import { CalendarDots, Users, Ticket, ShieldCheck } from "@phosphor-icons/react";

const STATS = [
  { icon: CalendarDots, value: "2,500+", label: "Events hosted" },
  { icon: Users, value: "850K", label: "Guests seated" },
  { icon: Ticket, value: "120K", label: "Tickets issued" },
  { icon: ShieldCheck, value: "100%", label: "Invite-only stays private" },
];

function Stats() {
  return (
    <div className="relative z-20 px-5 sm:px-8 lg:px-16 -mb-14">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden bg-lavender/30 shadow-xl shadow-imperial/25">
        {STATS.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex items-center gap-3 px-5 py-5 bg-moon">
            <div className="w-10 h-10 rounded-xl grid place-items-center shrink-0 bg-orchid/15">
              <Icon size={18} className="text-amethyst" />
            </div>
            <div className="min-w-0">
              <p className="font-serif text-xl text-imperial leading-none">{value}</p>
              <p className="text-xs text-imperial/55 mt-1 truncate">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Stats;
