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

export default function WalletScreen({ navigation }) {
  // Mock transactions (30 max)
  const allTransactions = [
    ...Array(30).keys(),
  ].map((i) => ({
    id: i + 1,
    title: "Health & Safety",
    date: "20 Nov 2025",
    amount: i % 2 === 0 ? 300 : -150,
  }));

  const [visibleCount, setVisibleCount] = useState(5);

  const visibleTransactions = allTransactions.slice(0, visibleCount);

  const handleLoadMore = () => {
    if (visibleCount < 30) {
      setVisibleCount((prev) => prev + 5);
    }
  };

  return (
        <View style={styles.container}>
          <TopBar
            title="Rewards"
            subtitle="Earn & redeem your points"
            showBackButton={true}
          />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* BALANCE CARD */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>R 0.00</Text>

          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceSubLabel}>Total Advanced</Text>
              <Text style={styles.balanceSubAmount}>R 0.00</Text>
            </View>

            <View>
              <Text style={styles.balanceSubLabel}>Total Repaid</Text>
              <Text style={styles.balanceSubAmount}>R 0.00</Text>
            </View>
          </View>
        </View>

        {/* TWO INFO CARDS */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Ionicons
              name="arrow-up-circle"
              size={26}
              color="#2AB576"
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.infoLabel}>This Week</Text>
            <Text style={styles.infoAmount}>R 0.00</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons
              name="arrow-down-circle"
              size={26}
              color="#D9534F"
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.infoLabel}>Next Payment</Text>
            <Text style={styles.infoAmount}>R 0.00</Text>
          </View>
        </View>

        {/* RECENT TRANSACTIONS */}
        <Text style={styles.recentTitle}>Recent Transactions</Text>

        {visibleTransactions.map((tx) => (
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
              {tx.amount > 0 ? `+R ${tx.amount}` : `R ${tx.amount}`}
            </Text>
          </View>
        ))}

        {/* LOAD MORE */}
        {visibleCount < 30 && (
          <TouchableOpacity style={styles.loadMoreBtn} onPress={handleLoadMore}>
            <Text style={styles.loadMoreText}>View more</Text>
          </TouchableOpacity>
        )}

        {/* VIEW STATEMENTS */}
        <TouchableOpacity
          style={styles.statementBtn}
          onPress={() => navigation.navigate("StatementsScreen")}
        >
          <Text style={styles.statementBtnText}>View All Statements</Text>
        </TouchableOpacity>

                {/* PROMO BANNER */}
                <View style={styles.bannerWrapper}>
                  <View style={styles.bannerLeftAccent} />
                  <View style={styles.bannerCard}>
                    <Text style={styles.bannerTitle}>Free South African Wallet</Text>
                    <Text style={styles.bannerSubtitle}>
                      Your Detour wallet is a free local bank account where you can manage
            advances, repayments and rewards.
                    </Text>
                  </View>
                </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },

  content: { paddingHorizontal: 20, paddingBottom: 140 },

  /* BALANCE */
  balanceCard: {
    backgroundColor: "#0F172A",
    padding: 20,
    borderRadius: 14,
    marginTop: 10,
    marginBottom: 16,
  },
  balanceLabel: { color: "#C9D1D9", fontSize: 14 },
  balanceAmount: { color: "#FFF", fontSize: 40, fontWeight: "800" },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#334155",
    paddingTop: 12,
  },
  balanceSubLabel: {
    color: "#9CA3AF",
    fontSize: 12,
    marginBottom: 2,
  },
  balanceSubAmount: { color: "#FFF", fontSize: 14, fontWeight: "600" },

  /* INFO CARDS */
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  infoCard: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 20,
    alignItems: "center",
  },
  infoLabel: { color: "#6B7280", fontSize: 14 },
  infoAmount: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "700",
  },

  /* TRANSACTIONS */
  recentTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 15,
    marginBottom: 12,
  },

  txCard: {
    flexDirection: "row",
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  txTitle: { fontSize: 15, color: "#111827", fontWeight: "600" },
  txDate: { fontSize: 12, color: "#6B7280" },
  txAmount: { fontSize: 15, fontWeight: "700" },

  loadMoreBtn: {
    paddingVertical: 10,
    alignItems: "center",
  },
  loadMoreText: {
    color: "#2AB576",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  /* STATEMENTS */
  statementBtn: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#2AB576",
  },
  statementBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

    /* PROMO BANNER */
  bannerWrapper: {
    flexDirection: "row",
    marginTop: 22,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1.4,
    borderColor: "#B4D4FF",
    overflow: "hidden",
  },
  bannerLeftAccent: {
    width: 12,
    backgroundColor: "#0A4AAA",
  },
  bannerCard: {
    flex: 1,
    backgroundColor: "#E7F3FF",
    padding: 16,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0A4AAA",
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "#0A4AAA",
    marginTop: 4,
    lineHeight: 18,
  },
});

