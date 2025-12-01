// src/screens/SignUpScreen.tsx - COMPLETE UPDATED VERSION
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth, validatePassword } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Checkbox from 'expo-checkbox';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState<{
    isValid: boolean;
    requirements: string[];
  }>({ isValid: false, requirements: [] });
  
  const { signUp } = useAuth();

  const validateForm = () => {
    // Validate full name
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    
    if (fullName.trim().length < 2) {
      Alert.alert('Error', 'Full name must be at least 2 characters');
      return false;
    }
    
    // Validate email
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    // Validate password
    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }
    
    if (!passwordValidation.isValid) {
      Alert.alert(
        'Password Requirements',
        'Please meet all password requirements:\n\n' +
        passwordValidation.requirements
          .filter(req => req.startsWith('❌'))
          .map(req => req.replace('❌ ', ''))
          .join('\n')
      );
      return false;
    }
    
    // Validate confirm password
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    
    // Validate terms
    if (!termsAgreed) {
      Alert.alert('Error', 'You must agree to the Terms & Conditions');
      return false;
    }
    
    // Optional: Validate phone number
    if (phoneNumber && phoneNumber.trim() !== '') {
      const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
        Alert.alert('Error', 'Please enter a valid phone number');
        return false;
      }
    }
    
    return true;
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    const validation = validatePassword(text);
    setPasswordValidation(validation);
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    const signUpData = {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      terms_agreed: termsAgreed,
      phone_number: phoneNumber.trim() || undefined,
    };
    
    const result = await signUp(signUpData);
    setIsLoading(false);
    
    if (result.success) {
      Alert.alert(
        'Success!',
        result.message || 'Account created successfully! Please check your email for verification.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to email verification screen
              navigation.navigate('EmailVerification', { 
                email: email.trim().toLowerCase(),
                userId: result.data?.user_id 
              });
            },
          },
        ]
      );
      
      // Clear form
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPhoneNumber('');
      setTermsAgreed(false);
      setPasswordValidation({ isValid: false, requirements: [] });
    } else {
      Alert.alert(
        'Sign Up Failed',
        result.error || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const goToLogin = () => {
    navigation.navigate('Login');
  };

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    let formatted = cleaned;
    if (cleaned.length > 3 && cleaned.length <= 6) {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else if (cleaned.length > 6) {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
    
    setPhoneNumber(formatted);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Back Button at Top */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={goToLogin}
          disabled={isLoading}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Main Content */}
          <View style={styles.contentContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Join Detour</Text>
                <Text style={styles.subtitle}>Create your driver account</Text>
              </View>
            </View>

            {/* Form */}
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
                  maxLength={50}
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
                  autoComplete="email"
                />
              </View>

              {/* Phone Number (Optional) */}
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number (Optional)"
                  value={phoneNumber}
                  onChangeText={formatPhoneNumber}
                  editable={!isLoading}
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                  maxLength={14}
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
                  autoComplete="password-new"
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

              {/* Password Requirements */}
              {password.length > 0 && (
                <View style={styles.passwordRequirements}>
                  <Text style={styles.passwordRequirementsTitle}>Password Requirements:</Text>
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
                  autoComplete="password-new"
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>

              {/* Password Match Indicator */}
              {confirmPassword.length > 0 && password.length > 0 && (
                <View style={styles.passwordMatchContainer}>
                  <Ionicons 
                    name={password === confirmPassword ? "checkmark-circle" : "close-circle"} 
                    size={16} 
                    color={password === confirmPassword ? "#2AB576" : "#FF6B6B"} 
                  />
                  <Text style={[
                    styles.passwordMatchText,
                    { color: password === confirmPassword ? "#2AB576" : "#FF6B6B" }
                  ]}>
                    {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                  </Text>
                </View>
              )}

              {/* Terms & Conditions */}
              <View style={styles.termsContainer}>
                <Checkbox
                  style={styles.checkbox}
                  value={termsAgreed}
                  onValueChange={setTermsAgreed}
                  color={termsAgreed ? '#2AB576' : undefined}
                  disabled={isLoading}
                />
                <TouchableOpacity 
                  style={styles.termsTextContainer}
                  onPress={() => setTermsAgreed(!termsAgreed)}
                  disabled={isLoading}
                >
                  <Text style={styles.termsText}>
                    I agree to the{' '}
                    <Text style={styles.termsLink}>Terms & Conditions</Text>
                    {' '}and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                    {' '}*
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Required Fields Note */}
              <Text style={styles.requiredNote}>* Required fields</Text>

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

              {/* Already have account */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={goToLogin} disabled={isLoading}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* App Info */}
            <View style={styles.appInfo}>
              <Text style={styles.appInfoText}>By signing up, you agree to our terms</Text>
              <Text style={styles.appVersion}>Detour Driver App v1.0.0</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 10 : 0,
    left: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 40,
  },
  header: {
    marginBottom: 30,
  },
  titleContainer: {
    marginTop: 20,
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
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
    fontFamily: 'System',
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
  passwordRequirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  passwordRequirement: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
    fontFamily: 'System',
  },
  requirementMet: {
    color: '#2AB576',
  },
  requirementNotMet: {
    color: '#FF6B6B',
  },
  passwordMatchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  passwordMatchText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    marginRight: 12,
    borderRadius: 4,
    marginTop: 2,
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontFamily: 'System',
  },
  termsLink: {
    color: '#2AB576',
    fontWeight: '600',
  },
  requiredNote: {
    fontSize: 12,
    color: '#999',
    marginBottom: 24,
    paddingHorizontal: 4,
    fontStyle: 'italic',
  },
  signUpButton: {
    backgroundColor: '#2AB576',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  signUpButtonDisabled: {
    opacity: 0.5,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'System',
  },
  loginLink: {
    color: '#2AB576',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 20,
  },
  appInfoText: {
    color: '#999',
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'System',
  },
  appVersion: {
    color: '#CCC',
    fontSize: 10,
    fontFamily: 'System',
  },
});