// api/assignmentApi.js
import api from './axiosInstance';

export const createAssignmentApi = (data) => api.post('/assignments', data);
export const getAssignmentsApi = () => api.get('/assignments');
export const updateAssignmentApi = (id, data) => api.put(`/assignments/${id}`, data);
export const deleteAssignmentApi = (id) => api.delete(`/assignments/${id}`);
