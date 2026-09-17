import { api } from "./client";

export const getAdminStats = async () => api.get("/admin/stats");

export const getAllUsers = async (search) =>
  api.get(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ""}`);

export const changeUserRole = async ({ id, role }) =>
  api.patch(`/admin/users/${id}/role`, { role });

export const deleteUser = async (id) => api.delete(`/admin/users/${id}`);

export const getAllEvents = async () => api.get("/admin/events");

export const changeEventStatus = async ({ id, status }) =>
  api.patch(`/admin/events/${id}/status`, { status });

export const adminStatsQueryOptions = () => ({
  queryKey: ["admin", "stats"],
  queryFn: getAdminStats,
});
