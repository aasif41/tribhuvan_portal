const path = require('path');

function fixRequireContextPathPlugin() {
  return {
    visitor: {
      CallExpression(pathNode, state) {
        if (
          pathNode.node.callee.type === 'MemberExpression' &&
          pathNode.node.callee.property.name === 'context'
        ) {
          const arg = pathNode.node.arguments[0];
          if (arg && arg.type === 'StringLiteral') {
            const currentFileDir = state.filename ? path.dirname(state.filename) : __dirname;
            const targetAppDir = path.resolve(__dirname, 'app');
            let relPath = path.relative(currentFileDir, targetAppDir).replace(/\\/g, '/');
            if (!relPath.startsWith('.')) {
              relPath = './' + relPath;
            }
            arg.value = relPath;
          }
        }
      },
    },
  };
}

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [fixRequireContextPathPlugin, 'react-native-reanimated/plugin'],
  };
};
