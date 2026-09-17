import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Ticket,
  CalendarBlank,
  MapPin,
  Clock,
  X,
  CircleNotch,
} from "@phosphor-icons/react";
import { cancelBooking, myBookingsQueryOptions, payBooking } from "@/lib/api/bookings";
import { Header } from "@/components/dashboard/Header";
import { useDashboardMenu } from "@/components/dashboard/menu-context";
import { Badge, BOOKING_TONE } from "@/components/common/Badge";
import { Empty, ErrorState, Loading } from "@/components/common/States";
import { formatDate, formatMoney, formatTime } from "@/lib/format";

export const Route = createFileRoute("/dashboard/bookings")({
  component: BookingsPage,
});

const TABS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "cancelled", label: "Cancelled" },
];

function BookingsPage() {
  const { openMenu } = useDashboardMenu();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState("upcoming");
  const [selected, setSelected] = useState(null);

  const { data: bookings = [], isLoading, isError, error, refetch } = useQuery(
    myBookingsQueryOptions()
  );

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["bookings"] });

  const pay = useMutation({
    mutationFn: payBooking,
    onSuccess: (updated) => {
      setSelected(updated);
      refresh();
    },
  });

  const cancel = useMutation({
    mutationFn: cancelBooking,
    onSuccess: (updated) => {
      setSelected(updated);
      refresh();
    },
  });

  const now = new Date();
  const visible = bookings.filter((booking) => {
    if (tab === "cancelled") return booking.status === "CANCELLED";
    if (booking.status === "CANCELLED") return false;
    const isPast = new Date(booking.event.date) < now;
    return tab === "past" ? isPast : !isPast;
  });

  if (isLoading) return <Loading label="Loading your tickets" />;
  if (isError) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <>
      <Header
        title="My bookings"
        subtitle="Every seat you've reserved, with its ticket code."
        onOpenMenu={openMenu}
      />

      <div className="flex gap-1 p-1 rounded-xl bg-white border border-lavender/25 w-fit mb-6">
        {TABS.map((item) => (
          <button
            key={item.value}
            onClick={() => setTab(item.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === item.value
                ? "bg-amethyst text-moon"
                : "text-imperial/60 hover:text-imperial"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Empty
          icon={Ticket}
          title={tab === "upcoming" ? "Nothing coming up" : `No ${tab} bookings`}
          message={
            tab === "upcoming"
              ? "Book something and your ticket will land here."
              : undefined
          }
          action={tab === "upcoming" ? "Browse events" : undefined}
          actionTo={tab === "upcoming" ? "/events" : undefined}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {visible.map((booking) => (
            <button
              key={booking.id}
              onClick={() => setSelected(booking)}
              className="text-left rounded-2xl bg-white border border-lavender/20 overflow-hidden transition-colors hover:border-orchid/50"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-serif text-lg leading-snug text-imperial">
                    {booking.event.title}
                  </h3>
                  <Badge tone={BOOKING_TONE[booking.status]}>
                    {booking.status === "PENDING"
                      ? "Payment due"
                      : booking.status.toLowerCase()}
                  </Badge>
                </div>

                <div className="flex flex-col gap-1.5 mt-3 text-xs text-imperial/55">
                  <span className="flex items-center gap-1.5">
                    <CalendarBlank size={13} /> {formatDate(booking.event.date)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} /> {formatTime(booking.event.startTime)}
                  </span>
                  <span className="flex items-center gap-1.5 truncate">
                    <MapPin size={13} /> {booking.event.location}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between px-4 py-3 border-t-2 border-dashed border-lavender/35 bg-moon">
                <div>
                  <p className="text-xs text-imperial/45">Ticket code</p>
                  <p className="font-serif text-base tracking-wide text-imperial">
                    {booking.status === "CONFIRMED" ? booking.code : "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-imperial/45">
                    {booking.seats} seat{booking.seats > 1 ? "s" : ""}
                  </p>
                  <p className="text-sm font-semibold text-imperial">
                    {booking.amount > 0 ? formatMoney(booking.amount) : "Free"}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <TicketDialog
          booking={selected}
          onClose={() => setSelected(null)}
          onPay={() => pay.mutate({ id: selected.id })}
          onCancel={() => cancel.mutate(selected.id)}
          isPaying={pay.isPending}
          isCancelling={cancel.isPending}
          error={pay.error?.message || cancel.error?.message}
        />
      )}
    </>
  );
}

function TicketDialog({
  booking,
  onClose,
  onPay,
  onCancel,
  isPaying,
  isCancelling,
  error,
}) {
  const { event } = booking;
  const isPast = new Date(event.date) < new Date();
  const canCancel = booking.status !== "CANCELLED" && !isPast;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-5 bg-imperial/60">
      <div className="w-full max-w-sm rounded-2xl bg-white overflow-hidden">
        <div className="flex items-start justify-between gap-3 p-5 pb-4">
          <div>
            <p className="text-xs text-imperial/45">
              {event.category?.name ?? "Event"}
            </p>
            <h2 className="font-serif text-xl leading-snug text-imperial mt-0.5">
              {event.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full grid place-items-center shrink-0 bg-moon text-imperial/60"
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-5 pb-4 flex flex-col gap-2 text-sm text-imperial/65">
          <span className="flex items-center gap-2">
            <CalendarBlank size={15} className="text-amethyst" />
            {formatDate(event.date)}, {formatTime(event.startTime)}
          </span>
          <span className="flex items-center gap-2">
            <MapPin size={15} className="text-amethyst" />
            {event.location}
          </span>
        </div>

        <div className="p-5 border-t-2 border-dashed border-lavender/40 bg-moon">
          {booking.status === "CONFIRMED" ? (
            <>
              <p className="text-xs text-imperial/45">Show this at the door</p>
              <p className="font-serif text-3xl tracking-wider text-imperial mt-1">
                {booking.code}
              </p>
              {booking.checkedIn && (
                <Badge tone="success" className="mt-3">Checked in</Badge>
              )}
            </>
          ) : booking.status === "PENDING" ? (
            <>
              <p className="text-sm text-imperial/65">
                Your seat is held. Pay {formatMoney(booking.amount)} to get the
                ticket code.
              </p>
              <button
                onClick={onPay}
                disabled={isPaying}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold mt-3 bg-linear-to-br from-orchid to-amethyst text-moon disabled:opacity-60"
              >
                {isPaying && <CircleNotch size={15} className="animate-spin" />}
                Pay {formatMoney(booking.amount)}
              </button>
            </>
          ) : (
            <p className="text-sm text-imperial/60">
              This booking was cancelled
              {booking.paymentStatus === "REFUNDED" && " and refunded"}.
            </p>
          )}

          {error && (
            <p className="text-xs mt-3 px-3 py-2 rounded-lg bg-rose-soft text-rose-deep">
              {error}
            </p>
          )}

          {canCancel && (
            <button
              onClick={onCancel}
              disabled={isCancelling}
              className="w-full py-2.5 rounded-xl text-sm font-medium mt-3 border border-lavender/40 text-imperial/65 disabled:opacity-60"
            >
              {isCancelling ? "Cancelling" : "Cancel this booking"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
