import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import { formatCurrency } from '../../utils/helpers'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function AdminAnalytics() {
  const [data, setData]     = useState([])
  const [period, setPeriod] = useState('monthly')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    adminService.getSalesReport({ period })
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [period])

  const totalRevenue = data.reduce((s, d) => s + (d.revenue || 0), 0)
  const totalOrders  = data.reduce((s, d) => s + (d.orders || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Analytics & Reports</h1>
        <div className="flex gap-2">
          {['daily', 'monthly'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all
                ${period === p ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="font-display font-bold text-3xl text-gray-900 dark:text-white">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="font-display font-bold text-3xl text-gray-900 dark:text-white">{totalOrders}</p>
        </div>
      </div>

      {loading ? (
        <div className="skeleton h-72 rounded-2xl" />
      ) : (
        <>
          <div className="card p-6">
            <h2 className="font-display font-semibold text-gray-900 dark:text-white mb-5">Revenue Chart</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey={period === 'daily' ? 'date' : 'month'} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => [formatCurrency(v), 'Revenue']} />
                <Bar dataKey="revenue" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <h2 className="font-display font-semibold text-gray-900 dark:text-white mb-5">Orders Trend</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey={period === 'daily' ? 'date' : 'month'} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
