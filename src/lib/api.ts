import axios from 'axios'

const DEFAULT_API_URL = 'https://ultimate-b-tech-buddy.onrender.com/api'

const isLocalHost = (url?: string) => {
  if (!url) return false
  try {
    const { hostname } = new URL(url)
    return hostname === 'localhost' || hostname === '127.0.0.1'
  } catch {
    return false
  }
}

const isRunningOnLocalhost = () => {
  if (typeof window === 'undefined') return false
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
}

const resolveApiUrl = () => {
  const rawEnvUrl = import.meta.env.VITE_API_URL?.trim()
  if (rawEnvUrl) {
    if (!isLocalHost(rawEnvUrl) || isRunningOnLocalhost()) {
      return rawEnvUrl.replace(/\/$/, '')
    }
  }
  return DEFAULT_API_URL
}

const api = axios.create({
  baseURL: resolveApiUrl(),
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
