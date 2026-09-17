import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  User,
  EnvelopeSimple,
  LockKey,
  Eye,
  EyeSlash,
  CircleNotch,
  Ticket,
  Megaphone,
} from "@phosphor-icons/react";
import { signup } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Field, inputClass } from "@/components/common/Field";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

const ACCOUNT_TYPES = [
  {
    value: "USER",
    icon: Ticket,
    title: "I'm going to events",
    body: "Browse, book seats and keep your tickets in one place.",
  },
  {
    value: "CREATOR",
    icon: Megaphone,
    title: "I'm hosting events",
    body: "Create public or invite-only events and manage who comes.",
  },
];

function SignupPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      signIn(await signup(form));
      navigate({ to: "/dashboard" });
    } catch (error) {
      setErrors(
        Object.keys(error.errors ?? {}).length
          ? error.errors
          : { form: error.message }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-imperial">
        <Link to="/" className="font-serif text-2xl text-moon">
          Evently
        </Link>
        <div>
          <p className="font-serif text-4xl leading-tight text-moon">
            Start with one event. Or one ticket.
          </p>
          <p className="text-moon/55 mt-4 max-w-sm leading-relaxed">
            You can switch to hosting later. Nothing here is locked in.
          </p>
        </div>
        <p className="text-xs text-moon/35">Kochi, Kerala</p>
      </div>

      <div className="flex items-center justify-center p-5 sm:p-10 bg-moon">
        <div className="w-full max-w-sm py-8">
          <h1 className="font-serif text-3xl text-imperial">Create your account</h1>
          <p className="text-sm text-imperial/55 mt-1.5 mb-6">
            Takes about thirty seconds.
          </p>

          {errors.form && (
            <p className="text-sm px-3.5 py-2.5 rounded-lg mb-4 bg-rose-soft text-rose-deep">
              {errors.form}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              {ACCOUNT_TYPES.map(({ value, icon: Icon, title, body }) => {
                const isSelected = form.role === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, role: value }))}
                    className={`flex gap-3 text-left p-3.5 rounded-xl border transition-colors ${
                      isSelected
                        ? "border-orchid bg-orchid/10"
                        : "border-lavender/35 bg-white hover:border-lavender"
                    }`}
                  >
                    <Icon
                      size={19}
                      weight={isSelected ? "fill" : "regular"}
                      className={isSelected ? "text-amethyst" : "text-imperial/45"}
                    />
                    <div>
                      <p className="text-sm font-semibold text-imperial">{title}</p>
                      <p className="text-xs text-imperial/55 mt-0.5">{body}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <Field label="Full name" error={errors.name}>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-imperial/40" />
                <input
                  value={form.name}
                  onChange={update("name")}
                  placeholder="Meera Thomas"
                  autoComplete="name"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </Field>

            <Field label="Email" error={errors.email}>
              <div className="relative">
                <EnvelopeSimple size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-imperial/40" />
                <input
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </Field>

            <Field
              label="Password"
              error={errors.password}
              hint="At least 6 characters."
            >
              <div className="relative">
                <LockKey size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-imperial/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={update("password")}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  className={`${inputClass} pl-10 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((shown) => !shown)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-imperial/40"
                >
                  {showPassword ? <EyeSlash size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold bg-linear-to-br from-orchid to-amethyst text-moon transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 mt-1"
            >
              {isSubmitting && <CircleNotch size={15} className="animate-spin" />}
              {isSubmitting ? "Creating account" : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-imperial/55 mt-6">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-amethyst hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
