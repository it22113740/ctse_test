import cors from "cors";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const PORT = Number(process.env.PORT) || 8080;
const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL || "http://localhost:3001";
const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || "http://localhost:3002";

const app = express();
app.use(cors());
// Do not use express.json() here — it consumes the body stream and proxied POST/PUT bodies arrive empty upstream.

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "api-gateway" });
});

/**
 * Express strips the mount path before the proxy sees req.url, so object pathRewrite
 * like "^/api/events" never matches. Use originalUrl and root-level proxies with pathFilter.
 */
function rewriteApiToService(apiPrefix: string, servicePrefix: string) {
  return (path: string, req: express.Request) => {
    const original = req.originalUrl?.split("?")[0] ?? path;
    if (!original.startsWith(apiPrefix)) return path;
    const tail = original.slice(apiPrefix.length) || "/";
    return servicePrefix + (tail === "/" ? "" : tail);
  };
}

app.use(
  createProxyMiddleware({
    target: EVENT_SERVICE_URL,
    changeOrigin: true,
    pathFilter: (pathname) => pathname.startsWith("/api/events"),
    pathRewrite: rewriteApiToService("/api/events", "/events"),
  }),
);

app.use(
  createProxyMiddleware({
    target: BOOKING_SERVICE_URL,
    changeOrigin: true,
    pathFilter: (pathname) => pathname.startsWith("/api/bookings"),
    pathRewrite: rewriteApiToService("/api/bookings", "/bookings"),
  }),
);

app.listen(PORT, () => {
  console.log(`api-gateway on ${PORT} -> events ${EVENT_SERVICE_URL}, bookings ${BOOKING_SERVICE_URL}`);
});
