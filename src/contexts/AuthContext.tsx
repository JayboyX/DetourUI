// src/contexts/AuthContext.tsx - COMPLETE UPDATED VERSION
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

// Types
export type User = {
  id: string;
  full_name: string;
  email: string;
  email_verified: boolean;
  created_at: string;
  phone_number?: string;
  profile_photo_url?: string;
};

export type SignUpData = {
  full_name: string;
  email: string;
  password: string;
  terms_agreed: boolean;
  phone_number?: string;
};

export type SignInData = {
  email: string;
  password: string;
};

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string; data?: any }>;
  signIn: (data: SignInData) => Promise<{ success: boolean; error?: string; data?: any }>;
  signOut: () => Promise<void>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message?: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; message?: string }>;
  checkVerification: (email: string) => Promise<{ success: boolean; email_verified?: boolean; message?: string }>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Password validation function
export const validatePassword = (password: string): { isValid: boolean; requirements: string[] } => {
  const requirements = [];
  const errors = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
    requirements.push('❌ At least 6 characters');
  } else {
    requirements.push('✅ At least 6 characters');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
    requirements.push('❌ Contains at least one number');
  } else {
    requirements.push('✅ Contains at least one number');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
    requirements.push('❌ Contains at least one uppercase letter');
  } else {
    requirements.push('✅ Contains at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
    requirements.push('❌ Contains at least one lowercase letter');
  } else {
    requirements.push('✅ Contains at least one lowercase letter');
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
    requirements.push('❌ Contains at least one special character (@$!%*?&)');
  } else {
    requirements.push('✅ Contains at least one special character (@$!%*?&)');
  }
  
  return {
    isValid: errors.length === 0,
    requirements,
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Check for stored token on app start
  useEffect(() => {
    checkStoredToken();
  }, []);

  const checkStoredToken = async () => {
    try {
      setIsLoading(true);
      const storedToken = await AsyncStorage.getItem('access_token');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error checking stored token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      setIsLoading(true);
      
      // Call FastAPI signup endpoint
      const response = await authAPI.signup({
        full_name: data.full_name,
        email: data.email.toLowerCase(),
        password: data.password,
        terms_agreed: data.terms_agreed,
        phone_number: data.phone_number,
      });

      if (response.data.success) {
        return { 
          success: true, 
          data: response.data.data,
          message: response.data.message
        };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'Failed to create account'
        };
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      let errorMessage = 'Failed to create account';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (data: SignInData) => {
    try {
      setIsLoading(true);
      
      const response = await authAPI.login({
        email: data.email.toLowerCase(),
        password: data.password,
      });

      if (response.data.success) {
        const { access_token, user: userData } = response.data.data;
        
        // Store token and user data
        await AsyncStorage.setItem('access_token', access_token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        setToken(access_token);
        setUser(userData);
        
        return { 
          success: true, 
          data: { token: access_token, user: userData },
          message: response.data.message
        };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'Login failed'
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.verifyEmail(token);
      
      if (response.data.success) {
        return { 
          success: true, 
          message: response.data.message,
          data: response.data.data
        };
      } else {
        return { 
          success: false, 
          message: response.data.message
        };
      }
    } catch (error: any) {
      console.error('Verify email error:', error);
      let errorMessage = 'Failed to verify email';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return { 
        success: false, 
        message: errorMessage 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (email: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.resendVerification(email);
      
      if (response.data.success) {
        return { 
          success: true, 
          message: response.data.message
        };
      } else {
        return { 
          success: false, 
          message: response.data.message
        };
      }
    } catch (error: any) {
      console.error('Resend verification error:', error);
      let errorMessage = 'Failed to resend verification email';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return { 
        success: false, 
        message: errorMessage 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const checkVerification = async (email: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.checkVerification(email);
      
      if (response.data.success) {
        return { 
          success: true, 
          email_verified: response.data.data?.email_verified,
          message: response.data.message
        };
      } else {
        return { 
          success: false, 
          message: response.data.message
        };
      }
    } catch (error: any) {
      console.error('Check verification error:', error);
      let errorMessage = 'Failed to check verification status';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return { 
        success: false, 
        message: errorMessage 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      // TODO: Implement update profile endpoint in FastAPI
      console.log('Update profile data:', data);
      
      // For now, just update local state
      const updatedUser = { ...user, ...data };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to update profile' 
      };
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    token,
    signUp,
    signIn,
    signOut,
    verifyEmail,
    resendVerification,
    checkVerification,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}