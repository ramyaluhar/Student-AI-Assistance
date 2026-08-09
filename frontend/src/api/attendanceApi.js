// api/attendanceApi.js
import api from './axiosInstance';

export const markAttendanceApi = (data) => api.post('/attendance', data);
export const getAttendanceApi = (params) => api.get('/attendance', { params });
export const getAttendanceSummaryApi = () => api.get('/attendance/summary');
export const deleteAttendanceApi = (id) => api.delete(`/attendance/${id}`);
