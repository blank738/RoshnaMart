import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';

// Layouts & Guards
import { MainLayout } from './layouts/MainLayout';
import { BuyerRoute, SellerRoute, AdminRoute } from './components/RouteGuards';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { ProductsPage } from './pages/public/ProductsPage';
import { ProductDetailPage } from './pages/public/ProductDetailPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterBuyerPage } from './pages/public/RegisterBuyerPage';
import { RegisterSellerPage } from './pages/public/RegisterSellerPage';
import { AboutPage } from './pages/public/AboutPage';

// Buyer Pages
import { BuyerDashboard } from './pages/buyer/BuyerDashboard';
import { CartPage } from './pages/buyer/CartPage';
import { CheckoutPage } from './pages/buyer/CheckoutPage';
import { OrderSuccessPage } from './pages/buyer/OrderSuccessPage';
import { OrdersPage } from './pages/buyer/OrdersPage';
import { OrderDetailPage } from './pages/buyer/OrderDetailPage';
import { WishlistPage } from './pages/buyer/WishlistPage';
import { BuyerProfilePage } from './pages/buyer/BuyerProfilePage';
import { NotificationsPage } from './pages/buyer/NotificationsPage';

// Seller Pages
import { SellerDashboard } from './pages/seller/SellerDashboard';
import { SellerProductsPage } from './pages/seller/SellerProductsPage';
import { SellerProductFormPage } from './pages/seller/SellerProductFormPage';
import { SellerOrdersPage } from './pages/seller/SellerOrdersPage';
import { SellerAnalyticsPage } from './pages/seller/SellerAnalyticsPage';
import { SellerProfilePage } from './pages/seller/SellerProfilePage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminSellersPage } from './pages/admin/AdminSellersPage';
import { AdminBuyersPage } from './pages/admin/AdminBuyersPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';
import { AdminReturnsPage } from './pages/admin/AdminReturnsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <Routes>
              <Route element={<MainLayout />}>
                {/* Public Storefront Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register/buyer" element={<RegisterBuyerPage />} />
                <Route path="/register/seller" element={<RegisterSellerPage />} />
                <Route path="/about" element={<AboutPage />} />

                {/* Buyer Protected Routes */}
                <Route element={<BuyerRoute />}>
                  <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
                  <Route path="/buyer/cart" element={<CartPage />} />
                  <Route path="/buyer/checkout" element={<CheckoutPage />} />
                  <Route path="/buyer/order-success/:id" element={<OrderSuccessPage />} />
                  <Route path="/buyer/orders" element={<OrdersPage />} />
                  <Route path="/buyer/orders/:id" element={<OrderDetailPage />} />
                  <Route path="/buyer/wishlist" element={<WishlistPage />} />
                  <Route path="/buyer/profile" element={<BuyerProfilePage />} />
                  <Route path="/buyer/notifications" element={<NotificationsPage />} />
                </Route>

                {/* Seller Protected Routes */}
                <Route element={<SellerRoute />}>
                  <Route path="/seller/dashboard" element={<SellerDashboard />} />
                  <Route path="/seller/products" element={<SellerProductsPage />} />
                  <Route path="/seller/products/new" element={<SellerProductFormPage />} />
                  <Route path="/seller/products/:id/edit" element={<SellerProductFormPage />} />
                  <Route path="/seller/orders" element={<SellerOrdersPage />} />
                  <Route path="/seller/analytics" element={<SellerAnalyticsPage />} />
                  <Route path="/seller/profile" element={<SellerProfilePage />} />
                </Route>

                {/* Admin Protected Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/sellers" element={<AdminSellersPage />} />
                  <Route path="/admin/buyers" element={<AdminBuyersPage />} />
                  <Route path="/admin/products" element={<AdminProductsPage />} />
                  <Route path="/admin/orders" element={<AdminOrdersPage />} />
                  <Route path="/admin/coupons" element={<AdminCouponsPage />} />
                  <Route path="/admin/returns" element={<AdminReturnsPage />} />
                  <Route path="/admin/settings" element={<AdminSettingsPage />} />
                  <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
