const TONES = {
  neutral: "bg-lavender/20 text-amethyst",
  brand: "bg-orchid/15 text-amethyst",
  success: "bg-leaf-soft text-leaf",
  warning: "bg-amber-soft text-amber-deep",
  danger: "bg-rose-soft text-rose-deep",
};

export function Badge({ tone = "neutral", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export const BOOKING_TONE = {
  CONFIRMED: "success",
  PENDING: "warning",
  CANCELLED: "danger",
};

export const EVENT_TONE = {
  PUBLISHED: "success",
  DRAFT: "warning",
  CANCELLED: "danger",
};
