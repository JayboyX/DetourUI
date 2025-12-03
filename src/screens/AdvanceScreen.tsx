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

export default function AdvanceScreen() {
  const [type, setType] = useState("fuel");
  const [amount, setAmount] = useState("500");

  const quickAmounts = ["100", "200", "300", "500"];

  return (
    <View style={styles.container}>
      <TopBar
        title="Advance"
        subtitle="Request fuel or cash"
        showBackButton={true}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* AVAILABLE ADVANCE */}
        <View style={styles.availableCard}>
          <Text style={styles.availableLabel}>Available Advance</Text>
          <Text style={styles.availableAmount}>R 500.00</Text>
          <Text style={styles.availableSub}>Available Advance</Text>
        </View>

        {/* ADVANCE TYPE */}
        <Text style={styles.sectionTitle}>Advance Type</Text>

        <View style={styles.typeRow}>
          {/* FUEL */}
          <TouchableOpacity
            onPress={() => setType("fuel")}
            style={[
              styles.typeButton,
              type === "fuel" && styles.typeButtonActive,
            ]}
          >
            <Ionicons
              name="car-outline"
              size={28}
              color={type === "fuel" ? "#fff" : "#000"}
              style={{ marginBottom: 6 }}
            />
            <Text
              style={[
                styles.typeText,
                type === "fuel" && styles.typeTextActive,
              ]}
            >
              Fuel
            </Text>
          </TouchableOpacity>

          {/* CASH */}
          <TouchableOpacity
            onPress={() => setType("cash")}
            style={[
              styles.typeButton,
              type === "cash" && styles.typeButtonActive,
            ]}
          >
            <Ionicons
              name="cash-outline"
              size={28}
              color={type === "cash" ? "#fff" : "#000"}
              style={{ marginBottom: 6 }}
            />
            <Text
              style={[
                styles.typeText,
                type === "cash" && styles.typeTextActive,
              ]}
            >
              Cash
            </Text>
          </TouchableOpacity>
        </View>

        {/* AMOUNT */}
        <Text style={styles.sectionTitle}>Amount</Text>

        <View style={styles.inputBox}>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        {/* QUICK SELECT */}
        <View style={styles.chipRow}>
          {quickAmounts.map((a, index) => (
            <TouchableOpacity
              key={index}
              style={styles.chip}
              onPress={() => setAmount(a)}
            >
              <Text style={styles.chipText}>R{a}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* INFO BANNER */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color="#B48300" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.infoTitle}>0% Interest</Text>
            <Text style={styles.infoDesc}>
              Clear fees, no hidden interest. Repayment deducted from your
              weekly earnings.
            </Text>
          </View>
        </View>

        {/* HOW IT WORKS */}
        <Text style={styles.sectionTitle}>How it works</Text>

        <View style={styles.howCard}>
          <View style={styles.howItem}>
            <View style={styles.howNumber}>
              <Text style={styles.howNumberText}>1</Text>
            </View>
            <View style={styles.howContent}>
              <Text style={styles.howTitle}>Request advance</Text>
              <Text style={styles.howDesc}>
                Choose fuel or cash based on your needs
              </Text>
            </View>
          </View>

          <View style={styles.howItem}>
            <View style={styles.howNumber}>
              <Text style={styles.howNumberText}>2</Text>
            </View>
            <View style={styles.howContent}>
              <Text style={styles.howTitle}>Get approved instantly</Text>
              <Text style={styles.howDesc}>
                Based on your driving activity and history
              </Text>
            </View>
          </View>

          <View style={styles.howItem}>
            <View style={styles.howNumber}>
              <Text style={styles.howNumberText}>3</Text>
            </View>
            <View style={styles.howContent}>
              <Text style={styles.howTitle}>Auto repayment</Text>
              <Text style={styles.howDesc}>
                Deducted from your weekly earnings automatically
              </Text>
            </View>
          </View>
        </View>

        {/* BUTTON */}
        <TouchableOpacity style={styles.requestBtn}>
          <Text style={styles.requestText}>Request R{amount} Advance</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  content: { padding: 20, paddingBottom: 140 },

  /* AVAILABLE CARD */
  availableCard: {
    backgroundColor: "#2AB576",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  availableLabel: { color: "#FFF", fontSize: 14, opacity: 0.9 },
  availableAmount: {
    color: "#FFF",
    fontSize: 40,
    fontWeight: "800",
    marginVertical: 6,
  },
  availableSub: { color: "#FFF", opacity: 0.9 },

  /* SECTION */
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 10,
    color: "#000",
  },

  /* ADVANCE TYPE */
  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  typeButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#D9D9D9",
    backgroundColor: "#FFF",
    paddingVertical: 22,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  typeButtonActive: {
    backgroundColor: "#2AB576",
    borderColor: "#2AB576",
  },

  typeText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },

  typeTextActive: {
    color: "#FFF",
  },

  /* AMOUNT INPUT */
  inputBox: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#DDD",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: "800",
    paddingVertical: 12,
  },

  /* CHIPS */
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  chip: {
    backgroundColor: "#EEE",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
  },

  /* INFO BANNER */
  infoBanner: {
    backgroundColor: "#FFF7D9",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  infoTitle: { color: "#B48300", fontWeight: "700", fontSize: 14 },
  infoDesc: {
    color: "#B48300",
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },

  /* HOW IT WORKS CARD */
  howCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },

  howItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  howNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E5F0FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  howNumberText: {
    color: "#0A4AAA",
    fontWeight: "700",
    fontSize: 15,
  },

  howContent: { flex: 1 },

  howTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },

  howDesc: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
    marginTop: 2,
  },

  /* REQUEST BUTTON */
  requestBtn: {
    marginTop: 14,
    backgroundColor: "#2AB576",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  requestText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
});
