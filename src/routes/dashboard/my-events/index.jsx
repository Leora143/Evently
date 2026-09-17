import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, CalendarBlank, Users, LockKey } from "@phosphor-icons/react";
import { myEventsQueryOptions } from "@/lib/api/events";
import { Header } from "@/components/dashboard/Header";
import { useDashboardMenu } from "@/components/dashboard/menu-context";
import { Badge, EVENT_TONE } from "@/components/common/Badge";
import { Empty, ErrorState, Loading } from "@/components/common/States";
import { countdown, formatDate, formatMoney } from "@/lib/format";

export const Route = createFileRoute("/dashboard/my-events/")({
  component: MyEventsPage,
});

function MyEventsPage() {
  const { openMenu } = useDashboardMenu();
  const { data: events = [], isLoading, isError, error, refetch } = useQuery(
    myEventsQueryOptions()
  );

  if (isLoading) return <Loading label="Loading your events" />;
  if (isError) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <>
      <Header
        title="My events"
        subtitle="Everything you're hosting, and how the seats are going."
        onOpenMenu={openMenu}
        action={
          <Link
            to="/dashboard/my-events/create"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold shrink-0 bg-linear-to-br from-orchid to-amethyst text-moon"
          >
            <Plus size={15} weight="bold" />
            <span className="hidden sm:inline">Create event</span>
          </Link>
        }
      />

      {events.length === 0 ? (
        <Empty
          icon={CalendarBlank}
          title="Nothing here yet"
          message="Set up your first event and start taking bookings."
          action="Create event"
          actionTo="/dashboard/my-events/create"
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {events.map((event) => {
            const filled = event.totalSeats
              ? Math.round((event.bookedSeats / event.totalSeats) * 100)
              : 0;

            return (
              <Link
                key={event.id}
                to="/dashboard/my-events/$eventId"
                params={{ eventId: event.id }}
                className="rounded-2xl p-5 bg-white border border-lavender/20 transition-colors hover:border-orchid/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-serif text-lg leading-snug text-imperial">
                      {event.title}
                    </h2>
                    <p className="text-xs text-imperial/50 mt-1">
                      {formatDate(event.date)} · {countdown(event.date)}
                    </p>
                  </div>
                  <Badge tone={EVENT_TONE[event.status]}>
                    {event.status.toLowerCase()}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {event.type === "PRIVATE" && (
                    <Badge tone="brand">
                      <LockKey size={12} weight="fill" />
                      Invite only
                    </Badge>
                  )}
                  <Badge tone={event.isPaid ? "neutral" : "success"}>
                    {event.isPaid ? formatMoney(event.price, event.currency) : "Free"}
                  </Badge>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-imperial/55 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Users size={13} />
                      {event.bookedSeats} of {event.totalSeats} seats booked
                    </span>
                    <span className="font-medium text-amethyst">{filled}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden bg-lavender/25">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-orchid to-amethyst"
                      style={{ width: `${Math.min(100, filled)}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
