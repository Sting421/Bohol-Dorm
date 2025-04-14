
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
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoading(true);
        
        if (session?.user) {
          const authenticatedUser: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            role: session.user.user_metadata?.role || 'staff',
          };
          setUser(authenticatedUser);
          localStorage.setItem('dormhub_user', JSON.stringify(authenticatedUser));
        } else {
          setUser(null);
          localStorage.removeItem('dormhub_user');
        }
        
        setIsLoading(false);
      }
    );

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const authenticatedUser: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'staff',
        };
        setUser(authenticatedUser);
        localStorage.setItem('dormhub_user', JSON.stringify(authenticatedUser));
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        toast.error('Google login failed');
        console.error(error);
      }
    } catch (error) {
      toast.error('Login failed');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('dormhub_user');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, logout, isAdmin }}>
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
