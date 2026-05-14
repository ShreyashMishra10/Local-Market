import api from './api'

export const adminService = {
  getDashboard:     ()       => api.get('/admin/dashboard'),
  getSalesReport:   (params) => api.get('/admin/reports/sales', { params }),

  // Users
  getUsers:         (params) => api.get('/admin/users', { params }),
  banUser:          (id)     => api.put(`/admin/users/${id}/ban`),
  deleteUser:       (id)     => api.delete(`/admin/users/${id}`),

  // Vendors
  getVendors:       (params) => api.get('/admin/vendors', { params }),
  approveVendor:    (id)     => api.put(`/admin/vendors/${id}/approve`),
  rejectVendor:     (id)     => api.put(`/admin/vendors/${id}/reject`),

  // Products
  getProducts:      (params) => api.get('/admin/products', { params }),
  approveProduct:   (id)     => api.put(`/admin/products/${id}/approve`),
  rejectProduct:    (id)     => api.put(`/admin/products/${id}/reject`),
  featureProduct:   (id)     => api.put(`/admin/products/${id}/feature`),

  // Orders
  getOrders:        (params) => api.get('/admin/orders', { params }),

  // Categories
  getCategories:    ()       => api.get('/categories'),
  createCategory:   (data)   => api.post('/admin/categories', data),
  updateCategory:   (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory:   (id)     => api.delete(`/admin/categories/${id}`),

  // Coupons
  getCoupons:       ()       => api.get('/admin/coupons'),
  createCoupon:     (data)   => api.post('/admin/coupons', data),
  updateCoupon:     (id, data) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon:     (id)     => api.delete(`/admin/coupons/${id}`),
}
