import axios from "axios";
import { API_BASE } from "./axios";

export const getAdminToken = () => localStorage.getItem("adminToken");

export const getAdmin = () => {
  try {
    return JSON.parse(localStorage.getItem("adminUser"));
  } catch {
    return null;
  }
};

export const setAdmin = (token, user) => {
  localStorage.setItem("adminToken", token);
  localStorage.setItem("adminUser", JSON.stringify(user));
};

export const clearAdmin = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
};

const adminApi = axios.create({ baseURL: API_BASE });

adminApi.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default adminApi;
