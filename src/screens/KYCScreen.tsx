// src/screens/KYCScreen.tsx - FIXED WITH ALL FUNCTIONS
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
  Image,
  Modal,
  Alert,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import RNPickerSelect from 'react-native-picker-select';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const { height, width } = Dimensions.get('window');

// South African Banks List
const SOUTH_AFRICAN_BANKS = [
  { label: 'Select Bank Name', value: '' },
  { label: 'Absa Bank', value: 'Absa Bank' },
  { label: 'First National Bank (FNB)', value: 'First National Bank (FNB)' },
  { label: 'Standard Bank', value: 'Standard Bank' },
  { label: 'Nedbank', value: 'Nedbank' },
  { label: 'Capitec Bank', value: 'Capitec Bank' },
  { label: 'Investec', value: 'Investec' },
  { label: 'African Bank', value: 'African Bank' },
  { label: 'Bidvest Bank', value: 'Bidvest Bank' },
  { label: 'Discovery Bank', value: 'Discovery Bank' },
  { label: 'TymeBank', value: 'TymeBank' },
  { label: 'Bank Zero', value: 'Bank Zero' },
  { label: 'Sasfin Bank', value: 'Sasfin Bank' },
  { label: 'Mercantile Bank', value: 'Mercantile Bank' },
  { label: 'Grindrod Bank', value: 'Grindrod Bank' },
  { label: 'Other', value: 'Other' },
];

// Document types
const DOCUMENT_TYPES = {
  ID_DOCUMENT: 'id_document',
  PROOF_OF_ADDRESS: 'proof_of_address',
  SELFIE: 'selfie'
};

