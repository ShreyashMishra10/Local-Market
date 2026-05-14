import api from './api'

export const productService = {
  getProducts:  (params) => api.get('/products', { params }),
  getProduct:   (id)     => api.get(`/products/${id}`),
  getFeatured:  ()       => api.get('/products/featured'),
  getTrending:  ()       => api.get('/products/trending'),
  getReviews:   (id, params) => api.get(`/products/${id}/reviews`, { params }),

  // Vendor
  getVendorProducts: (params) => api.get('/vendor/products', { params }),
  createProduct:     (data)   => api.post('/vendor/products', data),
  updateProduct:     (id, data) => api.put(`/vendor/products/${id}`, data),
  deleteProduct:     (id)     => api.delete(`/vendor/products/${id}`),
  updateStock:       (id, data) => api.patch(`/vendor/products/${id}/stock`, data),
}
