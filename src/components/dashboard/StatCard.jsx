export function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl p-5 bg-white border border-lavender/20">
      <div className="w-10 h-10 rounded-xl grid place-items-center bg-orchid/15 mb-4">
        <Icon size={18} className="text-amethyst" weight="fill" />
      </div>
      <p className="font-serif text-2xl text-imperial leading-none">{value}</p>
      <p className="text-xs text-imperial/50 mt-1.5">{label}</p>
    </div>
  );
}
