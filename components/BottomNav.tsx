import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";

type NavItem = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen?: string;
  isActive?: boolean;
};

export default function BottomNav() {
  const navigation = useNavigation<NavigationProp<any>>();

  const navItems: NavItem[] = [
    { name: "Home", icon: "home-outline", screen: "Dashboard", isActive: true },
    { name: "Advance", icon: "speedometer-outline" },
    { name: "Wallet", icon: "wallet-outline" },
    { name: "Rewards", icon: "gift-outline" },
    { name: "Profile", icon: "person-outline" },
  ];

  const handlePress = (item: NavItem) => {
    if (item.screen) {
      navigation.navigate(item.screen);
    }
  };

  return (
    <View style={styles.container}>
      {navItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.navItem}
          onPress={() => handlePress(item)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={item.icon}
            size={22}
            color={item.isActive ? "#2AB576" : "#666"}
          />
          <Text style={[styles.label, item.isActive && styles.activeLabel]}>
            {item.name}
          </Text>
        </TouchableOpacity>
      ))}
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
    fontWeight: "600",
  },
});