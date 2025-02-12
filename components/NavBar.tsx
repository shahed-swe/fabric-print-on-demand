import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaShoppingCart, FaSearch, FaUser } from 'react-icons/fa';

const NavBar = () => {
  const [cartItems, setCartItems] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsAuthenticated(true);
      setUserName(JSON.parse(user).name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserName('');
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

        {/* Search Bar */}
        {/* <div className="flex-grow mx-4 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:border-orange-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div> */}

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <span className="text-gray-600">Welcome, {userName}</span>
              <button
                onClick={handleLogout}
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