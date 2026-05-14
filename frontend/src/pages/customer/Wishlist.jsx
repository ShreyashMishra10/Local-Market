import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import ProductCard from '../../components/product/ProductCard'
import { FiHeart, FiShoppingBag } from 'react-icons/fi'

export default function Wishlist() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get('/wishlist')
      .then(r => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="page-container py-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <div key={i} className="skeleton aspect-[3/4] rounded-2xl" />)}
      </div>
    </div>
  )

  return (
    <div className="page-container py-8">
      <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <FiHeart className="text-red-500" /> My Wishlist ({products.length})
      </h1>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-8xl mb-6">💔</div>
          <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-3">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8">Save items you love for later</p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            <FiShoppingBag /> Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  )
}
