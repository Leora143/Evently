import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  MagnifyingGlass,
  CalendarBlank,
  MapPin,
  Users,
  Clock,
  CalendarX,
} from "@phosphor-icons/react";
import { eventsQueryOptions } from "@/lib/api/events";
import { categoriesQueryOptions } from "@/lib/api/categories";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Badge } from "@/components/common/Badge";
import { Loading, ErrorState, Empty } from "@/components/common/States";
import { countdown, formatDate, formatMoney, formatTime } from "@/lib/format";

export const Route = createFileRoute("/events/")({
  component: EventsListPage,
  validateSearch: (search) => ({
    category: search.category ?? "all",
    paid: search.paid ?? "all",
  }),
});

const PRICE_FILTERS = [
  { value: "all", label: "Any price" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

function EventsListPage() {
  const { category, paid } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [search, setSearch] = useState("");

  const { data: categories = [] } = useQuery(categoriesQueryOptions());
  const {
    data: events = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(eventsQueryOptions({ category, paid, when: "upcoming" }));

  const visible = events.filter((event) =>
    `${event.title} ${event.location}`.toLowerCase().includes(search.toLowerCase())
  );

  const setFilter = (next) =>
    navigate({ search: (current) => ({ ...current, ...next }) });

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto w-full px-5 sm:px-8 py-10">
        <h1 className="font-serif text-4xl text-imperial">What's on</h1>
        <p className="text-sm text-imperial/55 mt-2 max-w-md">
          Everything here is open to anyone. Private events live behind their
          invite codes.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-7">
          <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-lavender/25">
            <MagnifyingGlass size={16} className="text-imperial/40 shrink-0" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or place"
              className="flex-1 text-sm text-imperial outline-none bg-transparent placeholder:text-imperial/35"
            />
          </div>

          <div className="flex gap-1 p-1 rounded-xl bg-white border border-lavender/25">
            {PRICE_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilter({ paid: filter.value })}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  paid === filter.value
                    ? "bg-amethyst text-moon"
                    : "text-imperial/60 hover:text-imperial"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {[{ slug: "all", name: "All categories" }, ...categories].map((item) => (
            <button
              key={item.slug}
              onClick={() => setFilter({ category: item.slug })}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                category === item.slug
                  ? "bg-orchid/20 text-amethyst"
                  : "bg-white border border-lavender/25 text-imperial/60 hover:border-lavender"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {isLoading && <Loading label="Finding events" />}
        {isError && (
          <ErrorState message={error.message} onRetry={refetch} />
        )}

        {!isLoading && !isError && visible.length === 0 && (
          <Empty
            icon={CalendarX}
            title="No events match that"
            message="Try a different category, or clear the search."
          />
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-7">
          {visible.map((event) => {
            const soldOut = event.seatsLeft <= 0;
            return (
              <Link
                key={event.id}
                to="/events/$eventId"
                params={{ eventId: event.id }}
                className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-lavender/20 transition-all hover:border-orchid/50 hover:-translate-y-0.5"
              >
                <div className="relative h-40 grid place-items-center bg-linear-to-br from-imperial via-amethyst to-orchid/60">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-serif text-4xl text-moon/25">
                      {event.title[0].toUpperCase()}
                    </span>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge tone={event.isPaid ? "brand" : "success"}>
                      {event.isPaid
                        ? formatMoney(event.price, event.currency)
                        : "Free entry"}
                    </Badge>
                  </div>
                  {soldOut && (
                    <div className="absolute inset-0 grid place-items-center bg-imperial/70">
                      <span className="font-serif text-xl text-moon">Sold out</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col p-4">
                  <p className="text-xs font-medium text-amethyst">
                    {event.category?.name ?? "Event"} · {countdown(event.date)}
                  </p>
                  <h2 className="font-serif text-lg leading-snug text-imperial mt-1.5 line-clamp-2">
                    {event.title}
                  </h2>

                  <div className="flex flex-col gap-1.5 mt-3 text-xs text-imperial/55">
                    <span className="flex items-center gap-1.5">
                      <CalendarBlank size={13} /> {formatDate(event.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} /> {formatTime(event.startTime)}
                    </span>
                    <span className="flex items-center gap-1.5 truncate">
                      <MapPin size={13} /> {event.location}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-dashed border-lavender/35 text-xs text-imperial/45">
                    <Users size={13} />
                    {soldOut
                      ? "No seats left"
                      : `${event.seatsLeft} of ${event.totalSeats} seats left`}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </PublicLayout>
  );
}
