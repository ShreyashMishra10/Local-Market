import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import api from '../../services/api'
import ProductCard from '../../components/product/ProductCard'
import EmptyState from '../../components/common/EmptyState'
import ProductSkeleton from '../../components/product/ProductSkeleton'

export default function Wishlist() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get('/wishlist')
      .then(r => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Helmet><title>My Wishlist — LocalMarket</title></Helmet>
      <div className="page-container py-8">
        <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-6">
          ❤️ My Wishlist <span className="text-gray-400 font-normal text-lg">({products.length})</span>
        </h1>

        {loading ? (
          <ProductSkeleton count={8} />
        ) : products.length === 0 ? (
          <EmptyState
            type="wishlist"
            title="Your wishlist is empty"
            description="Save products you love by tapping the heart icon. They'll appear here for easy access."
            action="/products"
            actionLabel="Discover Products"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </>
  )
}
