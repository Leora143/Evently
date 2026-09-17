export function Field({ label, hint, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-imperial/80">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs mt-1.5 text-rose-deep">{error}</p>
      ) : hint ? (
        <p className="text-xs mt-1.5 text-imperial/45">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg text-sm text-imperial bg-moon/60 border border-lavender/35 outline-none transition-colors focus:border-orchid focus:ring-2 focus:ring-orchid/20 placeholder:text-imperial/35";
