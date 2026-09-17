import { verifyToken } from "../lib/jwt.js";
import prisma from "../lib/prisma.js";

// Reads the bearer token if there is one, but never blocks the request.
// Public event pages use this so signed-in extras can render.
export const attachUser = async (c, next) => {
  const header = c.req.header("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (token) {
    const payload = verifyToken(token);
    if (payload?.sub) {
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, name: true, email: true, role: true, avatarUrl: true },
      });
      if (user) c.set("user", user);
    }
  }

  await next();
};

export const requireAuth = async (c, next) => {
  if (!c.get("user")) {
    return c.json({ success: false, message: "Sign in to continue" }, 401);
  }
  await next();
};

// requireRole("ADMIN") or requireRole("CREATOR", "ADMIN")
export const requireRole =
  (...roles) =>
  async (c, next) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ success: false, message: "Sign in to continue" }, 401);
    }
    if (!roles.includes(user.role)) {
      return c.json(
        { success: false, message: "Your account can't do that" },
        403
      );
    }
    await next();
  };

// Admins can touch everything; creators only their own events.
export const canManageEvent = (user, event) =>
  user.role === "ADMIN" || event.organizerId === user.id;
