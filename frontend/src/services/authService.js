import api from './api'

export const authService = {
  register:       (data)    => api.post('/auth/register', data),
  login:          (data)    => api.post('/auth/login', data),
  logout:         ()        => api.post('/auth/logout'),
  refresh:        ()        => api.post('/auth/refresh'),
  me:             ()        => api.get('/auth/me'),
  updateProfile:  (data)    => api.put('/auth/profile', data),
  changePassword: (data)    => api.post('/auth/change-password', data),
  forgotPassword: (data)    => api.post('/auth/forgot-password', data),
}
