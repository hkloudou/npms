# vite-plugin-version-manager

A Vite plugin for automatic version management and dist cleanup.

## Features

- 🚀 **Automatic Version Increment**: Automatically increments package.json version during build
- 🧹 **Old Version Cleanup**: Removes old version directories from dist folder
- ⚙️ **Highly Configurable**: Customize version increment logic, cleanup behavior, and more
- 🎯 **Production-First**: Only runs in production mode by default (configurable)
- 📦 **TypeScript Support**: Full TypeScript support with type definitions

## Installation

```bash
npm install vite-plugin-version-manager --save-dev
# or
pnpm add vite-plugin-version-manager -D
# or
yarn add vite-plugin-version-manager -D
```

## Usage

### Basic Usage

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vitePluginVersionManager from 'vite-plugin-version-manager'

export default defineConfig({
  plugins: [vitePluginVersionManager()],
})
```

### Advanced Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vitePluginVersionManager from 'vite-plugin-version-manager'

export default defineConfig({
  plugins: [
    vitePluginVersionManager({
      // Enable/disable auto version increment
      autoIncrement: true,

      // Enable/disable cleanup of old version directories
      cleanOldVersions: true,

      // Custom version increment function
      versionIncrementer: (currentVersion) => {
        const [major, minor, patch] = currentVersion.split('.')
        return `${major}.${minor}.${parseInt(patch) + 1}`
      },

      // Directories/files to exclude from cleanup
      excludeFromCleanup: ['config.json', 'latest'],

      // Custom dist directory
      distDir: 'build',

      // Enable versioned config extraction
      enableVersionedConfig: true,

      // NPM CDN configuration
      npmCdnPrefix: 'https://unpkg.com',
      npmCdnModules: [
        { name: 'vue', var: 'Vue', path: '/dist/vue.global.prod.js', css: '' },
        { name: 'vue-router', var: 'VueRouter', path: '/dist/vue-router.global.prod.js', css: '' },
        { name: 'pinia', var: 'Pinia', path: '/dist/pinia.iife.prod.js', css: '' },
      ],
    }),
  ],
})
```

## Configuration Options

| Option                | Type       | Default                 | Description                                    |
| --------------------- | ---------- | ----------------------- | ---------------------------------------------- |
| `autoIncrement`       | `boolean`  | `true`                  | Whether to enable version auto-increment       |
| `cleanOldVersions`    | `boolean`  | `true`                  | Whether to clean old version directories       |
| `versionIncrementer`  | `function` | Default patch increment | Custom version increment function              |
| `excludeFromCleanup`  | `string[]` | `['config.json']`       | Directories to exclude from cleanup            |
| `distDir`             | `string`   | `'dist'`                | Custom dist directory path                     |
| `enableVersionedConfig` | `boolean`  | `false`               | Enable versioned config extraction and generation |
| `npmCdnPrefix`        | `string`   | `'https://unpkg.com'`   | NPM CDN prefix for external modules           |
| `npmCdnModules`       | `array`    | `undefined`             | NPM CDN module configurations                  |

## How It Works

1. **Pre-build Phase**: The plugin runs before the build starts
2. **Version Check**: Reads the current version from package.json
3. **Cleanup**: Removes old version directories from dist folder (except excluded ones)
4. **Version Increment**: Increments the version and updates package.json
5. **Timestamp**: Adds a lastBuildTime timestamp to package.json
6. **Post-build Phase** (optional): Generates config.json with build metadata

## Post-Build Features

When `enablePostBuild` is set to `true`, the plugin will also:

- **Generate config.json**: Creates a configuration file with build metadata
- **Version-specific configs**: Creates separate config files for each version
- **Index.html processing**: Reads and processes index.html from build output
- **Metadata collection**: Includes version, name, description, domains, and publish time

### Config.json Structure

```json
{
  "version": "1.0.2",
  "name": "my-app",
  "description": "My awesome application",
  "icon": "favicon.ico",
  "indexHtml": "<!DOCTYPE html>...",
  "uuid": "optional-uuid",
  "domains": ["example.com"],
  "publishTime": 1703123456789
}
```

The config.json will be created in two locations:
- `dist/config.json` - Main configuration file
- `dist/{version}/config.json` - Version-specific configuration for rollback purposes

## NPM CDN Features

When `npmCdnModules` is provided, the plugin will also:

- **Integrate CDN Import**: Automatically adds `vite-plugin-cdn-import` functionality
- **Auto Version Resolution**: Extracts versions from your `package.json` dependencies
- **Flexible CDN Prefix**: Configure any NPM CDN provider (unpkg, jsdelivr, etc.)
- **Module Configuration**: Define external modules with custom paths and CSS

### NPM CDN Module Structure

```typescript
interface CDNModuleConfig {
  name: string     // Package name (must exist in dependencies)
  var: string      // Global variable name
  path: string     // Path to the module file
  css: string      // Path to CSS file (optional)
}
```

### Example Configuration

```typescript
vitePluginVersionManager({
  npmCdnPrefix: 'https://cdn.jsdelivr.net/npm',
  npmCdnModules: [
    { name: 'vue', var: 'Vue', path: '/dist/vue.global.prod.js', css: '' },
    { name: 'element-plus', var: 'ElementPlus', path: '/dist/index.full.min.js', css: '/dist/index.css' },
  ]
})
```

This will automatically resolve to:
- `https://cdn.jsdelivr.net/npm/vue@3.4.0/dist/vue.global.prod.js`
- `https://cdn.jsdelivr.net/npm/element-plus@2.5.0/dist/index.full.min.js`
- `https://cdn.jsdelivr.net/npm/element-plus@2.5.0/dist/index.css`

## Example Directory Structure

Before build:

```
dist/
├── 1.0.0/     # Old version (will be cleaned)
├── 1.0.1/     # Old version (will be cleaned)
├── config.json # Excluded from cleanup
└── latest/    # Excluded from cleanup (if configured)
```

After build:

```
dist/
├── 1.0.2/     # New version directory
├── config.json # Preserved
└── latest/    # Preserved (if configured)
```

## TypeScript Support

The plugin is written in TypeScript and provides full type definitions:

```typescript
import type { VersionManagerOptions } from 'vite-plugin-version-manager'

const options: VersionManagerOptions = {
  autoIncrement: true,
  cleanOldVersions: true,
  // ... other options with full IntelliSense support
}
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
