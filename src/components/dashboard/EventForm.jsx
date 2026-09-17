import { useRef, useState } from "react";
import {
  Globe,
  LockKey,
  UploadSimple,
  ImageSquare,
  CircleNotch,
  Trash,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { categoriesQueryOptions } from "@/lib/api/categories";
import { uploadImage } from "@/lib/api/upload";
import { Field, inputClass } from "@/components/common/Field";
import { toDateInput } from "@/lib/format";

const EVENT_TYPES = [
  {
    value: "PUBLIC",
    icon: Globe,
    title: "Public event",
    body: "Concerts, expos, meetups. Listed for anyone to find and book.",
  },
  {
    value: "PRIVATE",
    icon: LockKey,
    title: "Invite only",
    body: "Weddings, college nights, reunions. Reachable with a code you send.",
  },
];

export const emptyEvent = {
  title: "",
  description: "",
  type: "PUBLIC",
  status: "PUBLISHED",
  date: "",
  startTime: "",
  endTime: "",
  location: "",
  isPaid: false,
  price: "",
  currency: "INR",
  totalSeats: "",
  imageUrl: null,
  categoryId: "",
};

export const toFormValues = (event) => ({
  ...emptyEvent,
  ...event,
  date: toDateInput(event.date),
  price: String(event.price ?? ""),
  totalSeats: String(event.totalSeats ?? ""),
  categoryId: event.categoryId ?? "",
});

// Shared by the create and edit pages so both stay identical.
export function EventForm({
  values,
  setValues,
  errors = {},
  onSubmit,
  isSubmitting,
  submitLabel,
  footer,
}) {
  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { data: categories = [] } = useQuery(categoriesQueryOptions());

  const set = (field, value) =>
    setValues((current) => ({ ...current, [field]: value }));

  const update = (field) => (event) => set(field, event.target.value);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setIsUploading(true);
    try {
      set("imageUrl", await uploadImage(file));
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-6"
    >
      <section className="rounded-2xl p-5 bg-white border border-lavender/20 flex flex-col gap-4">
        <h2 className="font-serif text-lg text-imperial">Who is this for?</h2>

        <div className="grid sm:grid-cols-2 gap-3">
          {EVENT_TYPES.map(({ value, icon: Icon, title, body }) => {
            const isSelected = values.type === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => set("type", value)}
                className={`flex gap-3 text-left p-4 rounded-xl border transition-colors ${
                  isSelected
                    ? "border-orchid bg-orchid/10"
                    : "border-lavender/35 hover:border-lavender"
                }`}
              >
                <Icon
                  size={20}
                  weight={isSelected ? "fill" : "regular"}
                  className={isSelected ? "text-amethyst" : "text-imperial/45"}
                />
                <div>
                  <p className="text-sm font-semibold text-imperial">{title}</p>
                  <p className="text-xs leading-relaxed text-imperial/55 mt-1">
                    {body}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl p-5 bg-white border border-lavender/20 flex flex-col gap-4">
        <h2 className="font-serif text-lg text-imperial">The basics</h2>

        <Field label="Event name" error={errors.title}>
          <input
            value={values.title}
            onChange={update("title")}
            placeholder="Kochi Indie Nights"
            className={inputClass}
          />
        </Field>

        <Field
          label="Description"
          hint="What should people know before they book?"
          error={errors.description}
        >
          <textarea
            value={values.description}
            onChange={update("description")}
            rows={4}
            placeholder="Four bands, one rooftop, doors at six."
            className={`${inputClass} resize-none`}
          />
        </Field>

        <Field label="Category" error={errors.categoryId}>
          <select
            value={values.categoryId ?? ""}
            onChange={update("categoryId")}
            className={inputClass}
          >
            <option value="">Pick one</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
      </section>

      <section className="rounded-2xl p-5 bg-white border border-lavender/20 flex flex-col gap-4">
        <h2 className="font-serif text-lg text-imperial">When and where</h2>

        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Date" error={errors.date}>
            <input
              type="date"
              value={values.date}
              onChange={update("date")}
              className={inputClass}
            />
          </Field>
          <Field label="Starts" error={errors.startTime}>
            <input
              type="time"
              value={values.startTime}
              onChange={update("startTime")}
              className={inputClass}
            />
          </Field>
          <Field label="Ends" error={errors.endTime}>
            <input
              type="time"
              value={values.endTime}
              onChange={update("endTime")}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Venue" error={errors.location}>
          <input
            value={values.location}
            onChange={update("location")}
            placeholder="Marine Drive Rooftop, Kochi"
            className={inputClass}
          />
        </Field>
      </section>

      <section className="rounded-2xl p-5 bg-white border border-lavender/20 flex flex-col gap-4">
        <h2 className="font-serif text-lg text-imperial">Seats and tickets</h2>

        <Field
          label="How many seats?"
          hint="Bookings close automatically once these run out."
          error={errors.totalSeats}
        >
          <input
            type="number"
            min="1"
            value={values.totalSeats}
            onChange={update("totalSeats")}
            placeholder="120"
            className={inputClass}
          />
        </Field>

        <div className="flex gap-2 p-1 rounded-xl bg-moon w-fit">
          <button
            type="button"
            onClick={() => set("isPaid", false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !values.isPaid ? "bg-white text-amethyst" : "text-imperial/55"
            }`}
          >
            Free entry
          </button>
          <button
            type="button"
            onClick={() => set("isPaid", true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              values.isPaid ? "bg-white text-amethyst" : "text-imperial/55"
            }`}
          >
            Paid ticket
          </button>
        </div>

        {values.isPaid && (
          <Field
            label="Price per seat (₹)"
            hint="Guests pay this once per seat they book."
            error={errors.price}
          >
            <input
              type="number"
              min="1"
              value={values.price}
              onChange={update("price")}
              placeholder="799"
              className={inputClass}
            />
          </Field>
        )}
      </section>

      <section className="rounded-2xl p-5 bg-white border border-lavender/20">
        <h2 className="font-serif text-lg text-imperial mb-4">Cover image</h2>

        {values.imageUrl ? (
          <div className="relative rounded-xl overflow-hidden">
            <img
              src={values.imageUrl}
              alt="Event cover"
              className="w-full h-44 object-cover"
            />
            <button
              type="button"
              onClick={() => set("imageUrl", null)}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-rose-deep"
            >
              <Trash size={13} />
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full flex flex-col items-center justify-center gap-2 py-10 rounded-xl border-2 border-dashed border-lavender/40 hover:border-orchid transition-colors"
          >
            {isUploading ? (
              <>
                <CircleNotch size={22} className="animate-spin text-amethyst" />
                <span className="text-sm text-imperial/65">Uploading</span>
              </>
            ) : (
              <>
                <UploadSimple size={22} className="text-imperial/40" />
                <span className="text-sm font-medium text-imperial/70">
                  Add a cover image
                </span>
                <span className="text-xs text-imperial/40">
                  JPG, PNG or WEBP, up to 5MB
                </span>
              </>
            )}
          </button>
        )}

        {uploadError && (
          <p className="text-xs mt-2.5 px-3 py-2 rounded-lg bg-rose-soft text-rose-deep">
            {uploadError}
          </p>
        )}
        {!values.imageUrl && !uploadError && (
          <p className="flex items-center gap-1.5 text-xs text-imperial/40 mt-2.5">
            <ImageSquare size={13} />
            Optional. Events without one get a coloured card.
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFile}
          className="hidden"
        />
      </section>

      {errors.form && (
        <p className="text-sm px-3.5 py-2.5 rounded-lg bg-rose-soft text-rose-deep">
          {errors.form}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        {footer}
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold ml-auto bg-linear-to-br from-orchid to-amethyst text-moon transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isSubmitting && <CircleNotch size={15} className="animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
