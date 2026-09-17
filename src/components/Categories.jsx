import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  MusicNotes,
  Briefcase,
  Trophy,
  PaintBrush,
  ForkKnife,
  Cpu,
  Heart,
  GraduationCap,
  Sparkle,
  ArrowRight,
} from "@phosphor-icons/react";
import { categoriesQueryOptions } from "@/lib/api/categories";

const ICONS = {
  music: MusicNotes,
  briefcase: Briefcase,
  trophy: Trophy,
  palette: PaintBrush,
  utensils: ForkKnife,
  cpu: Cpu,
  heart: Heart,
  graduation: GraduationCap,
  sparkle: Sparkle,
};

function Categories() {
  const { data: categories = [] } = useQuery(categoriesQueryOptions());

  if (categories.length === 0) return null;

  return (
    <section className="px-5 sm:px-8 lg:px-16 pt-28 pb-16">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-3xl text-imperial">Find your crowd</h2>
          <p className="text-sm text-imperial/55 mt-1.5">
            Every public event on Evently sits in one of these.
          </p>
        </div>
        <Link
          to="/events"
          className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-amethyst hover:text-orchid transition-colors shrink-0"
        >
          See all events
          <ArrowRight size={15} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => {
          const Icon = ICONS[category.icon] ?? Sparkle;
          return (
            <Link
              key={category.id}
              to="/events"
              search={{ category: category.slug }}
              className="group flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-lavender/20 transition-colors hover:border-orchid/50"
            >
              <div className="w-12 h-12 rounded-xl grid place-items-center shrink-0 bg-linear-to-br from-imperial to-amethyst">
                <Icon size={20} className="text-orchid" weight="fill" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-imperial truncate">
                  {category.name}
                </p>
                <p className="text-xs text-imperial/45 mt-0.5">
                  {category._count?.events ?? 0} events
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default Categories;
