import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { makeInviteCode, makeTicketCode } from "../src/lib/codes.js";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Music", slug: "music", icon: "music" },
  { name: "Business", slug: "business", icon: "briefcase" },
  { name: "Sports", slug: "sports", icon: "trophy" },
  { name: "Art & Culture", slug: "art-culture", icon: "palette" },
  { name: "Food & Drink", slug: "food-drink", icon: "utensils" },
  { name: "Technology", slug: "technology", icon: "cpu" },
  { name: "Weddings", slug: "weddings", icon: "heart" },
  { name: "College", slug: "college", icon: "graduation" },
];

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date;
};

const main = async () => {
  const password = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@evently.com" },
    update: {},
    create: { name: "Aditi Menon", email: "admin@evently.com", password, role: "ADMIN" },
  });

  const creator = await prisma.user.upsert({
    where: { email: "creator@evently.com" },
    update: {},
    create: { name: "Rahul Nair", email: "creator@evently.com", password, role: "CREATOR" },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@evently.com" },
    update: {},
    create: { name: "Meera Thomas", email: "user@evently.com", password, role: "USER" },
  });

  const categories = {};
  for (const category of CATEGORIES) {
    categories[category.slug] = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  const events = [
    {
      title: "Kochi Indie Nights",
      description:
        "Four bands, one rooftop, and a view of the backwaters. Doors open an hour before the first set so there is time to eat.",
      type: "PUBLIC",
      date: daysFromNow(12),
      startTime: "18:00",
      endTime: "23:00",
      location: "Marine Drive Rooftop, Kochi",
      isPaid: true,
      price: 799,
      totalSeats: 250,
      categoryId: categories.music.id,
    },
    {
      title: "Kerala Startup Summit",
      description:
        "A day of talks from founders who built in Kerala, plus office hours with three early-stage funds. Lunch included.",
      type: "PUBLIC",
      date: daysFromNow(26),
      startTime: "09:30",
      endTime: "17:00",
      location: "Technopark Phase 3, Trivandrum",
      isPaid: true,
      price: 1499,
      totalSeats: 400,
      categoryId: categories.business.id,
    },
    {
      title: "Open Air Film Screening",
      description:
        "A free evening screening on the lawn. Bring a mat. Seats are limited so we can keep it comfortable.",
      type: "PUBLIC",
      date: daysFromNow(6),
      startTime: "19:00",
      endTime: "22:00",
      location: "Durbar Hall Grounds, Ernakulam",
      isPaid: false,
      price: 0,
      totalSeats: 120,
      categoryId: categories["art-culture"].id,
    },
    {
      title: "Anjali & Vivek — Wedding Reception",
      description:
        "Dinner and dancing from eight. Please book seats for everyone in your party so we get the table count right.",
      type: "PRIVATE",
      date: daysFromNow(40),
      startTime: "19:30",
      endTime: "23:30",
      location: "Le Meridien, Kochi",
      isPaid: false,
      price: 0,
      totalSeats: 300,
      categoryId: categories.weddings.id,
    },
    {
      title: "CS Batch of 2022 Reunion",
      description:
        "Same canteen, same people, three years later. Pay at booking so we can confirm the caterer.",
      type: "PRIVATE",
      date: daysFromNow(18),
      startTime: "11:00",
      endTime: "16:00",
      location: "Rajagiri College, Kalamassery",
      isPaid: true,
      price: 450,
      totalSeats: 90,
      categoryId: categories.college.id,
    },
  ];

  for (const event of events) {
    const exists = await prisma.event.findFirst({ where: { title: event.title } });
    if (exists) continue;

    await prisma.event.create({
      data: {
        ...event,
        organizerId: creator.id,
        inviteCode: event.type === "PRIVATE" ? makeInviteCode() : null,
      },
    });
  }

  const freeEvent = await prisma.event.findFirst({
    where: { title: "Open Air Film Screening" },
  });

  const hasBooking = await prisma.booking.findFirst({
    where: { userId: user.id, eventId: freeEvent.id },
  });

  if (!hasBooking) {
    await prisma.$transaction([
      prisma.booking.create({
        data: {
          code: makeTicketCode(),
          eventId: freeEvent.id,
          userId: user.id,
          seats: 2,
          amount: 0,
          status: "CONFIRMED",
          paymentStatus: "FREE",
        },
      }),
      prisma.event.update({
        where: { id: freeEvent.id },
        data: { bookedSeats: { increment: 2 } },
      }),
    ]);
  }

  const privateEvents = await prisma.event.findMany({
    where: { type: "PRIVATE" },
    select: { title: true, inviteCode: true },
  });

  console.log("\nSeeded. Sign in with any of these (password: password123):");
  console.table([
    { role: "ADMIN", email: admin.email },
    { role: "CREATOR", email: creator.email },
    { role: "USER", email: user.email },
  ]);
  console.log("\nInvite codes for the private events:");
  console.table(privateEvents);
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
