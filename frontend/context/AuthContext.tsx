import React, { createContext, useState, useEffect, useContext } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  type: string;
}

interface GuestUser {
  _id: string;
  type: 'guest';
}

interface AuthContextProps {
  isAuthenticated: boolean;
  user: User | GuestUser | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  totalPrice: number;
  setTotalPrice: (price: number) => void;
  createGuestSession: () => void;
  isGuest: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | GuestUser | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const guestId = localStorage.getItem('guestId');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
      setIsGuest(false);
    } else if (guestId) {
      setIsGuest(true);
      setUser({ _id: guestId, type: 'guest' } as GuestUser);
    }
    
    setIsLoading(false);
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.removeItem('guestId');
    setIsAuthenticated(true);
    setUser(user);
  };

  const createGuestSession = () => {
    const guestId = `guest_${Date.now()}`;
    localStorage.setItem('guestId', guestId);
    setIsGuest(true);
    setUser({ _id: guestId, type: 'guest' } as GuestUser);
  };

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
    createGuestSession();
  };

  const value = React.useMemo(
    () => ({ 
      isAuthenticated, 
      user, 
      login, 
      logout, 
      totalPrice, 
      setTotalPrice, 
      createGuestSession,
      isGuest,
      isLoading
    }), 
    [isAuthenticated, user, totalPrice, isGuest, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
