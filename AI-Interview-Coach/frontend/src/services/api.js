import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const generateInterview = async (payload) => {
  const { data } = await api.post("/api/interviews/generate", payload);
  return data;
};

export const getInterview = async (interviewId) => {
  const { data } = await api.get(`/api/interviews/${interviewId}`);
  return data;
};

export const submitAnswer = async (payload) => {
  const { data } = await api.post("/api/answers/submit", payload);
  return data;
};

export const getFinalReport = async (interviewId) => {
  const { data } = await api.get(`/api/reports/${interviewId}`);
  return data;
};

export const getAnalytics = async (email) => {
  const { data } = await api.get("/api/analytics", { params: { email } });
  return data;
};

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/api/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const checkHealth = async () => {
  const { data } = await api.get("/health");
  return data;
};

export default api;
