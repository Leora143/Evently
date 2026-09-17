import { Hono } from "hono";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const categoryRoutes = new Hono();

categoryRoutes.get("/", async (c) => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { events: true } } },
    orderBy: { name: "asc" },
  });

  return c.json({ success: true, data: categories });
});

categoryRoutes.post("/", requireAuth, requireRole("ADMIN"), async (c) => {
  const { name, icon } = await c.req.json();
  if (!name) return c.json({ success: false, message: "Name is required" }, 400);

  const category = await prisma.category.create({
    data: {
      name,
      icon: icon ?? "sparkle",
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    },
  });

  return c.json({ success: true, data: category }, 201);
});

export default categoryRoutes;
