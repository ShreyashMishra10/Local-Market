import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { productService } from '../../services/productService'
import api from '../../services/api'
import { FiArrowLeft, FiSave, FiImage, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function AddProduct() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [saving, setSaving]         = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', category_id: '', price: '',
    original_price: '', stock: '', sku: '', tags: '', images: [],
    specifications: [],
  })
  const [imageUrls, setImageUrls] = useState([''])

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {})
  }, [])

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.price || !form.stock || !form.category_id) {
      toast.error('Please fill all required fields')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        price:          parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : undefined,
        stock:          parseInt(form.stock),
        tags:           form.tags.split(',').map(t => t.trim()).filter(Boolean),
        images:         imageUrls.filter(Boolean),
      }
      await productService.createProduct(payload)
      toast.success('Product added! Pending admin approval.')
      navigate('/vendor/products')
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).flat().forEach(m => toast.error(m))
      else toast.error('Failed to add product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
          <FiArrowLeft />
        </button>
        <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Product Title *</label>
            <input type="text" value={form.title} onChange={update('title')} placeholder="Enter product name" className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description *</label>
            <textarea value={form.description} onChange={update('description')} placeholder="Describe your product..." rows={4} className="input-field resize-none" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category *</label>
              <select value={form.category_id} onChange={update('category_id')} className="input-field" required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">SKU</label>
              <input type="text" value={form.sku} onChange={update('sku')} placeholder="SKU-001" className="input-field" />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Pricing & Stock</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Selling Price (₹) *</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={update('price')} placeholder="299" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Original Price (₹)</label>
              <input type="number" min="0" step="0.01" value={form.original_price} onChange={update('original_price')} placeholder="399" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Stock Quantity *</label>
              <input type="number" min="0" value={form.stock} onChange={update('stock')} placeholder="50" className="input-field" required />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FiImage className="text-primary-600" /> Product Images
          </h2>
          <p className="text-sm text-gray-500">Add image URLs (Cloudinary recommended)</p>
          <div className="space-y-2">
            {imageUrls.map((url, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={e => {
                    const updated = [...imageUrls]
                    updated[i] = e.target.value
                    setImageUrls(updated)
                  }}
                  placeholder="https://res.cloudinary.com/..."
                  className="input-field flex-1"
                />
                {imageUrls.length > 1 && (
                  <button type="button" onClick={() => setImageUrls(imageUrls.filter((_, j) => j !== i))} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl">
                    <FiX />
                  </button>
                )}
              </div>
            ))}
            {imageUrls.length < 5 && (
              <button type="button" onClick={() => setImageUrls([...imageUrls, ''])} className="btn-outline text-sm py-2 w-full">
                + Add Image URL
              </button>
            )}
          </div>
          {imageUrls.filter(Boolean).length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {imageUrls.filter(Boolean).map((url, i) => (
                <img key={i} src={url} alt="" className="w-16 h-16 rounded-xl object-cover" onError={e => e.target.style.display = 'none'} />
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Tags</h2>
          <input type="text" value={form.tags} onChange={update('tags')} placeholder="organic, fresh, local (comma-separated)" className="input-field" />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-outline flex-1">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <FiSave /> {saving ? 'Saving...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  )
}
