import { Hono } from "hono";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole, canManageEvent } from "../middleware/auth.js";
import { makeInviteCode } from "../lib/codes.js";
import { eventSchema, inviteSchema, fieldErrors } from "../lib/validators.js";

const eventRoutes = new Hono();

const withRelations = {
  category: { select: { id: true, name: true, slug: true, icon: true } },
  organizer: { select: { id: true, name: true, avatarUrl: true } },
};

const seatsLeft = (event) => event.totalSeats - event.bookedSeats;

// Every event has an inviteCode under the hood now (needed so the unique
// index never has to deal with nulls on Mongo). Public events just don't
// use theirs for anything, so we strip it out of what we send back unless
// the event is actually PRIVATE.
const shape = (event) => {
  const { inviteCode, ...rest } = event;
  return {
    ...rest,
    ...(event.type === "PRIVATE" ? { inviteCode } : {}),
    seatsLeft: seatsLeft(event),
  };
};

// NOTE on Mongo + inviteCode:
// Every event gets a generated inviteCode on create, public or private.
// This keeps the field always-present and always-unique, so the unique
// index never has to reason about null vs. missing. Public events simply
// never expose or use their code (see `shape` above). There's a small
// retry loop in case of a genuine (very unlikely) collision.
const MAX_INVITE_CODE_ATTEMPTS = 5;

const isInviteCodeCollision = (err) =>
  err?.code === "P2002" && err?.meta?.target?.includes("inviteCode");

async function createEventWithUniqueInvite(data) {
  for (let attempt = 0; attempt < MAX_INVITE_CODE_ATTEMPTS; attempt++) {
    try {
      return await prisma.event.create({
        data: { ...data, inviteCode: makeInviteCode() },
        include: withRelations,
      });
    } catch (err) {
      if (isInviteCodeCollision(err)) continue;
      throw err;
    }
  }

  throw new Error("Could not generate a unique invite code, please try again");
}

async function updateEventWithUniqueInvite(existing, data) {
  // Every event should already have a code from creation. Keep it as-is
  // regardless of type — we don't regenerate on type changes, we just
  // stop exposing it in `shape` for non-private events.
  if (existing.inviteCode) {
    return prisma.event.update({
      where: { id: existing.id },
      data: { ...data, inviteCode: existing.inviteCode },
      include: withRelations,
    });
  }

  // Backfill safety net: older rows created before this fix may still be
  // missing a code. Generate one now so they're brought in line.
  for (let attempt = 0; attempt < MAX_INVITE_CODE_ATTEMPTS; attempt++) {
    try {
      return await prisma.event.update({
        where: { id: existing.id },
        data: { ...data, inviteCode: makeInviteCode() },
        include: withRelations,
      });
    } catch (err) {
      if (isInviteCodeCollision(err)) continue;
      throw err;
    }
  }

  throw new Error("Could not generate a unique invite code, please try again");
}

// ---- Browse public events ------------------------------------------------
// Private events never show up here. They are reached by invite code only.
eventRoutes.get("/", async (c) => {
  const { search, category, paid, when } = c.req.query();

  const where = {
    type: "PUBLIC",
    status: "PUBLISHED",
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(category && category !== "all" && { category: { slug: category } }),
    ...(paid === "free" && { isPaid: false }),
    ...(paid === "paid" && { isPaid: true }),
    ...(when === "upcoming" && { date: { gte: new Date() } }),
  };

  const events = await prisma.event.findMany({
    where,
    include: withRelations,
    orderBy: { date: "asc" },
  });

  return c.json({ success: true, data: events.map(shape) });
});

// ---- Events the signed-in user organises ---------------------------------
eventRoutes.get("/mine", requireAuth, async (c) => {
  const user = c.get("user");

  const events = await prisma.event.findMany({
    // An admin's "My events" list is everything on the platform.
    where: user.role === "ADMIN" ? {} : { organizerId: user.id },
    include: { ...withRelations, _count: { select: { bookings: true } } },
    orderBy: { createdAt: "desc" },
  });

  return c.json({ success: true, data: events.map(shape) });
});

// ---- Look up a private event by its invite code --------------------------
eventRoutes.get("/invite/:code", async (c) => {
  const event = await prisma.event.findUnique({
    where: { inviteCode: c.req.param("code").toUpperCase() },
    include: withRelations,
  });

  // Only PRIVATE events should ever be reachable this way — a public
  // event's code is an internal implementation detail, not a real link.
  if (!event || event.type !== "PRIVATE" || event.status === "CANCELLED") {
    return c.json(
      { success: false, message: "That invite link doesn't work anymore" },
      404
    );
  }

  return c.json({ success: true, data: shape(event) });
});

// ---- Single event --------------------------------------------------------
eventRoutes.get("/:id", async (c) => {
  const user = c.get("user");
  const event = await prisma.event.findUnique({
    where: { id: c.req.param("id") },
    include: withRelations,
  });

  if (!event) {
    return c.json({ success: false, message: "Event not found" }, 404);
  }

  // A private event is only readable by its organiser, an admin,
  // or someone who arrived with the invite code.
  if (event.type === "PRIVATE") {
    const code = c.req.query("code")?.toUpperCase();
    const allowed =
      code === event.inviteCode || (user && canManageEvent(user, event));
    if (!allowed) {
      return c.json(
        { success: false, message: "This event is invite only" },
        403
      );
    }
  }

  return c.json({ success: true, data: shape(event) });
});

