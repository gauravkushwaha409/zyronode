import axios from 'axios';
import type { ApiError } from '../../types';


export const api = axios.create({
  baseURL: '',
  timeout: 100,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: ApiError) => {
    return Promise.reject(error);
  },
);
