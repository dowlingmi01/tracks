import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, Users } from 'lucide-react'; // Added Users icon

function NavHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isSuperAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log('NavHeader Auth State:', {
      user,
      isSuperAdmin: isSuperAdmin?.(),
      role: user?.role
    });
  }, [user, isSuperAdmin]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Updated navigation links to include Users management
  const navLinks = [
    { name: 'Home', path: '/' },
    ...(user 
      ? [
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Settings', path: '/settings' },
          // Add Users link for SUPERADMIN and ADMIN roles
          ...(user.role === 'SUPERADMIN' || user.role === 'ADMIN' 
            ? [{ 
                name: 'Users', 
                path: '/users',
                icon: Users // Added icon for Users section
              }] 
            : []
          ),
          // Keep existing Manage Companies link for superadmin
          ...(isSuperAdmin() ? [{ name: 'Manage Companies', path: '/admin/companies' }] : [])
        ]
      : [
          { name: 'Login', path: '/login' },
          { name: 'Register', path: '/register' }
        ]
    )
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">Tracks</span>
            </Link>
          </div>

          {/* Debug info - remove in production */}
          {user && (
            <div className="hidden md:flex items-center text-xs text-gray-500 mr-4">
              Role: {user.role} | Super: {isSuperAdmin() ? 'Yes' : 'No'}
            </div>
          )}

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium inline-flex items-center ${
                  location.pathname === link.path
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                {link.icon && <link.icon className="h-4 w-4 mr-2" />}
                {link.name}
              </Link>
            ))}
            {user && (
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
              >
                Logout ({user.firstName})
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2 rounded-md text-base font-medium inline-flex items-center ${
                  location.pathname === link.path
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.icon && <link.icon className="h-4 w-4 mr-2" />}
                {link.name}
              </Link>
            ))}
            {user && (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
              >
                Logout ({user.firstName})
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default NavHeader;