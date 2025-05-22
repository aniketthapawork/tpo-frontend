import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, registerUser, getMe, LoginData, SignupData } from '@/api/authService';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  rollno: string;
  role: 'student' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const userData = await getMe();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (data: LoginData) => {
    try {
      setIsLoading(true);
      const response = await loginUser(data);
      localStorage.setItem('authToken', response.token);
      setToken(response.token);
      setUser(response.user);
      toast({ title: "Login Successful", description: `Welcome back, ${response.user.name}!` });
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials.";
      toast({ title: "Login Error", description: errorMessage, variant: "destructive" });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupData) => {
    try {
      setIsLoading(true);
      const response = await registerUser(data);
      localStorage.setItem('authToken', response.token);
      setToken(response.token);
      setUser(response.user);
      toast({ title: "Signup Successful", description: `Welcome, ${response.user.name}!` });
    } catch (error: any) {
      console.error('Signup failed:', error);
      const errorMessage = error.response?.data?.message || "Signup failed. Please try again.";
      toast({ title: "Signup Error", description: errorMessage, variant: "destructive" });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated: !!user, login, signup, logout, setUser }}>
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
