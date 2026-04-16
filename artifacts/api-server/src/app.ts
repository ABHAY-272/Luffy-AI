import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
// TS2834/2835 Fix: Added .js extensions for ESM
import router from "./routes.js";
import { logger } from "./lib/logger.js";

// TS2339 Fix: Casting to 'any' allows .use() and other methods to work without type conflicts
const app = express() as any;

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: any) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: any) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;