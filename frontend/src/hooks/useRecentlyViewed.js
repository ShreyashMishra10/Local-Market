import { useState, useEffect } from 'react'

const KEY   = 'lm_recently_viewed'
const LIMIT = 10

export function useRecentlyViewed() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]') }
    catch { return [] }
  })

  const addProduct = (product) => {
    setItems(prev => {
      const filtered = prev.filter(p => p._id !== product._id)
      const next = [{ _id: product._id, title: product.title, price: product.price, images: product.images, rating: product.rating, vendor: product.vendor }, ...filtered].slice(0, LIMIT)
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }

  return { items, addProduct }
}
