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

  // 👇 Faz o tratamento dos dados JSON que vêm do banco com segurança
  getProfile: async () => {
    const data = await request("/estabelecimento/profile", { method: "GET" });
    return {
      ...data,
      // Se o TypeORM já converteu para Array, usamos direto. Se vier String, fazemos o parse.
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

  // 👇 Empacota os dados perfeitamente para o TypeORM salvar tudo de uma vez
  updateProfile: (data) => {
    const payload = {
      name: data.name,
      cnpj: data.cnpj,
      phone: data.phone,
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

  disable: () => request("/estabelecimento/disable", { method: "DELETE" }),
};
