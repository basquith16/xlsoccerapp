import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../hooks/useNavigation';
import Button from '../ui/Button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { isAuthenticated, user, logout } = useAuth();
  const { navigationItems } = useNavigation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setOpenDropdown(null); // Close any open dropdowns when toggling mobile menu
  };

  const handleDropdownToggle = (itemId: string) => {
    setOpenDropdown(openDropdown === itemId ? null : itemId);
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

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
            
            {/* Dynamic navigation from page builder */}
            {navigationItems.map((item) => (
              <div key={item.id} className="relative">
                {item.children && item.children.length > 0 ? (
                  // Dropdown menu for items with children
                  <div className="group">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDropdownToggle(item.id);
                      }}
                      className="flex items-center text-white hover:text-blue-200 transition-colors text-sm focus:outline-none focus:text-blue-200"
                      aria-expanded={openDropdown === item.id}
                    >
                      {item.title}
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </button>
                    
                    {openDropdown === item.id && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                        <div className="py-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.id}
                              to={child.url}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              onClick={closeDropdown}
                            >
                              {child.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Simple link for items without children
                  <Link
                    to={item.url}
                    className="text-white hover:text-blue-200 transition-colors text-sm focus:outline-none focus:text-blue-200"
                  >
                    {item.title}
                  </Link>
                )}
              </div>
            ))}
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
              
              {/* Dynamic navigation from page builder */}
              {navigationItems.map((item) => (
                <div key={item.id}>
                  <Link
                    to={item.url}
                    className="text-white hover:text-blue-200 transition-colors text-sm focus:outline-none focus:text-blue-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                  
                  {/* Show children in mobile as indented links */}
                  {item.children && item.children.length > 0 && (
                    <div className="ml-4 mt-2 space-y-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          to={child.url}
                          className="block text-blue-200 hover:text-white transition-colors text-sm focus:outline-none focus:text-white"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
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