// components/TopBar.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../src/contexts/AuthContext";

interface TopBarProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backgroundColor?: string;
}

export default function TopBar({
  title,
  subtitle,
  showBackButton = false,
  backgroundColor,
}: TopBarProps) {
  const { user } = useAuth();
  const navigation = useNavigation();

  const getInitials = () => {
    if (!user?.full_name) return "D";
    return user.full_name.split(" ")[0].charAt(0).toUpperCase();
  };

  const getFirstName = () => {
    if (!user?.full_name) return "Driver";
    return user.full_name.split(" ")[0];
  };

  // Determine dashboard mode
  const isDashboard = !title && !subtitle && user;

  // Title + subtitle logic
  const displayTitle = title || (isDashboard ? getFirstName() : "");
  const displaySubtitle = subtitle || (isDashboard ? "Welcome back" : "");

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  // Determine background color
  const bgColor = backgroundColor || (isDashboard ? "#2AB576" : "#FFFFFF");

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: bgColor }]}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: bgColor },
        ]}
      >
        <View style={styles.row}>
          {/* BACK BUTTON */}
          {showBackButton && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={26} color={isDashboard ? "#FFF" : "#000"} />
            </TouchableOpacity>
          )}

          {/* TEXT AREA */}
          <View
            style={[
              styles.textContainer,
              { marginLeft: showBackButton ? 10 : 0 },
            ]}
          >
            {/* Non-dashboard TITLE */}
            {!isDashboard && title && (
              <Text style={[styles.title, { color: "#000" }]}>
                {displayTitle}
              </Text>
            )}

            {/* Subtitle */}
            {displaySubtitle !== "" && (
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: isDashboard
                      ? "rgba(255,255,255,0.9)"
                      : "#555",
                  },
                ]}
              >
                {displaySubtitle}
              </Text>
            )}

            {/* Dashboard: subtitle THEN title */}
            {isDashboard && (
              <Text style={[styles.title, { color: "#FFF" }]}>
                {displayTitle}
              </Text>
            )}
          </View>

          {/* Avatar only shown on Dashboard */}
          {isDashboard ? (
            <View style={styles.avatarContainer}>
              {user?.profile_photo_url ? (
                <Image
                  source={{ uri: user.profile_photo_url }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>{getInitials()}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    width: "100%",
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 8 : 14,
    paddingBottom: 20,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 30,
    justifyContent: "center",
  },

  textContainer: {
    flex: 1,
  },

  subtitle: {
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 2,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
  },

  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
  },
});