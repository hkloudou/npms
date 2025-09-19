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

      // Run in all modes (not just production)
      productionOnly: false,
    }),
  ],
})
```

## Configuration Options

| Option               | Type       | Default                 | Description                              |
| -------------------- | ---------- | ----------------------- | ---------------------------------------- |
| `autoIncrement`      | `boolean`  | `true`                  | Whether to enable version auto-increment |
| `cleanOldVersions`   | `boolean`  | `true`                  | Whether to clean old version directories |
| `versionIncrementer` | `function` | Default patch increment | Custom version increment function        |
| `excludeFromCleanup` | `string[]` | `['config.json']`       | Directories to exclude from cleanup      |
| `distDir`            | `string`   | `'dist'`                | Custom dist directory path               |
| `productionOnly`     | `boolean`  | `true`                  | Only run in production mode              |

## How It Works

1. **Pre-build Phase**: The plugin runs before the build starts
2. **Version Check**: Reads the current version from package.json
3. **Cleanup**: Removes old version directories from dist folder (except excluded ones)
4. **Version Increment**: Increments the version and updates package.json
5. **Timestamp**: Adds a lastBuildTime timestamp to package.json

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
