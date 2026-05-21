import { request } from "./api";

export const establishmentApi = {
  saveOnboardingStep: (data) =>
    request("/estabelecimento/onboarding", {
      method: "POST",
      body: data, 
    }),

  finalizeOnboarding: (data) =>
    request("/estabelecimento/onboarding/finalize", {
      method: "POST",
      body: data, 
    }),

  getProfile: async () => {
    const data = await request("/estabelecimento/profile", { method: "GET" });
    
    return {
      ...data,
      paymentMethods:
        typeof data.paymentMethods === "string"
          ? JSON.parse(data.paymentMethods)
          : data.paymentMethods || [],

      serviceTypes:
        typeof data.serviceTypes === "string"
          ? JSON.parse(data.serviceTypes)
          : data.serviceTypes || [],

      configurations: data.configurations || { logo: null },
    };
  },

  updateProfile: (data) => {
    return request("/estabelecimento/profile", {
      method: "PUT",
      body: data, 
    });
  },

  disable: () => request("/estabelecimento/disable", { method: "DELETE" }),
};