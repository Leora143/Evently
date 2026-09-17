import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name needs at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password needs at least 6 characters"),
  role: z.enum(["USER", "CREATOR"]).default("USER"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export const eventSchema = z
  .object({
    title: z.string().min(3, "Title needs at least 3 characters"),
    description: z.string().min(10, "Add a few words about the event"),
    type: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
    status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED"]).default("PUBLISHED"),
    date: z.string().min(1, "Pick a date"),
    startTime: z.string().min(1, "Pick a start time"),
    endTime: z.string().min(1, "Pick an end time"),
    location: z.string().min(2, "Where is it happening?"),
    isPaid: z.boolean().default(false),
    price: z.coerce.number().min(0).default(0),
    currency: z.string().default("INR"),
    totalSeats: z.coerce.number().int().min(1, "There has to be at least 1 seat"),
    imageUrl: z.string().url().nullable().optional(),
    categoryId: z.string().nullable().optional(),
  })
  .refine((data) => !data.isPaid || data.price > 0, {
    message: "A paid event needs a price above 0",
    path: ["price"],
  });

export const bookingSchema = z.object({
  eventId: z.string().min(1),
  seats: z.coerce.number().int().min(1, "Book at least 1 seat").max(10, "Max 10 seats per booking"),
  inviteCode: z.string().optional(),
});

export const inviteSchema = z.object({
  email: z.string().email("Enter a valid email"),
  name: z.string().optional(),
});

export const roleSchema = z.object({
  role: z.enum(["USER", "CREATOR", "ADMIN"]),
});

export const profileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

// Turns a ZodError into { field: message } so the UI can show it inline.
export const fieldErrors = (error) =>
  error.issues.reduce((acc, issue) => {
    const key = issue.path[0] ?? "form";
    if (!acc[key]) acc[key] = issue.message;
    return acc;
  }, {});
