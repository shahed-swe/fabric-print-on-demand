import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaShoppingCart, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import countries from '../utils/countries';
import { cartService } from '@/services/cart';

const NavBar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [cartItems, setCartItems] = useState(0);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false); // New state for category dropdown
  const [selectedCountry, setSelectedCountry] = useState(countries[13]); // Default to USA
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!user) return;

      try {
        const response = await cartService.getCartItems(user?._id);
        console.log(response)
        setCartItems(response.length);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCartItems();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCountryDropdown(false);
      }
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
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
          <a className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="text-orange-500">Fabric</span>
            <span className="text-gray-700">Print</span>
          </a>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          {/* Country Selector */}
          <div className="relative" ref={countryDropdownRef}>
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
          </div>

          {/* Category Selector */}
          <div className="relative" ref={categoryDropdownRef}>
            <button
              className="flex items-center space-x-1 text-gray-600 hover:text-orange-500 transition-colors"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <span>Categories</span>
              <FaChevronDown className="text-xs" />
            </button>

            {showCategoryDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <Link href="/categories/islamic">
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Islamic
                  </a>
                </Link>
                <Link href="/categories/sports">
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Sports
                  </a>
                </Link>
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <>
              {user && 'name' in user && (
                <span className="text-gray-600">Welcome, {user.name}</span>
              )}
              <Link href="/orders">
                <a className="text-gray-600 hover:text-orange-500 transition-colors">
                  Orders
                </a>
              </Link>
              <Link href="/print-on-demand">
                <a className="text-gray-600 hover:text-orange-500 transition-colors">
                  Custom Print
                </a>
              </Link>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-orange-500 transition-colors"
              >
                Logout
              </button>
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
              {cartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems}
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