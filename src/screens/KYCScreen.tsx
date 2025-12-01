// src/screens/KYCScreen.tsx - UPDATED WITH LEFT-ALIGNED HEADER
import React, { useState } from 'react';
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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase'; // Your Supabase client

const { height } = Dimensions.get('window');

export default function KYCScreen() {
  const navigation = useNavigation();
  
  // Form state
  const [idNumber, setIdNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Validation functions
  const validateSouthAfricanID = (id: string) => {
    // Basic SA ID validation
    if (id.length !== 13) return false;
    if (!/^\d+$/.test(id)) return false;
    
    // Validate date of birth in ID
    const year = parseInt(id.substring(0, 2));
    const month = parseInt(id.substring(2, 4));
    const day = parseInt(id.substring(4, 6));
    
    // Check if date is valid
    if (month < 1 || month > 12 || day < 1 || day > 31) return false;
    
    return true;
  };

  const validateForm = () => {
    // Reset messages
    setErrorMessage('');
    setSuccessMessage('');

    // Basic validations
    if (!idNumber.trim()) {
      setErrorMessage('Please enter your ID/Passport number');
      return false;
    }
    
    // Validate SA ID if it's 13 digits
    if (/^\d{13}$/.test(idNumber) && !validateSouthAfricanID(idNumber)) {
      setErrorMessage('Please enter a valid South African ID number');
      return false;
    }
    
    if (!firstName.trim()) {
      setErrorMessage('Please enter your first name');
      return false;
    }
    
    if (!lastName.trim()) {
      setErrorMessage('Please enter your last name');
      return false;
    }
    
    if (!dateOfBirth.trim()) {
      setErrorMessage('Please enter your date of birth');
      return false;
    }
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateOfBirth)) {
      setErrorMessage('Date must be in YYYY-MM-DD format');
      return false;
    }
    
    if (!phoneNumber.trim()) {
      setErrorMessage('Please enter your phone number');
      return false;
    }
    
    // Validate South African phone number
    const phoneRegex = /^(\+27|0)[1-9]\d{8}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      setErrorMessage('Please enter a valid South African phone number (e.g., 0712345678 or +27712345678)');
      return false;
    }
    
    if (!address.trim()) {
      setErrorMessage('Please enter your address');
      return false;
    }
    
    if (!bankAccountNumber.trim()) {
      setErrorMessage('Please enter your bank account number');
      return false;
    }
    
    if (!bankName.trim()) {
      setErrorMessage('Please enter your bank name');
      return false;
    }
    
    return true;
  };

  const handlePhoneNumberChange = (text: string) => {
    // Format phone number as user types
    let formatted = text.replace(/\D/g, '');
    
    // Add South African country code if starting with 0
    if (formatted.startsWith('0') && formatted.length === 10) {
      formatted = '+27' + formatted.substring(1);
    }
    
    // Format: +27 71 234 5678
    if (formatted.startsWith('+27') && formatted.length > 3) {
      const part1 = formatted.substring(0, 3);
      const part2 = formatted.substring(3, 5);
      const part3 = formatted.substring(5, 8);
      const part4 = formatted.substring(8, 12);
      
      let result = part1;
      if (part2) result += ' ' + part2;
      if (part3) result += ' ' + part3;
      if (part4) result += ' ' + part4;
      setPhoneNumber(result);
    } else {
      setPhoneNumber(text);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Get current user from Supabase auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setErrorMessage('Please login to submit KYC information');
        setIsLoading(false);
        return;
      }

      // Insert KYC data directly to Supabase
      const { data, error } = await supabase
        .from('kyc_information')
        .insert([
          {
            user_id: user.id,
            id_number: idNumber.trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            date_of_birth: dateOfBirth.trim(),
            phone_number: phoneNumber.trim().replace(/\s/g, ''), // Remove spaces
            address: address.trim(),
            bank_account_number: bankAccountNumber.trim(),
            bank_name: bankName.trim(),
            bav_status: 'pending',
            kyc_status: 'pending'
          }
        ])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        
        // Check if it's a duplicate entry
        if (error.code === '23505') {
          setErrorMessage('You have already submitted KYC information');
        } else if (error.message.includes('foreign key constraint')) {
          setErrorMessage('User not found. Please try logging in again.');
        } else {
          setErrorMessage('Failed to save KYC information. Please try again.');
        }
      } else {
        setSuccessMessage('KYC information submitted successfully! Verification may take 24-48 hours.');
        
        // Trigger phone verification API (FastAPI service)
        await triggerPhoneVerification(user.id, phoneNumber.trim().replace(/\s/g, ''));
        
        // Reset form after successful submission
        setTimeout(() => {
          setIdNumber('');
          setFirstName('');
          setLastName('');
          setDateOfBirth('');
          setPhoneNumber('');
          setAddress('');
          setBankAccountNumber('');
          setBankName('');
          
          // Navigate back after 3 seconds
          setTimeout(() => {
            navigation.goBack();
          }, 3000);
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting KYC:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerPhoneVerification = async (userId: string, phone: string) => {
    try {
      // Call your FastAPI service to send SMS OTP
      const response = await fetch('YOUR_FASTAPI_ENDPOINT/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          phone_number: phone
        }),
      });
      
      if (!response.ok) {
        console.warn('Failed to trigger phone verification SMS');
      }
    } catch (error) {
      console.error('Error triggering phone verification:', error);
    }
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
          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>KYC Verification</Text>
              <Text style={styles.subtitle}>Complete your verification to start driving</Text>
            </View>
          </View>

          {/* Messages */}
          {errorMessage ? (
            <View style={styles.messageContainer}>
              <Ionicons name="warning" size={18} color="#FF6B6B" />
              <Text style={styles.messageText}>{errorMessage}</Text>
            </View>
          ) : null}

          {successMessage ? (
            <View style={[styles.messageContainer, styles.messageSuccess]}>
              <Ionicons name="checkmark-circle" size={18} color="#2AB576" />
              <Text style={[styles.messageText, { color: "#2AB576" }]}>{successMessage}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            {/* ID/Passport Number */}
            <View style={styles.inputContainer}>
              <Ionicons name="card-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="ID/Passport Number *"
                value={idNumber}
                onChangeText={setIdNumber}
                editable={!isLoading}
                placeholderTextColor="#999"
                maxLength={13}
                keyboardType="numeric"
              />
              <Text style={styles.inputHelper}>SA ID: 13 digits</Text>
            </View>

            {/* First Name */}
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="First Name *"
                value={firstName}
                onChangeText={setFirstName}
                editable={!isLoading}
                autoCapitalize="words"
                placeholderTextColor="#999"
              />
            </View>

            {/* Last Name */}
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Last Name *"
                value={lastName}
                onChangeText={setLastName}
                editable={!isLoading}
                autoCapitalize="words"
                placeholderTextColor="#999"
              />
            </View>

            {/* Date of Birth */}
            <View style={styles.inputContainer}>
              <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Date of Birth (YYYY-MM-DD) *"
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                editable={!isLoading}
                placeholderTextColor="#999"
                maxLength={10}
              />
              <Text style={styles.inputHelper}>Format: 1990-01-31</Text>
            </View>

            {/* Phone Number */}
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number *"
                value={phoneNumber}
                onChangeText={handlePhoneNumberChange}
                editable={!isLoading}
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
              <Text style={styles.inputHelper}>e.g., +27 71 234 5678</Text>
            </View>

            {/* Address */}
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <Ionicons name="home-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Full Residential Address *"
                value={address}
                onChangeText={setAddress}
                editable={!isLoading}
                multiline
                numberOfLines={3}
                placeholderTextColor="#999"
              />
            </View>

            {/* Bank Account Number */}
            <View style={styles.inputContainer}>
              <Ionicons name="card-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Bank Account Number *"
                value={bankAccountNumber}
                onChangeText={setBankAccountNumber}
                editable={!isLoading}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            {/* Bank Name */}
            <View style={styles.inputContainer}>
              <Ionicons name="business-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Bank Name *"
                value={bankName}
                onChangeText={setBankName}
                editable={!isLoading}
                placeholderTextColor="#999"
              />
              <Text style={styles.inputHelper}>e.g., FNB, Standard Bank, etc.</Text>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#2AB576" />
              <Text style={styles.infoText}>
                After submission, you'll receive an SMS to verify your phone number.
                Document uploads will be requested during verification.
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Submit Verification</Text>
                </>
              )}
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    minHeight: height,
  },
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  backButton: {
    marginRight: 16,
    marginTop: 4,
    padding: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'left',
    lineHeight: 22,
  },
  // Message Styles
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFE8E8',
  },
  messageSuccess: {
    backgroundColor: '#F0F9F4',
    borderColor: '#E8FFED',
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
    color: '#FF6B6B',
  },
  // Form Styles
  form: {
    width: '100%',
  },
  inputContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    overflow: 'hidden',
  },
  textAreaContainer: {
    height: 100,
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 18,
    zIndex: 1,
  },
  input: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 16,
    paddingLeft: 48,
    paddingRight: 16,
    minHeight: 56,
  },
  textArea: {
    paddingTop: 16,
    height: 100,
    textAlignVertical: 'top',
  },
  inputHelper: {
    fontSize: 12,
    color: '#999',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingLeft: 48,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9F4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8FFED',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    marginLeft: 12,
    lineHeight: 18,
  },
  // Submit Button
  submitButton: {
    backgroundColor: '#2AB576',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});