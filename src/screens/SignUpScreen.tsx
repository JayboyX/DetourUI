// src/screens/SignUpScreen.tsx - WITH CUSTOM TOPBAR (NO BACK BUTTON)
import React, { useState, useEffect, useRef } from 'react';
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
import { useAuth, validatePassword } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Checkbox from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');

export default function SignUpScreen() {
  const navigation = useNavigation();
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVerificationPending, setShowVerificationPending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const verificationCheckTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState<{
    isValid: boolean;
    requirements: string[];
  }>({ isValid: false, requirements: [] });
  
  const { signUp, checkVerification, resendVerification, signIn } = useAuth();

  useEffect(() => {
    checkPendingVerification();
    
    return () => {
      if (verificationCheckTimerRef.current) {
        clearInterval(verificationCheckTimerRef.current);
      }
    };
  }, []);

  const checkPendingVerification = async () => {
    try {
      const pending = await AsyncStorage.getItem('pending_verification_email');
      if (pending) {
        setPendingEmail(pending);
        setShowVerificationPending(true);
        startVerificationCheckInterval(pending);
      }
    } catch (error) {
      console.error('Error checking pending verification:', error);
    }
  };

  const startVerificationCheckInterval = (emailToCheck: string) => {
    if (verificationCheckTimerRef.current) {
      clearInterval(verificationCheckTimerRef.current);
    }

    const timer = setInterval(() => {
      checkVerificationStatus(emailToCheck);
    }, 5000);

    verificationCheckTimerRef.current = timer;
    checkVerificationStatus(emailToCheck);
  };

  const checkVerificationStatus = async (emailToCheck: string) => {
    try {
      const result = await checkVerification(emailToCheck);
      if (result.success && result.email_verified) {
        await AsyncStorage.removeItem('pending_verification_email');
        if (verificationCheckTimerRef.current) {
          clearInterval(verificationCheckTimerRef.current);
        }
        
        // Auto-login with stored credentials
        const storedPassword = await AsyncStorage.getItem('temp_password');
        if (storedPassword) {
          const loginResult = await signIn({
            email: emailToCheck,
            password: storedPassword
          });
          
          if (loginResult.success) {
            await AsyncStorage.removeItem('temp_password');
          } else {
            setErrorMessage('✅ Email verified! Please login manually.');
          }
        }
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  const validateForm = () => {
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name');
      return false;
    }
    
    if (fullName.trim().length < 2) {
      setErrorMessage('Full name must be at least 2 characters');
      return false;
    }
    
    if (!email.trim()) {
      setErrorMessage('Please enter your email');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    
    if (!password) {
      setErrorMessage('Please enter a password');
      return false;
    }
    
    if (!passwordValidation.isValid) {
      const errors = passwordValidation.requirements
        .filter(req => req.startsWith('❌'))
        .map(req => req.replace('❌ ', ''));
      setErrorMessage(`Password requirements:\n${errors.join('\n')}`);
      return false;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return false;
    }
    
    if (!termsAgreed) {
      setErrorMessage('You must agree to the Terms & Conditions');
      return false;
    }
    
    return true;
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    const validation = validatePassword(text);
    setPasswordValidation(validation);
    setErrorMessage('');
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrorMessage('');
    
    const signUpData = {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      terms_agreed: termsAgreed,
    };
    
    const result = await signUp(signUpData);
    
    if (result.success) {
      const userEmail = email.trim().toLowerCase();
      await AsyncStorage.setItem('pending_verification_email', userEmail);
      await AsyncStorage.setItem('temp_password', password);
      
      setPendingEmail(userEmail);
      setShowVerificationPending(true);
      
      startVerificationCheckInterval(userEmail);
      
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setTermsAgreed(false);
      setPasswordValidation({ isValid: false, requirements: [] });
      
    } else {
      setErrorMessage(result.error || 'Failed to create account');
    }
    
    setIsLoading(false);
  };

  const handleResendVerification = async () => {
    if (!pendingEmail || isResending) return;
    
    setIsResending(true);
    
    try {
      const result = await resendVerification(pendingEmail);
      
      if (!result.success) {
        setErrorMessage(result.message || 'Failed to resend email');
      } else {
        setErrorMessage('✅ Verification email resent!');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    } catch (error: any) {
      setErrorMessage('Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      {/* CUSTOM TOP BAR WITHOUT BACK BUTTON - TITLE ON TOP */}
      <View style={styles.customTopBar}>
        <View style={styles.topBarContent}>
          <View style={styles.textContainer}>
            {/* TITLE FIRST */}
            <Text style={styles.topBarTitle}>Sign Up</Text>
            {/* SUBTITLE BELOW */}
            <Text style={styles.topBarSubtitle}>Join Detour Drive</Text>
          </View>
        </View>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
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
            {/* Verification Screen */}
            {showVerificationPending ? (
              <View style={styles.verificationContainer}>
                <View style={styles.centeredContent}>
                  <View style={styles.verificationHeader}>
                    <View style={styles.verificationIcon}>
                      <Ionicons name="mail-outline" size={60} color="#2AB576" />
                      <View style={styles.verificationBadge}>
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </View>
                    </View>
                    <Text style={styles.verificationTitle}>Check Your Email</Text>
                    <Text style={styles.verificationSubtitle}>
                      We've sent a verification link to:
                    </Text>
                    <Text style={styles.verificationEmail}>{pendingEmail}</Text>
                  </View>

                  {/* Error/Success Message */}
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

                  {/* Resend Text */}
                  <View style={styles.resendTextContainer}>
                    <Text style={styles.resendText}>
                      Didn't get the email?{' '}
                      <Text style={styles.resendLink} onPress={handleResendVerification}>
                        {isResending ? 'Sending...' : 'Click here to receive it again'}
                      </Text>
                    </Text>
                    {isResending && <ActivityIndicator color="#2AB576" size="small" style={styles.resendSpinner} />}
                  </View>
                </View>
              </View>
            ) : (
              /* Regular Sign Up Form */
              <>
                {/* Error Message */}
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

                <View style={styles.form}>
                  {/* Full Name */}
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name *"
                      value={fullName}
                      onChangeText={setFullName}
                      editable={!isLoading}
                      autoCapitalize="words"
                      placeholderTextColor="#999"
                    />
                  </View>

                  {/* Email */}
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Email Address *"
                      value={email}
                      onChangeText={setEmail}
                      editable={!isLoading}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      placeholderTextColor="#999"
                    />
                  </View>

                  {/* Password */}
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Password *"
                      value={password}
                      onChangeText={handlePasswordChange}
                      secureTextEntry={!showPassword}
                      editable={!isLoading}
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity 
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#666" 
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Password Requirements */}
                  {password.length > 0 && (
                    <View style={styles.passwordRequirements}>
                      {passwordValidation.requirements.map((req, index) => (
                        <Text 
                          key={index} 
                          style={[
                            styles.passwordRequirement,
                            req.startsWith('✅') ? styles.requirementMet : styles.requirementNotMet
                          ]}
                        >
                          {req}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Confirm Password */}
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm Password *"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      editable={!isLoading}
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity 
                      style={styles.eyeButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Ionicons 
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#666" 
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Terms */}
                  <View style={styles.termsContainer}>
                    <Checkbox
                      style={styles.checkbox}
                      value={termsAgreed}
                      onValueChange={setTermsAgreed}
                      color={termsAgreed ? '#2AB576' : undefined}
                    />
                    <Text style={styles.termsText}>
                      I agree to the Terms & Conditions and Privacy Policy *
                    </Text>
                  </View>

                  {/* Sign Up Button */}
                  <TouchableOpacity
                    style={[
                      styles.signUpButton, 
                      (!passwordValidation.isValid || !termsAgreed) && styles.signUpButtonDisabled
                    ]}
                    onPress={handleSignUp}
                    disabled={isLoading || !passwordValidation.isValid || !termsAgreed}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.signUpButtonText}>Create Account</Text>
                    )}
                  </TouchableOpacity>

                  {/* Login Option */}
                  <TouchableOpacity
                    style={styles.loginOption}
                    onPress={handleGoToLogin}
                  >
                    <Text style={styles.loginOptionText}>Already have an account? Sign In</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Custom Top Bar Styles (White Background) - TITLE ON TOP
  customTopBar: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  topBarTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4, // Space between title and subtitle
  },
  topBarSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#555',
  },
  keyboardView: {
    flex: 1,
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
    paddingTop: 20,
    paddingBottom: 20,
    minHeight: height * 0.7,
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
  // Verification Screen
  verificationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  centeredContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  verificationHeader: {
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  verificationIcon: {
    position: 'relative',
    marginBottom: 20,
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2AB576',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  verificationSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 4,
  },
  verificationEmail: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2AB576',
    textAlign: 'center',
  },
  // Resend Text Styles
  resendTextContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  resendText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  resendLink: {
    color: '#2AB576',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  resendSpinner: {
    marginTop: 8,
  },
  // Regular Form
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
  passwordRequirements: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  passwordRequirement: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  requirementMet: {
    color: '#2AB576',
  },
  requirementNotMet: {
    color: '#FF6B6B',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    marginRight: 12,
    borderRadius: 4,
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    flex: 1,
  },
  signUpButton: {
    backgroundColor: '#2AB576',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  signUpButtonDisabled: {
    opacity: 0.5,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginOption: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginOptionText: {
    color: '#2AB576',
    fontSize: 16,
    fontWeight: '600',
  },
});