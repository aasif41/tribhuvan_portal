// Polyfill DOMException globally before any Expo or router modules load
if (typeof globalThis.DOMException === 'undefined') {
  class DOMExceptionPolyfill extends Error {
    constructor(message, name) {
      super(message);
      this.name = name || 'DOMException';
    }
  }
  globalThis.DOMException = DOMExceptionPolyfill;
  if (typeof global !== 'undefined') {
    (global as any).DOMException = DOMExceptionPolyfill;
  }
}

import 'expo-router/entry';
