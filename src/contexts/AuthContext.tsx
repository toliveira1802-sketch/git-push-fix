import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// MOCK AUTH CONTEXT - Para teste sem Supabase
interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for mock session
    const savedUser = localStorage.getItem('mock_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Mock login - aceita qualquer email/senha válidos
    if (email && password.length >= 6) {
      const mockUser = { id: crypto.randomUUID(), email };
      setUser(mockUser);
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      localStorage.setItem('mock_profile', JSON.stringify({ full_name: email.split('@')[0] }));
      return { error: null };
    }
    return { error: new Error('Invalid login credentials') };
  };

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    // Mock signup
    if (email && password.length >= 6 && name) {
      const mockUser = { id: crypto.randomUUID(), email };
      setUser(mockUser);
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      localStorage.setItem('mock_profile', JSON.stringify({ full_name: name, phone }));
      return { error: null };
    }
    return { error: new Error('Invalid signup data') };
  };

  const signInWithGoogle = async () => {
    // Mock Google login
    const mockUser = { id: crypto.randomUUID(), email: 'user@gmail.com' };
    setUser(mockUser);
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    localStorage.setItem('mock_profile', JSON.stringify({ full_name: 'Google User' }));
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('mock_user');
    localStorage.removeItem('mock_profile');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
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
