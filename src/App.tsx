import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import KeralaHealthDashboard from './components/KeralaHealthDashboard';
import PatientList from './components/PatientList';
import Alerts from './components/Alerts';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <Layout>
                  <KeralaHealthDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/patients"
            element={
              <ProtectedRoute requiredRole="doctor">
                <Layout>
                  <PatientList />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <Layout>
                  <Alerts />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
                    <p className="text-gray-600">Settings panel coming soon...</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;