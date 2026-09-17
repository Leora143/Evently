import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CaretLeft, Megaphone } from "@phosphor-icons/react";
import { createEvent } from "@/lib/api/events";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Header } from "@/components/dashboard/Header";
import { useDashboardMenu } from "@/components/dashboard/menu-context";
import { EventForm, emptyEvent } from "@/components/dashboard/EventForm";
import { Empty } from "@/components/common/States";

export const Route = createFileRoute("/dashboard/my-events/create")({
  component: CreateEventPage,
});

function CreateEventPage() {
  const { openMenu } = useDashboardMenu();
  const { canCreateEvents } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [values, setValues] = useState(emptyEvent);
  const [errors, setErrors] = useState({});

  const create = useMutation({
    mutationFn: createEvent,
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      navigate({
        to: "/dashboard/my-events/$eventId",
        params: { eventId: event.id },
      });
    },
    onError: (error) =>
      setErrors(
        Object.keys(error.errors ?? {}).length
          ? error.errors
          : { form: error.message }
      ),
  });

  if (!canCreateEvents) {
    return (
      <Empty
        icon={Megaphone}
        title="Host accounts only"
        message="Ask an admin to switch your account to a host account and this page opens up."
        action="Back to dashboard"
        actionTo="/dashboard"
      />
    );
  }

  return (
    <>
      <Link
        to="/dashboard/my-events"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-amethyst mb-4"
      >
        <CaretLeft size={14} />
        My events
      </Link>

      <Header
        title="Create an event"
        subtitle="Two minutes, and you're taking bookings."
        onOpenMenu={openMenu}
      />

      <EventForm
        values={values}
        setValues={setValues}
        errors={errors}
        onSubmit={() =>
          create.mutate({
            ...values,
            price: Number(values.price || 0),
            totalSeats: Number(values.totalSeats || 0),
            categoryId: values.categoryId || null,
          })
        }
        isSubmitting={create.isPending}
        submitLabel="Publish event"
      />
    </>
  );
}
