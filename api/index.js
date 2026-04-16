// api/index.js (Rename it from .ts to .js)
export default async function handler(req, res) {
  try {
    // Dynamic import to handle ESM/CommonJS bridge
    const module = await import('../artifacts/api-server/src/index.js');
    const app = module.app;

    if (!app) {
      return res.status(500).json({ error: "Express app instance not found." });
    }

    // Standard Express handler for Vercel
    return app(req, res);
  } catch (error) {
    console.error('Runtime Crash Log:', error);
    return res.status(500).json({ 
      error: 'Backend failed to load', 
      message: error.message 
    });
  }
}