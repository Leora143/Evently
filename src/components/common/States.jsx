import { Link } from "@tanstack/react-router";
import { CircleNotch, WarningCircle } from "@phosphor-icons/react";

export function Loading({ label = "Loading" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-imperial/50">
      <CircleNotch size={24} className="animate-spin text-orchid" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function ErrorState({ title = "That didn't load", message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <WarningCircle size={26} className="text-rose-deep" />
      <p className="font-serif text-lg text-imperial">{title}</p>
      {message && <p className="text-sm text-imperial/55 max-w-sm">{message}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-4 py-2 rounded-lg text-sm font-semibold bg-amethyst text-moon"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function Empty({ icon: Icon, title, message, action, actionTo }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl grid place-items-center bg-orchid/12 mb-1">
          <Icon size={22} className="text-amethyst" />
        </div>
      )}
      <p className="font-serif text-lg text-imperial">{title}</p>
      {message && <p className="text-sm text-imperial/55 max-w-xs">{message}</p>}
      {action && actionTo && (
        <Link
          to={actionTo}
          className="mt-3 px-4 py-2.5 rounded-lg text-sm font-semibold bg-linear-to-br from-orchid to-amethyst text-moon"
        >
          {action}
        </Link>
      )}
    </div>
  );
}
