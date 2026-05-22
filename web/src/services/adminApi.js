import { request } from "./api";

export const adminPlanApi = {
  listPublic: async () =>
    await request("/admin/public/plans", { method: "GET" }),

  list: async () =>
    await request("/admin/plans", { method: "GET" }),

  get: async (planId) =>
    await request(`/admin/plans/${planId}`, { method: "GET" }),

  create: async (data) =>
    await request("/admin/plans", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: async (planId, data) =>
    await request(`/admin/plans/${planId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: async (planId) =>
    await request(`/admin/plans/${planId}`, { method: "DELETE" }),
};

export const adminUserApi = {
  list: async () =>
    await request("/admin/admins", { method: "GET" }),

  get: async (adminId) =>
    await request(`/admin/admins/${adminId}`, { method: "GET" }),

  create: async (data) =>
    await request("/admin/admins", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: async (adminId, data) =>
    await request(`/admin/admins/${adminId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: async (adminId) =>
    await request(`/admin/admins/${adminId}`, { method: "DELETE" }),
};

export const adminSubscriptionApi = {
  list: async () =>
    await request("/admin/subscriptions", { method: "GET" }),

  get: async (subscriptionId) =>
    await request(`/admin/subscriptions/${subscriptionId}`, { method: "GET" }),

  updatePrice: async (subscriptionId, amount) =>
    await request(`/admin/subscriptions/${subscriptionId}/price`, {
      method: "PUT",
      body: JSON.stringify({ amount }),
    }),

  cancel: async (subscriptionId) =>
    await request(`/admin/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
    }),

  delete: async (subscriptionId) =>
    await request(`/admin/subscriptions/${subscriptionId}`, {
      method: "DELETE",
    }),
};

export const adminMetricsApi = {
  getSubscriptionMetrics: async () =>
    await request("/admin/metrics/subscriptions", { method: "GET" }),
};
