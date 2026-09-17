import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MagnifyingGlass, Trash, Users } from "@phosphor-icons/react";
import { changeUserRole, deleteUser, getAllUsers } from "@/lib/api/admin";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Header } from "@/components/dashboard/Header";
import { useDashboardMenu } from "@/components/dashboard/menu-context";
import { Empty, ErrorState, Loading } from "@/components/common/States";
import { inputClass } from "@/components/common/Field";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/dashboard/admin/users")({
  component: AdminUsersPage,
});

const ROLES = [
  { value: "USER", label: "Guest" },
  { value: "CREATOR", label: "Host" },
  { value: "ADMIN", label: "Admin" },
];

function AdminUsersPage() {
  const { openMenu } = useDashboardMenu();
  const { user: me, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: users = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => getAllUsers(),
    enabled: isAdmin,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin"] });

  const setRole = useMutation({ mutationFn: changeUserRole, onSuccess: refresh });
  const remove = useMutation({ mutationFn: deleteUser, onSuccess: refresh });

  if (!isAdmin) {
    return (
      <Empty
        icon={Users}
        title="Admins only"
        message="This page manages every account on the platform."
        action="Back to dashboard"
        actionTo="/dashboard"
      />
    );
  }

  if (isLoading) return <Loading label="Loading people" />;
  if (isError) return <ErrorState message={error.message} onRetry={refetch} />;

  const visible = users.filter((person) =>
    `${person.name} ${person.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header
        title="People"
        subtitle="Change what someone can do, or remove an account."
        onOpenMenu={openMenu}
      />

      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-lavender/25 mb-5">
        <MagnifyingGlass size={16} className="text-imperial/40 shrink-0" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or email"
          className="flex-1 text-sm text-imperial outline-none bg-transparent placeholder:text-imperial/35"
        />
      </div>

      <div className="rounded-2xl bg-white border border-lavender/20 divide-y divide-lavender/15">
        {visible.map((person) => {
          const isMe = person.id === me.id;
          return (
            <div
              key={person.id}
              className="flex flex-wrap items-center gap-3 p-4"
            >
              <div className="w-10 h-10 rounded-full grid place-items-center font-serif shrink-0 text-moon bg-linear-to-br from-orchid to-amethyst">
                {person.name[0]}
              </div>

              <div className="flex-1 min-w-40">
                <p className="text-sm font-semibold text-imperial truncate">
                  {person.name}
                  {isMe && <span className="text-imperial/40 font-normal"> (you)</span>}
                </p>
                <p className="text-xs text-imperial/50 truncate">{person.email}</p>
                <p className="text-xs text-imperial/40 mt-0.5">
                  {person._count.events} events hosted · {person._count.bookings}{" "}
                  bookings · joined {formatDate(person.createdAt)}
                </p>
              </div>

              <select
                value={person.role}
                disabled={isMe || setRole.isPending}
                onChange={(event) =>
                  setRole.mutate({ id: person.id, role: event.target.value })
                }
                className={`${inputClass} w-32 py-2 disabled:opacity-50`}
              >
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  if (window.confirm(`Remove ${person.name}? Their events and bookings go too.`)) {
                    remove.mutate(person.id);
                  }
                }}
                disabled={isMe}
                aria-label={`Remove ${person.name}`}
                className="w-9 h-9 rounded-lg grid place-items-center shrink-0 text-imperial/40 hover:text-rose-deep disabled:opacity-30"
              >
                <Trash size={16} />
              </button>
            </div>
          );
        })}

        {visible.length === 0 && (
          <p className="text-sm text-imperial/50 p-6 text-center">
            Nobody matches that search.
          </p>
        )}
      </div>
    </>
  );
}
