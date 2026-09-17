import { api } from "./client";

export const signup = async (payload) => api.post("/auth/signup", payload, { auth: false });

export const login = async (payload) => api.post("/auth/login", payload, { auth: false });

export const getMe = async () => api.get("/auth/me");

export const updateProfile = async (payload) => api.patch("/auth/me", payload);