// ---- Attendee list (organiser / admin only) ------------------------------
eventRoutes.get("/:id/attendees", requireAuth, async (c) => {
  const event = await prisma.event.findUnique({
    where: { id: c.req.param("id") },
  });
  if (!event) return c.json({ success: false, message: "Event not found" }, 404);
  if (!canManageEvent(c.get("user"), event)) {
    return c.json({ success: false, message: "Not your event" }, 403);
  }

  const bookings = await prisma.booking.findMany({
    where: { eventId: event.id, status: { not: "CANCELLED" } },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return c.json({ success: true, data: bookings });
});

// ---- Create --------------------------------------------------------------
eventRoutes.post("/", requireAuth, requireRole("CREATOR", "ADMIN"), async (c) => {
  const parsed = eventSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({ success: false, errors: fieldErrors(parsed.error) }, 400);
  }

  const { date, ...rest } = parsed.data;

  try {
    const event = await createEventWithUniqueInvite({
      ...rest,
      date: new Date(date),
      price: rest.isPaid ? rest.price : 0,
      organizerId: c.get("user").id,
    });

    return c.json({ success: true, data: shape(event) }, 201);
  } catch (err) {
    console.error("Failed to create event:", err);
    return c.json(
      { success: false, message: "Could not create the event, please try again" },
      500
    );
  }
});

// ---- Update --------------------------------------------------------------
eventRoutes.patch("/:id", requireAuth, async (c) => {
  const existing = await prisma.event.findUnique({
    where: { id: c.req.param("id") },
  });
  if (!existing) {
    return c.json({ success: false, message: "Event not found" }, 404);
  }
  if (!canManageEvent(c.get("user"), existing)) {
    return c.json({ success: false, message: "Not your event" }, 403);
  }

  const parsed = eventSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({ success: false, errors: fieldErrors(parsed.error) }, 400);
  }

  const { date, ...rest } = parsed.data;

  // Seats already sold set the floor for how far capacity can shrink.
  if (rest.totalSeats < existing.bookedSeats) {
    return c.json(
      {
        success: false,
        errors: {
          totalSeats: `${existing.bookedSeats} seats are already booked`,
        },
      },
      400
    );
  }

  try {
    const event = await updateEventWithUniqueInvite(existing, {
      ...rest,
      date: new Date(date),
      price: rest.isPaid ? rest.price : 0,
    });

    return c.json({ success: true, data: shape(event) });
  } catch (err) {
    console.error("Failed to update event:", err);
    return c.json(
      { success: false, message: "Could not update the event, please try again" },
      500
    );
  }
});

// ---- Cancel / delete -----------------------------------------------------
eventRoutes.delete("/:id", requireAuth, async (c) => {
  const event = await prisma.event.findUnique({
    where: { id: c.req.param("id") },
  });
  if (!event) return c.json({ success: false, message: "Event not found" }, 404);
  if (!canManageEvent(c.get("user"), event)) {
    return c.json({ success: false, message: "Not your event" }, 403);
  }

  // Bookings exist, so keep the record and cancel it instead of deleting.
  if (event.bookedSeats > 0) {
    await prisma.$transaction([
      prisma.event.update({
        where: { id: event.id },
        data: { status: "CANCELLED" },
      }),
      prisma.booking.updateMany({
        where: { eventId: event.id, status: { not: "CANCELLED" } },
        data: { status: "CANCELLED" },
      }),
    ]);
    return c.json({ success: true, message: "Event cancelled, guests notified" });
  }

  await prisma.event.delete({ where: { id: event.id } });
  return c.json({ success: true, message: "Event deleted" });
});

// ---- Guest list for private events ---------------------------------------
eventRoutes.get("/:id/invites", requireAuth, async (c) => {
  const event = await prisma.event.findUnique({
    where: { id: c.req.param("id") },
  });
  if (!event) return c.json({ success: false, message: "Event not found" }, 404);
  if (!canManageEvent(c.get("user"), event)) {
    return c.json({ success: false, message: "Not your event" }, 403);
  }

  const invites = await prisma.invite.findMany({
    where: { eventId: event.id },
    orderBy: { createdAt: "desc" },
  });

  return c.json({ success: true, data: invites });
});

eventRoutes.post("/:id/invites", requireAuth, async (c) => {
  const event = await prisma.event.findUnique({
    where: { id: c.req.param("id") },
  });
  if (!event) return c.json({ success: false, message: "Event not found" }, 404);
  if (!canManageEvent(c.get("user"), event)) {
    return c.json({ success: false, message: "Not your event" }, 403);
  }

  const parsed = inviteSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({ success: false, errors: fieldErrors(parsed.error) }, 400);
  }

  const invite = await prisma.invite.upsert({
    where: { eventId_email: { eventId: event.id, email: parsed.data.email } },
    update: { name: parsed.data.name },
    create: { ...parsed.data, eventId: event.id },
  });

  return c.json({ success: true, data: invite }, 201);
});

eventRoutes.delete("/:id/invites/:inviteId", requireAuth, async (c) => {
  const event = await prisma.event.findUnique({
    where: { id: c.req.param("id") },
  });
  if (!event) return c.json({ success: false, message: "Event not found" }, 404);
  if (!canManageEvent(c.get("user"), event)) {
    return c.json({ success: false, message: "Not your event" }, 403);
  }

  await prisma.invite.delete({ where: { id: c.req.param("inviteId") } });
  return c.json({ success: true, message: "Guest removed" });
});

export default eventRoutes;