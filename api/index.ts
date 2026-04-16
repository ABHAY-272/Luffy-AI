// api/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Dynamic import for ESM compatibility
    const { app } = await import('../artifacts/api-server/src/index.js');

    // Express app ko request handle karne ke liye pass kar rahe hain
    return app(req, res);
  } catch (error: any) {
    console.error('Vercel Entry Point Error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message 
    });
  }
}