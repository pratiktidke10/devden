import api from './axios'

export const getActivity = () =>
  api.get('/api/activity/')