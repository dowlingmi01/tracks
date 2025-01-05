// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layout/NavHeader';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Companies from './pages/admin/Companies';
import UsersList from './pages/users/UsersList';
import UserForm from './pages/users/UserForm';
import Cohorts from './pages/cohorts/Cohorts';
import CohortPage from './pages/cohorts/CohortPage';
import CreateCohort from './pages/cohorts/CreateCohort';
import EditCohort from './pages/cohorts/EditCohort';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <>
    <Toaster position="top-right" />
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/companies" element={<Companies />} />
              <Route
                path="/users"
                element={
                  <ProtectedRoute roles={['SUPERADMIN', 'ADMIN']}>
                    <UsersList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/new"
                element={
                  <ProtectedRoute roles={['SUPERADMIN', 'ADMIN']}>
                    <UserForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/:id"
                element={
                  <ProtectedRoute roles={['SUPERADMIN', 'ADMIN']}>
                    <UserForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cohorts"
                element={
                  <ProtectedRoute roles={['SUPERADMIN', 'ADMIN']}>
                    <Cohorts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cohorts/new"
                element={
                  <ProtectedRoute roles={['SUPERADMIN', 'ADMIN']}>
                    <CreateCohort />
                  </ProtectedRoute>
                }
              />
              {/* Change "/cohort/:id" to "/cohorts/:id" */}
              <Route
                path="/cohorts/:id"
                element={
                  <ProtectedRoute roles={['SUPERADMIN', 'ADMIN']}>
                    <CohortPage />
                  </ProtectedRoute>
                }
              />
              {/* Change "/cohort/:id/edit" to "/cohorts/:id/edit" */}
              <Route
                path="/cohorts/:id/edit"
                element={
                  <ProtectedRoute roles={['SUPERADMIN', 'ADMIN']}>
                    <EditCohort />
                  </ProtectedRoute>
                }
              />              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
    </>
  );
}

export default App;