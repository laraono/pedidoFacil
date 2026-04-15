const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export function getToken() {
  return localStorage.getItem("accessToken");
}

export async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  const token = getToken();

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && path !== "/refresh" && path !== "/login") {
    try {
      const refreshedRes = await fetch(`${BASE_URL}/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!refreshedRes.ok) throw new Error("Refresh falhou");

      const refreshed = await refreshedRes.json();
      localStorage.setItem("accessToken", refreshed.accessToken);

      headers["Authorization"] = `Bearer ${refreshed.accessToken}`;
      const retry = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
        credentials: "include",
      });

      if (!retry.ok) {
        const retryData = await retry.json().catch(() => ({}));
        const error = new Error(retryData.message || retryData.error || `Erro ${retry.status}`);
        error.data = retryData;
        error.status = retry.status;
        throw error;
      }

      return retry.status === 204 ? null : retry.json();
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Sessão expirada. Faça login novamente.");
    }
  }

  if (!res.ok) {
    const error = new Error(data.message || data.error || `Erro ${res.status}`);
    error.data = data;
    error.status = res.status;
    throw error;
  }

  return data;
}