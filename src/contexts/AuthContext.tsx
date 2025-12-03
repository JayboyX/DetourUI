// src/contexts/AuthContext.tsx - WITH DATABASE VALIDATION
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';
import { supabase } from '../lib/supabase';

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

export type KYCStatus = {
  hasKYC: boolean;
  isComplete: boolean;
  kycData?: any;
  message?: string;
  requiresKYC: boolean;
};

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string; data?: any }>;
  signIn: (data: SignInData) => Promise<{ success: boolean; error?: string; data?: any }>;
  signOut: () => Promise<void>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message?: string; data?: any }>;
  resendVerification: (email: string) => Promise<{ success: boolean; message?: string }>;
  checkVerification: (email: string) => Promise<{ success: boolean; email_verified?: boolean; message?: string }>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string; data?: any }>;
  signInWithFacebook: () => Promise<{ success: boolean; error?: string; data?: any }>;
  validateSession: () => Promise<boolean>;
  forceLogout: () => Promise<void>;
  checkKYCStatus: () => Promise<KYCStatus>;
  clearKYCState: () => void;
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
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    checkAndValidateStoredToken();
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const clearAuthStorage = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('pending_verification_email');
      if (isMountedRef.current) {
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error clearing auth storage:', error);
    }
  };

  const checkKYCStatus = async (): Promise<KYCStatus> => {
    try {
      if (!user || !token) {
        return { 
          hasKYC: false, 
          isComplete: false, 
          requiresKYC: true,
          message: 'User not logged in' 
        };
      }

      const { data, error } = await supabase
        .from('kyc_information')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('KYC check error:', error);
        return { 
          hasKYC: false, 
          isComplete: false, 
          requiresKYC: true,
          message: 'Error checking KYC status' 
        };
      }

      if (!data) {
        return { 
          hasKYC: false, 
          isComplete: false, 
          requiresKYC: true,
          message: 'No KYC record found. Please complete KYC verification.' 
        };
      }

      const kycData = data;
      
      const requiredFields = [
        'id_number',
        'first_name', 
        'last_name',
        'date_of_birth',
        'phone_number',
        'address',
        'bank_account_number',
        'bank_name',
        'id_document_url',
        'proof_of_address_url',
        'selfie_url'
      ];

      const isComplete = requiredFields.every(field => 
        kycData[field] !== null && kycData[field] !== undefined && kycData[field] !== ''
      );

      const isRejected = kycData.kyc_status === 'rejected' || kycData.bav_status === 'failed';

      return { 
        hasKYC: true, 
        isComplete: isComplete && !isRejected,
        requiresKYC: !isComplete || isRejected,
        kycData,
        message: isRejected ? 
          'KYC verification failed. Please contact support.' : 
          (!isComplete ? 'Please complete all KYC fields.' : 'KYC complete')
      };
    } catch (error) {
      console.error('KYC check error:', error);
      return { 
        hasKYC: false, 
        isComplete: false, 
        requiresKYC: true,
        message: 'Error checking KYC status' 
      };
    }
  };

  const clearKYCState = () => {
    console.log('KYC state cleared - will re-check on next load');
  };

  // FIXED: Now checks if user exists in database
  const validateSession = async (): Promise<boolean> => {
    try {
      const storedToken = await AsyncStorage.getItem('access_token');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (!storedToken || !storedUser) {
        return false;
      }
      
      const parsedUser = JSON.parse(storedUser);
      
      // CRITICAL FIX: Check if user exists in database
      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('id, email, status, email_verified')
        .eq('id', parsedUser.id)
        .single();
      
      // If user doesn't exist in DB, clear storage
      if (dbError || !dbUser) {
        console.log('User not found in database, clearing auth');
        await clearAuthStorage();
        return false;
      }
      
      // Check if user is active
      if (dbUser.status !== 'active') {
        console.log('User account is not active');
        await clearAuthStorage();
        return false;
      }
      
      // Update user data with latest from database
      const updatedUser = { ...parsedUser, ...dbUser };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Also check verification with API
      const response = await authAPI.checkVerification(parsedUser.email);
      
      if (response.data.success) {
        if (isMountedRef.current) {
          setToken(storedToken);
          setUser(updatedUser);
        }
        return true;
      } else {
        await clearAuthStorage();
        return false;
      }
    } catch (error) {
      console.error('Session validation error:', error);
      await clearAuthStorage();
      return false;
    }
  };

  const checkAndValidateStoredToken = async () => {
    try {
      setIsLoading(true);
      
      const storedToken = await AsyncStorage.getItem('access_token');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        const isValid = await validateSession();
        
        if (!isValid && isMountedRef.current) {
          Alert.alert(
            'Session Expired',
            'Your account has been removed or deactivated.',
            [{ text: 'OK' }]
          );
        }
      } else if (isMountedRef.current) {
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking stored token:', error);
      await clearAuthStorage();
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // FIXED: Now checks if user exists in database before storing
  const signIn = async (data: SignInData) => {
    try {
      const response = await authAPI.login({
        email: data.email.toLowerCase(),
        password: data.password,
      });

      if (response.data.success) {
        const { access_token, user: userData } = response.data.data;
        
        // VERIFY USER EXISTS IN DATABASE
        const { data: dbUser, error: dbError } = await supabase
          .from('users')
          .select('id, status, email_verified')
          .eq('id', userData.id)
          .single();
        
        if (dbError || !dbUser) {
          // User doesn't exist in database
          await clearAuthStorage();
          return { 
            success: false, 
            error: 'Account not found' 
          };
        }
        
        if (dbUser.status !== 'active') {
          // User is inactive
          await clearAuthStorage();
          return { 
            success: false, 
            error: 'Account is deactivated' 
          };
        }
        
        // Update user data with database info
        const updatedUser = { ...userData, ...dbUser };
        
        // Store token and user data
        await AsyncStorage.setItem('access_token', access_token);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        if (isMountedRef.current) {
          setToken(access_token);
          setUser(updatedUser);
        }
        
        return { 
          success: true, 
          data: { token: access_token, user: updatedUser },
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
      
      if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        return { 
          success: false, 
          error: 'Cannot connect to server. Check your internet connection.'
        };
      }
      
      let errorMessage = 'Login failed';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
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
    }
  };

  const verifyEmail = async (token: string) => {
    try {
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
    }
  };

  const resendVerification = async (email: string) => {
    try {
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
    }
  };

  const checkVerification = async (email: string) => {
    try {
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
    }
  };

  const signOut = async () => {
    try {
      await clearAuthStorage();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const forceLogout = async () => {
    try {
      await clearAuthStorage();
      Alert.alert(
        'Session Expired',
        'Your session has expired. Please log in again.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Force logout error:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { 
        success: false,
        error: 'Google sign in is coming soon!'
      };
    } catch (error: any) {
      console.error('Google sign in error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to sign in with Google' 
      };
    }
  };

  const signInWithFacebook = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { 
        success: false,
        error: 'Facebook sign in is coming soon!'
      };
    } catch (error: any) {
      console.error('Facebook sign in error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to sign in with Facebook' 
      };
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      console.log('Update profile data:', data);
      
      const updatedUser = { ...user, ...data };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      if (isMountedRef.current) {
        setUser(updatedUser);
      }
      
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
    signInWithGoogle,
    signInWithFacebook,
    validateSession,
    forceLogout,
    checkKYCStatus,
    clearKYCState,
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