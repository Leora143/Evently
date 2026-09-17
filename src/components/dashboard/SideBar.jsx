import { Link, useRouterState } from "@tanstack/react-router";
import {
  SquaresFour,
  CalendarDots,
  Ticket,
  UserGear,
  Users,
  ListChecks,
  SignOut,
} from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth/AuthProvider";

// Each entry lists the roles that may see it. This is the single place
// that decides what a role finds in the sidebar.
const NAV_ITEMS = [
  { label: "Overview", to: "/dashboard", icon: SquaresFour, roles: ["USER", "CREATOR", "ADMIN"], exact: true },
  { label: "My bookings", to: "/dashboard/bookings", icon: Ticket, roles: ["USER", "CREATOR", "ADMIN"] },
  { label: "My events", to: "/dashboard/my-events", icon: CalendarDots, roles: ["CREATOR", "ADMIN"] },
  { label: "All users", to: "/dashboard/admin/users", icon: Users, roles: ["ADMIN"] },
  { label: "All events", to: "/dashboard/admin/events", icon: ListChecks, roles: ["ADMIN"] },
  { label: "Profile", to: "/dashboard/profile", icon: UserGear, roles: ["USER", "CREATOR", "ADMIN"] },
];

const ROLE_LABEL = { USER: "Guest", CREATOR: "Host", ADMIN: "Admin" };

export function Sidebar({ onNavigate }) {
  const { user, signOut } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const items = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  return (
    <aside className="flex flex-col w-60 shrink-0 h-full py-6 px-4 justify-between bg-imperial">
      <div>
        <Link to="/" className="flex items-center gap-2 px-2 mb-8">
          <div className="w-8 h-8 rounded-lg grid place-items-center bg-linear-to-br from-orchid to-amethyst">
            <Ticket size={16} className="text-moon" weight="fill" />
          </div>
          <span className="font-serif text-lg text-moon">Evently</span>
        </Link>

        <nav className="flex flex-col gap-1">
          {items.map(({ label, to, icon: Icon, exact }) => {
            const isActive = exact ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border-l-[3px] ${
                  isActive
                    ? "bg-orchid/15 text-orchid border-orchid"
                    : "text-moon/60 border-transparent hover:bg-amethyst/40 hover:text-moon"
                }`}
              >
                <Icon size={17} weight={isActive ? "fill" : "regular"} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div>
        <div className="px-3 py-3 rounded-lg bg-amethyst/30 mb-2">
          <p className="text-sm font-medium text-moon truncate">{user?.name}</p>
          <p className="text-xs text-orchid mt-0.5">{ROLE_LABEL[user?.role]} account</p>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-moon/55 hover:text-moon transition-colors"
        >
          <SignOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
