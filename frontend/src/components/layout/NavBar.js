// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">
            Your App
          </Link>
          <div className="space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-800 hover:text-gray-600">
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-800 hover:text-gray-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-800 hover:text-gray-600">
                  Login
                </Link>
                <Link to="/register" className="text-gray-800 hover:text-gray-600">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;