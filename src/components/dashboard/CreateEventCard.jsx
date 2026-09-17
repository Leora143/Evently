import { Link } from "@tanstack/react-router";
import { Plus } from "@phosphor-icons/react";

export function CreateEventCard() {
  return (
    <div className="rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-48 bg-linear-to-br from-amethyst to-imperial">
      <div
        aria-hidden
        className="absolute -right-8 -bottom-10 w-44 h-44 rounded-full bg-orchid/35 blur-2xl"
      />
      <div className="relative">
        <h3 className="font-serif text-xl text-moon">Host something</h3>
        <p className="text-sm mt-2 max-w-56 leading-relaxed text-moon/65">
          Pick public or invite-only, set your seat count, and you're taking
          bookings.
        </p>
      </div>
      <Link
        to="/dashboard/my-events/create"
        className="relative self-start flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-moon text-imperial transition-transform hover:-translate-y-0.5"
      >
        <Plus size={15} weight="bold" />
        Create event
      </Link>
    </div>
  );
}
