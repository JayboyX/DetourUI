// src/screens/DashboardScreen.tsx - UPDATED WITH AUTO REFRESH
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import TopBar from "../../components/TopBar";
import BottomNav from "../../components/BottomNav";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function DashboardScreen() {
  const { user, isLoading, signOut } = useAuth();
  const navigation = useNavigation();
  const [kycData, setKycData] = useState(null);
  const [isLoadingKYC, setIsLoadingKYC] = useState(true);

  // Fetch KYC status function
  const fetchKYCStatus = async () => {
    try {
      if (!user) {
        setIsLoadingKYC(false);
        return;
      }
      
      setIsLoadingKYC(true);
      const { data, error } = await supabase
        .from('kyc_information')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setKycData(data);
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    } finally {
      setIsLoadingKYC(false);
    }
  };

  // Fetch on initial load
  useEffect(() => {
    if (user) {
      fetchKYCStatus();
    }
  }, [user]);

  // Fetch when screen comes into focus (after returning from KYC)
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchKYCStatus();
      }
      
      // Optional: Add a small delay to ensure data is updated
      const refreshTimer = setTimeout(() => {
        if (user) {
          fetchKYCStatus();
        }
      }, 500);
      
      return () => clearTimeout(refreshTimer);
    }, [user])
  );

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          }
        }
      ]
    );
  };

  const handleKYCAction = () => {
    if (kycData) {
      // If KYC exists but not verified, show status
      if (kycData.kyc_status !== 'verified') {
        Alert.alert(
          "KYC Status",
          `Your KYC is currently ${kycData.kyc_status}. Verification typically takes 24-48 hours.`,
          [{ text: "OK" }]
        );
      }
    } else {
      // No KYC data, navigate to KYC screen
      navigation.navigate('KYC');
    }
  };

  const isKYCVerified = () => {
    return kycData && kycData.kyc_status === 'verified';
  };

  const getKYCStatusText = () => {
    if (!kycData) return "Not Submitted";
    
    switch (kycData.kyc_status) {
      case 'verified': return 'Verified';
      case 'pending': return 'Under Review';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getKYCStatusColor = () => {
    if (!kycData) return "#666";
    
    switch (kycData.kyc_status) {
      case 'verified': return "#2AB576";
      case 'pending': return "#FFA500";
      case 'rejected': return "#FF6B6B";
      default: return "#666";
    }
  };

  if (isLoading || isLoadingKYC) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2AB576" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>Welcome to Detour</Text>
          <Text style={styles.authSubtitle}>Please sign in to access your dashboard</Text>
          <TouchableOpacity 
            style={styles.authButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.authButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
        <BottomNav />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />
      
      <View style={styles.content}>
        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome</Text>
          <Text style={styles.userName}>{user.full_name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          
          {/* Email Verification Status */}
          {!user.email_verified && (
            <View style={styles.verifyContainer}>
              <Text style={styles.verifyText}>
                ⚠️ Please verify your email address
              </Text>
            </View>
          )}
        </View>

        {/* KYC Status Display */}
        <View style={styles.kycStatusContainer}>
          <Text style={styles.kycStatusLabel}>KYC Status:</Text>
          <View style={[styles.kycStatusBadge, { backgroundColor: getKYCStatusColor() + '20' }]}>
            <Text style={[styles.kycStatusText, { color: getKYCStatusColor() }]}>
              {getKYCStatusText()}
            </Text>
          </View>
        </View>

        {/* KYC Button - Only show if not verified */}
        {!isKYCVerified() && (
          <TouchableOpacity 
            style={styles.kycButton}
            onPress={handleKYCAction}
          >
            <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
            <Text style={styles.kycButtonText}>
              {kycData ? 'Check KYC Status' : 'Complete KYC Verification'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Verified KYC Message */}
        {isKYCVerified() && (
          <View style={styles.verifiedContainer}>
            <Ionicons name="checkmark-circle" size={48} color="#2AB576" />
            <Text style={styles.verifiedTitle}>KYC Verified</Text>
            <Text style={styles.verifiedText}>
              Your identity verification is complete. You're ready to start driving!
            </Text>
          </View>
        )}

        {/* Sign Out Button */}
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  authContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  authSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  authButton: {
    backgroundColor: "#2AB576",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  authButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  welcomeContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  verifyContainer: {
    backgroundColor: "#FFF5E8",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  verifyText: {
    color: "#FFA500",
    fontSize: 14,
    fontWeight: "500",
  },
  kycStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    minWidth: 200,
    justifyContent: "center",
  },
  kycStatusLabel: {
    fontSize: 16,
    color: "#666",
    marginRight: 12,
    fontWeight: "500",
  },
  kycStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  kycStatusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  kycButton: {
    backgroundColor: "#2AB576",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
    width: "100%",
    maxWidth: 300,
  },
  kycButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  verifiedContainer: {
    alignItems: "center",
    backgroundColor: "#F0F9F4",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    width: "100%",
    maxWidth: 300,
    borderWidth: 1,
    borderColor: "#E8FFED",
  },
  verifiedTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2AB576",
    marginTop: 12,
    marginBottom: 8,
  },
  verifiedText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  signOutButton: {
    backgroundColor: "#FFE8E8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: "100%",
    maxWidth: 200,
  },
  signOutText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});