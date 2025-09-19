# Publishing Guide

## How to Publish This Plugin to NPM

### 1. Preparation

1. **Create GitHub Repository**

   ```bash
   # Create a new repository vite-plugin-version-manager on GitHub
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/vite-plugin-version-manager.git
   git push -u origin main
   ```

2. **Register NPM Account**

   - Visit https://www.npmjs.com/ to register an account
   - Verify your email

3. **Login to NPM**
   ```bash
   npm login
   ```

### 2. Configure Package Information

Edit `package.json`:

```json
{
  "name": "vite-plugin-version-manager",
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/vite-plugin-version-manager.git"
  }
}
```

### 3. Local Testing

```bash
# Install dependencies
npm install

# Build project
npm run build

# Check build output
ls dist/

# Test package locally
npm pack
```

### 4. Publish to NPM

#### Method 1: Manual Publishing

```bash
# Build
npm run build

# Publish
npm publish
```

#### Method 2: Automated Publishing with GitHub Actions

1. **Setup NPM Token**

   - Generate Access Token on NPM website
   - Add Secret in GitHub repository settings: `NPM_TOKEN`

2. **Create Git Tag to Trigger Publishing**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

### 5. Version Management

```bash
# Update patch version (1.0.0 -> 1.0.1)
npm version patch

# Update minor version (1.0.1 -> 1.1.0)
npm version minor

# Update major version (1.1.0 -> 2.0.0)
npm version major

# Push tags
git push --tags
```

### 6. Usage in Projects

After successful publishing, you can use it in other projects:

```bash
npm install vite-plugin-version-manager --save-dev
```

```typescript
// vite.config.ts
import vitePluginVersionManager from 'vite-plugin-version-manager'

export default defineConfig({
  plugins: [
    vitePluginVersionManager({
      autoIncrement: true,
      cleanOldVersions: true,
    }),
  ],
})
```

### 7. Maintenance and Updates

- Regularly update dependencies
- Handle GitHub Issues
- Publish new versions
- Update documentation

### Important Notes

1. **Package Name Uniqueness**: Ensure the package name is unique on NPM
2. **Semantic Versioning**: Follow SemVer specification
3. **Documentation Completeness**: Keep README and examples updated
4. **Test Coverage**: Add unit tests and integration tests
5. **Compatibility**: Ensure compatibility with different Vite versions

### Recommended Package Names

If `vite-plugin-version-manager` is already taken, consider:

- `vite-plugin-auto-version`
- `vite-plugin-version-bump`
- `vite-plugin-build-version`
- `@yourscope/vite-plugin-version-manager`