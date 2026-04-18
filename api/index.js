import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Debugging: Check what files actually exist ---
const checkPath = (p) => {
  const absolutePath = path.resolve(__dirname, p);
  console.log(`Checking path: ${absolutePath} -> ${fs.existsSync(absolutePath) ? 'FOUND' : 'NOT FOUND'}`);
};

checkPath('../artifacts/api-server/src/index.js');
checkPath('../artifacts/api-server/dist/index.js');
// ------------------------------------------------

let appInstance;

async function loadApp() {
  const paths = [
    '../artifacts/api-server/src/index.js',
    '../artifacts/api-server/dist/index.js',
    '../artifacts/api-server/index.js'
  ];

  for (const p of paths) {
    try {
      const module = await import(p);
      if (module.app) {
        console.log(`✅ Loaded app from: ${p}`);
        return module.app;
      }
    } catch (e) {
      console.log(`❌ Failed to load from: ${p}`);
    }
  }
  return null;
}

const app = express();
const PORT = process.env.PORT || 10000;

const backendApp = await loadApp();

if (!backendApp) {
  console.error("🔴 CRITICAL: API Server files missing. Build failed to generate JS files.");
  process.exit(1);
}

app.use('/api', backendApp);
const frontendPath = path.join(__dirname, '../dist');
app.use(express.static(frontendPath));
app.get('*', (req, res) => res.sendFile(path.join(frontendPath, 'index.html')));

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Live on ${PORT}`));