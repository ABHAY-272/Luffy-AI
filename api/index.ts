// api/index.ts - Simplified for Build Bypass
export default async function handler(req: any, res: any) {
  try {
    // Dynamic import to bridge CommonJS and ESM format
    // Force naya file path for fresh build
    const module = await import('../artifacts/api-server/src/index.js');
    const app = module.app;

    if (!app) {
      throw new Error("Express app instance not found.");
    }

    // Express handles the request
    return app(req, res);
  } catch (error: any) {
    console.error('Runtime Error:', error);
    res.status(500).json({ 
      error: 'Backend failed to load', 
      message: error.message 
    });
  }
}