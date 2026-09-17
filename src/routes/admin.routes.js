import { Hono } from "hono";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { roleSchema, fieldErrors } from "../lib/validators.js";

const adminRoutes = new Hono();

adminRoutes.use("*", requireAuth, requireRole("ADMIN"));

adminRoutes.get("/stats", async (c) => {
  const [users, creators, events, publicEvents, privateEvents, bookings, revenue] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "CREATOR" } }),
      prisma.event.count(),
      prisma.event.count({ where: { type: "PUBLIC" } }),
      prisma.event.count({ where: { type: "PRIVATE" } }),
      prisma.booking.count({ where: { status: { not: "CANCELLED" } } }),
      prisma.booking.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { amount: true },
      }),
    ]);

  return c.json({
    success: true,
    data: {
      users,
      creators,
      events,
      publicEvents,
      privateEvents,
      bookings,
      revenue: revenue._sum.amount ?? 0,
    },
  });
});

adminRoutes.get("/users", async (c) => {
  const search = c.req.query("search");

  const users = await prisma.user.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
      _count: { select: { events: true, bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return c.json({ success: true, data: users });
});

adminRoutes.patch("/users/:id/role", async (c) => {
  const parsed = roleSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({ success: false, errors: fieldErrors(parsed.error) }, 400);
  }
  if (c.req.param("id") === c.get("user").id) {
    return c.json(
      { success: false, message: "You can't change your own role" },
      400
    );
  }

  const user = await prisma.user.update({
    where: { id: c.req.param("id") },
    data: { role: parsed.data.role },
    select: { id: true, name: true, email: true, role: true },
  });

  return c.json({ success: true, data: user });
});

adminRoutes.delete("/users/:id", async (c) => {
  if (c.req.param("id") === c.get("user").id) {
    return c.json({ success: false, message: "You can't delete yourself" }, 400);
  }
  await prisma.user.delete({ where: { id: c.req.param("id") } });
  return c.json({ success: true, message: "User removed" });
});

adminRoutes.get("/events", async (c) => {
  const events = await prisma.event.findMany({
    include: {
      organizer: { select: { id: true, name: true, email: true } },
      category: { select: { name: true, slug: true } },
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return c.json({ success: true, data: events });
});

adminRoutes.patch("/events/:id/status", async (c) => {
  const { status } = await c.req.json();
  if (!["DRAFT", "PUBLISHED", "CANCELLED"].includes(status)) {
    return c.json({ success: false, message: "Unknown status" }, 400);
  }

  const event = await prisma.event.update({
    where: { id: c.req.param("id") },
    data: { status },
  });

  return c.json({ success: true, data: event });
});

export default adminRoutes;
