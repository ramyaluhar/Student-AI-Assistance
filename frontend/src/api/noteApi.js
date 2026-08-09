// api/noteApi.js
import api from './axiosInstance';

export const uploadNoteApi = (formData) =>
  api.post('/notes/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getNotesApi = () => api.get('/notes');
export const getNoteByIdApi = (id) => api.get(`/notes/${id}`);
export const summarizeNoteApi = (id) => api.post(`/notes/${id}/summarize`);
export const exportNoteApi = (id) => api.get(`/notes/${id}/export`, { responseType: 'blob' });
export const deleteNoteApi = (id) => api.delete(`/notes/${id}`);