export default function KYCScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  // Form state
  const [idNumber, setIdNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [otherBankName, setOtherBankName] = useState('');
  
  // Document state
  const [idDocument, setIdDocument] = useState(null);
  const [proofOfAddress, setProofOfAddress] = useState(null);
  const [selfie, setSelfie] = useState(null);
  
  // OTP state
  const [otpCode, setOtpCode] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dateError, setDateError] = useState(false);
  const [addressError, setAddressError] = useState(false);
  
  // KYC record ID for updates
  const [kycRecordId, setKycRecordId] = useState(null);

  // Validation functions
  const validateSouthAfricanID = (id: string) => {
    if (id.length !== 13) return false;
    if (!/^\d+$/.test(id)) return false;
    
    const year = parseInt(id.substring(0, 2));
    const month = parseInt(id.substring(2, 4));
    const day = parseInt(id.substring(4, 6));
    
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const maxDays = daysInMonth[month - 1];
    
    if (month === 2) {
      const fullYear = year < 50 ? 2000 + year : 1900 + year;
      const isLeapYear = (fullYear % 4 === 0 && fullYear % 100 !== 0) || (fullYear % 400 === 0);
      if (isLeapYear && day > 29) return false;
      if (!isLeapYear && day > 28) return false;
    } else if (day > maxDays) {
      return false;
    }
    
    return true;
  };

  const validateDateFormat = (date: string) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      setDateError(true);
      return false;
    }
    
    const [year, month, day] = date.split('-').map(Number);
    
    if (month < 1 || month > 12) {
      setDateError(true);
      return false;
    }
    
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let maxDays = daysInMonth[month - 1];
    
    if (month === 2) {
      const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
      maxDays = isLeapYear ? 29 : 28;
    }
    
    if (day < 1 || day > maxDays) {
      setDateError(true);
      return false;
    }
    
    const today = new Date();
    const inputDate = new Date(year, month - 1, day);
    if (inputDate > today) {
      setDateError(true);
      return false;
    }
    
    setDateError(false);
    return true;
  };

  const validateAddress = (addr: string) => {
    const addressRegex = /^[A-Za-z0-9\s,.'-]{10,100}$/;
    const isValid = addressRegex.test(addr);
    setAddressError(!isValid);
    return isValid;
  };

  const validateForm = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setDateError(false);
    setAddressError(false);

    if (!idNumber.trim()) {
      setErrorMessage('Please enter your ID/Passport number');
      return false;
    }
    
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
    
    if (!validateDateFormat(dateOfBirth)) {
      setErrorMessage('Please enter a valid date of birth in YYYY-MM-DD format');
      return false;
    }
    
    if (!phoneNumber.trim()) {
      setErrorMessage('Please enter your phone number');
      return false;
    }
    
    const phoneRegex = /^(\+27|0)[1-9]\d{8}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      setErrorMessage('Please enter a valid South African phone number (e.g., 0712345678 or +27712345678)');
      return false;
    }
    
    if (!address.trim()) {
      setErrorMessage('Please enter your address');
      return false;
    }
    
    if (!validateAddress(address.trim())) {
      setErrorMessage('Please enter a valid address (10-100 characters, letters, numbers, and basic punctuation only)');
      return false;
    }
    
    if (!bankAccountNumber.trim()) {
      setErrorMessage('Please enter your bank account number');
      return false;
    }
    
    if (!selectedBank) {
      setErrorMessage('Please select your bank name');
      return false;
    }
    
    if (selectedBank === 'Other' && !otherBankName.trim()) {
      setErrorMessage('Please specify your bank name');
      return false;
    }
    
    // Check documents
    if (!idDocument) {
      setErrorMessage('Please upload your ID document');
      return false;
    }
    
    if (!proofOfAddress) {
      setErrorMessage('Please upload proof of address');
      return false;
    }
    
    if (!selfie) {
      setErrorMessage('Please upload a selfie');
      return false;
    }
    
    return true;
  };

  // Phone number formatter
  const formatPhoneNumber = (text: string) => {
    let formatted = text.replace(/\D/g, '');
    
    if (formatted.startsWith('0') && formatted.length === 10) {
      formatted = '+27' + formatted.substring(1);
    }
    
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

  const pickDocument = async (type: string) => {
    try {
      let result;
      
      if (type === DOCUMENT_TYPES.SELFIE) {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        
        if (!permissionResult.granted) {
          Alert.alert('Permission Required', 'Camera permission is required to take a selfie');
          return;
        }
        
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          base64: false,
        });
      } else {
        result = await DocumentPicker.getDocumentAsync({
          type: ['image/*', 'application/pdf'],
          copyToCacheDirectory: true,
        });
      }
      
      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const document = {
          uri: asset.uri,
          name: asset.name || `document_${Date.now()}.${type === 'selfie' ? 'jpg' : 'pdf'}`,
          type: asset.mimeType || 'application/octet-stream',
          size: asset.fileSize || 0,
        };
        
        switch (type) {
          case DOCUMENT_TYPES.ID_DOCUMENT:
            setIdDocument(document);
            break;
          case DOCUMENT_TYPES.PROOF_OF_ADDRESS:
            setProofOfAddress(document);
            break;
          case DOCUMENT_TYPES.SELFIE:
            setSelfie(document);
            break;
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const uploadDocumentToSupabase = async (document: any, docType: string) => {
    try {
      if (!document || !document.uri) {
        console.log('No document to upload');
        throw new Error('No document provided');
      }

      // Get file extension
      const fileExtension = document.uri.split('.').pop() || 'jpg';
      const fileName = `${docType}_${Date.now()}.${fileExtension}`;
      const folderPath = `${idNumber.trim()}/`;
      const filePath = `${folderPath}${fileName}`;

      console.log('Uploading:', {
        path: filePath,
        type: document.type,
        size: document.size
      });

      // SIMPLIFIED: Use form data method instead of FileSystem
      const formData = new FormData();
      formData.append('file', {
        uri: document.uri,
        name: fileName,
        type: document.type || 'image/jpeg',
      });

      // Upload to Supabase using fetch with form data
      const response = await fetch(
        `https://rfbngcyvdzrrebyudawo.supabase.co/storage/v1/object/KYC_Bucket/${filePath}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabase.auth.session?.access_token || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmYm5nY3l2ZHpycmVieXVkYXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzI4NjgsImV4cCI6MjA4MDE0ODg2OH0.0CeeJt_9UD_R96vy2rhI-uhWH7dGa2IesSaB1YbiLmU'}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error:', errorText);
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Upload successful:', data);

      // Get public URL
      const publicUrl = `https://rfbngcyvdzrrebyudawo.supabase.co/storage/v1/object/public/KYC_Bucket/${filePath}`;
      
      console.log('Public URL:', publicUrl);
      return publicUrl;
      
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      if (!user) {
        setErrorMessage('Please login to submit KYC information');
        setIsLoading(false);
        return;
      }

      // Determine final bank name
      const finalBankName = selectedBank === 'Other' ? otherBankName.trim() : selectedBank;

      // Insert KYC data first
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_information')
        .insert({
          user_id: user.id,
          id_number: idNumber.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          date_of_birth: dateOfBirth.trim(),
          phone_number: phoneNumber.trim().replace(/\s/g, ''),
          address: address.trim(),
          bank_account_number: bankAccountNumber.trim(),
          bank_name: finalBankName,
          bav_status: 'pending',
          kyc_status: 'pending',
          phone_verified: false,
          phone_otp_attempts: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (kycError) {
        console.error('KYC insert error:', kycError);
        
        if (kycError.code === '23505') {
          setErrorMessage('You have already submitted KYC information');
        } else if (kycError.code === '42501') {
          setErrorMessage('Permission denied. Please contact support.');
        } else {
          setErrorMessage(`Failed to save KYC: ${kycError.message}`);
        }
        setIsLoading(false);
        return;
      }

      setKycRecordId(kycData.id);
      
      // Upload documents - ALL MUST SUCCEED
      setIsUploading(true);
      let uploadErrors = [];
      let idDocumentUrl = null;
      let proofOfAddressUrl = null;
      let selfieUrl = null;
      
      try {
        // Upload ID document
        idDocumentUrl = await uploadDocumentToSupabase(idDocument, 'id_document');
        console.log('ID Document uploaded:', idDocumentUrl);
      } catch (error) {
        uploadErrors.push('ID Document upload failed');
        console.error('ID Document upload failed:', error);
      }
      
      try {
        // Upload proof of address
        proofOfAddressUrl = await uploadDocumentToSupabase(proofOfAddress, 'proof_of_address');
        console.log('Proof of Address uploaded:', proofOfAddressUrl);
      } catch (error) {
        uploadErrors.push('Proof of Address upload failed');
        console.error('Proof of Address upload failed:', error);
      }
      
      try {
        // Upload selfie
        selfieUrl = await uploadDocumentToSupabase(selfie, 'selfie');
        console.log('Selfie uploaded:', selfieUrl);
      } catch (error) {
        uploadErrors.push('Selfie upload failed');
        console.error('Selfie upload failed:', error);
      }
      
      // Check if all uploads succeeded
      if (uploadErrors.length > 0) {
        setIsUploading(false);
        setIsLoading(false);
        setErrorMessage(`Upload failed: ${uploadErrors.join(', ')}. Please try again.`);
        return; // STOP HERE - don't proceed to OTP
      }
      
      // Update KYC record with document URLs
      const { error: updateError } = await supabase
        .from('kyc_information')
        .update({
          id_document_url: idDocumentUrl,
          proof_of_address_url: proofOfAddressUrl,
          selfie_url: selfieUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', kycData.id);
        
      if (updateError) {
        console.error('Failed to update document URLs:', updateError);
      }
      
      setIsUploading(false);
      
      // Only proceed to OTP if all uploads succeeded
      const otpResult = await triggerPhoneVerification(user.id, phoneNumber.trim().replace(/\s/g, ''));
      
      if (otpResult.success) {
        // Show OTP modal
        setShowOtpModal(true);
      } else {
        setErrorMessage('KYC submitted but phone verification failed. Please verify later.');
      }
      
    } catch (error: any) {
      console.error('Error submitting KYC:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerPhoneVerification = async (userId: string, phone: string) => {
    try {
      const API_URL = 'https://sjkixfkta8.us-east-1.awsapprunner.com/api/auth';
      
      const response = await fetch(`${API_URL}/send-phone-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          phone_number: phone
        }),
      });
      
      const data = await response.json();
      console.log('Phone verification response:', data);
      
      return data;
      
    } catch (error) {
      console.warn('Phone verification API call failed:', error);
      return { success: false, message: 'Network error' };
    }
  };

  const verifyOTP = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }
    
    setIsVerifyingOtp(true);
    setOtpError('');
    
    try {
      const API_URL = 'https://sjkixfkta8.us-east-1.awsapprunner.com/api/auth';
      
      const response = await fetch(`${API_URL}/verify-phone-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          otp_code: otpCode.trim()
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update KYC record with phone verified
        if (kycRecordId) {
          await supabase
            .from('kyc_information')
            .update({
              phone_verified: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', kycRecordId);
        }
        
      setOtpSuccess(true);

      setTimeout(() => {
        setShowOtpModal(false);
        setTimeout(() => {
          // Navigate to Dashboard instead of going back
          navigation.navigate('Dashboard');
        }, 2000);
      }, 2000);
        
      } else {
        setOtpError(data.message || 'Invalid OTP code');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setOtpError('Network error. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const resendOTP = async () => {
    if (!user || !phoneNumber) return;
    
    setIsVerifyingOtp(true);
    setOtpError('');
    
    try {
      const result = await triggerPhoneVerification(user.id, phoneNumber.trim().replace(/\s/g, ''));
      
      if (result.success) {
        setOtpError('✅ New OTP sent to your phone');
        setTimeout(() => setOtpError(''), 3000);
      } else {
        setOtpError(result.message || 'Failed to resend OTP');
      }
    } catch (error) {
      setOtpError('Failed to resend OTP');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const renderDocumentButton = (type: string, label: string, document: any) => {
    const isSelfie = type === DOCUMENT_TYPES.SELFIE;
    const iconName = isSelfie ? 'camera' : 'document-attach';
    
    return (
      <TouchableOpacity
        style={[styles.documentButton, document && styles.documentButtonSelected]}
        onPress={() => pickDocument(type)}
        disabled={isLoading || isUploading}
      >
        <Ionicons 
          name={iconName} 
          size={24} 
          color={document ? "#2AB576" : "#666"} 
        />
        <Text style={[
          styles.documentButtonText,
          document && styles.documentButtonTextSelected
        ]}>
          {document ? `${label} ✓` : label}
        </Text>
        {document && document.uri && isSelfie ? (
          <Image 
            source={{ uri: document.uri }} 
            style={styles.documentThumbnail}
          />
        ) : null}
      </TouchableOpacity>
    );
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
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {/* Title and Subtitle */}
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>KYC Verification</Text>
            <Text style={styles.subtitle}>Complete verification to start driving</Text>
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
                editable={!isLoading && !isUploading}
                placeholderTextColor="#999"
                maxLength={13}
                keyboardType="numeric"
              />
              <View style={styles.helperRow}>
                <Text style={[styles.inputHelper, dateError && styles.inputHelperError]}>
                  SA ID: 13 digits (e.g., 9001010000089)
                </Text>
              </View>
            </View>

            {/* First Name */}
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="First Name *"
                value={firstName}
                onChangeText={setFirstName}
                editable={!isLoading && !isUploading}
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
                editable={!isLoading && !isUploading}
                autoCapitalize="words"
                placeholderTextColor="#999"
              />
            </View>

            {/* Date of Birth */}
            <View style={[styles.inputContainer, dateError && styles.inputError]}>
              <Ionicons 
                name="calendar-outline" 
                size={20} 
                color={dateError ? "#FF6B6B" : "#666"} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Date of Birth (YYYY-MM-DD) *"
                value={dateOfBirth}
                onChangeText={(text) => {
                  setDateOfBirth(text);
                  if (text.trim()) {
                    validateDateFormat(text);
                  } else {
                    setDateError(false);
                  }
                }}
                editable={!isLoading && !isUploading}
                placeholderTextColor="#999"
                maxLength={10}
              />
              <View style={styles.helperRow}>
                <Text style={[styles.inputHelper, dateError && styles.inputHelperError]}>
                  Format: 1990-01-31
                </Text>
                {dateError && (
                  <Ionicons name="warning" size={16} color="#FF6B6B" />
                )}
              </View>
            </View>

            {/* Phone Number - FIXED */}
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number *"
                value={phoneNumber}
                onChangeText={formatPhoneNumber}
                editable={!isLoading && !isUploading}
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
              <View style={styles.helperRow}>
                <Text style={[styles.inputHelper, addressError && styles.inputHelperError]}>
                  e.g., +27 71 234 5678 or 0712345678
                </Text>
              </View>
            </View>

            {/* Address - FIXED */}
            <View style={[styles.inputContainer, styles.textAreaContainer, addressError && styles.inputError]}>
              <Ionicons 
                name="home-outline" 
                size={20} 
                color={addressError ? "#FF6B6B" : "#666"} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Full Residential Address *"
                value={address}
                onChangeText={(text) => {
                  setAddress(text);
                  if (text.trim()) {
                    validateAddress(text);
                  } else {
                    setAddressError(false);
                  }
                }}
                editable={!isLoading && !isUploading}
                multiline
                numberOfLines={3}
                placeholderTextColor="#999"
              />
              <View style={styles.helperRow}>
                <Text style={[styles.inputHelper, addressError && styles.inputHelperError]}>
                  Format: 123 Main Street, Johannesburg, 2001
                </Text>
                {addressError && (
                  <Ionicons name="warning" size={16} color="#FF6B6B" />
                )}
              </View>
            </View>

            {/* Bank Account Number */}
            <View style={styles.inputContainer}>
              <Ionicons name="card-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Bank Account Number *"
                value={bankAccountNumber}
                onChangeText={setBankAccountNumber}
                editable={!isLoading && !isUploading}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
              <View style={styles.helperRow}>
                <Text style={[styles.inputHelper, addressError && styles.inputHelperError]}>
                  e.g., 12345678901
                </Text>
              </View>
            </View>

            {/* Bank Name - Dropdown */}
            <View style={[styles.inputContainer, styles.pickerContainer]}>
              <Ionicons name="business-outline" size={20} color="#666" style={styles.inputIcon} />
              <RNPickerSelect
                onValueChange={(value) => setSelectedBank(value)}
                items={SOUTH_AFRICAN_BANKS}
                placeholder={{ label: 'Select Bank Name', value: '' }}
                style={{
                  inputIOS: styles.pickerInput,
                  inputAndroid: styles.pickerInput,
                  iconContainer: styles.pickerIconContainer,
                  placeholder: styles.pickerPlaceholder,
                }}
                value={selectedBank}
                useNativeAndroidPickerStyle={false}
                Icon={() => (
                  <Ionicons name="chevron-down" size={20} color="#666" style={styles.pickerChevron} />
                )}
                disabled={isLoading || isUploading}
              />
            </View>

            {/* Other Bank Input */}
            {selectedBank === 'Other' && (
              <View style={styles.inputContainer}>
                <Ionicons name="business-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Specify Bank Name *"
                  value={otherBankName}
                  onChangeText={setOtherBankName}
                  editable={!isLoading && !isUploading}
                  placeholderTextColor="#999"
                />
              </View>
            )}

            {/* Document Upload Section */}
            <View style={styles.documentsSection}>
              <Text style={styles.documentsTitle}>Upload Required Documents *</Text>
              
              {renderDocumentButton(DOCUMENT_TYPES.ID_DOCUMENT, 'ID Document', idDocument)}
              {renderDocumentButton(DOCUMENT_TYPES.PROOF_OF_ADDRESS, 'Proof of Address', proofOfAddress)}
              {renderDocumentButton(DOCUMENT_TYPES.SELFIE, 'Selfie Photo', selfie)}
              
              <Text style={styles.documentsNote}>
                • ID: Passport or SA ID card{'\n'}
                • Proof of Address: Utility bill or bank statement (last 3 months){'\n'}
                • Selfie: Clear photo of your face
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, (isLoading || isUploading) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading || isUploading}
            >
              {isLoading || isUploading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>
                    {isUploading ? 'Uploading Documents...' : 'Submit Verification'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* OTP Verification Modal */}
      <Modal
        visible={showOtpModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => !otpSuccess && setShowOtpModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={dismissKeyboard}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowOtpModal(false)}
              disabled={otpSuccess}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            
            <View style={styles.modalHeader}>
              <Ionicons name="phone-portrait" size={60} color="#2AB576" />
              <Text style={styles.modalTitle}>Verify Phone Number</Text>
              <Text style={styles.modalSubtitle}>
                Enter the 6-digit code sent to{'\n'}
                <Text style={styles.phoneNumberText}>{phoneNumber}</Text>
              </Text>
            </View>
            
            {otpError && (
              <View style={[
                styles.messageContainer, 
                otpError.includes('✅') ? styles.messageSuccess : styles.messageError
              ]}>
                <Ionicons 
                  name={otpError.includes('✅') ? "checkmark-circle" : "warning"} 
                  size={18} 
                  color={otpError.includes('✅') ? "#2AB576" : "#FF6B6B"} 
                />
                <Text style={[
                  styles.messageText,
                  { color: otpError.includes('✅') ? "#2AB576" : "#FF6B6B" }
                ]}>
                  {otpError}
                </Text>
              </View>
            )}
            
            {otpSuccess ? (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={80} color="#2AB576" />
                <Text style={styles.successTitle}>Verified!</Text>
                <Text style={styles.successText}>
                  Phone verification complete.{'\n'}
                  Returning to dashboard...
                </Text>
              </View>
            ) : (
              <>
                <TextInput
                  style={styles.otpInput}
                  placeholder="Enter 6-digit OTP"
                  value={otpCode}
                  onChangeText={(text) => {
                    setOtpCode(text.replace(/[^0-9]/g, ''));
                    setOtpError('');
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!isVerifyingOtp}
                  placeholderTextColor="#999"
                  onSubmitEditing={dismissKeyboard}
                  blurOnSubmit={false}
                />
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={resendOTP}
                    disabled={isVerifyingOtp}
                  >
                    <Ionicons name="refresh" size={18} color="#2AB576" />
                    <Text style={styles.resendButtonText}>Resend Code</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.verifyButton, (!otpCode || otpCode.length !== 6) && styles.verifyButtonDisabled]}
                    onPress={verifyOTP}
                    disabled={!otpCode || otpCode.length !== 6 || isVerifyingOtp}
                  >
                    {isVerifyingOtp ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                        <Text style={styles.verifyButtonText}>Verify</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
  header: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  backButton: {
    padding: 4,
  },
  headerTextContainer: {
    marginBottom: 30,
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
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    overflow: 'hidden',
  },
  inputError: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  textAreaContainer: {
    height: 120,
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
  helperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingLeft: 48,
  },
  inputHelper: {
    fontSize: 12,
    color: '#999',
  },
  inputHelperError: {
    color: '#FF6B6B',
  },
  pickerContainer: {
    height: 56,
    justifyContent: 'center',
  },
  pickerInput: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 16,
    paddingLeft: 48,
    paddingRight: 40,
  },
  pickerIconContainer: {
    right: 16,
    top: 18,
  },
  pickerPlaceholder: {
    color: '#999',
  },
  pickerChevron: {
    marginRight: 10,
  },
  // Document Styles
  documentsSection: {
    marginBottom: 24,
  },
  documentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    position: 'relative',
  },
  documentButtonSelected: {
    backgroundColor: '#F0F9F4',
    borderColor: '#2AB576',
  },
  documentButtonText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  documentButtonTextSelected: {
    color: '#2AB576',
    fontWeight: '500',
  },
  documentThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginLeft: 10,
  },
  documentsNote: {
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
    marginTop: 8,
  },
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    position: 'relative',
    marginTop: 20,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  phoneNumberText: {
    fontWeight: '600',
    color: '#2AB576',
  },
  otpInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    color: '#2AB576',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  verifyButton: {
    backgroundColor: '#2AB576',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 120,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2AB576',
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});