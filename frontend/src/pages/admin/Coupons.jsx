import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import { formatDate, formatCurrency } from '../../utils/helpers'
import { FiPlus, FiTrash2, FiX, FiSave, FiPercent } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [saving, setSaving]   = useState(false)
  const [form, setForm] = useState({
    code: '', type: 'percentage', value: '', min_order_amount: '',
    max_discount: '', usage_limit: '', expires_at: '', description: '',
  })

  const load = () => {
    setLoading(true)
    adminService.getCoupons()
      .then(r => setCoupons(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await adminService.createCoupon({ ...form, code: form.code.toUpperCase() })
      toast.success('Coupon created!')
      setModal(false)
      setForm({ code: '', type: 'percentage', value: '', min_order_amount: '', max_discount: '', usage_limit: '', expires_at: '', description: '' })
      load()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).flat().forEach(m => toast.error(m))
      else toast.error(err.response?.data?.error || 'Failed to create coupon')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return
    try {
      await adminService.deleteCoupon(id)
      load()
      toast.success('Deleted')
    } catch { toast.error('Failed') }
  }

  const update = (f) => (e) => setForm({...form, [f]: e.target.value})

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white flex items-center gap-2">
          <FiPercent className="text-primary-600" /> Coupons
        </h1>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
          <FiPlus /> Create Coupon
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : coupons.length === 0 ? (
        <div className="card p-12 text-center">
          <FiPercent className="text-5xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No coupons yet. Create your first coupon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map(c => (
            <div key={c._id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-mono font-bold text-lg px-3 py-1 rounded-xl">
                  {c.code}
                </div>
                <button onClick={() => handleDelete(c._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  <FiTrash2 className="text-sm" />
                </button>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}
              </p>
              {c.description && <p className="text-sm text-gray-500 mt-1">{c.description}</p>}
              <div className="flex flex-wrap gap-2 mt-3 text-xs text-gray-400">
                {c.min_order_amount && <span>Min: {formatCurrency(c.min_order_amount)}</span>}
                {c.max_discount && <span>Max: {formatCurrency(c.max_discount)}</span>}
                {c.usage_limit && <span>Limit: {c.used_count}/{c.usage_limit}</span>}
                {c.expires_at && <span>Expires: {formatDate(c.expires_at)}</span>}
              </div>
              <span className={`badge text-xs mt-2 ${c.is_active ? 'badge-green' : 'badge-gray'}`}>
                {c.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-xl my-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">Create Coupon</h2>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><FiX /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Code *</label>
                  <input type="text" value={form.code} onChange={update('code')} placeholder="WELCOME10" className="input-field uppercase" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type *</label>
                  <select value={form.type} onChange={update('type')} className="input-field">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Value *</label>
                  <input type="number" min="0" value={form.value} onChange={update('value')} placeholder={form.type === 'percentage' ? '10' : '50'} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Min Order (₹)</label>
                  <input type="number" min="0" value={form.min_order_amount} onChange={update('min_order_amount')} placeholder="200" className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Max Discount (₹)</label>
                  <input type="number" min="0" value={form.max_discount} onChange={update('max_discount')} placeholder="100" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Usage Limit</label>
                  <input type="number" min="1" value={form.usage_limit} onChange={update('usage_limit')} placeholder="100" className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Expires At</label>
                <input type="date" value={form.expires_at} onChange={update('expires_at')} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea value={form.description} onChange={update('description')} rows={2} className="input-field resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <FiSave /> {saving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
