import { api } from "./client";

export const getCategories = async () => api.get("/categories");

export const categoriesQueryOptions = () => ({
  queryKey: ["categories"],
  queryFn: getCategories,
  staleTime: 1000 * 60 * 10,
});
