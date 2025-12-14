/**
 * @typedef {'CLOSED' | 'OPEN' | 'HALF_OPEN'} CircuitState
 */

/**
 * @typedef {Object} CircuitBreakerOptions
 * @property {number} failureThreshold Failure percentage (0-100) required to open the circuit.
 * @property {number} windowDuration Sliding time window (ms) used to track failures.
 * @property {number} minimumRequests Minimum number of requests in the window before failure evaluation begins.
 * @property {number} halfOpenMaxSuccesses Number of successful probe calls required in HALF_OPEN to close the circuit.
 * @property {number} halfOpenMaxConcurrent Maximum number of concurrent probe executions allowed in HALF_OPEN.
 * @property {number[]} openStateDurations Array of durations (ms) for incremental OPEN intervals.
 * @property {number} timeout Maximum duration (ms) to allow a call to run before timing out.
 * @property {boolean} [includeIgnoredErrorsInRequests=false] If true, ignored errors contribute to the request count denominator.
 * @property {(error: Error) => boolean} [shouldCountError]
 *   Optional predicate to determine whether a thrown error should be counted as a failure
 *   for circuit evaluation.
 *   Return `true` to count the error toward failure thresholds, or `false` to ignore it
 *   (e.g., validation errors, client errors).
 * @property {(error: Error) => any | Promise<any>} [fallback]
 *   Optional fallback function invoked when execution fails or the circuit is OPEN.
 *   Receives the original error as an argument and should return a safe or degraded
 *   response. May return a value or a Promise.
 */

class CircuitBreaker {
  /**
   * @param {CircuitBreakerOptions} options
   */
  constructor(options) {
    this._validateOptions(options);

    this.options = options;

    /** @type {CircuitState} */
    this.state = 'CLOSED';

    this.failures = [];
    this.successTimestamps = [];
    this.ignoredErrors = [];
    this.halfOpenSuccesses = 0;
    this.openedAt = 0;

    // Concurrency control
    this.halfOpenInFlight = 0;
    this.controllers = new Set();

    // Incremental OPEN durations
    this._openIndex = 0;
    this._currentOpenDuration = this._getNextOpenDuration();

    this.listeners = {
      open: [],
      close: [],
      halfOpen: []
    };
  }

