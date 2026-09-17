import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="bg-imperial text-moon px-5 sm:px-8 lg:px-16 pt-14 pb-8">
      <div className="grid gap-10 sm:grid-cols-3">
        <div>
          <p className="font-serif text-2xl text-orchid">Evently</p>
          <p className="text-sm text-moon/55 mt-3 max-w-xs leading-relaxed">
            Book a concert ticket or run the guest list for a wedding. Same
            place, same seat count, same ticket.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-moon/90">Go to</p>
          <div className="flex flex-col gap-2 mt-3 text-sm text-moon/55">
            <Link to="/events" className="hover:text-orchid transition-colors w-fit">
              Public events
            </Link>
            <Link to="/invite" className="hover:text-orchid transition-colors w-fit">
              Enter an invite code
            </Link>
            <Link to="/signup" className="hover:text-orchid transition-colors w-fit">
              Host an event
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-moon/90">Reach us</p>
          <p className="text-sm text-moon/55 mt-3 leading-relaxed">
            support@evently.com
            <br />
            +91 98765 43210
            <br />
            Kochi, Kerala
          </p>
        </div>
      </div>

      <div className="border-t border-moon/10 mt-10 pt-6 text-xs text-moon/40">
        © {new Date().getFullYear()} Evently. All rights reserved.
      </div>
    </footer>
  );
}
