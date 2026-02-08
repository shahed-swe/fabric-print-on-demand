import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaShoppingCart, FaChevronDown, FaUser, FaClipboardList, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import countries from '../utils/countries';
import { cartService } from '@/services/cart';

const NavBar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[13]); // Default to USA
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCountryDropdown(false);
      }
      
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCountrySelect = (country: any) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
  };

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center space-x-2 md:space-x-3 group flex-shrink-0">
              {/* Logo Icon */}
              <div className="relative">
                <div className="w-8 md:w-10 h-8 md:h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <svg 
                    className="w-5 md:w-6 h-5 md:h-6 text-white" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path d="M12 2L2 7v10c0 5.55 3.84 10 9 9s9-4.65 9-9V7l-8-5z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 11l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              
              {/* Logo Text */}
              <div className="hidden sm:flex flex-col">
                <div className="flex items-center">
                  <span className="text-lg md:text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                    Custom
                  </span>
                  <span className="text-lg md:text-xl font-bold text-orange-500 ml-1 group-hover:text-orange-600 transition-colors">
                    Print
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-medium tracking-wider uppercase">
                  Service
                </span>
              </div>
            </a>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {/* Products Link */}
            <Link href="/products">
              <a className="text-gray-600 hover:text-orange-500 transition-colors text-sm lg:text-base">
                Products
              </a>
            </Link>
            <Link href="/print-on-demand">
              <a className="text-gray-600 hover:text-orange-500 transition-colors text-sm lg:text-base">
                Custom Print
              </a>
            </Link>
            {isAuthenticated ? (
              <>
                {/* User Dropdown Menu */}
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-orange-500 transition-colors rounded-lg hover:bg-gray-50"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {user && 'name' in user ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <FaChevronDown className="text-xs hidden lg:block" />
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                      {/* User Info Header */}
                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-white">
                        <p className="font-semibold text-sm">
                          {user && 'name' in user ? user.name : 'User'}
                        </p>
                        <p className="text-xs text-orange-100">
                          {user && 'email' in user ? user.email : ''}
                        </p>
                      </div>

                      {/* Dropdown Items */}
                      <div className="py-2">
                        <Link href="/profile">
                          <a
                            onClick={() => setShowUserDropdown(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors border-b border-gray-100"
                          >
                            <FaUser className="w-4 h-4" />
                            <span>My Profile</span>
                          </a>
                        </Link>

                        <Link href="/orders">
                          <a
                            onClick={() => setShowUserDropdown(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors border-b border-gray-100"
                          >
                            <FaClipboardList className="w-4 h-4" />
                            <span>My Orders</span>
                          </a>
                        </Link>

                        <button
                          onClick={() => {
                            logout();
                            setShowUserDropdown(false);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <FaSignOutAlt className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/register">
                  <a className="text-gray-600 hover:text-orange-500 transition-colors text-sm lg:text-base">
                    Register
                  </a>
                </Link>
                <Link href="/login">
                  <a className="text-gray-600 hover:text-orange-500 transition-colors text-sm lg:text-base">
                    Login
                  </a>
                </Link>
              </>
            )}
            <Link href="/cart">
              <a className="relative group">
                <FaShoppingCart className="text-xl text-gray-600 hover:text-orange-500 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </a>
            </Link>
          </div>

          {/* Mobile Menu Items */}
          <div className="flex md:hidden items-center space-x-3">
            {/* Cart Icon */}
            <Link href="/cart">
              <a className="relative group">
                <FaShoppingCart className="text-xl text-gray-600 hover:text-orange-500 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </a>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-gray-600 hover:text-orange-500 transition-colors p-2"
            >
              {showMobileMenu ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-2">
            <Link href="/products">
              <a 
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                Products
              </a>
            </Link>
            <Link href="/print-on-demand">
              <a 
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                Custom Print
              </a>
            </Link>

            {isAuthenticated ? (
              <>
                <Link href="/profile">
                  <a 
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors border-t border-gray-200 mt-2"
                  >
                    <FaUser className="w-4 h-4" />
                    <span>My Profile</span>
                  </a>
                </Link>

                <Link href="/orders">
                  <a 
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  >
                    <FaClipboardList className="w-4 h-4" />
                    <span>My Orders</span>
                  </a>
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/register">
                  <a 
                    onClick={() => setShowMobileMenu(false)}
                    className="block px-4 py-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors border-t border-gray-200 mt-2"
                  >
                    Register
                  </a>
                </Link>
                <Link href="/login">
                  <a 
                    onClick={() => setShowMobileMenu(false)}
                    className="block px-4 py-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  >
                    Login
                  </a>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;