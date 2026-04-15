import { request } from "./api";

export const couponApi = {
  list: () => request("/cupons", { method: "GET" }),

  create: (data) =>
    request("/cupons", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    request(`/cupons/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id) => request(`/cupons/${id}`, { method: "DELETE" }),

  validate: (code) => request(`/cupons/validate/${code}`, { method: "GET" }),
};
