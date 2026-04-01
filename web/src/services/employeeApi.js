import { request } from "./api";

export const employeeApi = {
  // Lista todos os funcionários ativos
  list: () => request("/funcionario", { method: "GET" }),

  // Lista todos os funcionários inativos
  listInactive: () => request("/funcionario/inactive", { method: "GET" }),

  // Cria um novo funcionário
  create: (data) =>
    request("/funcionario", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Atualiza dados de um funcionário
  update: (id, data) =>
    request(`/funcionario/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Remove o acesso de um funcionário (soft delete)
  delete: (id) => request(`/funcionario/${id}`, { method: "DELETE" }),

  // Reativa um funcionário
  reactivate: (id) =>
    request(`/funcionario/${id}/reactivate`, { method: "PATCH" }),
};
