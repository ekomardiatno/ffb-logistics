import axios from "axios";

const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || "/api",
  timeout: 10000
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
