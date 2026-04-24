import axios from 'axios';

const api = axios.create({
    baseURL: 'https://lecture-summarizer-mi8z.onrender.com/api/v1',
    withCredentials: true,
});

// Interceptor to automatically attach your JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
