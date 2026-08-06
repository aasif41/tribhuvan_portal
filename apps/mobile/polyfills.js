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
