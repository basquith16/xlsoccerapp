import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { User, LogOut, Menu, X } from 'lucide-react';

const Header = (): JSX.Element => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async (): Promise<void> => {
    await logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-xl-red text-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/img/logo.webp" 
              alt="XL Soccer World" 
              className="w-[8.7rem] h-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-gray-300 transition-colors">
              Home
            </Link>
            <Link to="/sessions" className="hover:text-gray-300 transition-colors">
              Sessions
            </Link>
            {isAuthenticated && (
              <Link to="/account" className="hover:text-gray-300 transition-colors">
                My Account
              </Link>
            )}
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm">Welcome, {user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 hover:text-gray-300 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="flex items-center space-x-1 hover:text-gray-300 transition-colors"
                >
                  <User size={16} />
                  <span>Login</span>
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-xl-red px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="hover:text-gray-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/sessions" 
                className="hover:text-gray-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sessions
              </Link>
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/account" 
                    className="hover:text-gray-300 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 hover:text-gray-300 transition-colors text-left"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="flex items-center space-x-1 hover:text-gray-300 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={16} />
                    <span>Login</span>
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-white text-xl-red px-4 py-2 rounded-full hover:bg-gray-100 transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 