# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## 🚀 Deployment

### Railway Deployment with Docker + Caddy (Recommended)

This project uses a production-optimized Docker setup with Caddy web server:

1. **Push to GitHub**: Ensure your code is committed and pushed to GitHub
2. **Connect Railway**: Go to [railway.app](https://railway.app) and connect your GitHub account
3. **Deploy**: Select "Deploy from GitHub repo" and choose this repository
4. **Environment Variables**: Set these in Railway dashboard:
   ```
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
   VITE_DEV_MODE=false
   ```
5. **Deploy**: Railway will automatically detect the Dockerfile and deploy

**Production Stack:**
- 🐳 **Multi-stage Docker build** (Node.js build → Caddy server)
- ⚡ **Caddy web server** for optimized static file serving
- 🗜️ **Gzip compression** and proper caching headers
- 🔄 **SPA routing** support for React Router
- 💓 **Health checks** at `/health` endpoint
- 🔒 **Security headers** and MIME type protection

**Configuration Files:**
- ✅ `Dockerfile` - Multi-stage build configuration
- ✅ `Caddyfile` - Web server and routing configuration  
- ✅ `railway.json` - Railway deployment settings
- ✅ Environment variable setup

### Local Docker Testing

Test the Docker build locally before deploying:

```bash
# Build the Docker image
docker build -t mission-control .

# Run locally on port 3000
docker run -p 3000:3000 -e VITE_MAPBOX_ACCESS_TOKEN=your_token mission-control

# Test health check
curl http://localhost:3000/health
```

### Manual Deployment Options

**Railway CLI:**
```bash
npm install -g @railway/cli
railway login
railway init
railway variables set VITE_MAPBOX_ACCESS_TOKEN=your_token
railway up
```

**Build for Static Hosting:**
```bash
npm run build
# Deploy the 'dist' folder to any static host
```