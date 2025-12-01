import React from "react";
import { View, Text, StyleSheet, Platform, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface TopBarProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
}

export default function TopBar({
  title = "Driver",
  subtitle = "Welcome back,",
  showBackButton = false,
}: TopBarProps) {
  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <Text style={styles.title}>{title}</Text>
          </View>
          
          {/* Right side placeholder for notification/avatar */}
          <View style={styles.rightContainer}>
            <View style={styles.avatarPlaceholder} />
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
  rightContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
});