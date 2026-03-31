import { request } from "./api";

export const establishmentApi = {
  saveOnboardingStep: (data) =>
    request("/estabelecimento/onboarding", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  finalizeOnboarding: (data) =>
    request("/estabelecimento/finalize", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getProfile: () => request("/estabelecimento/profile", { method: "GET" }),

  updateProfile: (data) =>
    request("/estabelecimento/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  disable: () => request("/estabelecimento/disable", { method: "DELETE" }),
};
