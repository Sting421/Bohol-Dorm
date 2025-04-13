
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import supabase from '@/lib/supabase';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user in localStorage
    const storedUser = localStorage.getItem('dormhub_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('Invalid credentials');
        console.error(error);
      } else if (data.user) {
        const authenticatedUser: User = {
          id: data.user.id,
          name: data.user.user_metadata?.name || 'User',
          email: data.user.email,
          role: data.user.user_metadata?.role || 'staff',
        };
        setUser(authenticatedUser);
        localStorage.setItem('dormhub_user', JSON.stringify(authenticatedUser));
        toast.success(`Welcome back, ${authenticatedUser.name}`);
      }
    } catch (error) {
      toast.error('Login failed');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dormhub_user');
    toast.success('Logged out successfully');
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
