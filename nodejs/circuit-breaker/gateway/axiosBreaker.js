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
 * @param {{ exec: (fn: (signal: AbortSignal) => any) => Promise<any> } | undefined} [retryStrategy] Optional RetryStrategy instance
 * @returns {{ request: Function, breaker: CircuitBreaker } & Record<string, Function>}
 */
function createAxiosBreaker(breakerOptions, axiosConfig = {}, axiosInstance = axios, retryStrategy) {
  const options = { ...breakerOptions };

  // Default: don't count axios cancellation as a failure unless caller overrides.
  if (!options.shouldCountError) {
    options.shouldCountError = (err) => !axios.isCancel(err);
  }

  const breaker = new CircuitBreaker(options);
  const client = typeof axiosInstance.create === 'function'
    ? axiosInstance.create(axiosConfig)
    : axiosInstance;

  const executeOnce = (config, outerSignal) =>
    breaker.exec((breakerSignal) => {
      // Tie breaker aborts and outer aborts to the same axios signal
      const controller = new AbortController();
      const forwardAbort = (signal) =>
        signal?.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
      forwardAbort(breakerSignal);
      forwardAbort(outerSignal);
      return client.request({ ...config, signal: controller.signal });
    });

  const baseRequest = (config, signal) => executeOnce(config, signal);

  const request = retryStrategy
    ? (config) => retryStrategy.exec((signal) => baseRequest(config, signal))
    : (config) => baseRequest(config);

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
