import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { productService } from '../../services/productService'
import api from '../../services/api'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function EditProduct() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', category_id: '', price: '',
    original_price: '', stock: '', sku: '', tags: '', is_active: true,
  })

  useEffect(() => {
    Promise.all([
      productService.getProduct(id),
      api.get('/categories'),
    ]).then(([pr, cr]) => {
      const p = pr.data.product
      setForm({
        title:          p.title || '',
        description:    p.description || '',
        category_id:    p.category_id || '',
        price:          p.price || '',
        original_price: p.original_price || '',
        stock:          p.stock || '',
        sku:            p.sku || '',
        tags:           (p.tags || []).join(', '),
        is_active:      p.is_active ?? true,
      })
      setCategories(cr.data)
    }).catch(() => toast.error('Failed to load product'))
    .finally(() => setLoading(false))
  }, [id])

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        price:   parseFloat(form.price),
        stock:   parseInt(form.stock),
        tags:    form.tags.split(',').map(t => t.trim()).filter(Boolean),
      }
      await productService.updateProduct(id, payload)
      toast.success('Product updated!')
      navigate('/vendor/products')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="skeleton h-96 rounded-2xl" />

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
          <FiArrowLeft />
        </button>
        <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title *</label>
            <input type="text" value={form.title} onChange={update('title')} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={update('description')} rows={4} className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
              <select value={form.category_id} onChange={update('category_id')} className="input-field">
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
              <select value={form.is_active} onChange={e => setForm({...form, is_active: e.target.value === 'true'})} className="input-field">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Price (₹) *</label>
              <input type="number" min="0" value={form.price} onChange={update('price')} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Original (₹)</label>
              <input type="number" min="0" value={form.original_price} onChange={update('original_price')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Stock *</label>
              <input type="number" min="0" value={form.stock} onChange={update('stock')} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags</label>
            <input type="text" value={form.tags} onChange={update('tags')} placeholder="tag1, tag2, tag3" className="input-field" />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-outline flex-1">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
