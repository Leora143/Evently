import { Hono } from "hono";
import crypto from "node:crypto";
import { requireAuth, requireRole } from "../middleware/auth.js";

const uploadRoutes = new Hono();

// The browser uploads straight to Cloudinary. This endpoint only hands out
// a short-lived signature, so the API secret never reaches the client and
// no image bytes pass through this server.
uploadRoutes.get(
  "/signature",
  requireAuth,
  requireRole("CREATOR", "ADMIN"),
  (c) => {
    const { CLOUDINARY_API_SECRET, CLOUDINARY_API_KEY, CLOUDINARY_CLOUD_NAME } =
      process.env;

    if (!CLOUDINARY_API_SECRET || !CLOUDINARY_API_KEY || !CLOUDINARY_CLOUD_NAME) {
      return c.json(
        { success: false, message: "Image uploads aren't configured yet" },
        503
      );
    }

    const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "evently";
    const timestamp = Math.round(Date.now() / 1000);

    const signature = crypto
      .createHash("sha1")
      .update(`folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`)
      .digest("hex");

    return c.json({
      success: true,
      data: {
        signature,
        timestamp,
        folder,
        apiKey: CLOUDINARY_API_KEY,
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadUrl: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      },
    });
  }
);

export default uploadRoutes;
