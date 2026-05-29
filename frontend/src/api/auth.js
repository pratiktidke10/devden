import api from './axios'

export const loginUser = (email, password) =>
  api.post('/api/auth/login/', { email, password })

export const registerUser = (data) =>
  api.post('/api/auth/register/', data)

export const getMe = () =>
  api.get('/api/auth/user/')