class Logger {
  #instanceId = process.env.INSTANCE_ID || 'unknown';

  #getTimestamp() {
    return new Date().toISOString().replace('T', ' ').replace('Z', '');
  }

  #formatMessage(level, message) {
    return `[${this.#instanceId} :: ${this.#getTimestamp()}] ${level} - ${message}`;
  }

  info(message, ...args) {
    console.log(this.#formatMessage('INFO', message), ...args);
  }

  error(message, ...args) {
    console.error(this.#formatMessage('ERROR', message), ...args);
  }

  warn(message, ...args) {
    console.warn(this.#formatMessage('WARN', message), ...args);
  }

  debug(message, ...args) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.#formatMessage('DEBUG', message), ...args);
    }
  }
}

// Export a singleton instance
const logger = new Logger();

module.exports = {
  logger,
};
