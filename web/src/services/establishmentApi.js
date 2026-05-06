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
    const payload = {
      name: data.name ?? '',
      cnpj: data.cnpj ?? '',
      razaoSocial: data.razaoSocial ?? '',
      phone: data.phone ?? '',
      address: data.address ?? '',
      inscricaoMunicipalPath: data.inscricaoMunicipalPath ?? null,
      paymentMethods: JSON.stringify(data.paymentMethods || []),
      selfServiceEnabled: data.selfServiceEnabled,
      selfServiceCode: data.selfServiceCode,
      configurations: {
        logo: data.logo,
      },
    };

    return request("/estabelecimento/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  uploadInscricaoMunicipal: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return request("/estabelecimento/inscricao-municipal", {
      method: "POST",
      body: formData,
      headers: {},
    });
  },

  disable: () => request("/estabelecimento/disable", { method: "DELETE" }),
};