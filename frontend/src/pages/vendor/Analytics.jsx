import { useEffect, useState } from 'react'
import { vendorService } from '../../services/vendorService'
import { formatCurrency } from '../../utils/helpers'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { FiTrendingUp, FiDollarSign, FiPackage, FiShoppingBag } from 'react-icons/fi'

export default function VendorAnalytics() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    vendorService.getAnalytics()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="skeleton h-96 rounded-2xl" />

  const { overview, monthly_sales, best_sellers } = data || {}

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Analytics</h1>

      {/* Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue',  value: formatCurrency(overview?.total_revenue || 0), icon: FiDollarSign, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
          { label: 'Total Orders',   value: overview?.total_orders || 0, icon: FiShoppingBag, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Products',       value: overview?.total_products || 0, icon: FiPackage, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Rating',         value: `${overview?.rating?.toFixed(1) || 0} ⭐`, icon: FiTrendingUp, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-3`}><Icon className="text-xl" /></div>
            <p className="font-display font-bold text-xl text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Monthly Sales Chart */}
      {monthly_sales?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-display font-semibold text-gray-900 dark:text-white mb-5">Monthly Sales</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthly_sales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={v => [formatCurrency(v), 'Sales']} />
              <Bar dataKey="sales" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Best Sellers Table */}
      {best_sellers?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-display font-semibold text-gray-900 dark:text-white mb-4">Best Selling Products</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-3 font-semibold">Product</th>
                  <th className="pb-3 font-semibold">Units Sold</th>
                  <th className="pb-3 font-semibold">Price</th>
                  <th className="pb-3 font-semibold">Stock</th>
                  <th className="pb-3 font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {best_sellers.map(p => (
                  <tr key={p._id} className="text-sm">
                    <td className="py-3 flex items-center gap-3">
                      <img src={p.images?.[0] || `https://picsum.photos/seed/${p._id}/40/40`} className="w-10 h-10 rounded-xl object-cover" alt="" />
                      <span className="font-medium text-gray-900 dark:text-white">{p.title}</span>
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{p.total_sold}</td>
                    <td className="py-3 font-semibold text-gray-900 dark:text-white">{formatCurrency(p.price)}</td>
                    <td className="py-3">
                      <span className={`badge text-xs ${p.stock > 10 ? 'badge-green' : p.stock > 0 ? 'badge-yellow' : 'badge-red'}`}>{p.stock}</span>
                    </td>
                    <td className="py-3 font-bold text-gray-900 dark:text-white">{formatCurrency(p.price * p.total_sold)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
