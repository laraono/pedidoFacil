import { request } from "./api";

export const employeeApi = {
  list: () => request("/funcionario", { method: "GET" }),

  listInactive: () => request("/funcionario/inactive", { method: "GET" }),

  create: (data) =>
    request("/funcionario", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    request(`/funcionario/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id) => request(`/funcionario/${id}`, { method: "DELETE" }),

  reactivate: (id) =>
    request(`/funcionario/${id}/reactivate`, { method: "PATCH" }),
};
