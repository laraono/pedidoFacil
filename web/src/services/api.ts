const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export function getToken() {
  return localStorage.getItem("accessToken");
}

export async function request(path: string, options: RequestInit & { isMultipart?: boolean } = {}) {
  const isFormData = options.isMultipart === true || options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  if (options.body && !isFormData && typeof options.body === "object") {
    options = { ...options, body: JSON.stringify(options.body) };
  }

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
        throw new Error(retryData.error || `Erro ${retry.status}`);
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
    throw new Error(data.message || data.error || `Erro ${res.status}`);
  }
  
  return data;
}