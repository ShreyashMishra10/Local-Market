import api from './api'

export const reviewService = {
  getReviews:   (productId, params) => api.get(`/products/${productId}/reviews`, { params }),
  createReview: (data)    => api.post('/reviews', data),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),
  deleteReview: (id)      => api.delete(`/reviews/${id}`),
  markHelpful:  (id)      => api.post(`/reviews/${id}/helpful`),
}
