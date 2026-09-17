import { Link } from "@tanstack/react-router";
import { CalendarBlank, MapPin, Users } from "@phosphor-icons/react";
import { Badge } from "@/components/common/Badge";
import { EventTypeChip } from "@/components/common/EventTypeChip";
import { countdown, formatDate, formatMoney } from "@/lib/format";

// One row, used in the overview list and in "My events".
export function EventCard({ event, to, params }) {
  const left = event.seatsLeft ?? event.totalSeats - event.bookedSeats;
  const soldOut = left <= 0;

  return (
    <Link
      to={to}
      params={params}
      className="flex items-center gap-4 p-3 -mx-1 rounded-xl transition-colors hover:bg-moon"
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 grid place-items-center bg-linear-to-br from-imperial to-amethyst">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="font-serif text-xl text-orchid">
            {event.title[0].toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate text-imperial">{event.title}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-imperial/50">
          <span className="flex items-center gap-1 shrink-0">
            <CalendarBlank size={12} /> {formatDate(event.date)}
          </span>
          <span className="flex items-center gap-1 truncate">
            <MapPin size={12} /> {event.location}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <EventTypeChip type={event.type} />
          <Badge tone={event.isPaid ? "neutral" : "success"}>
            {event.isPaid ? formatMoney(event.price, event.currency) : "Free"}
          </Badge>
        </div>
      </div>

      <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0 pl-4 border-l-2 border-dashed border-imperial/12 ticket-notch">
        <Badge tone={soldOut ? "danger" : "brand"}>{countdown(event.date)}</Badge>
        <span className="flex items-center gap-1 text-xs text-imperial/45">
          <Users size={12} />
          {soldOut ? "Sold out" : `${left} left`}
        </span>
      </div>
    </Link>
  );
}