  async exec(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.openedAt >= this._currentOpenDuration) {
        this._transitionToHalfOpen();
      } else {
        return this._fallback(this._breakerError('CIRCUIT_OPEN'));
      }
    }

    if (this.state === 'HALF_OPEN') {
      if (this.halfOpenInFlight >= this.options.halfOpenMaxConcurrent) {
        return this._fallback(
          this._breakerError('HALF_OPEN_CONCURRENCY_LIMIT_REACHED')
        );
      }
      this.halfOpenInFlight++;
    }

    const controller = new AbortController();
    this.controllers.add(controller);

    try {
      const result = await this._withTimeout(fn, controller);
      this._onSuccess();
      return result;
    } catch (error) {
      this._onFailure(error);
      return this._fallback(error);
    } finally {
      this.controllers.delete(controller);
      if (this.state === 'HALF_OPEN') {
        this.halfOpenInFlight--;
      }
    }
  }

  _validateOptions(options) {
    if (!options || typeof options !== 'object') {
      throw new TypeError('CircuitBreaker options must be an object');
    }

    if (!Array.isArray(options.openStateDurations) || options.openStateDurations.length === 0) {
      throw new TypeError('openStateDurations must be a non-empty array of numbers');
    }
    for (const val of options.openStateDurations) {
      if (typeof val !== 'number' || val <= 0 || !Number.isFinite(val)) {
        throw new TypeError('Each value in openStateDurations must be a finite number > 0');
      }
    }

    const requiredNumberOptions = [
      'failureThreshold',
      'windowDuration',
      'minimumRequests',
      'halfOpenMaxSuccesses',
      'halfOpenMaxConcurrent',
      'timeout'
    ];

    for (const key of requiredNumberOptions) {
      if (typeof options[key] !== 'number' || !Number.isFinite(options[key])) {
        throw new TypeError(`CircuitBreaker option "${key}" must be a finite number`);
      }
    }

    if (options.failureThreshold <= 0 || options.failureThreshold > 100) {
      throw new RangeError('failureThreshold must be between 1 and 100');
    }
    if (options.minimumRequests <= 0) throw new RangeError('minimumRequests must be > 0');
    if (options.windowDuration <= 0) throw new RangeError('windowDuration must be > 0');
    if (options.halfOpenMaxSuccesses <= 0) throw new RangeError('halfOpenMaxSuccesses must be > 0');
    if (options.halfOpenMaxConcurrent <= 0) throw new RangeError('halfOpenMaxConcurrent must be > 0');
    if (options.timeout <= 0) throw new RangeError('timeout must be > 0');

    if (options.includeIgnoredErrorsInRequests !== undefined && typeof options.includeIgnoredErrorsInRequests !== 'boolean') {
      throw new TypeError('includeIgnoredErrorsInRequests must be a boolean if provided');
    }
    if (options.shouldCountError && typeof options.shouldCountError !== 'function') {
      throw new TypeError('shouldCountError must be a function if provided');
    }
    if (options.fallback && typeof options.fallback !== 'function') {
      throw new TypeError('fallback must be a function if provided');
    }
  }

  /**
   * Returns the current open duration and optionally increments the index.
   * @private
   * @param {boolean} [increment=false] Whether to increment the openIndex
   */
  _getNextOpenDuration(increment = false) {
    const duration = this.options.openStateDurations[
      Math.min(this._openIndex, this.options.openStateDurations.length - 1)
    ];
    if (increment) {
      this._openIndex = Math.min(
        this._openIndex + 1,
        this.options.openStateDurations.length - 1
      );
    }
    return duration;
  }

  /**
   * Run fn with a timeout; fn may optionally accept an AbortSignal for cancellation.
   * @param {(signal: AbortSignal) => any | Promise<any>} fn
   * @returns {Promise<any>}
   * @private
   */
  _withTimeout(fn, controller = new AbortController()) {
    const timeoutError = this._breakerError('EXECUTION_TIMEOUT');
    const timeoutId = setTimeout(() => controller.abort(timeoutError), this.options.timeout);

    const taskPromise = Promise.resolve().then(() => fn(controller.signal));
    const abortPromise = new Promise((_, reject) => {
      controller.signal.addEventListener(
        'abort',
        () => reject(controller.signal.reason ?? timeoutError),
        { once: true }
      );
    });

    return Promise.race([taskPromise, abortPromise]).finally(() => clearTimeout(timeoutId));
  }

  _onSuccess() {
    const now = Date.now();
    this.successTimestamps.push(now);
    this._pruneWindows(now);

    if (this.state === 'HALF_OPEN') {
      this.halfOpenSuccesses++;
      if (this.halfOpenSuccesses >= this.options.halfOpenMaxSuccesses) {
        this._close();
      }
    }
  }

  _onFailure(error) {
    if (this.options.shouldCountError && !this.options.shouldCountError(error)) {
      const now = Date.now();
      this.ignoredErrors.push(now);
      this._pruneWindows(now);
      return;
    }

    const now = Date.now();
    this.failures.push(now);
    this._pruneWindows(now);

    if (this.state === 'HALF_OPEN') {
      this._open();
      return;
    }

    if (this.state === 'CLOSED') {
      const eligibleRequests = this._eligibleRequestsInWindow();
      const failureRate = this._failureRate(eligibleRequests);
      if (eligibleRequests >= this.options.minimumRequests && failureRate >= this.options.failureThreshold) {
        this._open();
      }
    }
  }

  _totalRequestsInWindow() {
    return this.failures.length + this.successTimestamps.length + this.ignoredErrors.length;
  }

  _eligibleRequestsInWindow() {
    const total = this._totalRequestsInWindow();
    return this.options.includeIgnoredErrorsInRequests
      ? total
      : total - this.ignoredErrors.length;
  }

  _failureRate(eligibleRequests = this._eligibleRequestsInWindow()) {
    if (eligibleRequests === 0) return 0;
    return (this.failures.length / eligibleRequests) * 100;
  }

  _pruneWindows(now) {
    const windowStart = now - this.options.windowDuration;
    this.failures = this.failures.filter(ts => ts >= windowStart);
    this.successTimestamps = this.successTimestamps.filter(ts => ts >= windowStart);
    this.ignoredErrors = this.ignoredErrors.filter(ts => ts >= windowStart);
  }

  _open() {
    this.state = 'OPEN';
    this.openedAt = Date.now();
    this.halfOpenSuccesses = 0;
    this.halfOpenInFlight = 0;
    this._abortControllers();

    this._currentOpenDuration = this._getNextOpenDuration(true); // get and increment

    this._emit('open');
  }

  _close() {
    this.state = 'CLOSED';
    this.failures = [];
    this.successTimestamps = [];
    this.halfOpenSuccesses = 0;
    this.halfOpenInFlight = 0;
    this.controllers.clear();

    this._openIndex = 0;
    this._currentOpenDuration = this._getNextOpenDuration();

    this._emit('close');
  }

  _transitionToHalfOpen() {
    this.state = 'HALF_OPEN';
    this.halfOpenSuccesses = 0;
    this.halfOpenInFlight = 0;
    this._emit('halfOpen');
  }

  _fallback(error) {
    if (this.options.fallback) {
      return this.options.fallback(error);
    }
    throw error;
  }

  _breakerError(code) {
    const err = new Error(code);
    err.isCircuitBreaker = true;
    err.breakerCode = code;
    err.breakerState = this.state;
    return err;
  }

  on(event, handler) {
    this.listeners[event].push(handler);
  }

  _emit(event) {
    for (const fn of this.listeners[event]) fn();
  }

  _abortControllers() {
    for (const controller of this.controllers) {
      controller.abort(this._breakerError('CIRCUIT_OPEN'));
    }
    this.controllers.clear();
  }

  getMetrics() {
    const eligibleRequests = this._eligibleRequestsInWindow();
    return {
      state: this.state,
      failures: this.failures.length,
      successes: this.successTimestamps.length,
      ignoredErrors: this.ignoredErrors.length,
      halfOpenSuccesses: this.halfOpenSuccesses,
      halfOpenInFlight: this.halfOpenInFlight,
      failureRate: this._failureRate(eligibleRequests),
      eligibleRequests,
      totalRequests: this._totalRequestsInWindow(),
      currentOpenDuration: this._currentOpenDuration,
      openIndex: this._openIndex
    };
  }
}

module.exports = { CircuitBreaker };
