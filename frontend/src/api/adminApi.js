// api/adminApi.js
import api from './axiosInstance';

export const getAllUsersApi = () => api.get('/admin/users');
export const toggleUserStatusApi = (id) => api.put(`/admin/users/${id}/status`);
export const deleteUserApi = (id) => api.delete(`/admin/users/${id}`);
export const getPlatformStatsApi = () => api.get('/admin/stats');
