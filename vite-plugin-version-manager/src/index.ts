import fs from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import cdnImport from 'vite-plugin-cdn-import'

interface PackageJsonData extends Record<string, unknown> {
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

interface ConfigJson {
  version: string
  name: string
  description: string
  icon: string
  indexHtml: string
  uuid?: string
  domains: string[]
  publishTime: number
}

interface CDNModuleConfig {
  name: string
  var: string
  path: string
  css: string
}

interface GeneratedCDNModule {
  name: string
  var: string
  path: string
  css?: string
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
   * Enable versioned config extraction and generation
   * @default false
   */
  enableVersionedConfig?: boolean

  /**
   * NPM CDN prefix for external modules
   * @default 'https://unpkg.com'
   */
  npmCdnPrefix?: string

  /**
   * NPM CDN module configurations
   * If provided, enables CDN import functionality
   */
  npmCdnModules?: CDNModuleConfig[]
}

const defaultVersionIncrementer = (currentVersion: string): string => {
  const versionParts = currentVersion.split('.')
  versionParts[2] = String(parseInt(versionParts[2] || '0') + 1)
  return versionParts.join('.')
}

const generateNpmCdnModules = (
  npmCdnModules: CDNModuleConfig[],
  npmCdnPrefix: string,
  pkg: PackageJsonData
): GeneratedCDNModule[] => {
  return npmCdnModules.map((config) => {
    const version = pkg.dependencies?.[config.name]?.replace('^', '') || 'latest'
    return {
      name: config.name,
      var: config.var,
      path: `${npmCdnPrefix}/${config.name}@${version}${config.path}`,
      css: config.css && config.css.length > 0
        ? `${npmCdnPrefix}/${config.name}@${version}${config.css}`
        : undefined,
    }
  })
}

const generateVersionedConfig = async (distDir: string, pkg: PackageJsonData, buildDir: string): Promise<void> => {
  const version = pkg.version
  const outDir = path.resolve(process.cwd(), `${distDir}/${version}`)
  const indexPath = path.join(buildDir, 'index.html')
  const configPath = path.join(path.resolve(process.cwd(), distDir), 'config.json')

  // Check if index.html exists in build output
  let indexContent = ''
  try {
    indexContent = await fs.readFile(indexPath, 'utf-8')
    // Delete index.html file after reading in production mode
    await fs.unlink(indexPath)
  } catch (indexErr: unknown) {
    if (indexErr instanceof Error && 'code' in indexErr && indexErr.code === 'ENOENT') {
      console.log(`[vite-plugin-version-manager] Index.html not found at ${indexPath}`)
      indexContent = ''
    } else {
      throw indexErr
    }
  }

  let config: ConfigJson = {
    version: version,
    name: pkg.name,
    description: pkg.description || 'N/A',
    icon: `favicon.ico`,
    indexHtml: indexContent,
    uuid: pkg.uuid,
    domains: pkg.domains || [],
    publishTime: Date.now(),
  }

  // Try to read existing config
  try {
    const configData = await fs.readFile(configPath, 'utf-8')
    config = { ...JSON.parse(configData), ...config }
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && err.code !== 'ENOENT') throw err
  }

  const configContent = JSON.stringify(config, null, 2)

  // Write to dist/config.json (main config)
  await fs.writeFile(configPath, configContent, 'utf-8')

  // Ensure version directory exists
  await fs.mkdir(outDir, { recursive: true })

  // Write to dist/{version}/config.json (version-specific config)
  const versionConfigPath = path.join(outDir, 'config.json')
  await fs.writeFile(versionConfigPath, configContent, 'utf-8')

  console.log(`[vite-plugin-version-manager] Updated config.json with version ${version}`)
  console.log(
    `[vite-plugin-version-manager] Published at: ${config.publishTime} (${new Date(config.publishTime).toISOString()})`,
  )
  console.log(`[vite-plugin-version-manager] Created version-specific config at ${versionConfigPath}`)
}

export default function vitePluginVersionManager(options: VersionManagerOptions = {}): Plugin | Plugin[] {
  const {
    autoIncrement = true,
    cleanOldVersions = true,
    versionIncrementer = defaultVersionIncrementer,
    excludeFromCleanup = ['config.json'],
    distDir = 'dist',
    enableVersionedConfig = false,
    npmCdnPrefix = 'https://unpkg.com',
    npmCdnModules,
  } = options

  const plugins: Plugin[] = [
    {
      name: 'vite-plugin-version-manager',

      async buildStart() {
        // Only run in production mode
        if (process.env.NODE_ENV !== 'production') {
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
        } catch (error) {
          console.error('[vite-plugin-version-manager] Error:', error)
          throw error
        }
      },

      async closeBundle() {
        // Only run in production mode
        if (process.env.NODE_ENV !== 'production') {
          return
        }

        try {
          const packageJsonPath = path.resolve(process.cwd(), 'package.json')
          const packageJson: PackageJsonData = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))
          const currentVersion = packageJson.version

          // Generate versioned config first (with current version)
          if (enableVersionedConfig) {
            const buildDir = path.resolve(process.cwd(), distDir)
            await generateVersionedConfig(distDir, packageJson, buildDir)
          }

          // Then increment version for next build
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
  ]

  // Add NPM CDN import plugin if modules are configured
  if (npmCdnModules && npmCdnModules.length > 0) {
    try {
      const packageJsonPath = path.resolve(process.cwd(), 'package.json')
      const packageJson: PackageJsonData = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      const generatedCdnModules = generateNpmCdnModules(npmCdnModules, npmCdnPrefix, packageJson)

      const cdnPlugin = cdnImport({
        modules: generatedCdnModules,
      })
      
      // Handle both single plugin and plugin array
      if (Array.isArray(cdnPlugin)) {
        plugins.push(...cdnPlugin)
      } else {
        plugins.push(cdnPlugin as Plugin)
      }

      console.log(`[vite-plugin-version-manager] NPM CDN import enabled with ${generatedCdnModules.length} modules`)
    } catch (error) {
      console.warn('[vite-plugin-version-manager] Failed to setup NPM CDN import:', error)
    }
  }

  return plugins.length === 1 ? plugins[0] : plugins
}

// Named export for CommonJS compatibility
export { vitePluginVersionManager }
