import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarBlank,
  Clock,
  MapPin,
  Users,
  Minus,
  Plus,
  CircleNotch,
  CheckCircle,
  Ticket,
  ShieldCheck,
} from "@phosphor-icons/react";
import { createBooking, payBooking } from "@/lib/api/bookings";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Badge } from "@/components/common/Badge";
import { EventTypeChip } from "@/components/common/EventTypeChip";
import { countdown, formatDate, formatMoney, formatTime } from "@/lib/format";

export function EventDetail({ event, inviteCode }) {
  const { isSignedIn, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [seats, setSeats] = useState(1);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

  const seatsLeft = event.seatsLeft ?? event.totalSeats - event.bookedSeats;
  const soldOut = seatsLeft <= 0;
  const isPast = new Date(event.date) < new Date();
  const isHost = user?.id === event.organizerId;
  const maxSeats = Math.min(10, seatsLeft);
  const total = event.isPaid ? event.price * seats : 0;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["event", event.id] });
    queryClient.invalidateQueries({ queryKey: ["bookings"] });
  };

  const book = useMutation({
    mutationFn: createBooking,
    onSuccess: (created) => {
      setBooking(created);
      setError("");
      refresh();
    },
    onError: (mutationError) => setError(mutationError.message),
  });

  const pay = useMutation({
    mutationFn: payBooking,
    onSuccess: (paid) => {
      setBooking(paid);
      setError("");
      refresh();
    },
    onError: (mutationError) => setError(mutationError.message),
  });

  const isBusy = book.isPending || pay.isPending;

  return (
    <div className="max-w-5xl mx-auto w-full px-5 sm:px-8 py-8">
      <div className="relative h-52 sm:h-72 rounded-2xl overflow-hidden grid place-items-center bg-linear-to-br from-imperial via-amethyst to-orchid/70">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="font-serif text-6xl text-moon/20">
            {event.title[0].toUpperCase()}
          </span>
        )}
        <div className="absolute top-4 left-4 flex gap-2">
          <EventTypeChip type={event.type} />
          {event.category && <Badge tone="neutral">{event.category.name}</Badge>}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mt-7">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amethyst">{countdown(event.date)}</p>
          <h1 className="font-serif text-3xl sm:text-4xl leading-tight text-imperial mt-1.5">
            {event.title}
          </h1>

          <div className="flex flex-wrap gap-x-6 gap-y-2.5 mt-5 text-sm text-imperial/65">
            <span className="flex items-center gap-2">
              <CalendarBlank size={16} className="text-amethyst" />
              {formatDate(event.date)}
            </span>
            <span className="flex items-center gap-2">
              <Clock size={16} className="text-amethyst" />
              {formatTime(event.startTime)} – {formatTime(event.endTime)}
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-amethyst" />
              {event.location}
            </span>
          </div>

          <h2 className="font-serif text-xl text-imperial mt-8 mb-2">
            About this event
          </h2>
          <p className="text-[15px] leading-relaxed text-imperial/70 whitespace-pre-wrap max-w-prose">
            {event.description}
          </p>

          <div className="flex items-center gap-3 mt-8 p-4 rounded-2xl bg-white border border-lavender/20">
            <div className="w-10 h-10 rounded-full grid place-items-center font-serif text-moon bg-linear-to-br from-orchid to-amethyst">
              {event.organizer?.name?.[0] ?? "E"}
            </div>
            <div>
              <p className="text-xs text-imperial/45">Hosted by</p>
              <p className="text-sm font-semibold text-imperial">
                {event.organizer?.name}
              </p>
            </div>
          </div>
        </div>

        <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-6 h-fit">
          <div className="rounded-2xl p-5 bg-white border border-lavender/25">
            {booking ? (
              <BookingResult
                booking={booking}
                event={event}
                onPay={() => pay.mutate({ id: booking.id })}
                isPaying={pay.isPending}
                error={error}
              />
            ) : (
              <>
                <p className="text-xs font-medium text-imperial/50">
                  {event.isPaid ? "Per seat" : "Entry"}
                </p>
                <p className="font-serif text-3xl text-imperial mt-0.5">
                  {event.isPaid ? formatMoney(event.price, event.currency) : "Free"}
                </p>

                <div className="flex items-center gap-2 mt-3 text-xs text-imperial/55">
                  <Users size={14} />
                  {soldOut
                    ? "No seats left"
                    : `${seatsLeft} of ${event.totalSeats} seats left`}
                </div>

                <div className="h-px bg-lavender/25 my-4" />

                {isPast ? (
                  <Notice>This event has already happened.</Notice>
                ) : event.status !== "PUBLISHED" ? (
                  <Notice>
                    {event.status === "CANCELLED"
                      ? "This event was cancelled."
                      : "This event isn't open for bookings yet."}
                  </Notice>
                ) : isHost ? (
                  <Notice>You're hosting this one. Manage it from your dashboard.</Notice>
                ) : soldOut ? (
                  <Notice>Every seat is taken.</Notice>
                ) : !isSignedIn ? (
                  <>
                    <p className="text-sm text-imperial/60 mb-3">
                      Sign in to reserve a seat. It takes a moment.
                    </p>
                    <button
                      onClick={() =>
                        navigate({
                          to: "/login",
                          search: { redirect: window.location.pathname },
                        })
                      }
                      className="w-full py-3 rounded-xl text-sm font-semibold bg-linear-to-br from-orchid to-amethyst text-moon"
                    >
                      Sign in to book
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-imperial/80 mb-2">
                      How many seats?
                    </p>
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-moon">
                      <button
                        onClick={() => setSeats((count) => Math.max(1, count - 1))}
                        disabled={seats <= 1}
                        aria-label="One seat fewer"
                        className="w-8 h-8 rounded-lg grid place-items-center bg-white text-amethyst disabled:opacity-40"
                      >
                        <Minus size={13} weight="bold" />
                      </button>
                      <span className="text-sm font-semibold text-imperial">{seats}</span>
                      <button
                        onClick={() => setSeats((count) => Math.min(maxSeats, count + 1))}
                        disabled={seats >= maxSeats}
                        aria-label="One seat more"
                        className="w-8 h-8 rounded-lg grid place-items-center bg-white text-amethyst disabled:opacity-40"
                      >
                        <Plus size={13} weight="bold" />
                      </button>
                    </div>
                    {maxSeats < 10 && (
                      <p className="text-xs text-imperial/45 mt-1.5">
                        {maxSeats} seat{maxSeats > 1 ? "s" : ""} available to you.
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-dashed border-lavender/40">
                      <span className="text-sm text-imperial/60">Total</span>
                      <span className="font-serif text-xl text-imperial">
                        {event.isPaid ? formatMoney(total, event.currency) : "Free"}
                      </span>
                    </div>

                    {error && (
                      <p className="text-xs mt-3 px-3 py-2 rounded-lg bg-rose-soft text-rose-deep">
                        {error}
                      </p>
                    )}

                    <button
                      onClick={() =>
                        book.mutate({ eventId: event.id, seats, inviteCode })
                      }
                      disabled={isBusy}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold mt-4 bg-linear-to-br from-orchid to-amethyst text-moon transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      {book.isPending && (
                        <CircleNotch size={15} className="animate-spin" />
                      )}
                      {event.isPaid ? "Reserve and pay" : "Book my seat"}
                    </button>

                    <p className="flex items-center gap-1.5 text-xs text-imperial/40 mt-3">
                      <ShieldCheck size={13} />
                      Cancel any time before the event day.
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Notice({ children }) {
  return (
    <p className="text-sm px-3.5 py-3 rounded-xl bg-moon text-imperial/60">
      {children}
    </p>
  );
}

// Shown in place of the booking form once a booking exists.
// A paid booking sits here as "payment due" until it goes through.
function BookingResult({ booking, event, onPay, isPaying, error }) {
  const needsPayment = booking.paymentStatus === "PENDING";

  return (
    <div>
      <div className="flex items-center gap-2.5">
        {needsPayment ? (
          <Ticket size={22} className="text-amber-deep" weight="fill" />
        ) : (
          <CheckCircle size={22} className="text-leaf" weight="fill" />
        )}
        <p className="font-serif text-xl text-imperial">
          {needsPayment ? "Seat held" : "You're going"}
        </p>
      </div>

      <p className="text-sm text-imperial/60 mt-2 leading-relaxed">
        {needsPayment
          ? `We're holding ${booking.seats} seat${booking.seats > 1 ? "s" : ""} for you. Pay to get your ticket.`
          : `${booking.seats} seat${booking.seats > 1 ? "s" : ""} confirmed. Show this code at the door.`}
      </p>

      {!needsPayment && (
        <div className="ticket-notch mt-4 p-4 rounded-xl border-l-2 border-dashed border-lavender/50 bg-moon">
          <p className="text-xs text-imperial/45">Ticket code</p>
          <p className="font-serif text-xl tracking-wide text-imperial mt-0.5">
            {booking.code}
          </p>
        </div>
      )}

      {needsPayment && (
        <>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-dashed border-lavender/40">
            <span className="text-sm text-imperial/60">Amount due</span>
            <span className="font-serif text-xl text-imperial">
              {formatMoney(booking.amount, event.currency)}
            </span>
          </div>

          {error && (
            <p className="text-xs mt-3 px-3 py-2 rounded-lg bg-rose-soft text-rose-deep">
              {error}
            </p>
          )}

          <button
            onClick={onPay}
            disabled={isPaying}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold mt-4 bg-linear-to-br from-orchid to-amethyst text-moon disabled:opacity-60"
          >
            {isPaying && <CircleNotch size={15} className="animate-spin" />}
            Pay {formatMoney(booking.amount, event.currency)}
          </button>
          <p className="text-xs text-imperial/40 mt-2.5">
            Test payment. Swap in a real gateway before you go live.
          </p>
        </>
      )}

      <Link
        to="/dashboard/bookings"
        className="block text-center text-sm font-medium text-amethyst mt-4 hover:underline"
      >
        See all my bookings
      </Link>
    </div>
  );
}
