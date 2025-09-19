import fs from 'node:fs/promises'
import path from 'node:path'
import type { Plugin } from 'vite'

export interface PackageJsonData extends Record<string, unknown> {
  name: string
  version: string
  uuid?: string
  domains?: string[]
  lastBuildTime?: string
  dependencies?: Record<string, string>
  description?: string
  private?: boolean
  type?: string
  scripts?: Record<string, string>
  devDependencies?: Record<string, string>
}

export interface VersionManagerOptions {
  /**
   * Whether to enable version auto-increment
   * @default true
   */
  autoIncrement?: boolean

  /**
   * Whether to clean old version directories
   * @default true
   */
  cleanOldVersions?: boolean

  /**
   * Custom version increment function
   * @param currentVersion Current version string
   * @returns New version string
   */
  versionIncrementer?: (currentVersion: string) => string

  /**
   * Directories to exclude from cleanup
   * @default ['config.json']
   */
  excludeFromCleanup?: string[]

  /**
   * Custom dist directory path
   * @default 'dist'
   */
  distDir?: string

  /**
   * Only run in production mode
   * @default true
   */
  productionOnly?: boolean
}

const defaultVersionIncrementer = (currentVersion: string): string => {
  const versionParts = currentVersion.split('.')
  versionParts[2] = String(parseInt(versionParts[2] || '0') + 1)
  return versionParts.join('.')
}

export default function vitePluginVersionManager(options: VersionManagerOptions = {}): Plugin {
  const {
    autoIncrement = true,
    cleanOldVersions = true,
    versionIncrementer = defaultVersionIncrementer,
    excludeFromCleanup = ['config.json'],
    distDir = 'dist',
    productionOnly = true,
  } = options

  return {
    name: 'vite-plugin-version-manager',
    enforce: 'pre',

    async buildStart() {
      // Skip in development mode if productionOnly is true
      if (productionOnly && process.env.NODE_ENV !== 'production') {
        console.log(`[vite-plugin-version-manager] Skipping in development mode`)
        return
      }

      try {
        const packageJsonPath = path.resolve(process.cwd(), 'package.json')
        const packageJson: PackageJsonData = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))

        const currentVersion = packageJson.version
        const distDirPath = path.resolve(process.cwd(), distDir)

        // Clean old version directories
        if (cleanOldVersions) {
          try {
            const files = await fs.readdir(distDirPath, { withFileTypes: true })
            for (const file of files) {
              const filePath = path.join(distDirPath, file.name)
              const shouldExclude = excludeFromCleanup.some(
                (exclude) => file.name === exclude || file.name.includes(exclude),
              )

              if (file.isDirectory() && file.name !== currentVersion && !shouldExclude) {
                await fs.rm(filePath, { recursive: true, force: true })
                console.log(`[vite-plugin-version-manager] Deleted old directory: ${filePath}`)
              }
            }
          } catch (err: unknown) {
            if (err instanceof Error && 'code' in err && err.code !== 'ENOENT') {
              throw err
            }
          }
        }

        // Auto increment version
        if (autoIncrement) {
          const newVersion = versionIncrementer(currentVersion)
          packageJson.version = newVersion
          packageJson.lastBuildTime = new Date().toISOString()

          await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8')

          console.log(
            `[vite-plugin-version-manager] Updated version: ${currentVersion} → ${newVersion}`,
          )
        }
      } catch (error) {
        console.error('[vite-plugin-version-manager] Error:', error)
        throw error
      }
    },
  }
}

// Named export for CommonJS compatibility
export { vitePluginVersionManager }
