import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

// Resolve directory names
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamically import the app instance
// Hum directly .ts use nahi kar sakte, aur compile ke baad location 
// shayad 'dist' folder ke andar chali gayi ho.
let app;
try {
  // Try 1: Original path with .js (Compiled location)
  const backend = await import('../artifacts/api-server/src/index.js');
  app = backend.app;
} catch (e) {
  try {
    // Try 2: Alternative compiled location (Common in workspaces)
    const backend = await import('../artifacts/api-server/dist/index.js');
    app = backend.app;
  } catch (err) {
    console.error("Critical: Could not find api-server index file.");
    process.exit(1);
  }
}

const server = express();
const PORT = process.env.PORT || 10000;

// Connect backend routes
server.use('/api', app);

// Serve Frontend
const frontendPath = path.join(__dirname, '../dist');
server.use(express.static(frontendPath));

server.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server finally live on port ${PORT}`);
});