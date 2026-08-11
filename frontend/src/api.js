import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: API_URL });

export const getProspects = (params) => api.get("/prospects", { params }).then((r) => r.data);
export const getProspect = (id) => api.get(`/prospects/${id}`).then((r) => r.data);
export const createProspect = (data) => api.post("/prospects", data).then((r) => r.data);
export const updateProspect = (id, data) => api.put(`/prospects/${id}`, data).then((r) => r.data);
export const deleteProspect = (id) => api.delete(`/prospects/${id}`).then((r) => r.data);
export const declineProspect = (id, reason) =>
  api.post(`/prospects/${id}/decline`, { reason }).then((r) => r.data);
export const advanceSequence = (id, channelUsed) =>
  api.post(`/prospects/${id}/advance-sequence`, { channelUsed }).then((r) => r.data);

export const getTemplates = () => api.get("/templates").then((r) => r.data);
export const createTemplate = (data) => api.post("/templates", data).then((r) => r.data);
export const updateTemplate = (id, data) => api.put(`/templates/${id}`, data).then((r) => r.data);
export const deleteTemplate = (id) => api.delete(`/templates/${id}`).then((r) => r.data);

export const getSuppression = () => api.get("/suppression").then((r) => r.data);
export const addSuppression = (data) => api.post("/suppression", data).then((r) => r.data);
export const removeSuppression = (id) => api.delete(`/suppression/${id}`).then((r) => r.data);

export const getStats = () => api.get("/stats").then((r) => r.data);

export default api;
