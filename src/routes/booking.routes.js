import { Hono } from "hono";
import prisma from "../lib/prisma.js";
import { requireAuth, canManageEvent } from "../middleware/auth.js";
import { makeTicketCode } from "../lib/codes.js";
import { bookingSchema, fieldErrors } from "../lib/validators.js";

const bookingRoutes = new Hono();

const withEvent = {
  event: {
    include: {
      category: { select: { name: true, slug: true, icon: true } },
      organizer: { select: { id: true, name: true } },
    },
  },
};

// ---- My bookings ---------------------------------------------------------
bookingRoutes.get("/", requireAuth, async (c) => {
  const bookings = await prisma.booking.findMany({
    where: { userId: c.get("user").id },
    include: withEvent,
    orderBy: { createdAt: "desc" },
  });

  return c.json({ success: true, data: bookings });
});

bookingRoutes.get("/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const booking = await prisma.booking.findUnique({
    where: { id: c.req.param("id") },
    include: withEvent,
  });

  if (!booking) {
    return c.json({ success: false, message: "Booking not found" }, 404);
  }
  if (booking.userId !== user.id && !canManageEvent(user, booking.event)) {
    return c.json({ success: false, message: "Not your booking" }, 403);
  }

  return c.json({ success: true, data: booking });
});

// ---- Book seats ----------------------------------------------------------
// Free events confirm straight away. Paid events are held as PENDING until
// payment comes back, but the seats are reserved either way so two people
// can't take the same last seat.
bookingRoutes.post("/", requireAuth, async (c) => {
  const parsed = bookingSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({ success: false, errors: fieldErrors(parsed.error) }, 400);
  }

  const user = c.get("user");
  const { eventId, seats, inviteCode } = parsed.data;

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({ where: { id: eventId } });

      if (!event) throw new Error("Event not found");
      if (event.status !== "PUBLISHED") throw new Error("This event isn't taking bookings");
      if (new Date(event.date) < new Date()) throw new Error("This event has already happened");
      if (event.organizerId === user.id) throw new Error("You're hosting this one");

      if (
        event.type === "PRIVATE" &&
        inviteCode?.toUpperCase() !== event.inviteCode &&
        user.role !== "ADMIN"
      ) {
        throw new Error("This event is invite only");
      }

      const left = event.totalSeats - event.bookedSeats;
      if (left < seats) {
        throw new Error(
          left === 0 ? "This event is sold out" : `Only ${left} seats left`
        );
      }

      const already = await tx.booking.findFirst({
        where: { eventId, userId: user.id, status: { not: "CANCELLED" } },
      });
      if (already) throw new Error("You already have a booking for this event");

      await tx.event.update({
        where: { id: eventId },
        data: { bookedSeats: { increment: seats } },
      });

      return tx.booking.create({
        data: {
          code: makeTicketCode(),
          eventId,
          userId: user.id,
          seats,
          amount: event.isPaid ? event.price * seats : 0,
          status: event.isPaid ? "PENDING" : "CONFIRMED",
          paymentStatus: event.isPaid ? "PENDING" : "FREE",
        },
        include: withEvent,
      });
    });

    return c.json({ success: true, data: booking }, 201);
  } catch (error) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

// ---- Pay for a pending booking -------------------------------------------
// Swap the body of this handler for a real gateway verification when you
// add one. Razorpay and Stripe both have free test modes; the shape of
// this endpoint (reference in, CONFIRMED out) stays the same.
bookingRoutes.post("/:id/pay", requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const booking = await prisma.booking.findUnique({
    where: { id: c.req.param("id") },
  });

  if (!booking) {
    return c.json({ success: false, message: "Booking not found" }, 404);
  }
  if (booking.userId !== c.get("user").id) {
    return c.json({ success: false, message: "Not your booking" }, 403);
  }
  if (booking.paymentStatus === "PAID") {
    return c.json({ success: false, message: "This one is already paid" }, 400);
  }

  const paid = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentRef: body.paymentRef ?? `SIM-${Date.now()}`,
    },
    include: withEvent,
  });

  return c.json({ success: true, data: paid });
});

// ---- Cancel --------------------------------------------------------------
bookingRoutes.post("/:id/cancel", requireAuth, async (c) => {
  const booking = await prisma.booking.findUnique({
    where: { id: c.req.param("id") },
    include: { event: true },
  });

  if (!booking) {
    return c.json({ success: false, message: "Booking not found" }, 404);
  }
  if (booking.userId !== c.get("user").id) {
    return c.json({ success: false, message: "Not your booking" }, 403);
  }
  if (booking.status === "CANCELLED") {
    return c.json({ success: false, message: "Already cancelled" }, 400);
  }
  if (new Date(booking.event.date) < new Date()) {
    return c.json(
      { success: false, message: "Past events can't be cancelled" },
      400
    );
  }

  const [, cancelled] = await prisma.$transaction([
    prisma.event.update({
      where: { id: booking.eventId },
      data: { bookedSeats: { decrement: booking.seats } },
    }),
    prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "CANCELLED",
        paymentStatus: booking.paymentStatus === "PAID" ? "REFUNDED" : booking.paymentStatus,
      },
      include: withEvent,
    }),
  ]);

  return c.json({ success: true, data: cancelled });
});

// ---- Check a ticket in at the door (organiser / admin) -------------------
bookingRoutes.post("/check-in/:code", requireAuth, async (c) => {
  const booking = await prisma.booking.findUnique({
    where: { code: c.req.param("code").toUpperCase() },
    include: { event: true, user: { select: { name: true, email: true } } },
  });

  if (!booking) {
    return c.json({ success: false, message: "No ticket with that code" }, 404);
  }
  if (!canManageEvent(c.get("user"), booking.event)) {
    return c.json({ success: false, message: "Not your event" }, 403);
  }
  if (booking.status !== "CONFIRMED") {
    return c.json(
      { success: false, message: `This ticket is ${booking.status.toLowerCase()}` },
      400
    );
  }
  if (booking.checkedIn) {
    return c.json({ success: false, message: "Already checked in" }, 400);
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { checkedIn: true, checkedInAt: new Date() },
    include: { user: { select: { name: true, email: true } } },
  });

  return c.json({ success: true, data: updated });
});

export default bookingRoutes;
