// Metro Prelude Polyfills for React Native Hermes environment
if (typeof globalThis.DOMException === 'undefined') {
  function DOMExceptionPolyfill(message, name) {
    const error = new Error(message);
    error.name = name || 'DOMException';
    return error;
  }
  DOMExceptionPolyfill.prototype = Object.create(Error.prototype);
  DOMExceptionPolyfill.prototype.constructor = DOMExceptionPolyfill;

  globalThis.DOMException = DOMExceptionPolyfill;
  if (typeof global !== 'undefined') {
    global.DOMException = DOMExceptionPolyfill;
  }
}

if (typeof globalThis.PerformanceEntry === 'undefined') {
  function PerformanceEntryPolyfill(name, entryType, startTime, duration) {
    this.name = name || '';
    this.entryType = entryType || 'mark';
    this.startTime = startTime || 0;
    this.duration = duration || 0;
  }
  PerformanceEntryPolyfill.prototype.toJSON = function () {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
    };
  };

  globalThis.PerformanceEntry = PerformanceEntryPolyfill;
  if (typeof global !== 'undefined') {
    global.PerformanceEntry = PerformanceEntryPolyfill;
  }
}

if (typeof globalThis.PerformanceObserver === 'undefined') {
  function PerformanceObserverPolyfill(callback) {
    this.callback = callback;
  }
  PerformanceObserverPolyfill.prototype.observe = function () {};
  PerformanceObserverPolyfill.prototype.disconnect = function () {};

  globalThis.PerformanceObserver = PerformanceObserverPolyfill;
  if (typeof global !== 'undefined') {
    global.PerformanceObserver = PerformanceObserverPolyfill;
  }
}
