import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { CircleNotch, CheckCircle } from "@phosphor-icons/react";
import { updateProfile } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Header } from "@/components/dashboard/Header";
import { useDashboardMenu } from "@/components/dashboard/menu-context";
import { Field, inputClass } from "@/components/common/Field";
import { Badge } from "@/components/common/Badge";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
});

const ROLE_COPY = {
  USER: "You can browse events, book seats and manage your own bookings.",
  CREATOR: "You can create and run your own events, on top of booking others.",
  ADMIN: "You can manage every user and every event on the platform.",
};

function ProfilePage() {
  const { openMenu } = useDashboardMenu();
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone ?? "",
  });
  const [saved, setSaved] = useState(false);

  const update = (field) => (event) => {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const save = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      setUser(updated);
      setSaved(true);
    },
  });

  return (
    <>
      <Header
        title="Profile"
        subtitle="What hosts see when you book, and what you can do here."
        onOpenMenu={openMenu}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate(form);
          }}
          className="lg:col-span-2 rounded-2xl p-5 bg-white border border-lavender/20 flex flex-col gap-4"
        >
          <div className="flex items-center gap-4 pb-4 border-b border-lavender/20">
            <div className="w-14 h-14 rounded-full grid place-items-center font-serif text-2xl text-moon bg-linear-to-br from-orchid to-amethyst">
              {user.name[0]}
            </div>
            <div>
              <p className="font-serif text-lg text-imperial">{user.name}</p>
              <p className="text-sm text-imperial/50">{user.email}</p>
            </div>
          </div>

          <Field label="Full name" error={save.error?.errors?.name}>
            <input value={form.name} onChange={update("name")} className={inputClass} />
          </Field>

          <Field
            label="Phone"
            hint="Hosts use this if plans change on the day."
            error={save.error?.errors?.phone}
          >
            <input
              value={form.phone}
              onChange={update("phone")}
              placeholder="+91 98765 43210"
              className={inputClass}
            />
          </Field>

          <Field label="Email" hint="Email can't be changed here.">
            <input value={user.email} disabled className={`${inputClass} opacity-60`} />
          </Field>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={save.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-linear-to-br from-orchid to-amethyst text-moon disabled:opacity-60"
            >
              {save.isPending && <CircleNotch size={15} className="animate-spin" />}
              Save changes
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-leaf">
                <CheckCircle size={16} weight="fill" />
                Saved
              </span>
            )}
          </div>
        </form>

        <div className="rounded-2xl p-5 bg-white border border-lavender/20 h-fit">
          <h2 className="font-serif text-lg text-imperial">Your access</h2>
          <Badge tone="brand" className="mt-3">
            {user.role === "USER" ? "Guest" : user.role === "CREATOR" ? "Host" : "Admin"}
          </Badge>
          <p className="text-sm leading-relaxed text-imperial/60 mt-3">
            {ROLE_COPY[user.role]}
          </p>
          {user.role === "USER" && (
            <p className="text-xs text-imperial/45 mt-4 pt-4 border-t border-lavender/20">
              Want to host? Ask an admin to switch your account to a host
              account.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
