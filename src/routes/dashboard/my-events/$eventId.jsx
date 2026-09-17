import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CaretLeft,
  Copy,
  Check,
  Users,
  Trash,
  Plus,
  X,
  QrCode,
  CircleNotch,
  LockKey,
} from "@phosphor-icons/react";
import {
  addInvite,
  deleteEvent,
  eventQueryOptions,
  getAttendees,
  getInvites,
  removeInvite,
  updateEvent,
} from "@/lib/api/events";
import { checkInTicket } from "@/lib/api/bookings";
import { Header } from "@/components/dashboard/Header";
import { useDashboardMenu } from "@/components/dashboard/menu-context";
import { EventForm, toFormValues } from "@/components/dashboard/EventForm";
import { Badge, BOOKING_TONE } from "@/components/common/Badge";
import { Field, inputClass } from "@/components/common/Field";
import { Empty, ErrorState, Loading } from "@/components/common/States";
import { formatDate, formatMoney } from "@/lib/format";

export const Route = createFileRoute("/dashboard/my-events/$eventId")({
  component: ManageEventPage,
});

const TABS = [
  { value: "guests", label: "Guests" },
  { value: "details", label: "Edit details" },
  { value: "door", label: "Door check-in" },
];

function ManageEventPage() {
  const { eventId } = Route.useParams();
  const { openMenu } = useDashboardMenu();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState("guests");

  const { data: event, isLoading, isError, error, refetch } = useQuery(
    eventQueryOptions(eventId)
  );

  if (isLoading) return <Loading label="Loading event" />;
  if (isError) return <ErrorState message={error.message} onRetry={refetch} />;

  const remove = () => {
    if (!window.confirm("Cancel this event? Guests with bookings lose their seats.")) {
      return;
    }
    deleteEvent(event.id).then(() => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      navigate({ to: "/dashboard/my-events" });
    });
  };

  return (
    <>
      <Link
        to="/dashboard/my-events"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-amethyst mb-4"
      >
        <CaretLeft size={14} />
        My events
      </Link>

      <Header
        title={event.title}
        subtitle={`${formatDate(event.date)} · ${event.bookedSeats} of ${event.totalSeats} seats booked`}
        onOpenMenu={openMenu}
        action={
          <button
            onClick={remove}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium shrink-0 border border-lavender/40 text-rose-deep"
          >
            <Trash size={15} />
            <span className="hidden sm:inline">Cancel event</span>
          </button>
        }
      />

      {event.type === "PRIVATE" && <InviteLink event={event} />}

      <div className="flex gap-1 p-1 rounded-xl bg-white border border-lavender/25 w-fit my-6">
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

      {tab === "guests" && <GuestsTab event={event} />}
      {tab === "details" && <DetailsTab event={event} />}
      {tab === "door" && <DoorTab event={event} />}
    </>
  );
}

