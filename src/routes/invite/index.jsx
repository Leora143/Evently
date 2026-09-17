import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LockKey, ArrowRight } from "@phosphor-icons/react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { inputClass } from "@/components/common/Field";

export const Route = createFileRoute("/invite/")({
  component: InviteGatePage,
});

function InviteGatePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const clean = code.trim().toUpperCase();
    if (clean) navigate({ to: "/invite/$code", params: { code: clean } });
  };

  return (
    <PublicLayout>
      <div className="max-w-md mx-auto w-full px-5 py-20">
        <div className="w-12 h-12 rounded-2xl grid place-items-center bg-orchid/15 mb-5">
          <LockKey size={22} className="text-amethyst" weight="fill" />
        </div>

        <h1 className="font-serif text-3xl text-imperial">
          Got an invite code?
        </h1>
        <p className="text-sm leading-relaxed text-imperial/60 mt-2.5">
          Private events don't show up in search. The host sends you an eight
          character code — enter it here to see the details and book your seat.
        </p>

        <form onSubmit={handleSubmit} className="mt-7">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="ABCD2345"
            maxLength={8}
            aria-label="Invite code"
            className={`${inputClass} text-center font-serif text-2xl tracking-[0.3em] py-4`}
          />
          <button
            type="submit"
            disabled={code.trim().length < 4}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold mt-3 bg-linear-to-br from-orchid to-amethyst text-moon disabled:opacity-50"
          >
            Open my invite
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </PublicLayout>
  );
}
