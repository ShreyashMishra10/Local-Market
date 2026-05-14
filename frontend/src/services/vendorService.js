import api from './api'

export const vendorService = {
  getVendors:     (params) => api.get('/vendors', { params }),
  getVendor:      (id)     => api.get(`/vendors/${id}`),
  getFeatured:    ()       => api.get('/vendors/featured'),
  getNearby:      (params) => api.get('/vendors/nearby', { params }),

  getProfile:     ()       => api.get('/vendor/profile'),
  updateProfile:  (data)   => api.put('/vendor/profile', data),
  getAnalytics:   ()       => api.get('/vendor/analytics'),
}
