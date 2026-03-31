import { request } from "./api";

export const establishmentApi = {
  // ETAPA 2: Cria o rascunho do estabelecimento (Nome e CNPJ)
  saveOnboardingStep: (data) =>
    request("/estabelecimento/onboarding", {
      // Removido o /api
      method: "POST",
      body: JSON.stringify(data),
    }),

  // ETAPA 3: Cria os cargos da equipe, o cargo de Gerente e ativa o totem
  finalizeOnboarding: (data) =>
    request("/estabelecimento/finalize", {
      // Removido o /api
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Busca os dados completos do estabelecimento
  getProfile: () => request("/estabelecimento/profile", { method: "GET" }),

  // Atualiza dados secundários (telefone, endereço, etc)
  updateProfile: (data) =>
    request("/estabelecimento/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Desativa o estabelecimento (Soft Delete)
  disable: () => request("/estabelecimento/disable", { method: "DELETE" }),
};
