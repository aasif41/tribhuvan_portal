module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    assumptions: {
      setPublicClassFields: true,
      privateFieldsAsSymbols: true,
    },
    plugins: [
      '@babel/plugin-transform-private-methods',
      '@babel/plugin-transform-class-properties',
      '@babel/plugin-transform-private-property-in-object',
    ],
  };
};
