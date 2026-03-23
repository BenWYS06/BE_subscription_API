const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export const getToken = () => localStorage.getItem("token");
export const getUserId = () => localStorage.getItem("userId");
export const getUserName = () => localStorage.getItem("userName");

export const saveAuth = (data) => {
  if (!data || !data.token || !data.user) return;
  localStorage.setItem("token", data.token);
  localStorage.setItem("userId", data.user._id || "");
  localStorage.setItem("userName", data.user.name || "");
};

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
};

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
  };

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = data?.error || data?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}
