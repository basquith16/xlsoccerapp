import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-[#010768] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center" aria-label="SOFIVE Soccer Center Home">
            <img 
              src="/logo.png" 
              alt="SOFIVE Lake Nona" 
              className="h-16 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" aria-label="Main navigation">
            <Link 
              to="/" 
              className="text-white hover:text-blue-200 transition-colors text-sm focus:outline-none focus:text-blue-200"
            >
              Home
            </Link>
            <Link 
              to="/sessions" 
              className="text-white hover:text-blue-200 transition-colors text-sm focus:outline-none focus:text-blue-200"
            >
              Sessions
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  to="/account" 
                  className="text-white hover:text-blue-200 transition-colors text-sm focus:outline-none focus:text-blue-200"
                >
                  My Account
                </Link>
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="text-white hover:text-blue-200 transition-colors text-sm focus:outline-none focus:text-blue-200 px-3 py-1 rounded-md"
                  >
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  <span className="text-white font-medium">
                    Welcome, {user?.name || 'User'}
                  </span>
                  <Button 
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1 border-white text-white hover:bg-white hover:text-slate-900 text-xs"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    <span>Logout</span>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-slate-900 text-xs">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700 text-xs">Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white hover:text-blue-200 transition-colors focus:outline-none focus:text-blue-200"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-700" role="navigation" aria-label="Mobile navigation">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-white hover:text-blue-200 transition-colors text-sm focus:outline-none focus:text-blue-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/sessions" 
                className="text-white hover:text-blue-200 transition-colors text-sm focus:outline-none focus:text-blue-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Sessions
              </Link>
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/account" 
                    className="text-white hover:text-blue-200 transition-colors text-sm focus:outline-none focus:text-blue-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Account
                  </Link>
                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white font-medium">
                        Welcome, {user?.name || 'User'}
                      </span>
                      <User className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    </div>
                    <Button 
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center justify-center space-x-2 border-white text-white hover:bg-white hover:text-slate-900 text-xs"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      <span>Logout</span>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t border-slate-700">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full border-white text-white hover:bg-white hover:text-slate-900 text-xs">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button size="sm" className="w-full bg-blue-600 text-white hover:bg-blue-700 text-xs">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 