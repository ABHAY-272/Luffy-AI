// api/index.ts
// @ts-ignore
export default async function handler(req: any, res: any) {
  try {
    // @ts-ignore - Dynamic import to bridge CommonJS and ESM
    const module = await import('../artifacts/api-server/src/index.js');
    const app = module.app;

    if (!app) {
      return res.status(500).json({ error: "Express app instance not found." });
    }

    // Express handles the request
    return app(req, res);
  } catch (error: any) {
    console.error('Runtime Error:', error);
    return res.status(500).json({ 
      error: 'Backend failed to load', 
      message: error.message 
    });
  }
}