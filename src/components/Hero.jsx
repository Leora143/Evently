import { Link } from "@tanstack/react-router";
import { ArrowRight, LockKey, Globe } from "@phosphor-icons/react";
import herobg from "@/assets/herobg.png";
import Navbar from "./Navbar";
import Stats from "./Stats";

function Hero() {
  return (
    <section className="relative bg-imperial overflow-hidden">
      <div
        aria-hidden
        className="absolute -top-40 -left-32 w-[32rem] h-[32rem] rounded-full bg-amethyst/45 blur-3xl"
      />
      <Navbar />

      <div className="relative grid lg:grid-cols-2 gap-10 items-center px-5 sm:px-8 lg:px-16 pt-10 pb-32">
        <div className="max-w-xl">
          <h1 className="font-serif font-light text-5xl sm:text-6xl lg:text-[4.2rem] leading-[1.05] text-moon">
            Two kinds of guest list. One place to run both.
          </h1>

          <p className="text-lg leading-relaxed text-moon/65 mt-6 max-w-md">
            Sell tickets to a concert the whole city can see, or send a wedding
            invite that only reaches the people you choose. Seats, payments and
            check-in work the same way for both.
          </p>

          <div className="flex flex-wrap gap-3 mt-9">
            <Link
              to="/events"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-linear-to-br from-orchid to-amethyst text-moon transition-transform hover:-translate-y-0.5"
            >
              Browse public events
              <ArrowRight size={17} />
            </Link>
            <Link
              to="/invite"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium border border-orchid/45 text-orchid transition-colors hover:bg-orchid/10"
            >
              <LockKey size={16} />
              Enter an invite code
            </Link>
          </div>

          <div className="flex flex-wrap gap-x-7 gap-y-2 mt-9 text-sm text-moon/50">
            <span className="flex items-center gap-2">
              <Globe size={15} className="text-orchid" />
              Concerts, expos, meetups
            </span>
            <span className="flex items-center gap-2">
              <LockKey size={15} className="text-orchid" />
              Weddings, college nights, reunions
            </span>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <img
            src={herobg}
            alt="People at an event"
            className="w-full object-cover"
            style={{
              WebkitMaskImage:
                "radial-gradient(ellipse at center, black 50%, rgba(0,0,0,0.9) 65%, rgba(0,0,0,0.4) 80%, transparent 100%)",
              maskImage:
                "radial-gradient(ellipse at center, black 50%, rgba(0,0,0,0.9) 65%, rgba(0,0,0,0.4) 80%, transparent 100%)",
            }}
          />
        </div>
      </div>

      <Stats />
    </section>
  );
}

export default Hero;
