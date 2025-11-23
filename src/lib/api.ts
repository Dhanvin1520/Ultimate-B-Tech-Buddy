import axios from 'axios'


const API_URL = import.meta.env.VITE_API_URL || 'https://ultimate-b-tech-buddy.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
})


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['x-auth-token'] = token
  }
  return config
}, (error) => {
  return Promise.reject(error)
})


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {

      localStorage.removeItem('token')
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error)
  }
)

export default api
