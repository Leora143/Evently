import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Ticket,
  CalendarDots,
  Users,
  CurrencyInr,
  CalendarBlank,
  Compass,
} from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { myBookingsQueryOptions } from "@/lib/api/bookings";
import { myEventsQueryOptions } from "@/lib/api/events";
import { adminStatsQueryOptions } from "@/lib/api/admin";
import { Header } from "@/components/dashboard/Header";
import { useDashboardMenu } from "@/components/dashboard/menu-context";
import { StatCard } from "@/components/dashboard/StatCard";
import { Panel } from "@/components/dashboard/Panel";
import { EventCard } from "@/components/dashboard/EventCard";
import { BookingCard } from "@/components/dashboard/BookingCard";
import { CreateEventCard } from "@/components/dashboard/CreateEventCard";
import { Empty, Loading } from "@/components/common/States";
import { formatMoney } from "@/lib/format";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverview,
});

function DashboardOverview() {
  const { user, canCreateEvents, isAdmin } = useAuth();
  const { openMenu } = useDashboardMenu();

  const bookingsQuery = useQuery(myBookingsQueryOptions());
  const eventsQuery = useQuery({
    ...myEventsQueryOptions(),
    enabled: canCreateEvents,
  });
  const adminQuery = useQuery({ ...adminStatsQueryOptions(), enabled: isAdmin });

  const bookings = bookingsQuery.data ?? [];
  const myEvents = eventsQuery.data ?? [];

  const activeBookings = bookings.filter((b) => b.status !== "CANCELLED");
  const upcoming = activeBookings.filter((b) => new Date(b.event.date) >= new Date());
  const spent = activeBookings.reduce((sum, b) => sum + (b.paymentStatus === "PAID" ? b.amount : 0), 0);

  const guestStats = [
    { label: "Upcoming events", value: upcoming.length, icon: CalendarDots },
    { label: "Tickets held", value: activeBookings.reduce((s, b) => s + b.seats, 0), icon: Ticket },
    { label: "Awaiting payment", value: bookings.filter((b) => b.paymentStatus === "PENDING").length, icon: CurrencyInr },
    { label: "Total spent", value: formatMoney(spent), icon: CurrencyInr },
  ];

  const hostStats = [
    { label: "Events you host", value: myEvents.length, icon: CalendarDots },
    {
      label: "Seats booked",
      value: myEvents.reduce((sum, event) => sum + event.bookedSeats, 0),
      icon: Users,
    },
    {
      label: "Live right now",
      value: myEvents.filter((event) => event.status === "PUBLISHED").length,
      icon: Ticket,
    },
  ];

  const adminStats = adminQuery.data
    ? [
        { label: "People registered", value: adminQuery.data.users, icon: Users },
        { label: "Events on platform", value: adminQuery.data.events, icon: CalendarDots },
        { label: "Bookings made", value: adminQuery.data.bookings, icon: Ticket },
        { label: "Revenue collected", value: formatMoney(adminQuery.data.revenue), icon: CurrencyInr },
      ]
    : [];

  const stats = isAdmin ? adminStats : canCreateEvents ? hostStats : guestStats;

  if (bookingsQuery.isLoading) return <Loading label="Loading your dashboard" />;

  return (
    <>
      <Header
        title={`Hello, ${user.name.split(" ")[0]}`}
        subtitle={
          isAdmin
            ? "Everything across the platform, at a glance."
            : canCreateEvents
              ? "Your events and the seats going out the door."
              : "What you've booked and what's coming up."
        }
        onOpenMenu={openMenu}
        action={
          <Link
            to="/events"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold shrink-0 bg-white border border-lavender/30 text-amethyst"
          >
            <Compass size={15} />
            Browse events
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Panel
          title={canCreateEvents ? "Your events" : "Coming up for you"}
          actionLabel={canCreateEvents ? "Manage all" : "See bookings"}
          actionTo={canCreateEvents ? "/dashboard/my-events" : "/dashboard/bookings"}
          className="xl:col-span-2"
        >
          {canCreateEvents ? (
            myEvents.length === 0 ? (
              <Empty
                icon={CalendarBlank}
                title="No events yet"
                message="Create your first one and start taking bookings."
                action="Create event"
                actionTo="/dashboard/my-events/create"
              />
            ) : (
              <div className="flex flex-col divide-y divide-lavender/15">
                {myEvents.slice(0, 5).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    to="/dashboard/my-events/$eventId"
                    params={{ eventId: event.id }}
                  />
                ))}
              </div>
            )
          ) : upcoming.length === 0 ? (
            <Empty
              icon={CalendarBlank}
              title="Nothing booked yet"
              message="Find something happening near you."
              action="Browse events"
              actionTo="/events"
            />
          ) : (
            <div className="flex flex-col divide-y divide-lavender/15">
              {upcoming.slice(0, 5).map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </Panel>

        {canCreateEvents ? (
          <CreateEventCard />
        ) : (
          <Panel title="Recent bookings" actionLabel="All" actionTo="/dashboard/bookings">
            {bookings.length === 0 ? (
              <p className="text-sm text-imperial/50 py-4">Nothing here yet.</p>
            ) : (
              <div className="flex flex-col divide-y divide-lavender/15">
                {bookings.slice(0, 4).map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </Panel>
        )}
      </div>
    </>
  );
}
