import React, { useEffect } from 'react';
import NavBar from './NavBar';
import { useAuth } from '@/context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {

  const { isAuthenticated, isGuest, createGuestSession } = useAuth();

  useEffect(() => {
    const guestId = localStorage.getItem('guestId');
    if (!isAuthenticated && !isGuest && !guestId) {
      createGuestSession();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="pt-16 md:pt-16">
        {children}
      </main>
    </div>
  );
};

export default Layout;
