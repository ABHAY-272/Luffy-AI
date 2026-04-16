// ESM imports with .js extension
import app from "./app.js"; 
import { logger } from "./lib/logger.js";

// Global process declaration for TS
declare const process: any;

// Named export for Vercel gateway
export { app }; 

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

/** * TS2339 FIX: 'app' ko 'any' cast kiya hai taaki .listen() 
 * safely call ho sake bina interface conflict ke.
 */
(app as any).listen(port, (err: any) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});