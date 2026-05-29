import api from './axios'

export const getTopics = (search = '') =>
  api.get(`/api/topics/?q=${search}`)