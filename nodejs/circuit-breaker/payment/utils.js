const path = require('path');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function logger() {
  function getCallerFile() {
    const originalPrepareStackTrace = Error.prepareStackTrace;

    try {
      const err = new Error();
      Error.prepareStackTrace = (_, stack) => stack;

      const stack = err.stack;

      // stack[0] = this file
      // stack[1] = console override
      // stack[2] = actual caller
      const caller = stack[2];
      if (!caller) return 'unknown';

      const fileName = caller.getFileName();
      return fileName ? path.basename(fileName) : 'unknown';
    } catch {
      return 'unknown';
    } finally {
      Error.prepareStackTrace = originalPrepareStackTrace;
    }
  }

  const methods = ['log', 'info', 'warn', 'error', 'debug'];

  methods.forEach(method => {
    const original = console[method];

    console[method] = (...args) => {
      const timestamp = new Date().toISOString();
      const file = getCallerFile();

      original(`[${timestamp}] [${file}]`, ...args);
    };
  });
}

module.exports = { delay, logger };