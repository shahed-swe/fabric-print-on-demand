import React from 'react';
import NavBar from './NavBar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};

export default Layout;
