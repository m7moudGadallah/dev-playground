const { Router } = require('express');
const { delay } = require('./utils');

const api = Router();

api.get('/health', (_, res) => {
  res.json({
    status: 'ok'
  });
});

api.post('/pay', async (req, res) => {
  const requestId = req.headers['x-request-id'] || 'unknown';

  const latencyRoll = Math.random();
  const errorRoll = Math.random();

  /* --------------------
     Latency simulation
  ---------------------*/
  if (latencyRoll < 0.20) {
    await delay(150);          // fast
  } else if (latencyRoll < 0.45) {
    await delay(800);          // normal
  } else if (latencyRoll < 0.65) {
    await delay(2500);         // slow
  } else if (latencyRoll < 0.80) {
    await delay(6000);         // timeout-like
  } // else: instant response


  /* --------------------
     5xx / infra errors
  ---------------------*/
  if (errorRoll < 0.10) {
    console.log(`[pay] requestId=${requestId} -> 500 Internal server error`);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'PAYMENT_INTERNAL_ERROR'
    });
  }

  if (errorRoll < 0.18) {
    console.log(`[pay] requestId=${requestId} -> 503 Service unavailable`);
    return res.status(503).json({
      error: 'Payment service unavailable',
      code: 'SERVICE_UNAVAILABLE'
    });
  }

  if (errorRoll < 0.25) {
    console.log(`[pay] requestId=${requestId} -> 504 Gateway timeout`);
    return res.status(504).json({
      error: 'Upstream timeout',
      code: 'GATEWAY_TIMEOUT'
    });
  }

  /* --------------------
     4xx client errors
  ---------------------*/
  if (errorRoll < 0.35) {
    console.log(`[pay] requestId=${requestId} -> 400 Invalid payment payload`);
    return res.status(400).json({
      error: 'Invalid payment payload',
      code: 'INVALID_REQUEST'
    });
  }

  if (errorRoll < 0.42) {
    console.log(`[pay] requestId=${requestId} -> 401 Unauthorized`);
    return res.status(401).json({
      error: 'Unauthorized',
      code: 'AUTH_REQUIRED'
    });
  }

  if (errorRoll < 0.48) {
    console.log(`[pay] requestId=${requestId} -> 403 Payment method blocked`);
    return res.status(403).json({
      error: 'Payment method blocked',
      code: 'PAYMENT_FORBIDDEN'
    });
  }

  if (errorRoll < 0.54) {
    console.log(`[pay] requestId=${requestId} -> 404 Customer not found`);
    return res.status(404).json({
      error: 'Customer not found',
      code: 'CUSTOMER_NOT_FOUND'
    });
  }

  if (errorRoll < 0.60) {
    console.log(`[pay] requestId=${requestId} -> 409 Duplicate transaction`);
    return res.status(409).json({
      error: 'Duplicate transaction',
      code: 'DUPLICATE_PAYMENT'
    });
  }

  if (errorRoll < 0.66) {
    console.log(`[pay] requestId=${requestId} -> 422 Insufficient funds`);
    return res.status(422).json({
      error: 'Insufficient funds',
      code: 'INSUFFICIENT_FUNDS'
    });
  }

  if (errorRoll < 0.72) {
    console.log(`[pay] requestId=${requestId} -> 429 Too many requests`);
    return res.status(429).json({
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: 5
    });
  }

  /* --------------------
     Success
  ---------------------*/
  console.log(`[pay] requestId=${requestId} -> 200 Payment successful`);
  return res.json({
    status: 'Payment successful',
    transactionId: `tx_${Date.now()}`
  });
});

module.exports = { api };