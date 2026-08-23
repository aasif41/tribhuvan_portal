const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = fs.realpathSync(__dirname);
const workspaceRoot = fs.realpathSync(path.resolve(projectRoot, '../..'));

const config = getDefaultConfig(projectRoot);

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

config.watchFolders = [projectRoot, workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Block root node_modules/react-native to prevent duplicate React Native instances
const rootRN = path.resolve(workspaceRoot, 'node_modules', 'react-native');
config.resolver.blockList = [
  new RegExp(`^${escapeRegExp(rootRN)}[/\\\\].*`),
];

// Singletons that MUST resolve to a single canonical path
const singletons = [
  'react-native-safe-area-context',
  'react-native-screens',
  'react-native-gesture-handler',
  'react-native',
  'react',
];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  for (const pkg of singletons) {
    if (moduleName === pkg || moduleName.startsWith(`${pkg}/`)) {
      const subPath = moduleName === pkg ? '' : moduleName.slice(pkg.length + 1);
      const localPkgDir = path.resolve(projectRoot, 'node_modules', pkg);
      const rootPkgDir = path.resolve(workspaceRoot, 'node_modules', pkg);
      const baseDir = fs.existsSync(localPkgDir) ? localPkgDir : rootPkgDir;
      
      const targetFile = subPath ? path.resolve(baseDir, subPath) : baseDir;
      try {
        return context.resolveRequest(context, targetFile, platform);
      } catch (e) {
        // Fallback to standard context resolution
      }
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Enable require.context for Expo Router release builds
config.transformer = config.transformer || {};
config.transformer.unstable_allowRequireContext = true;

module.exports = config;
