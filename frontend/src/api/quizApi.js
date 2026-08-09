// api/quizApi.js
import api from './axiosInstance';

export const generateQuizApi = (data) => api.post('/quiz/generate', data);
export const getQuizzesApi = () => api.get('/quiz');
export const getQuizByIdApi = (id) => api.get(`/quiz/${id}`);
export const submitQuizApi = (id, answers) => api.post(`/quiz/${id}/submit`, { answers });
export const deleteQuizApi = (id) => api.delete(`/quiz/${id}`);
