import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminProtectedRoute } from '@/components/admin/AdminProtectedRoute';

// Lazy-loaded Customer Pages
const HomePage = lazy(() =>
  import('@/pages/home/HomePage').then((m) => ({ default: m.HomePage }))
);
const ShopPage = lazy(() =>
  import('@/pages/shop/ShopPage').then((m) => ({ default: m.ShopPage }))
);
const CategoriesPage = lazy(() =>
  import('@/pages/shop/CategoriesPage').then((m) => ({ default: m.CategoriesPage }))
);
const ProductDetailsPage = lazy(() =>
  import('@/pages/product/ProductDetailsPage').then((m) => ({ default: m.ProductDetailsPage }))
);
const CartPage = lazy(() =>
  import('@/pages/cart/CartPage').then((m) => ({ default: m.CartPage }))
);
const CheckoutPage = lazy(() =>
  import('@/pages/checkout/CheckoutPage').then((m) => ({ default: m.CheckoutPage }))
);
const OrderSuccessPage = lazy(() =>
  import('@/pages/checkout/OrderSuccessPage').then((m) => ({ default: m.OrderSuccessPage }))
);
const MyOrdersPage = lazy(() =>
  import('@/pages/orders/MyOrdersPage').then((m) => ({ default: m.MyOrdersPage }))
);
const LoginPage = lazy(() =>
  import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const ForgotPasswordPage = lazy(() =>
  import('@/pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
);
const AboutUsPage = lazy(() =>
  import('@/pages/about/AboutUsPage').then((m) => ({ default: m.AboutUsPage }))
);
const ContactUsPage = lazy(() =>
  import('@/pages/contact/ContactUsPage').then((m) => ({ default: m.ContactUsPage }))
);

// Lazy-loaded Admin Pages
const AdminLoginPage = lazy(() =>
  import('@/pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
);
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminProductsPage = lazy(() =>
  import('@/pages/admin/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage }))
);
const AdminProductFormPage = lazy(() =>
  import('@/pages/admin/AdminProductFormPage').then((m) => ({ default: m.AdminProductFormPage }))
);
const AdminCategoriesPage = lazy(() =>
  import('@/pages/admin/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage }))
);
const AdminOrdersPage = lazy(() =>
  import('@/pages/admin/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage }))
);
const AdminOrderDetailsPage = lazy(() =>
  import('@/pages/admin/AdminOrderDetailsPage').then((m) => ({ default: m.AdminOrderDetailsPage }))
);
const AdminCustomersPage = lazy(() =>
  import('@/pages/admin/AdminCustomersPage').then((m) => ({ default: m.AdminCustomersPage }))
);
const AdminInventoryPage = lazy(() =>
  import('@/pages/admin/AdminInventoryPage').then((m) => ({ default: m.AdminInventoryPage }))
);
const AdminSettingsPage = lazy(() =>
  import('@/pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage }))
);

const RouteLoadingFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 p-8">
    <div className="w-8 h-8 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
    <span className="text-xs font-medium text-slate-400">Loading experience...</span>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/* Customer Interface Routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/product/:slug" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success/:id" element={<OrderSuccessPage />} />
          <Route path="/orders" element={<MyOrdersPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Admin Public Authentication Route */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin Protected Dashboard Routes */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/new" element={<AdminProductFormPage />} />
          <Route path="products/edit/:id" element={<AdminProductFormPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:id" element={<AdminOrderDetailsPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="inventory" element={<AdminInventoryPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Fallback 404 Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
