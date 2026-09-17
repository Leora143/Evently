import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { attachUser } from "./middleware/auth.js";
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: (process.env.CLIENT_URL || "http://localhost:5173").split(","),
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.use("*", attachUser);

app.get("/", (c) => c.json({ message: "Evently API is running" }));

app.route("/api/auth", authRoutes);
app.route("/api/events", eventRoutes);
app.route("/api/bookings", bookingRoutes);
app.route("/api/categories", categoryRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/upload", uploadRoutes);

app.notFound((c) => c.json({ success: false, message: "Route not found" }, 404));

app.onError((error, c) => {
  // Mongo ids are ObjectIds. A malformed one in the URL is a bad request,
  // not a server fault.
  if (error.code === "P2023" || error.code === "P2025") {
    return c.json({ success: false, message: "Not found" }, 404);
  }

  console.error(error);
  return c.json({ success: false, message: "Something went wrong on our side" }, 500);
});

export default app;