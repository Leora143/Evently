import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { List, X, Ticket } from "@phosphor-icons/react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/lib/auth/AuthProvider";

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Events", path: "/events" },
  { name: "Have an invite?", path: "/invite" },
];

export function Navbar({ tone = "dark" }) {
  const { isSignedIn, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const base = tone === "dark" ? "text-moon/75" : "text-imperial/70";
  const hover = tone === "dark" ? "hover:text-orchid" : "hover:text-amethyst";

  return (
    <nav className="relative z-30 flex items-center justify-between px-5 sm:px-8 py-4">
      <Link to="/" className="flex items-center gap-2 shrink-0">
        <img src={logo} alt="" className="w-9 h-9 object-contain" />
        <span
          className={`font-serif text-xl tracking-tight ${
            tone === "dark" ? "text-moon" : "text-imperial"
          }`}
        >
          Evently
        </span>
      </Link>

      <div className={`hidden md:flex items-center gap-8 text-sm ${base}`}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`transition-colors ${hover}`}
            activeProps={{ className: tone === "dark" ? "text-orchid" : "text-amethyst" }}
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div className="hidden md:flex items-center gap-3">
        {isSignedIn ? (
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-linear-to-br from-orchid to-amethyst text-moon"
          >
            <Ticket size={15} weight="fill" />
            {user.name.split(" ")[0]}'s dashboard
          </Link>
        ) : (
          <>
            <Link to="/login" className={`text-sm ${base} ${hover} transition-colors`}>
              Sign in
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-linear-to-br from-orchid to-amethyst text-moon"
            >
              Create account
            </Link>
          </>
        )}
      </div>

      <button
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className={`md:hidden ${tone === "dark" ? "text-moon" : "text-imperial"}`}
      >
        {isOpen ? <X size={22} /> : <List size={22} />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 p-4 rounded-2xl bg-white shadow-xl shadow-imperial/15 flex flex-col gap-1 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm text-imperial/75 hover:bg-moon"
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px bg-lavender/25 my-2" />
          {isSignedIn ? (
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-amethyst"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm text-imperial/75"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-semibold text-center bg-linear-to-br from-orchid to-amethyst text-moon"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
