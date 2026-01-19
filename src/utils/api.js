// C:\Project\kaist\2_week\blockpass-front\src\utils\api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8010/api/v1',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;