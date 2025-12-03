import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import TopBar from "../../components/TopBar";
import BottomNav from "../../components/BottomNav";
import { Ionicons } from "@expo/vector-icons";

export default function BuyScreen() {
  const [selectedTab, setSelectedTab] = useState("me");
  const [phone, setPhone] = useState("");

  // Logic for field visibility
  const showBundleType =
    selectedTab === "me" || (selectedTab === "other" && phone.length >= 10);

  const showSelectBundle = showBundleType;

  const showNetwork =
    selectedTab === "me" || (selectedTab === "other" && phone.length >= 10);

  return (
    <View style={styles.container}>
      <TopBar title="Buy" subtitle="Airtime, data & bundles" showBackButton />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* FOR ME */}
        <TouchableOpacity
          style={[
            styles.card,
            selectedTab === "me" && styles.cardActive,
          ]}
          onPress={() => setSelectedTab("me")}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>For me</Text>
            <Text style={styles.numberTag}>0712345678</Text>
          </View>
          <Text style={styles.cardSubText}>
            Buy airtime, data and other bundles
          </Text>
        </TouchableOpacity>

        {/* FOR SOMEONE ELSE */}
        <TouchableOpacity
          style={[
            styles.card,
            selectedTab === "other" && styles.cardActive,
          ]}
          onPress={() => setSelectedTab("other")}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>For someone else</Text>

            <TouchableOpacity style={styles.buyBtnSmall}>
              <Text style={styles.buyBtnSmallText}>Buy</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardSubText}>Buy for another number</Text>
        </TouchableOpacity>

        {/* PHONE NUMBER (only for someone else) */}
        {selectedTab === "other" && (
          <View style={styles.inputBox}>
            <TextInput
              style={styles.inputText}
              placeholder="Phone number"
              placeholderTextColor="#9b9b9b"
              keyboardType="numeric"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        )}

        {/* BUNDLE TYPE */}
        {showBundleType && (
          <View style={styles.dropdown}>
            <Text style={styles.dropdownText}>Bundle type</Text>
            <Ionicons name="chevron-down" size={18} color="#9b9b9b" />
          </View>
        )}

        {/* SELECT BUNDLE */}
        {showSelectBundle && (
          <View style={styles.dropdown}>
            <Text style={styles.dropdownText}>Select bundle</Text>
            <Ionicons name="chevron-down" size={18} color="#9b9b9b" />
          </View>
        )}

        {/* MOBILE NETWORK */}
        {showNetwork && (
          <View style={styles.dropdown}>
            <Text style={styles.dropdownText}>Mobile network</Text>
            <Ionicons name="chevron-down" size={18} color="#9b9b9b" />
          </View>
        )}

        {/* BUY BUTTON */}
        <TouchableOpacity style={styles.buyBtn}>
          <Text style={styles.buyText}>Buy</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 140 },

  /* CARDS */
  card: {
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  cardActive: {
    borderColor: "#2AB576",
    backgroundColor: "#E8F8F0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    color: "#2AB576",
    fontWeight: "600",
    fontSize: 14,
  },
  numberTag: {
    backgroundColor: "#2AB576",
    color: "#fff",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    fontSize: 12,
  },
  cardSubText: {
    marginTop: 5,
    color: "#8A8A8A",
    fontSize: 13,
  },

  buyBtnSmall: {
    backgroundColor: "#2AB576",
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  buyBtnSmallText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  /* INPUT */
  inputBox: {
    borderWidth: 1,
    borderColor: "#D9D9D9",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  inputText: {
    fontSize: 14,
    color: "#000",
  },

  /* DROPDOWNS */
  dropdown: {
    borderWidth: 1,
    borderColor: "#D9D9D9",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    color: "#7A7A7A",
    fontSize: 14,
  },

  /* BUY BUTTON */
  buyBtn: {
    backgroundColor: "#2AB576",
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  buyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
