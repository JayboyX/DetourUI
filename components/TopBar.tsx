import React from "react";
import { View, Text, StyleSheet, Platform, StatusBar, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../src/contexts/AuthContext"; // Updated path

interface TopBarProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
}

export default function TopBar({
  title,
  subtitle = "Welcome back,",
  showBackButton = false,
}: TopBarProps) {
  const { user } = useAuth();

  // Get first letter of first name for avatar fallback
  const getInitials = () => {
    if (!user?.full_name) return "D"; // Default to "D" for Driver
    
    const names = user.full_name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    // Get first letter of first name
    return names[0].charAt(0).toUpperCase();
  };

  // Get driver's first name for greeting
  const getFirstName = () => {
    if (!user?.full_name) return "Driver";
    
    const names = user.full_name.trim().split(' ');
    return names[0];
  };

  // Use provided title or get first name
  const displayTitle = title || getFirstName();

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <Text style={styles.title}>{displayTitle}</Text>
          </View>
          
          {/* Profile Avatar */}
          <View style={styles.avatarContainer}>
            {user?.profile_photo_url ? (
              <Image
                source={{ uri: user.profile_photo_url }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{getInitials()}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#2AB576",
  },
  container: {
    backgroundColor: "#2AB576",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 15,
    paddingBottom: 25,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "400",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 2,
  },
  avatarContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});