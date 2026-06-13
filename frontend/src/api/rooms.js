import api from './axios'

export const getRooms = (search = '', topic = '') =>
  api.get(`/api/rooms/?q=${search}&topic=${topic}`)

export const getRoom = (id) =>
  api.get(`/api/rooms/${id}/`)

export const createRoom = (data) =>
  api.post('/api/rooms/', data)

export const updateRoom = (id, data) =>
  api.put(`/api/rooms/${id}/`, data)

export const deleteRoom = (id) =>
  api.delete(`/api/rooms/${id}/`)

export const postMessage = (roomId, body) =>
  api.post(`/api/rooms/${roomId}/messages/`, { body })

export const deleteMessage = (id) =>
  api.delete(`/api/messages/${id}/`)
