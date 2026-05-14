import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Suspense, lazy } from 'react'

// Layout
import MainLayout from './components/common/MainLayout'
import DashboardLayout from './components/common/DashboardLayout'
import AdminLayout from './components/common/AdminLayout'
import PageLoader from './components/common/PageLoader'

// Public Pages
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import Products from './pages/customer/Products'
import ProductDetail from './pages/customer/ProductDetail'
import VendorStorefront from './pages/customer/VendorStorefront'
import Vendors from './pages/customer/Vendors'

// Customer Pages (lazy)
const Cart      = lazy(() => import('./pages/customer/Cart'))
const Checkout  = lazy(() => import('./pages/customer/Checkout'))
const Orders    = lazy(() => import('./pages/customer/Orders'))
const OrderDetail = lazy(() => import('./pages/customer/OrderDetail'))
const Wishlist  = lazy(() => import('./pages/customer/Wishlist'))
const Profile   = lazy(() => import('./pages/customer/Profile'))

// Vendor Pages (lazy)
const VendorDashboard   = lazy(() => import('./pages/vendor/Dashboard'))
const VendorProducts    = lazy(() => import('./pages/vendor/Products'))
const VendorOrders      = lazy(() => import('./pages/vendor/Orders'))
const VendorProfile     = lazy(() => import('./pages/vendor/Profile'))
const VendorAnalytics   = lazy(() => import('./pages/vendor/Analytics'))
const AddProduct        = lazy(() => import('./pages/vendor/AddProduct'))
const EditProduct       = lazy(() => import('./pages/vendor/EditProduct'))

// Admin Pages (lazy)
const AdminDashboard    = lazy(() => import('./pages/admin/Dashboard'))
const AdminUsers        = lazy(() => import('./pages/admin/Users'))
const AdminVendors      = lazy(() => import('./pages/admin/Vendors'))
const AdminProducts     = lazy(() => import('./pages/admin/Products'))
const AdminOrders       = lazy(() => import('./pages/admin/Orders'))
const AdminCategories   = lazy(() => import('./pages/admin/Categories'))
const AdminCoupons      = lazy(() => import('./pages/admin/Coupons'))
const AdminAnalytics    = lazy(() => import('./pages/admin/Analytics'))

// Route Guards
function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function VendorRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'vendor') return <Navigate to="/" replace />
  return children
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function GuestRoute({ children }) {
  const { user } = useAuth()
  return !user ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ─── Public Routes ─── */}
        <Route element={<MainLayout />}>
          <Route path="/"              element={<Home />} />
          <Route path="/products"      element={<Products />} />
          <Route path="/products/:id"  element={<ProductDetail />} />
          <Route path="/vendors"       element={<Vendors />} />
          <Route path="/vendors/:id"   element={<VendorStorefront />} />

          {/* Auth */}
          <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />

          {/* Customer Protected */}
          <Route path="/cart"     element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
          <Route path="/orders"   element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path="/orders/:id" element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
          <Route path="/profile"  element={<PrivateRoute><Profile /></PrivateRoute>} />
        </Route>

        {/* ─── Vendor Dashboard ─── */}
        <Route path="/vendor" element={<VendorRoute><DashboardLayout role="vendor" /></VendorRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"         element={<VendorDashboard />} />
          <Route path="products"          element={<VendorProducts />} />
          <Route path="products/add"      element={<AddProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="orders"            element={<VendorOrders />} />
          <Route path="analytics"         element={<VendorAnalytics />} />
          <Route path="profile"           element={<VendorProfile />} />
        </Route>

        {/* ─── Admin Dashboard ─── */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"  element={<AdminDashboard />} />
          <Route path="users"      element={<AdminUsers />} />
          <Route path="vendors"    element={<AdminVendors />} />
          <Route path="products"   element={<AdminProducts />} />
          <Route path="orders"     element={<AdminOrders />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="coupons"    element={<AdminCoupons />} />
          <Route path="analytics"  element={<AdminAnalytics />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
