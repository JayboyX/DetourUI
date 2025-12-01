// src/screens/EmailVerificationScreen.tsx - COMPLETE UPDATED VERSION
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Linking,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function EmailVerificationScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute();
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [hasOpenedMail, setHasOpenedMail] = useState(false);
  
  const { verifyEmail, resendVerification, checkVerification } = useAuth();
  
  const email = route.params?.email || '';
  const isResend = route.params?.isResend || false;
  
  // Handle deep links for email verification
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      console.log('Deep link received:', url);
      
      if (url.includes('verify-email')) {
        const token = extractTokenFromUrl(url);
        if (token) {
          await verifyEmailToken(token);
        }
      }
    };

    // Get initial URL if app was opened from deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => subscription.remove();
  }, []);

  // Countdown timer for resend button
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const extractTokenFromUrl = (url: string) => {
    try {
      const query = url.split('?')[1];
      const params = new URLSearchParams(query);
      return params.get('token');
    } catch (error) {
      console.error('Error extracting token:', error);
      return null;
    }
  };

  const verifyEmailToken = async (token: string) => {
    setIsLoading(true);
    try {
      const result = await verifyEmail(token);
      
      if (result.success) {
        Alert.alert(
          'Email Verified! 🎉',
          result.message || 'Your email has been verified successfully!',
          [
            { 
              text: 'Continue to Login', 
              onPress: () => navigation.navigate('Login') 
            },
          ]
        );
      } else {
        Alert.alert(
          'Verification Failed',
          result.message || 'The verification link is invalid or has expired.',
          [
            { 
              text: 'OK', 
              onPress: () => setCountdown(0) // Enable resend immediately
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        'Failed to verify email. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (countdown > 0) {
      Alert.alert(
        'Please Wait',
        `You can resend the verification email in ${countdown} seconds.`
      );
      return;
    }

    setResendLoading(true);
    try {
      const result = await resendVerification(email);
      
      if (result.success) {
        Alert.alert(
          'Email Sent! 📧',
          result.message || 'Verification email has been resent. Please check your inbox.',
          [{ text: 'OK' }]
        );
        setCountdown(60); // 60 seconds cooldown
      } else {
        Alert.alert(
          'Failed to Resend',
          result.message || 'Unable to resend verification email. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        'Failed to resend verification email. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setCheckingStatus(true);
    try {
      const result = await checkVerification(email);
      
      if (result.success) {
        if (result.email_verified) {
          Alert.alert(
            'Email Verified! ✅',
            'Your email has been verified. You can now log in.',
            [
              { 
                text: 'Continue to Login', 
                onPress: () => navigation.navigate('Login') 
              },
            ]
          );
        } else {
          Alert.alert(
            'Not Verified Yet',
            'Your email has not been verified yet. Please check your inbox for the verification email.',
            [
              { 
                text: 'Open Email App', 
                onPress: openEmailApp 
              },
              { text: 'OK', style: 'cancel' },
            ]
          );
        }
      } else {
        Alert.alert(
          'Error',
          result.message || 'Failed to check verification status.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        'Failed to check verification status. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setCheckingStatus(false);
    }
  };

  const openEmailApp = async () => {
    try {
      // Try to open default mail app
      await Linking.openURL('mailto:');
      setHasOpenedMail(true);
    } catch (error) {
      Alert.alert(
        'Cannot Open Email',
        'Please check your email app manually.',
        [{ text: 'OK' }]
      );
    }
  };

  const openGmail = async () => {
    try {
      await Linking.openURL('https://mail.google.com/');
      setHasOpenedMail(true);
    } catch (error) {
      Alert.alert(
        'Cannot Open Gmail',
        'Please open Gmail manually.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  const handleManualTokenEntry = () => {
    Alert.prompt(
      'Enter Verification Token',
      'If you received a token via another method, enter it here:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Verify', 
          onPress: (token) => {
            if (token && token.trim()) {
              verifyEmailToken(token.trim());
            }
          }
        },
      ],
      'plain-text'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading || resendLoading || checkingStatus}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Email Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <Ionicons name="mail-outline" size={60} color="#2AB576" />
            </View>
            {isResend && (
              <View style={styles.resendBadge}>
                <Ionicons name="refresh" size={16} color="#FFFFFF" />
              </View>
            )}
          </View>
          
          <Text style={styles.title}>
            {isResend ? 'Verification Email Sent!' : 'Check Your Email'}
          </Text>
          
          <Text style={styles.subtitle}>
            {isResend 
              ? 'We\'ve resent the verification link to:'
              : 'We\'ve sent a verification link to:'}
          </Text>
          
          <Text style={styles.emailText}>{email}</Text>
          
          <Text style={styles.instructions}>
            Please click the link in the email to verify your account. 
            The link will expire in 24 hours.
          </Text>

          {/* Open Email App Buttons */}
          <View style={styles.emailAppButtons}>
            <TouchableOpacity
              style={styles.emailAppButton}
              onPress={openEmailApp}
              disabled={isLoading}
            >
              <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
              <Text style={styles.emailAppButtonText}>Open Email</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.emailAppButton, styles.gmailButton]}
              onPress={openGmail}
              disabled={isLoading}
            >
              <Ionicons name="logo-google" size={20} color="#FFFFFF" />
              <Text style={styles.emailAppButtonText}>Open Gmail</Text>
            </TouchableOpacity>
          </View>

          {/* Spam Warning */}
          <View style={styles.warningContainer}>
            <Ionicons name="warning-outline" size={18} color="#FFA726" />
            <Text style={styles.warningText}>
              Can't find the email? Check your spam or junk folder.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {/* Check Verification Status Button */}
            <TouchableOpacity
              style={styles.checkButton}
              onPress={handleCheckVerification}
              disabled={checkingStatus || isLoading}
            >
              {checkingStatus ? (
                <ActivityIndicator color="#2AB576" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#2AB576" />
                  <Text style={styles.checkButtonText}>Check Verification Status</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Resend Button */}
            <TouchableOpacity
              style={[
                styles.resendButton,
                countdown > 0 && styles.resendButtonDisabled
              ]}
              onPress={handleResendEmail}
              disabled={resendLoading || countdown > 0}
            >
              {resendLoading ? (
                <ActivityIndicator color="#2AB576" size="small" />
              ) : (
                <>
                  <Ionicons name="refresh-outline" size={20} color="#2AB576" />
                  <Text style={styles.resendButtonText}>
                    {countdown > 0 
                      ? `Resend (${countdown}s)` 
                      : 'Resend Verification Email'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Continue to Login Button */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleGoToLogin}
              disabled={isLoading}
            >
              <Text style={styles.continueButtonText}>Continue to Login</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Manual Token Entry */}
            <TouchableOpacity
              style={styles.manualButton}
              onPress={handleManualTokenEntry}
              disabled={isLoading}
            >
              <Ionicons name="key-outline" size={16} color="#666" />
              <Text style={styles.manualButtonText}>Enter token manually</Text>
            </TouchableOpacity>
          </View>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpText}>
              • The verification link expires in 24 hours{'\n'}
              • Check spam/junk folder{'\n'}
              • Make sure you entered the correct email{'\n'}
              • Contact support if you need assistance
            </Text>
          </View>

          {/* Loading Overlay */}
          {(isLoading || resendLoading || checkingStatus) && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#2AB576" />
              <Text style={styles.loadingText}>
                {isLoading 
                  ? 'Verifying...' 
                  : resendLoading 
                  ? 'Sending...' 
                  : 'Checking...'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    marginTop: 10,
    marginLeft: 20,
    marginBottom: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8FFED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2AB576',
  },
  resendBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FFA726',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2AB576',
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  instructions: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  emailAppButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
  },
  emailAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2AB576',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    minWidth: 140,
    justifyContent: 'center',
  },
  gmailButton: {
    backgroundColor: '#DB4437',
  },
  emailAppButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  warningText: {
    fontSize: 14,
    color: '#F57C00',
    marginLeft: 12,
    flex: 1,
  },
  actionButtons: {
    width: '100%',
    marginBottom: 30,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9F4',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8FFED',
  },
  checkButtonText: {
    color: '#2AB576',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#2AB576',
  },
  resendButtonDisabled: {
    opacity: 0.5,
    borderColor: '#CCCCCC',
  },
  resendButtonText: {
    color: '#2AB576',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2AB576',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  manualButtonText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 8,
    textDecorationLine: 'underline',
  },
  helpContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#2AB576',
    fontWeight: '600',
  },
});