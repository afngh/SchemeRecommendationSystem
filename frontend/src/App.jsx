import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';

import Header from './components/Header';
import Footer from './components/Footer';
import FloatingChatbot from './components/FloatingChatbot';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import RecommendPage from './pages/RecommendPage';
import GovDashboardPage from './pages/GovDashboardPage';
import TopRatedPage from './pages/TopRatedPage';
import DeliveryPage from './pages/DeliveryPage';
import DeveloperPage from './pages/DeveloperPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminSchemesPage from './pages/AdminSchemesPage';

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-[#f4f7f4] text-[#064e3b]">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/recommend" element={<RecommendPage />} />
                <Route path="/gov/dashboard" element={<GovDashboardPage />} />
                <Route path="/top-rated" element={<TopRatedPage />} />
                <Route path="/developer" element={<DeveloperPage />} />
                <Route path="/admin/schemes" element={<AdminSchemesPage />} />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>
            <Footer />
            <FloatingChatbot />
          </div>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
