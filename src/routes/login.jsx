import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EnvelopeSimple, LockKey, CircleNotch } from "@phosphor-icons/react";
import { login } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Field, inputClass } from "@/components/common/Field";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: (search) => ({ redirect: search.redirect ?? undefined }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { signIn } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      signIn(await login(form));
      navigate({ to: redirect || "/dashboard" });
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
            Your tickets, your guest lists, your events.
          </p>
          <p className="text-moon/55 mt-4 max-w-sm leading-relaxed">
            Sign in to see what you've booked, what you're hosting, and who is
            coming.
          </p>
        </div>
        <p className="text-xs text-moon/35">Kochi, Kerala</p>
      </div>

      <div className="flex items-center justify-center p-5 sm:p-10 bg-moon">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-3xl text-imperial">Welcome back</h1>
          <p className="text-sm text-imperial/55 mt-1.5 mb-7">
            Sign in to pick up where you left off.
          </p>

          {errors.form && (
            <p className="text-sm px-3.5 py-2.5 rounded-lg mb-4 bg-rose-soft text-rose-deep">
              {errors.form}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Email" error={errors.email}>
              <div className="relative">
                <EnvelopeSimple
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-imperial/40"
                />
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

            <Field label="Password" error={errors.password}>
              <div className="relative">
                <LockKey
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-imperial/40"
                />
                <input
                  type="password"
                  value={form.password}
                  onChange={update("password")}
                  placeholder="Your password"
                  autoComplete="current-password"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold bg-linear-to-br from-orchid to-amethyst text-moon transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 mt-1"
            >
              {isSubmitting && <CircleNotch size={15} className="animate-spin" />}
              {isSubmitting ? "Signing in" : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm text-imperial/55 mt-6">
            New here?{" "}
            <Link to="/signup" className="font-semibold text-amethyst hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
