import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../../utils/helpers'
import { FiUsers, FiShield, FiPackage, FiShoppingBag, FiDollarSign, FiAlertCircle } from 'react-icons/fi'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getDashboard()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
      <div className="skeleton h-72 rounded-2xl" />
    </div>
  )

  const { stats, monthly_revenue, top_vendors, recent_orders } = data || {}

  const statCards = [
    { label: 'Total Revenue',    value: formatCurrency(stats?.total_revenue || 0), icon: FiDollarSign, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    { label: 'Total Orders',     value: stats?.total_orders || 0, icon: FiShoppingBag, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Total Users',      value: stats?.total_users || 0, icon: FiUsers, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Total Vendors',    value: stats?.total_vendors || 0, icon: FiShield, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Admin Dashboard</h1>

      {/* Pending Alerts */}
      {(stats?.pending_vendors > 0 || stats?.pending_products > 0) && (
        <div className="card p-4 border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 flex items-center gap-3">
          <FiAlertCircle className="text-yellow-500 text-xl flex-shrink-0" />
          <div className="text-sm">
            {stats?.pending_vendors > 0 && <p className="text-yellow-800 dark:text-yellow-300"><strong>{stats.pending_vendors}</strong> vendors awaiting approval</p>}
            {stats?.pending_products > 0 && <p className="text-yellow-800 dark:text-yellow-300"><strong>{stats.pending_products}</strong> products awaiting approval</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-4`}>
              <Icon className="text-xl" />
            </div>
            <p className="font-display font-bold text-2xl text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.total_products || 0}</p>
          <p className="text-sm text-gray-500">Total Products</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-yellow-500">{stats?.pending_vendors || 0}</p>
          <p className="text-sm text-gray-500">Pending Vendors</p>
        </div>
      </div>

      {/* Revenue Chart */}
      {monthly_revenue?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-display font-semibold text-gray-900 dark:text-white mb-5">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthly_revenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#dc2626" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [formatCurrency(v), 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#dc2626" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Vendors */}
        {top_vendors?.length > 0 && (
          <div className="card p-6">
            <h2 className="font-display font-semibold text-gray-900 dark:text-white mb-4">Top Vendors</h2>
            <div className="space-y-3">
              {top_vendors.map((v, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-sm font-bold text-gray-400">{i + 1}</span>
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{v.shop_name}</p>
                      <p className="text-xs text-gray-400">⭐ {v.rating?.toFixed(1)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-gray-900 dark:text-white">{formatCurrency(v.total_sales)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Orders */}
        {recent_orders?.length > 0 && (
          <div className="card p-6">
            <h2 className="font-display font-semibold text-gray-900 dark:text-white mb-4">Recent Orders</h2>
            <div className="space-y-3">
              {recent_orders.slice(0, 6).map(order => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.order_number}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCurrency(order.total)}</p>
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
