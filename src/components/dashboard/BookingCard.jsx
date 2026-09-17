import { CalendarBlank, Ticket, MapPin } from "@phosphor-icons/react";
import { Badge, BOOKING_TONE } from "@/components/common/Badge";
import { formatDate, formatMoney } from "@/lib/format";

export function BookingCard({ booking, onSelect }) {
  const { event } = booking;

  return (
    <button
      onClick={() => onSelect?.(booking)}
      className="w-full text-left flex items-center gap-4 p-3 -mx-1 rounded-xl transition-colors hover:bg-moon"
    >
      <div className="w-11 h-11 rounded-xl grid place-items-center shrink-0 bg-lavender/20">
        <Ticket size={17} className="text-amethyst" weight="fill" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate text-imperial">{event.title}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-imperial/50">
          <span className="flex items-center gap-1">
            <CalendarBlank size={12} /> {formatDate(event.date)}
          </span>
          <span className="flex items-center gap-1 truncate">
            <MapPin size={12} /> {event.location}
          </span>
          <span>
            {booking.seats} seat{booking.seats > 1 ? "s" : ""}
          </span>
          {booking.amount > 0 && <span>{formatMoney(booking.amount, event.currency)}</span>}
        </div>
      </div>

      <div className="shrink-0 pl-4 border-l-2 border-dashed border-imperial/12 ticket-notch">
        <Badge tone={BOOKING_TONE[booking.status]}>
          {booking.status === "PENDING" ? "Payment due" : booking.status.toLowerCase()}
        </Badge>
      </div>
    </button>
  );
}
