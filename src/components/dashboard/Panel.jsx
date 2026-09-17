import { Link } from "@tanstack/react-router";
import { ArrowRight } from "@phosphor-icons/react";

export function Panel({ title, actionLabel, actionTo, className = "", children }) {
  return (
    <section className={`rounded-2xl p-5 bg-white border border-lavender/20 ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="font-serif text-lg text-imperial">{title}</h2>
        {actionLabel && actionTo && (
          <Link
            to={actionTo}
            className="flex items-center gap-1.5 text-xs font-medium text-amethyst hover:text-orchid transition-colors shrink-0"
          >
            {actionLabel}
            <ArrowRight size={13} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
