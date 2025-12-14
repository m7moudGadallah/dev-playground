const { Router } = require('express');
const { delay } = require('./utils');

const api = Router();

api.get('/health', (_, res) => {
  res.json({
    status: 'ok'
  });
});

api.post('/pay', async (_, res) => {
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
    return res.status(500).json({
      error: 'Internal server error',
      code: 'PAYMENT_INTERNAL_ERROR'
    });
  }

  if (errorRoll < 0.18) {
    return res.status(503).json({
      error: 'Payment service unavailable',
      code: 'SERVICE_UNAVAILABLE'
    });
  }

  if (errorRoll < 0.25) {
    return res.status(504).json({
      error: 'Upstream timeout',
      code: 'GATEWAY_TIMEOUT'
    });
  }

  /* --------------------
     4xx client errors
  ---------------------*/
  if (errorRoll < 0.35) {
    return res.status(400).json({
      error: 'Invalid payment payload',
      code: 'INVALID_REQUEST'
    });
  }

  if (errorRoll < 0.42) {
    return res.status(401).json({
      error: 'Unauthorized',
      code: 'AUTH_REQUIRED'
    });
  }

  if (errorRoll < 0.48) {
    return res.status(403).json({
      error: 'Payment method blocked',
      code: 'PAYMENT_FORBIDDEN'
    });
  }

  if (errorRoll < 0.54) {
    return res.status(404).json({
      error: 'Customer not found',
      code: 'CUSTOMER_NOT_FOUND'
    });
  }

  if (errorRoll < 0.60) {
    return res.status(409).json({
      error: 'Duplicate transaction',
      code: 'DUPLICATE_PAYMENT'
    });
  }

  if (errorRoll < 0.66) {
    return res.status(422).json({
      error: 'Insufficient funds',
      code: 'INSUFFICIENT_FUNDS'
    });
  }

  if (errorRoll < 0.72) {
    return res.status(429).json({
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: 5
    });
  }

  /* --------------------
     Success
  ---------------------*/
  return res.json({
    status: 'Payment successful',
    transactionId: `tx_${Date.now()}`
  });
});

module.exports = { api };