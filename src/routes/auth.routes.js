import { Hono } from "hono";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
import { requireAuth } from "../middleware/auth.js";
import {
  signupSchema,
  loginSchema,
  profileSchema,
  fieldErrors,
} from "../lib/validators.js";

const authRoutes = new Hono();

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  avatarUrl: user.avatarUrl,
});

authRoutes.post("/signup", async (c) => {
  const parsed = signupSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({ success: false, errors: fieldErrors(parsed.error) }, 400);
  }

  const { name, email, password, role, phone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return c.json(
      { success: false, errors: { email: "That email is already registered" } },
      409
    );
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      // Admins are never created through signup - promote from the admin panel.
      role,
      password: await bcrypt.hash(password, 10),
    },
  });

  return c.json(
    {
      success: true,
      data: { user: publicUser(user), token: signToken({ sub: user.id }) },
    },
    201
  );
});

authRoutes.post("/login", async (c) => {
  const parsed = loginSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({ success: false, errors: fieldErrors(parsed.error) }, 400);
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return c.json(
      { success: false, errors: { form: "Email or password is wrong" } },
      401
    );
  }

  return c.json({
    success: true,
    data: { user: publicUser(user), token: signToken({ sub: user.id }) },
  });
});

authRoutes.get("/me", requireAuth, async (c) => {
  const user = await prisma.user.findUnique({
    where: { id: c.get("user").id },
  });
  return c.json({ success: true, data: publicUser(user) });
});

authRoutes.patch("/me", requireAuth, async (c) => {
  const parsed = profileSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({ success: false, errors: fieldErrors(parsed.error) }, 400);
  }

  const user = await prisma.user.update({
    where: { id: c.get("user").id },
    data: parsed.data,
  });

  return c.json({ success: true, data: publicUser(user) });
});

export default authRoutes;
