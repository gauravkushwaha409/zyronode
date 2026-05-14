import axios from 'axios';


export const createApiClient = (baseURL: string) => axios.create({
  baseURL,
  timeout: 100,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
