import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ListChecks, LockKey, Globe } from "@phosphor-icons/react";
import { changeEventStatus, getAllEvents } from "@/lib/api/admin";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Header } from "@/components/dashboard/Header";
import { useDashboardMenu } from "@/components/dashboard/menu-context";
import { Badge, EVENT_TONE } from "@/components/common/Badge";
import { Empty, ErrorState, Loading } from "@/components/common/States";
import { inputClass } from "@/components/common/Field";
import { formatDate, formatMoney } from "@/lib/format";

export const Route = createFileRoute("/dashboard/admin/events")({
  component: AdminEventsPage,
});

const FILTERS = [
  { value: "all", label: "All" },
  { value: "PUBLIC", label: "Public" },
  { value: "PRIVATE", label: "Invite only" },
];

const STATUSES = ["PUBLISHED", "DRAFT", "CANCELLED"];

function AdminEventsPage() {
  const { openMenu } = useDashboardMenu();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");

  const { data: events = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "events"],
    queryFn: getAllEvents,
    enabled: isAdmin,
  });

  const setStatus = useMutation({
    mutationFn: changeEventStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin"] }),
  });

  if (!isAdmin) {
    return (
      <Empty
        icon={ListChecks}
        title="Admins only"
        message="This page lists every event on the platform."
        action="Back to dashboard"
        actionTo="/dashboard"
      />
    );
  }

  if (isLoading) return <Loading label="Loading events" />;
  if (isError) return <ErrorState message={error.message} onRetry={refetch} />;

  const visible =
    filter === "all" ? events : events.filter((event) => event.type === filter);

  return (
    <>
      <Header
        title="All events"
        subtitle="Take something down, or put a draft live."
        onOpenMenu={openMenu}
      />

      <div className="flex gap-1 p-1 rounded-xl bg-white border border-lavender/25 w-fit mb-5">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === item.value
                ? "bg-amethyst text-moon"
                : "text-imperial/60 hover:text-imperial"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-lavender/20 divide-y divide-lavender/15">
        {visible.map((event) => (
          <div key={event.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl grid place-items-center shrink-0 bg-orchid/12">
              {event.type === "PRIVATE" ? (
                <LockKey size={17} className="text-amethyst" weight="fill" />
              ) : (
                <Globe size={17} className="text-amethyst" weight="fill" />
              )}
            </div>

            <div className="flex-1 min-w-48">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-imperial">{event.title}</p>
                <Badge tone={EVENT_TONE[event.status]}>
                  {event.status.toLowerCase()}
                </Badge>
              </div>
              <p className="text-xs text-imperial/50 mt-1">
                {formatDate(event.date)} · {event.location}
              </p>
              <p className="text-xs text-imperial/40 mt-0.5">
                {event.organizer.name} · {event.bookedSeats}/{event.totalSeats} seats ·{" "}
                {event.isPaid ? formatMoney(event.price, event.currency) : "Free"}
              </p>
            </div>

            <select
              value={event.status}
              disabled={setStatus.isPending}
              onChange={(input) =>
                setStatus.mutate({ id: event.id, status: input.target.value })
              }
              className={`${inputClass} w-36 py-2`}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </option>
              ))}
            </select>

            {event.type === "PUBLIC" && (
              <Link
                to="/events/$eventId"
                params={{ eventId: event.id }}
                className="text-sm font-medium text-amethyst hover:text-orchid shrink-0"
              >
                View
              </Link>
            )}
          </div>
        ))}

        {visible.length === 0 && (
          <p className="text-sm text-imperial/50 p-6 text-center">
            No events of that kind yet.
          </p>
        )}
      </div>
    </>
  );
}
