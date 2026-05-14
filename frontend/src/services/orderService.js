import api from './api'

export const orderService = {
  getOrders:    (params) => api.get('/orders', { params }),
  getOrder:     (id)     => api.get(`/orders/${id}`),
  createOrder:  (data)   => api.post('/orders', data),
  cancelOrder:  (id, data) => api.post(`/orders/${id}/cancel`, data),

  // Vendor
  getVendorOrders:  (params) => api.get('/vendor/orders', { params }),
  updateOrderStatus: (id, data) => api.put(`/vendor/orders/${id}/status`, data),
}
