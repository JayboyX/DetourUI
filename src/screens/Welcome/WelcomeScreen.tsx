import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      {/* Heading */}
      <View style={styles.textBox}>
        <Text style={styles.heading}>
          Welcome to{"\n"}
          <Text style={styles.detour}>Detour </Text>
          <Text style={styles.playIcon}>▶</Text>
          {"\n"}Drive
        </Text>
      </View>

      {/* Button */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.startText}>Let's start</Text>
      </TouchableOpacity>

      {/* Register */}
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Don’t have account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.registerBtn}>Register Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // black background instead of image
    justifyContent: "space-between",
    paddingVertical: 80,
    paddingHorizontal: 25,
  },

  textBox: {
    marginTop: 80,
  },

  heading: {
    fontSize: 36,
    fontWeight: "700",
    lineHeight: 42,
    color: "#fff",
  },

  detour: {
    color: "#31D843",
    fontWeight: "800",
  },

  playIcon: {
    color: "#31D843",
    fontWeight: "800",
  },

  startButton: {
    backgroundColor: "#fff",
    borderRadius: 35,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#31D843",
    marginTop: 40,
  },

  startText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  footerText: {
    color: "#fff",
    fontSize: 14,
    marginRight: 6,
  },

  registerBtn: {
    color: "#31D843",
    fontSize: 14,
    fontWeight: "700",
  },
});
