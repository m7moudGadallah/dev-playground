const { Router } = require('express');
const { createAxiosBreaker, isCircuitBreakerError } = require('./axiosBreaker');
const { RetryStrategy } = require('./retryStrategy');

const { PAYMENT_SERVICE_DOMAIN } = process.env;

const api = Router();

const isRetryablePaymentError = (err) => {
  // Count server errors (5xx), rate limiting (429), and circuit timeouts.
  const status = err?.response?.status;
  if (status >= 500 || status === 429) return true;
  const code = err?.breakerCode || err?.message;
  return code === 'EXECUTION_TIMEOUT';
};

// Circuit breaker-wrapped axios client for payment calls, with bounded retries.
const paymentRetryStrategy = new RetryStrategy({
  retryDelays: [1_000, 2_000, 3_000],
  isRetryable: isRetryablePaymentError
});

const paymentApi = createAxiosBreaker(
  {
    failureThreshold: 50,          // % failures in window to trip
    windowDuration: 500_000,        // ms
    minimumRequests: 10,           // minimum sample size
    halfOpenMaxSuccesses: 2,       // probes to close
    halfOpenMaxConcurrent: 2,      // limit probes
    openStateDurations: [5_000, 10_000, 20_000], // backoff progression
    timeout: 2_000,                // ms per attempt
    shouldCountError: isRetryablePaymentError
  },
  {
    baseURL: PAYMENT_SERVICE_DOMAIN
  },
  undefined,
  paymentRetryStrategy
);

api.get('/health', (_, res) => {
  res.json({
    status: 'ok'
  });
});

api.get('/payment-status', (_, res) => {
  const metrics = paymentApi.breaker.getMetrics();
  res.json(metrics);
});

api.post('/checkout', async (req, res) => {
  const requestId =
    req.headers['x-request-id'] ||
    `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

  let payResponse = null;
  try {
    payResponse = await paymentApi.post('/api/pay', {}, { headers: { 'x-request-id': requestId } });
    res.json(payResponse.data);
  } catch (err) {
    const breaker = isCircuitBreakerError(err);
    const status = breaker ? 503 : err?.response?.status || 500;
    const upstreamMessage = err?.response?.data?.error || err?.response?.data || err.message;
    res.status(status).json({
      error: upstreamMessage,
      code: breaker ? err.breakerCode : undefined
    });
  } finally {
    console.log(`[Checkout]: pay endpoint respond with status code ${payResponse?.status || '-'}`);
  }
});

module.exports = { api };
