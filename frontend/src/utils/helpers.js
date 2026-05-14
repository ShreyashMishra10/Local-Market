export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(date))
}

export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date))
}

export const truncate = (str, n = 50) =>
  str?.length > n ? str.slice(0, n) + '...' : str

export const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

export const getStatusColor = (status) => {
  const map = {
    pending:   'badge-yellow',
    confirmed: 'badge-blue',
    shipped:   'badge-blue',
    delivered: 'badge-green',
    cancelled: 'badge-red',
    refunded:  'badge-gray',
  }
  return map[status] || 'badge-gray'
}

export const getStatusLabel = (status) => {
  const map = {
    pending:   'Pending',
    confirmed: 'Confirmed',
    shipped:   'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded:  'Refunded',
  }
  return map[status] || status
}

export const slugify = (text) =>
  text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')

export const calculateDiscount = (original, current) =>
  original > current ? Math.round(((original - current) / original) * 100) : 0

export const generateOrderNumber = () =>
  'ORD-' + Date.now().toString(36).toUpperCase()

export const debounce = (fn, delay = 300) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export const classNames = (...classes) => classes.filter(Boolean).join(' ')
