import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import MainLayout from './layouts/MainLayout'
import CustomerLayout from './layouts/CustomerLayout'
import AdminLayout from './layouts/AdminLayout'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CategoriesPage from './pages/CategoriesPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import NotFoundPage from './pages/NotFoundPage'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import CustomerProfilePage from './pages/customer/CustomerProfilePage'
import CustomerAddressesPage from './pages/customer/CustomerAddressesPage'
import ChangePasswordPage from './pages/customer/ChangePasswordPage'
import CustomerCartPage from './pages/customer/CustomerCartPage'
import CustomerWishlistPage from './pages/customer/CustomerWishlistPage'
import CustomerOrdersPage from './pages/customer/CustomerOrdersPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminVendorsPage from './pages/admin/AdminVendorsPage'
import AdminPendingVendorsPage from './pages/admin/AdminPendingVendorsPage'
import AdminVendorDetailPage from './pages/admin/AdminVendorDetailPage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'
import AdminCustomersPage from './pages/admin/AdminCustomersPage'
import AdminCustomerDetailPage from './pages/admin/AdminCustomerDetailPage'
import AdminProfilePage from './pages/admin/AdminProfilePage'
import AdminChangePasswordPage from './pages/admin/AdminChangePasswordPage'
import VendorLayout from './layouts/VendorLayout'
import VendorDashboard from './pages/vendor/VendorDashboard'
import VendorProductsPage from './pages/vendor/VendorProductsPage'
import VendorNewProductPage from './pages/vendor/VendorNewProductPage'
import VendorEditProductPage from './pages/vendor/VendorEditProductPage'
import VendorInventoryPage from './pages/vendor/VendorInventoryPage'
import VendorProfilePage from './pages/vendor/VendorProfilePage'
import VendorChangePasswordPage from './pages/vendor/VendorChangePasswordPage'
import ProtectedRoute from './routes/ProtectedRoute'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Routes>
            {/* Public Storefront Layout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:productId" element={<ProductDetailPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Protected Customer Portal */}
            <Route
              path="/customer"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}>
                  <CustomerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/customer/dashboard" replace />} />
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="profile" element={<CustomerProfilePage />} />
              <Route path="addresses" element={<CustomerAddressesPage />} />
              <Route path="change-password" element={<ChangePasswordPage />} />
              <Route path="cart" element={<CustomerCartPage />} />
              <Route path="wishlist" element={<CustomerWishlistPage />} />
              <Route path="orders" element={<CustomerOrdersPage />} />
            </Route>

            {/* Protected Admin Management Portal */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="customers/:id" element={<AdminCustomerDetailPage />} />
              <Route path="vendors" element={<AdminVendorsPage />} />
              <Route path="vendors/pending" element={<AdminPendingVendorsPage />} />
              <Route path="vendors/:id" element={<AdminVendorDetailPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="profile" element={<AdminProfilePage />} />
              <Route path="change-password" element={<AdminChangePasswordPage />} />
            </Route>

            {/* Protected Vendor Partner Portal */}
            <Route
              path="/vendor"
              element={
                <ProtectedRoute allowedRoles={['VENDOR']}>
                  <VendorLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/vendor/dashboard" replace />} />
              <Route path="dashboard" element={<VendorDashboard />} />
              <Route path="products" element={<VendorProductsPage />} />
              <Route path="products/new" element={<VendorNewProductPage />} />
              <Route path="products/:id/edit" element={<VendorEditProductPage />} />
              <Route path="inventory" element={<VendorInventoryPage />} />
              <Route path="profile" element={<VendorProfilePage />} />
              <Route path="change-password" element={<VendorChangePasswordPage />} />
            </Route>
          </Routes>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}
