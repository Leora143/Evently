import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LockKey } from "@phosphor-icons/react";
import { getEventByInvite } from "@/lib/api/events";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { EventDetail } from "@/components/EventDetail";
import { Loading } from "@/components/common/States";

export const Route = createFileRoute("/invite/$code")({
  component: InvitedEventPage,
});

function InvitedEventPage() {
  const { code } = Route.useParams();

  const { data: event, isLoading, isError, error } = useQuery({
    queryKey: ["event", "invite", code],
    queryFn: () => getEventByInvite(code),
    retry: false,
  });

  return (
    <PublicLayout>
      {isLoading && <Loading label="Checking your invite" />}

      {isError && (
        <div className="max-w-md mx-auto w-full px-5 py-20 text-center">
          <div className="w-12 h-12 rounded-2xl grid place-items-center bg-rose-soft mx-auto mb-4">
            <LockKey size={22} className="text-rose-deep" />
          </div>
          <h1 className="font-serif text-2xl text-imperial">
            That code didn't open anything
          </h1>
          <p className="text-sm text-imperial/55 mt-2">
            {error.message} Check the code with whoever invited you.
          </p>
          <Link
            to="/invite"
            className="inline-block mt-5 px-5 py-2.5 rounded-lg text-sm font-semibold bg-linear-to-br from-orchid to-amethyst text-moon"
          >
            Try another code
          </Link>
        </div>
      )}

      {event && (
        <>
          <div className="max-w-5xl mx-auto w-full px-5 sm:px-8 pt-6">
            <p className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl bg-orchid/12 text-amethyst">
              <LockKey size={15} weight="fill" />
              You're seeing this because you have the invite code.
            </p>
          </div>
          <EventDetail event={event} inviteCode={code} />
        </>
      )}
    </PublicLayout>
  );
}
