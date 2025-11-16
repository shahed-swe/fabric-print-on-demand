import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cartService } from '@/services/cart';
import { useAuth } from './AuthContext';

interface CartContextType {
  cartCount: number;
  refreshCart: () => Promise<void>;
  incrementCart: () => void;
  decrementCart: () => void;
  setCartCount: (count: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();

  const refreshCart = async () => {
    if (!user) {
      setCartCount(0);
      return;
    }

    try {
      const response = await cartService.getCartItems(user._id);
      const count = response.items?.length || 0;
      setCartCount(count);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartCount(0);
    }
  };

  const incrementCart = () => {
    setCartCount(prev => prev + 1);
  };

  const decrementCart = () => {
    setCartCount(prev => Math.max(0, prev - 1));
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart, incrementCart, decrementCart, setCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
