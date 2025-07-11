
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './HomePage';
import ServicePage from './ServicePage';
import BookingPage from './BookingPage';
import PaymentPage from './PaymentPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import Chatbot from './components/Chatbot';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ServiceProvider } from './context/ServiceContext';
import ProfilePage from './pages/ProfilePage';
import { ThemeProvider } from './context/ThemeContext';
import BottomNavBar from './components/BottomNavBar';
import AllServicesPage from './pages/AllServicesPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ServiceCenterFinderPage from './pages/ServiceCenterFinderPage';

// Admin components
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminRoute from './components/AdminRoute';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminPromoBannerPage from './pages/admin/AdminPromoBannerPage';

const { BrowserRouter, Routes, Route } = ReactRouterDOM as any;

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ServiceProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
              <Header />
              <main className="flex-grow container mx-auto max-w-7xl px-4 py-8 mb-20 md:mb-0">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/service/:serviceId" element={<ServicePage />} />
                  <Route path="/services" element={<AllServicesPage />} />
                  <Route path="/search" element={<SearchResultsPage />} />
                  <Route path="/centers" element={<ServiceCenterFinderPage />} />
                  
                  {/* User Protected Routes */}
                  <Route 
                    path="/booking/:serviceId" 
                    element={
                      <ProtectedRoute>
                        <BookingPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/payment" 
                    element={
                      <ProtectedRoute>
                        <PaymentPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } 
                  />


                  {/* Admin Protected Routes */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminLayout />
                      </AdminRoute>
                    }
                  >
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="services" element={<AdminServicesPage />} />
                    <Route path="promo-banner" element={<AdminPromoBannerPage />} />
                    <Route path="bookings" element={<AdminBookingsPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                  </Route>

                </Routes>
              </main>
              <Footer />
              <Chatbot />
              <BottomNavBar />
            </div>
          </BrowserRouter>
        </ServiceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;