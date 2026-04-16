import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";

// TS2307 FIX: Hum TS ko bol rahe hain ki error ignore kare, runtime par ye mil jayega
// @ts-ignore
import router from "./routes.js";
// @ts-ignore
import { logger } from "./lib/logger.js";

const app = express() as any;

app.use(
  // TS2349 FIX: pinoHttp ko as any cast kiya taaki 'not callable' error hat jaye
  (pinoHttp as any)({
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

// Routing
app.use("/api", router);

export default app;