// ---- Invite link ----------------------------------------------------------
function InviteLink({ event }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/invite/${event.inviteCode}`;

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl p-5 bg-linear-to-br from-amethyst to-imperial">
      <p className="flex items-center gap-2 text-sm text-orchid">
        <LockKey size={15} weight="fill" />
        Invite only
      </p>
      <p className="text-sm text-moon/65 mt-2 max-w-md leading-relaxed">
        This event isn't listed anywhere. Send this link to the people you want
        there — anyone with it can book a seat.
      </p>

      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <div className="flex-1 px-4 py-2.5 rounded-lg bg-imperial/50 text-sm text-moon/80 truncate">
          {url}
        </div>
        <button
          onClick={copy}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-moon text-imperial shrink-0"
        >
          {copied ? <Check size={15} weight="bold" /> : <Copy size={15} />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>

      <p className="text-xs text-moon/40 mt-3">
        Code on its own: <span className="font-serif tracking-wider text-orchid">{event.inviteCode}</span>
      </p>
    </div>
  );
}

// ---- Guests ---------------------------------------------------------------
function GuestsTab({ event }) {
  const queryClient = useQueryClient();
  const [guest, setGuest] = useState({ email: "", name: "" });

  const attendeesQuery = useQuery({
    queryKey: ["event", event.id, "attendees"],
    queryFn: () => getAttendees(event.id),
  });

  const invitesQuery = useQuery({
    queryKey: ["event", event.id, "invites"],
    queryFn: () => getInvites(event.id),
    enabled: event.type === "PRIVATE",
  });

  const refreshInvites = () =>
    queryClient.invalidateQueries({ queryKey: ["event", event.id, "invites"] });

  const invite = useMutation({
    mutationFn: addInvite,
    onSuccess: () => {
      setGuest({ email: "", name: "" });
      refreshInvites();
    },
  });

  const uninvite = useMutation({
    mutationFn: removeInvite,
    onSuccess: refreshInvites,
  });

  const attendees = attendeesQuery.data ?? [];
  const invites = invitesQuery.data ?? [];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <section className="lg:col-span-2 rounded-2xl p-5 bg-white border border-lavender/20">
        <h2 className="font-serif text-lg text-imperial mb-4">
          Who has booked ({attendees.length})
        </h2>

        {attendeesQuery.isLoading ? (
          <Loading label="Loading guests" />
        ) : attendees.length === 0 ? (
          <Empty
            icon={Users}
            title="No bookings yet"
            message={
              event.type === "PRIVATE"
                ? "Share the invite link and they'll show up here."
                : "Your event is live. Bookings land here as they come in."
            }
          />
        ) : (
          <div className="flex flex-col divide-y divide-lavender/15">
            {attendees.map((booking) => (
              <div key={booking.id} className="flex items-center gap-3 py-3">
                <div className="w-9 h-9 rounded-full grid place-items-center text-sm font-serif shrink-0 text-moon bg-linear-to-br from-orchid to-amethyst">
                  {booking.user.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-imperial truncate">
                    {booking.user.name}
                  </p>
                  <p className="text-xs text-imperial/50 truncate">
                    {booking.user.email} · {booking.seats} seat
                    {booking.seats > 1 ? "s" : ""}
                    {booking.amount > 0 && ` · ${formatMoney(booking.amount)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {booking.checkedIn && <Badge tone="success">Arrived</Badge>}
                  <Badge tone={BOOKING_TONE[booking.status]}>
                    {booking.status === "PENDING" ? "Unpaid" : booking.status.toLowerCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {event.type === "PRIVATE" && (
        <section className="rounded-2xl p-5 bg-white border border-lavender/20 h-fit">
          <h2 className="font-serif text-lg text-imperial">Guest list</h2>
          <p className="text-xs text-imperial/50 mt-1 mb-4">
            Keep track of who you meant to invite. Booking still needs the link.
          </p>

          <form
            onSubmit={(formEvent) => {
              formEvent.preventDefault();
              invite.mutate({ id: event.id, ...guest });
            }}
            className="flex flex-col gap-3"
          >
            <Field label="Email" error={invite.error?.errors?.email}>
              <input
                type="email"
                value={guest.email}
                onChange={(input) =>
                  setGuest((current) => ({ ...current, email: input.target.value }))
                }
                placeholder="cousin@example.com"
                className={inputClass}
              />
            </Field>
            <Field label="Name (optional)">
              <input
                value={guest.name}
                onChange={(input) =>
                  setGuest((current) => ({ ...current, name: input.target.value }))
                }
                placeholder="Anjali"
                className={inputClass}
              />
            </Field>
            <button
              type="submit"
              disabled={invite.isPending || !guest.email}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold bg-amethyst text-moon disabled:opacity-50"
            >
              <Plus size={14} weight="bold" />
              Add to list
            </button>
          </form>

          {invites.length > 0 && (
            <div className="flex flex-col divide-y divide-lavender/15 mt-4 pt-2">
              {invites.map((item) => (
                <div key={item.id} className="flex items-center gap-2 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-imperial truncate">
                      {item.name || item.email}
                    </p>
                    {item.name && (
                      <p className="text-xs text-imperial/45 truncate">{item.email}</p>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      uninvite.mutate({ id: event.id, inviteId: item.id })
                    }
                    aria-label={`Remove ${item.email}`}
                    className="w-7 h-7 rounded-lg grid place-items-center text-imperial/40 hover:text-rose-deep"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

// ---- Edit details ---------------------------------------------------------
function DetailsTab({ event }) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState(() => toFormValues(event));
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const save = useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      setErrors({});
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ["event", event.id] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error) =>
      setErrors(
        Object.keys(error.errors ?? {}).length
          ? error.errors
          : { form: error.message }
      ),
  });

  return (
    <EventForm
      values={values}
      setValues={(next) => {
        setSaved(false);
        setValues(next);
      }}
      errors={errors}
      onSubmit={() =>
        save.mutate({
          id: event.id,
          ...values,
          price: Number(values.price || 0),
          totalSeats: Number(values.totalSeats || 0),
          categoryId: values.categoryId || null,
        })
      }
      isSubmitting={save.isPending}
      submitLabel="Save changes"
      footer={
        saved && (
          <span className="flex items-center gap-1.5 text-sm text-leaf">
            <Check size={16} weight="bold" />
            Saved
          </span>
        )
      }
    />
  );
}

// ---- Door check-in --------------------------------------------------------
function DoorTab({ event }) {
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");

  const checkIn = useMutation({
    mutationFn: checkInTicket,
    onSuccess: () => {
      setCode("");
      queryClient.invalidateQueries({ queryKey: ["event", event.id, "attendees"] });
    },
  });

  return (
    <div className="max-w-md">
      <div className="rounded-2xl p-5 bg-white border border-lavender/20">
        <div className="w-11 h-11 rounded-xl grid place-items-center bg-orchid/15 mb-4">
          <QrCode size={20} className="text-amethyst" weight="fill" />
        </div>

        <h2 className="font-serif text-lg text-imperial">Check guests in</h2>
        <p className="text-sm leading-relaxed text-imperial/60 mt-1.5 mb-4">
          Ask for the ticket code on their booking and type it in. Each code
          works once.
        </p>

        <form
          onSubmit={(formEvent) => {
            formEvent.preventDefault();
            checkIn.mutate(code.trim().toUpperCase());
          }}
        >
          <input
            value={code}
            onChange={(input) => setCode(input.target.value.toUpperCase())}
            placeholder="EVT-XXXX-XXXX"
            aria-label="Ticket code"
            className={`${inputClass} text-center font-serif text-lg tracking-widest py-3.5`}
          />
          <button
            type="submit"
            disabled={checkIn.isPending || code.trim().length < 6}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold mt-3 bg-linear-to-br from-orchid to-amethyst text-moon disabled:opacity-50"
          >
            {checkIn.isPending && <CircleNotch size={15} className="animate-spin" />}
            Check in
          </button>
        </form>

        {checkIn.isSuccess && (
          <p className="flex items-center gap-2 text-sm mt-4 px-3.5 py-3 rounded-xl bg-leaf-soft text-leaf">
            <Check size={16} weight="bold" />
            {checkIn.data.user.name} is in.
          </p>
        )}
        {checkIn.isError && (
          <p className="text-sm mt-4 px-3.5 py-3 rounded-xl bg-rose-soft text-rose-deep">
            {checkIn.error.message}
          </p>
        )}
      </div>
    </div>
  );
}
