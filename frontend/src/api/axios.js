import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const axiosInstance = axios.create({
  baseURL: BASE_URL,
})

// REQUEST interceptor — attach token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// RESPONSE interceptor — handle expired tokens automatically
// If any request returns 401, we clear localStorage and
// reload the page so the user is taken back to a clean state.
// In a production app you would silently refresh the token instead,
// but for now this gives clean behaviour without complexity.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config.url
      const isAuthEndpoint =
        url.includes('/auth/login') ||
        url.includes('/auth/register')

      // Only clear tokens on protected endpoints (create room, post message etc.)
      // NOT on public read endpoints
      const isProtectedEndpoint =
        url.includes('/auth/') ||
        (url.includes('/rooms') && error.config.method === 'post') ||
        url.includes('/messages') ||
        url.includes('/update')

      if (!isAuthEndpoint && isProtectedEndpoint) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_id')
        localStorage.removeItem('user_name')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance