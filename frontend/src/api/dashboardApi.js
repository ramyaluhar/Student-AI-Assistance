// api/dashboardApi.js
import api from './axiosInstance';

export const getDashboardStatsApi = () => api.get('/dashboard');
