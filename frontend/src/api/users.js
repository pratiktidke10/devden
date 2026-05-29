import api from './axios'

export const getUserProfile = (id) =>
  api.get(`/api/users/${id}/`)

export const updateUserProfile = (id, data) =>
  api.put(`/api/users/${id}/`, data)