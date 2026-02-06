import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaShoppingCart, FaChevronDown, FaUser, FaClipboardList, FaSignOutAlt } from 'react-icons/fa';
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
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center space-x-3 group">
            {/* Logo Icon */}
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <svg 
                  className="w-6 h-6 text-white" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path d="M12 2L2 7v10c0 5.55 3.84 10 9 9s9-4.65 9-9V7l-8-5z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 11l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            
            {/* Logo Text */}
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                  Custom
                </span>
                <span className="text-xl font-bold text-orange-500 ml-1 group-hover:text-orange-600 transition-colors">
                  Print
                </span>
              </div>
              <span className="text-xs text-gray-500 font-medium tracking-wider uppercase">
                Service
              </span>
            </div>
          </a>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          {/* Country Selector */}
          {/* <div className="relative" ref={countryDropdownRef}>
            <button 
              className="flex items-center space-x-1 text-gray-600 hover:text-orange-500 transition-colors"
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
            >
              <span className="text-xl">{selectedCountry?.flag}</span>
              <FaChevronDown className="text-xs" />
            </button>
            
            {showCountryDropdown && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto z-50">
                {countries.map((country, index) => (
                  <Link href={`/countries/${country.name.toLowerCase().replace(/\s+/g, '-')}`} key={index}>
                    <a
                      className={`flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${
                        selectedCountry?.name === country?.name ? 'bg-orange-50' : ''
                      }`}
                      onClick={() => handleCountrySelect(country)}
                    >
                      <span className="text-xl">{country.flag}</span>
                      <span>{country.name}</span>
                    </a>
                  </Link>
                ))}
              </div>
            )}
          </div> */}

          {/* Products Link */}
          <Link href="/products">
            <a className="text-gray-600 hover:text-orange-500 transition-colors">
              Products
            </a>
          </Link>
          <Link href="/print-on-demand">
                <a className="text-gray-600 hover:text-orange-500 transition-colors">
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
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user && 'name' in user ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <FaChevronDown className="text-xs" />
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
                <a className="text-gray-600 hover:text-orange-500 transition-colors">
                  Register
                </a>
              </Link>
              <Link href="/login">
                <a className="text-gray-600 hover:text-orange-500 transition-colors">
                  Login
                </a>
              </Link>
            </>
          )}
          <Link href="/cart">
            <a className="relative group">
              <FaShoppingCart className="text-2xl text-gray-600 hover:text-orange-500 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </a>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;