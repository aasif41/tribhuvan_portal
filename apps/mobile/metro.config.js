const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const defaultGetPolyfills = config.serializer?.getPolyfills || (() => []);

config.serializer = {
  ...config.serializer,
  getPolyfills: (options) => [
    require.resolve('./polyfills.js'),
    ...defaultGetPolyfills(options),
  ],
};

module.exports = config;
