// api/plannerApi.js
import api from './axiosInstance';

export const createTaskApi = (data) => api.post('/planner', data);
export const getTasksApi = (params) => api.get('/planner', { params });
export const updateTaskApi = (id, data) => api.put(`/planner/${id}`, data);
export const deleteTaskApi = (id) => api.delete(`/planner/${id}`);
export const generateAIPlanApi = (data) => api.post('/planner/ai-generate', data);
