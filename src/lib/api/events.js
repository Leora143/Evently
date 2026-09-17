import { api } from "./client";

const toQuery = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, value);
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

export const getEvents = async (filters) => api.get(`/events${toQuery(filters)}`);

export const getMyEvents = async () => api.get("/events/mine");

export const getEvent = async (id, code) => api.get(`/events/${id}${toQuery({ code })}`);

export const getEventByInvite = async (code) => api.get(`/events/invite/${code}`);

export const getAttendees = async (id) => api.get(`/events/${id}/attendees`);

export const createEvent = async (payload) => api.post("/events", payload);

export const updateEvent = async ({ id, ...payload }) => api.patch(`/events/${id}`, payload);

export const deleteEvent = async (id) => api.delete(`/events/${id}`);

export const getInvites = async (id) => api.get(`/events/${id}/invites`);

export const addInvite = async ({ id, ...payload }) => api.post(`/events/${id}/invites`, payload);

export const removeInvite = async ({ id, inviteId }) =>
  api.delete(`/events/${id}/invites/${inviteId}`);

export const eventsQueryOptions = (filters) => ({
  queryKey: ["events", filters],
  queryFn: () => getEvents(filters),
});

export const eventQueryOptions = (id, code) => ({
  queryKey: ["event", id, code ?? null],
  queryFn: () => getEvent(id, code),
  enabled: Boolean(id),
});

export const myEventsQueryOptions = () => ({
  queryKey: ["events", "mine"],
  queryFn: getMyEvents,
});
