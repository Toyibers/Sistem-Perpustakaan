/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';

import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Catalog from './pages/user/Catalog';
import BookDetail from './pages/user/BookDetail';
import History from './pages/user/History';
import Dashboard from './pages/admin/Dashboard';
import Books from './pages/admin/Books';
import Users from './pages/admin/Users';
import Borrowings from './pages/admin/Borrowings';
import AdminProfile from './pages/admin/Profile';
import UserProfile from './pages/user/Profile';

// Protected Route Component for Users
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Public / User Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Catalog />} />
        <Route path="books/:id" element={<BookDetail />} />
        <Route path="history" element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="books" element={<Books />} />
        <Route path="users" element={<Users />} />
        <Route path="borrowings" element={<Borrowings />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
