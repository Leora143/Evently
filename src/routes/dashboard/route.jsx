import { useState } from "react";
import { createFileRoute, Outlet, Navigate, useRouterState } from "@tanstack/react-router";
import { X } from "@phosphor-icons/react";
import { Sidebar } from "@/components/dashboard/SideBar";
import { MenuContext } from "@/components/dashboard/menu-context";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Loading } from "@/components/common/States";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const { isSignedIn, isLoading } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (isLoading) return <Loading label="Getting your account" />;

  if (!isSignedIn) {
    return <Navigate to="/login" search={{ redirect: pathname }} replace />;
  }

  return (
    <div className="min-h-screen flex bg-moon">
      <div className="hidden lg:block sticky top-0 h-screen">
        <Sidebar />
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-imperial/60"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative h-full">
            <Sidebar onNavigate={() => setIsMenuOpen(false)} />
            <button
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
              className="absolute top-5 -right-11 w-9 h-9 rounded-full grid place-items-center bg-moon text-imperial"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 p-5 sm:p-8">
        <div className="max-w-5xl mx-auto w-full">
          <MenuContext.Provider value={{ openMenu: () => setIsMenuOpen(true) }}>
            <Outlet />
          </MenuContext.Provider>
        </div>
      </main>
    </div>
  );
}
