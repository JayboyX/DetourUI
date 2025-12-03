import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import TopBar from "../../components/TopBar";
import BottomNav from "../../components/BottomNav";
import { Ionicons } from "@expo/vector-icons";

export default function StatementsScreen() {
  const [filter, setFilter] = useState("all");
  const [month, setMonth] = useState("All");

  // Mock transactions for example
  const transactions = [
    { id: 1, title: "Health & Safety", date: "20 Nov 2025", amount: 300 },
    { id: 2, title: "Advance Repayment", date: "19 Nov 2025", amount: -150 },
    { id: 3, title: "Reward Bonus", date: "18 Nov 2025", amount: 200 },
    { id: 4, title: "Health & Safety", date: "16 Nov 2025", amount: 300 },
    { id: 5, title: "Fuel Advance", date: "14 Nov 2025", amount: -500 },
  ];

  const months = ["All", "Nov 2025", "Oct 2025", "Sep 2025"];

  // Filtering logic
  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "deposit" && tx.amount < 0) return false;
    if (filter === "withdrawal" && tx.amount > 0) return false;
    if (month !== "All" && !tx.date.includes(month.split(" ")[0])) return false;
    return true;
  });

  return (
    <View style={styles.container}>
      <TopBar title="Statements" subtitle="Full transaction history" showBackButton />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* FILTER SECTION */}
        <Text style={styles.sectionTitle}>Filters</Text>

        {/* FILTER BUTTONS */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterBtn, filter === "all" && styles.filterBtnActive]}
            onPress={() => setFilter("all")}
          >
            <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterBtn,
              filter === "deposit" && styles.filterBtnActive,
            ]}
            onPress={() => setFilter("deposit")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "deposit" && styles.filterTextActive,
              ]}
            >
              Deposits
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterBtn,
              filter === "withdrawal" && styles.filterBtnActive,
            ]}
            onPress={() => setFilter("withdrawal")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "withdrawal" && styles.filterTextActive,
              ]}
            >
              Withdrawals
            </Text>
          </TouchableOpacity>
        </View>

        {/* MONTH FILTER */}
        <View style={styles.dropdown}>
          <Text style={styles.dropdownText}>Month: {month}</Text>
          <Ionicons name="chevron-down" size={20} color="#9b9b9b" />
        </View>

        {/* MONTH OPTIONS LIST */}
        <View style={{ marginBottom: 16 }}>
          {months.map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.monthOption,
                month === m && styles.monthOptionActive,
              ]}
              onPress={() => setMonth(m)}
            >
              <Text
                style={[
                  styles.monthText,
                  month === m && styles.monthTextActive,
                ]}
              >
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* STATEMENT LIST */}
        <Text style={styles.sectionTitle}>Transactions</Text>

        {filteredTransactions.map((tx) => (
          <View key={tx.id} style={styles.txCard}>
            <Ionicons
              name={tx.amount > 0 ? "arrow-up" : "arrow-down"}
              size={22}
              color={tx.amount > 0 ? "#2AB576" : "#D9534F"}
              style={{ marginRight: 10 }}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.txTitle}>{tx.title}</Text>
              <Text style={styles.txDate}>{tx.date}</Text>
            </View>

            <Text
              style={[
                styles.txAmount,
                { color: tx.amount > 0 ? "#2AB576" : "#D9534F" },
              ]}
            >
              {tx.amount > 0 ? `+R ${tx.amount}` : `R ${Math.abs(tx.amount)}`}
            </Text>
          </View>
        ))}

        {/* DOWNLOAD STATEMENT */}
        <TouchableOpacity style={styles.downloadBtn}>
          <Ionicons name="download-outline" size={18} color="#fff" />
          <Text style={styles.downloadText}>Download Monthly PDF</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  content: { paddingHorizontal: 20, paddingBottom: 140 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 15,
    marginBottom: 10,
  },

  /* FILTER BUTTONS */
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DADADA",
    marginRight: 8,
    alignItems: "center",
  },
  filterBtnActive: {
    backgroundColor: "#2AB576",
    borderColor: "#2AB576",
  },
  filterText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#fff",
  },

  /* MONTH DROPDOWN */
  dropdown: {
    borderWidth: 1,
    borderColor: "#E4E4E4",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dropdownText: { fontSize: 14, color: "#555" },

  monthOption: {
    paddingVertical: 8,
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  monthOptionActive: {
    backgroundColor: "#2AB57633",
  },
  monthText: { fontSize: 14, color: "#444" },
  monthTextActive: { color: "#2AB576", fontWeight: "700" },

  /* TRANSACTION CARDS */
  txCard: {
    flexDirection: "row",
    padding: 14,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  txTitle: { fontSize: 15, color: "#111827", fontWeight: "600" },
  txDate: { fontSize: 12, color: "#6B7280" },
  txAmount: { fontSize: 15, fontWeight: "700" },

  /* DOWNLOAD BUTTON */
  downloadBtn: {
    marginTop: 16,
    backgroundColor: "#2AB576",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  downloadText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
});

