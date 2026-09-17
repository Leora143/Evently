import {
  Ticket,
  LockKey,
  Wallet,
  QrCode,
} from "@phosphor-icons/react";

const REASONS = [
  {
    icon: Ticket,
    title: "Seats are counted, not guessed",
    body: "Set a seat limit when you create the event. Bookings stop the moment the last seat goes, so nobody turns up to a full room.",
  },
  {
    icon: LockKey,
    title: "Private events stay off the map",
    body: "An invite-only event never shows in search or listings. It opens for one thing: the code you send your guests.",
  },
  {
    icon: Wallet,
    title: "Free and paid, same flow",
    body: "Free events confirm instantly. Paid ones hold the seat while payment goes through, then send the ticket.",
  },
  {
    icon: QrCode,
    title: "One code at the door",
    body: "Every booking gets a ticket code. Hosts mark guests in as they arrive and see the count update live.",
  },
];

function WhyChoose() {
  return (
    <section className="px-5 sm:px-8 lg:px-16 py-16 bg-white border-y border-lavender/20">
      <h2 className="font-serif text-3xl text-imperial">
        What you get either way
      </h2>
      <p className="text-sm text-imperial/55 mt-1.5 max-w-md">
        The same tools whether four hundred strangers are coming or forty
        cousins.
      </p>

      <div className="grid sm:grid-cols-2 gap-5 mt-8">
        {REASONS.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="ticket-notch flex gap-4 p-5 pl-6 rounded-2xl bg-moon border-l-2 border-dashed border-lavender/50"
          >
            <div className="w-11 h-11 rounded-xl grid place-items-center shrink-0 bg-orchid/15">
              <Icon size={19} className="text-amethyst" weight="fill" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-imperial">{title}</h3>
              <p className="text-sm leading-relaxed text-imperial/60 mt-1.5">
                {body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default WhyChoose;
