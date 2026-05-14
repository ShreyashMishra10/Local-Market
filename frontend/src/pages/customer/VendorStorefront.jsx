import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { vendorService } from '../../services/vendorService'
import ProductCard from '../../components/product/ProductCard'
import { FiStar, FiMapPin, FiPhone, FiPackage } from 'react-icons/fi'

export default function VendorStorefront() {
  const { id } = useParams()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    vendorService.getVendor(id)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="page-container py-8">
      <div className="skeleton h-48 rounded-2xl mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
      </div>
    </div>
  )

  if (!data) return <div className="page-container py-20 text-center text-gray-500">Vendor not found</div>

  const { vendor, products } = data

  return (
    <div>
      {/* Banner */}
      <div className="bg-gradient-hero h-48 md:h-64 relative overflow-hidden">
        {vendor.banner_image && (
          <img src={vendor.banner_image} alt="" className="w-full h-full object-cover opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="page-container">
        {/* Vendor Info Card */}
        <div className="card p-6 -mt-12 relative mb-8 flex flex-col sm:flex-row items-start sm:items-end gap-5">
          <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-800 shadow-lg overflow-hidden flex-shrink-0">
            {vendor.shop_logo
              ? <img src={vendor.shop_logo} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-primary-100 flex items-center justify-center text-primary-600 text-3xl font-bold">{vendor.shop_name?.[0]}</div>
            }
          </div>
          <div className="flex-1">
            <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">{vendor.shop_name}</h1>
            <p className="text-gray-500 text-sm">{vendor.category}</p>
            {vendor.description && <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">{vendor.description}</p>}
            <div className="flex flex-wrap gap-4 mt-3">
              <span className="flex items-center gap-1 text-sm text-gray-500"><FiStar className="text-yellow-400 fill-current" /> {vendor.rating?.toFixed(1)} ({vendor.total_reviews} reviews)</span>
              <span className="flex items-center gap-1 text-sm text-gray-500"><FiMapPin className="text-primary-400 text-xs" /> {vendor.city}</span>
              {vendor.phone && <span className="flex items-center gap-1 text-sm text-gray-500"><FiPhone className="text-xs" /> {vendor.phone}</span>}
            </div>
          </div>
        </div>

        {/* Products */}
        <h2 className="section-title mb-6 flex items-center gap-2">
          <FiPackage className="text-primary-600" /> Products from {vendor.shop_name}
        </h2>

        {products.data?.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No products listed yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-12">
            {(products.data || []).map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
