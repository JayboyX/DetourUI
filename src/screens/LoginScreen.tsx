// src/screens/LoginScreen.tsx - CLEAN VERSION
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showResendOption, setShowResendOption] = useState(false);
  
  const { signIn, resendVerification } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();

  // Handle auto-login from verification
  useEffect(() => {
    const autoLoginEmail = route.params?.autoLoginEmail;
    const message = route.params?.message;
    
    if (autoLoginEmail) {
      setEmail(autoLoginEmail);
      if (message) {
        setErrorMessage(message);
      }
    }
  }, [route.params]);

  // Clear error when user types
  useEffect(() => {
    setErrorMessage('');
    setShowResendOption(false);
  }, [email, password]);

  const handleLogin = async () => {
    // Clear previous errors
    setErrorMessage('');
    setShowResendOption(false);

    // Validate inputs
    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await signIn({ 
        email: email.toLowerCase(), 
        password 
      });
      
      if (result.success) {
        // AuthContext will handle navigation to dashboard
        // Show loading state until navigation happens
      } else {
        // Show error inline
        const errorMsg = result.error || 'Invalid email or password';
        setErrorMessage(errorMsg);
        
        // Check if error is about email verification
        if (errorMsg.toLowerCase().includes('not verified') || 
            errorMsg.toLowerCase().includes('verification') ||
            errorMsg.toLowerCase().includes('verify')) {
          setShowResendOption(true);
        }
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Network error. Please check your connection.';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email address first');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setErrorMessage('Password reset link sent to your email');
    // TODO: Implement actual password reset
  };

  const handleResendVerification = async () => {
    if (!email) return;
    
    setIsLoading(true);
    
    try {
      const result = await resendVerification(email.toLowerCase());
      
      if (result.success) {
        setErrorMessage('✅ Verification email resent. Check your inbox.');
        setShowResendOption(false);
      } else {
        setErrorMessage(`❌ ${result.message || 'Failed to resend email'}`);
      }
    } catch (error: any) {
      setErrorMessage('❌ Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    navigation.navigate('SignUp');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey</Text>
          </View>

          {/* Error/Message Display */}
          {errorMessage ? (
            <View style={[
              styles.messageContainer,
              errorMessage.includes('✅') ? styles.messageSuccess : styles.messageError
            ]}>
              <Ionicons 
                name={errorMessage.includes('✅') ? "checkmark-circle" : "warning"} 
                size={18} 
                color={errorMessage.includes('✅') ? "#2AB576" : "#FF6B6B"} 
              />
              <Text style={[
                styles.messageText,
                { color: errorMessage.includes('✅') ? "#2AB576" : "#FF6B6B" }
              ]}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={[
              styles.inputContainer,
              errorMessage.toLowerCase().includes('email') && !errorMessage.includes('✅') && styles.inputError
            ]}>
              <Ionicons 
                name="mail-outline" 
                size={20} 
                color={errorMessage.toLowerCase().includes('email') && !errorMessage.includes('✅') ? "#FF6B6B" : "#666"} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading}
                placeholderTextColor="#999"
                autoComplete="email"
              />
            </View>

            {/* Password Input */}
            <View style={[
              styles.inputContainer,
              errorMessage.toLowerCase().includes('password') && !errorMessage.includes('✅') && styles.inputError
            ]}>
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color={errorMessage.toLowerCase().includes('password') && !errorMessage.includes('✅') ? "#FF6B6B" : "#666"} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
                placeholderTextColor="#999"
                autoComplete="password"
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                (isLoading || !email.trim() || !password) && styles.loginButtonDisabled
              ]}
              onPress={handleLogin}
              disabled={isLoading || !email.trim() || !password}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Resend Verification Option */}
            {showResendOption && errorMessage && (
              <TouchableOpacity 
                style={styles.resendButton}
                onPress={handleResendVerification}
                disabled={isLoading}
              >
                <Ionicons name="refresh-outline" size={16} color="#2AB576" />
                <Text style={styles.resendButtonText}>
                  Resend verification email
                </Text>
              </TouchableOpacity>
            )}

            {/* Create Account */}
            <TouchableOpacity 
              style={styles.signupButton}
              onPress={handleCreateAccount} 
              disabled={isLoading}
            >
              <Text style={styles.signupText}>Don't have an account? </Text>
              <Text style={styles.signupLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    minHeight: height,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  // Message Container
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  messageSuccess: {
    backgroundColor: '#F0F9F4',
    borderColor: '#E8FFED',
  },
  messageError: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFE8E8',
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    height: 56,
  },
  inputError: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    paddingVertical: 8,
  },
  forgotPasswordText: {
    color: '#2AB576',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#2AB576',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#F0F9F4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8FFED',
    marginBottom: 16,
  },
  resendButtonText: {
    color: '#2AB576',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  signupButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#2AB576',
    fontSize: 14,
    fontWeight: '600',
  },
});