import "dotenv/config";
import { serve } from "@hono/node-server";
import app from "./app.js";

const port = Number(process.env.PORT) || 5000;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Evently API listening on http://localhost:${info.port}`);
});
