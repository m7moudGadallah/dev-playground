/**
 * Minimal, transport-agnostic retry strategy.
 * - Only concerns itself with a delay schedule and a user-provided retry predicate.
 * - Caller decides what "retryable" means (HTTP, DB, queue, etc).
 */
class RetryStrategy {
  /**
   * @param {Object} [options]
   * @param {number[]} [options.retryDelays] Delay durations (ms) used between retries.
   * @param {(err: any) => boolean} [options.isRetryable] Predicate to decide if an error is retryable.
   */
  constructor(options = {}) {
    this.options = this._validateOptions(options);

    const {
      retryDelays = [100, 300, 1000],
      isRetryable
    } = this.options;

    this.retryDelays = [...retryDelays];
    this._isRetryable = isRetryable || (() => false);
    this._retryIndex = 0;
  }

  /**
   * Execute fn with retry support. fn receives an AbortSignal.
   * @param {(signal: AbortSignal) => any | Promise<any>} fn
   * @returns {Promise<any>}
   */
  async exec(fn) {
    if (typeof fn !== 'function') {
      throw new TypeError('exec expects a function');
    }

    this._retryIndex = 0;
    const controller = new AbortController();

    // Simple sleep helper for retry delays.
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    while (true) {
      try {
        return await fn(controller.signal);
      } catch (err) {
        const delayMs = this._getNextRetry();
        const shouldRetry = delayMs !== undefined && this._isRetryable(err);

        if (!shouldRetry) {
          throw err;
        }

        await sleep(delayMs);
      }
    }
  }

  /**
   * Return the configured retry delay schedule.
   * @returns {number[]}
   */
  getDelays() {
    return [...this.retryDelays];
  }

  /**
   * Determine whether an error is retryable using the provided predicate.
   * @param {any} err
   * @returns {boolean}
   */
  isRetryable(err) {
    return this._isRetryable(err);
  }

  /**
   * Validate options upfront.
   * @private
   */
  _validateOptions(options) {
    if (options !== undefined && typeof options !== 'object') {
      throw new TypeError('RetryStrategy options must be an object if provided');
    }

    const retryDelays = options.retryDelays ?? [100, 300, 1000];
    if (!Array.isArray(retryDelays)) {
      throw new TypeError('retryDelays must be an array of numbers');
    }
    retryDelays.forEach(val => {
      if (typeof val !== 'number' || !Number.isFinite(val) || val < 0) {
        throw new TypeError('retryDelays must contain only finite numbers >= 0');
      }
    });

    if (options.isRetryable !== undefined && typeof options.isRetryable !== 'function') {
      throw new TypeError('isRetryable must be a function if provided');
    }

    return { retryDelays, isRetryable: options.isRetryable };
  }

  /**
   * Return the next delay and advance the cursor; undefined when exhausted.
   * @private
   */
  _getNextRetry() {
    if (this._retryIndex >= this.retryDelays.length) return undefined;
    const delay = this.retryDelays[this._retryIndex];
    this._retryIndex = Math.min(this._retryIndex + 1, this.retryDelays.length);
    return delay;
  }
}

module.exports = { RetryStrategy };
