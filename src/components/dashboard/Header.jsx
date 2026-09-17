import { List } from "@phosphor-icons/react";

export function Header({ title, subtitle, action, onOpenMenu }) {
  return (
    <header className="flex items-start justify-between gap-4 mb-8">
      <div className="flex items-start gap-3 min-w-0">
        <button
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="lg:hidden mt-1 text-imperial/60"
        >
          <List size={22} />
        </button>
        <div className="min-w-0">
          <h1 className="font-serif text-2xl sm:text-3xl text-imperial truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-imperial/55 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </header>
  );
}
