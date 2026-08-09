// api/chatApi.js
import api from './axiosInstance';

export const getChatsApi = () => api.get('/chat');
export const getChatByIdApi = (id) => api.get(`/chat/${id}`);
export const sendMessageApi = (data) => api.post('/chat/message', data);
export const deleteChatApi = (id) => api.delete(`/chat/${id}`);
