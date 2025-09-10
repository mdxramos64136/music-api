// src/lib/api.js
const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

export const API_BASE = isLocal ? "http://localhost:4000" : "";

export const apiFetch = (path, options) => fetch(`${API_BASE}${path}`, options);
