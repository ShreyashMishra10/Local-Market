import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { vendorService } from '../../services/vendorService'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../../utils/helpers'
import { FiPackage, FiShoppingBag, FiDollarSign, FiStar, FiTrendingUp, FiArrowRight, FiPlus } from 'react-icons/fi'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function VendorDashboard() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    vendorService.getAnalytics()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="skeleton h-72 rounded-2xl" />
      </div>
    )
  }

  const { overview, monthly_sales, best_sellers, recent_orders } = data || {}

  const statCards = [
    { label: 'Total Revenue',    value: formatCurrency(overview?.total_revenue || 0), icon: FiDollarSign, color: 'bg-green-50 text-green-600 dark:bg-green-900/20' },
    { label: 'Total Orders',     value: overview?.total_orders || 0, icon: FiShoppingBag, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' },
    { label: 'Active Products',  value: overview?.active_products || 0, icon: FiPackage, color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20' },
    { label: 'Pending Orders',   value: overview?.pending_orders || 0, icon: FiTrendingUp, color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Vendor Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back! Here's your store overview.</p>
        </div>
        <Link to="/vendor/products/add" className="btn-primary flex items-center gap-2">
          <FiPlus /> Add Product
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-4`}>
              <Icon className="text-xl" />
            </div>
            <p className="text-2xl font-display font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Rating card */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-14 h-14 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500 rounded-xl flex items-center justify-center">
          <FiStar className="text-2xl fill-current" />
        </div>
        <div>
          <p className="text-3xl font-display font-bold text-gray-900 dark:text-white">{overview?.rating?.toFixed(1)}</p>
          <p className="text-sm text-gray-500">Average Rating • {overview?.total_reviews} reviews</p>
        </div>
      </div>

      {/* Monthly Sales Chart */}
      {monthly_sales?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-display font-semibold text-gray-900 dark:text-white mb-5">Monthly Sales (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthly_sales}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#dc2626" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={v => [formatCurrency(v), 'Sales']} />
              <Area type="monotone" dataKey="sales" stroke="#dc2626" fill="url(#salesGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Sellers */}
        {best_sellers?.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-gray-900 dark:text-white">Best Sellers</h2>
              <Link to="/vendor/products" className="text-primary-600 text-sm flex items-center gap-1">View all <FiArrowRight className="text-xs" /></Link>
            </div>
            <div className="space-y-3">
              {best_sellers.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3">
                  <span className="w-6 text-sm font-bold text-gray-400">{i + 1}</span>
                  <img src={p.images?.[0] || `https://picsum.photos/seed/${p._id}/40/40`} className="w-10 h-10 rounded-xl object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-gray-900 dark:text-white">{p.title}</p>
                    <p className="text-xs text-gray-400">{p.total_sold} sold</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(p.price)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Orders */}
        {recent_orders?.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
              <Link to="/vendor/orders" className="text-primary-600 text-sm flex items-center gap-1">View all <FiArrowRight className="text-xs" /></Link>
            </div>
            <div className="space-y-3">
              {recent_orders.map(order => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.order_number}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(order.total)}</p>
                    <span className={`badge ${getStatusColor(order.status)} text-xs`}>{getStatusLabel(order.status)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
