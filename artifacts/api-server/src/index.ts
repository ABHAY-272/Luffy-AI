// TS2835 Fix: ESM mode mein explicit .js extensions zaroori hain
import app from "./app.js"; 
import { logger } from "./lib/logger.js";

// TS2591 Fix: Node types recognize karne ke liye global declaration
declare const process: any;

// Exporting the app instance for Vercel
export { app }; 

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// TS7006 Fix: 'err' ko explicit type dena zaroori hai
app.listen(port, (err: any) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});