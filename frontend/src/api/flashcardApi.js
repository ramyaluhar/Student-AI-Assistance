// api/flashcardApi.js
import api from './axiosInstance';

export const generateFlashcardsApi = (data) => api.post('/flashcards/generate', data);
export const getDecksApi = () => api.get('/flashcards');
export const getDeckByIdApi = (id) => api.get(`/flashcards/${id}`);
export const deleteDeckApi = (id) => api.delete(`/flashcards/${id}`);
