import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CaretLeft } from "@phosphor-icons/react";
import { eventQueryOptions } from "@/lib/api/events";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { EventDetail } from "@/components/EventDetail";
import { Loading, ErrorState } from "@/components/common/States";

export const Route = createFileRoute("/events/$eventId")({
  component: EventDetailPage,
  validateSearch: (search) => ({ code: search.code ?? undefined }),
});

function EventDetailPage() {
  const { eventId } = Route.useParams();
  const { code } = Route.useSearch();

  const { data: event, isLoading, isError, error, refetch } = useQuery(
    eventQueryOptions(eventId, code)
  );

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto w-full px-5 sm:px-8 pt-6">
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-amethyst hover:text-orchid transition-colors"
        >
          <CaretLeft size={14} />
          All events
        </Link>
      </div>

      {isLoading && <Loading label="Opening event" />}
      {isError && (
        <ErrorState
          title="Can't open this event"
          message={error.message}
          onRetry={refetch}
        />
      )}
      {event && <EventDetail event={event} inviteCode={code} />}
    </PublicLayout>
  );
}
