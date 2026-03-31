// src/services/authApi.js
import { request } from "./api";

export const authApi = {
  register: (data) =>
    request("/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (email, senha) =>
    request("/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    }),

  logout: () => request("/logout", { method: "POST" }),

  refresh: () => request("/refresh", { method: "POST" }),

  // O seu controller de Auth tem o método perfil()
  me: () => request("/perfil", { method: "GET" }),
};
