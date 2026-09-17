import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { Compass } from "@phosphor-icons/react";

export const Route = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: NotFound,
});

function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center px-5 bg-moon">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-2xl grid place-items-center bg-orchid/15 mx-auto mb-4">
          <Compass size={22} className="text-amethyst" />
        </div>
        <h1 className="font-serif text-3xl text-imperial">Nothing at this address</h1>
        <p className="text-sm text-imperial/55 mt-2">
          The page moved or the link was mistyped.
        </p>
        <Link
          to="/"
          className="inline-block mt-5 px-5 py-2.5 rounded-lg text-sm font-semibold bg-linear-to-br from-orchid to-amethyst text-moon"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
