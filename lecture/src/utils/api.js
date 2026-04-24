import axios from 'axios';

const api = axios.create({
    // Changed to 4000 to match your Express server
    baseURL: 'http://localhost:4000/api/v1',
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
