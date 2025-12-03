import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function BottomNav() {
  const navigation = useNavigation();
  const route = useRoute();

  const navItems = [
    { name: "Home", icon: "home-outline", screen: "Dashboard" },
    { name: "Advance", icon: "speedometer-outline", screen: "Advance" },
    { name: "Wallet", icon: "wallet-outline", screen: "Wallet" },
    { name: "Rewards", icon: "gift-outline", screen: "Rewards" },
    { name: "Profile", icon: "person-outline", screen: "Profile" },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item, index) => {
        const isActive = route.name === item.screen;

        return (
          <TouchableOpacity
            key={index}
            style={styles.navItem}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.icon}
              size={22}
              color={isActive ? "#2AB576" : "#666"}
            />
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: Platform.OS === "ios" ? 85 : 75,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
    marginTop: 4,
  },
  activeLabel: {
    color: "#2AB576",
    fontWeight: "700",
  },
});
