const axios = require('axios');
const { CircuitBreaker } = require('./circuitBreaker');

const BREAKER_CODES = new Set([
  'CIRCUIT_OPEN',
  'HALF_OPEN_CONCURRENCY_LIMIT_REACHED',
  'EXECUTION_TIMEOUT'
]);

/**
 * Create an axios wrapper that routes all calls through a circuit breaker.
 * The breaker timeout drives an AbortSignal passed to axios so in-flight
 * requests can be cancelled when the breaker times out.
 *
 * @param {import('./circuitBreaker')} breakerOptions
 * @param {import('axios').AxiosRequestConfig} [axiosConfig] Optional axios config (e.g., baseURL, headers).
 * @param {import('axios').AxiosInstance | typeof axios} [axiosInstance=axios]
 * @returns {{ request: Function, breaker: CircuitBreaker } & Record<string, Function>}
 */
function createAxiosBreaker(breakerOptions, axiosConfig = {}, axiosInstance = axios) {
  const options = { ...breakerOptions };

  // Default: don't count axios cancellation as a failure unless caller overrides.
  if (!options.shouldCountError) {
    options.shouldCountError = (err) => !axios.isCancel(err);
  }

  const breaker = new CircuitBreaker(options);
  const client = typeof axiosInstance.create === 'function'
    ? axiosInstance.create(axiosConfig)
    : axiosInstance;

  const request = (config) =>
    breaker.exec((signal) => client.request({ ...config, signal }));

  const wrapped = { request, breaker };

  // Attach HTTP verb helpers mirroring axios
  ['get', 'delete', 'head', 'options'].forEach((method) => {
    wrapped[method] = (url, config = {}) => request({ ...config, url, method });
  });

  ['post', 'put', 'patch'].forEach((method) => {
    wrapped[method] = (url, data, config = {}) => request({ ...config, url, data, method });
  });

  return wrapped;
}

function isCircuitBreakerError(err) {
  return !!(
    err &&
    (err.isCircuitBreaker || BREAKER_CODES.has(err.breakerCode) || BREAKER_CODES.has(err.message))
  );
}

module.exports = { createAxiosBreaker, isCircuitBreakerError };
