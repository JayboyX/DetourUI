import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import TopBar from "../../components/TopBar";
import BottomNav from "../../components/BottomNav";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/contexts/AuthContext";

// ✅ Same style as Subscription — using process.env
const INTERNAL_API = process.env.EXPO_PUBLIC_API_BASE_URL;      // internal balance API
const EXTERNAL_API = process.env.EXPO_PUBLIC_EXTERNAL_API;      // wallet + transactions API

export default function WalletScreen({ navigation }) {
  const { user } = useAuth();

  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [thisWeekIncome, setThisWeekIncome] = useState(0);
  const [nextPayment, setNextPayment] = useState(0);
  const [loading, setLoading] = useState(true);

  // Debug logs
  console.log("INTERNAL_API =", INTERNAL_API);
  console.log("EXTERNAL_API =", EXTERNAL_API);
  console.log("USER =", user?.id);

  // -----------------------------
  // Helper: Get current week boundaries (Friday 01:00 to next Friday 01:00)
  // Using Africa/Johannesburg timezone
  // -----------------------------
  const getCurrentWeekBoundaries = () => {
    const now = new Date();
    
    // Convert to Africa/Johannesburg time (UTC+2)
    const jhbOffset = 2; // Africa/Johannesburg is UTC+2
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const jhbNow = new Date(utc + (3600000 * jhbOffset));
    
    const currentDay = jhbNow.getDay(); // 0 = Sunday, 5 = Friday
    const currentHour = jhbNow.getHours();
    const currentMinutes = jhbNow.getMinutes();
    
    // Find the most recent Friday at 01:00
    const lastFriday = new Date(jhbNow);
    
    // Calculate days to subtract to get to last Friday
    let daysToSubtract = currentDay - 5; // 5 = Friday
    
    // If it's Friday but before 01:00, go back 7 days
    if (daysToSubtract === 0 && (currentHour < 1 || (currentHour === 1 && currentMinutes < 0))) {
      daysToSubtract = -7;
    } 
    // If it's not Friday yet (or it's Friday after 01:00 but not the right calculation)
    else if (daysToSubtract < 0) {
      daysToSubtract += 7;
    } else if (daysToSubtract > 0) {
      // This shouldn't happen with day 0-6, but just in case
      daysToSubtract -= 7;
    }
    
    lastFriday.setDate(jhbNow.getDate() - daysToSubtract);
    lastFriday.setHours(1, 0, 0, 0); // Set to 01:00
    
    // Next Friday at 01:00
    const nextFriday = new Date(lastFriday);
    nextFriday.setDate(lastFriday.getDate() + 7);
    
    console.log("Current JHB time:", jhbNow);
    console.log("Week start (last Friday 01:00):", lastFriday);
    console.log("Week end (next Friday 01:00):", nextFriday);
    
    return { 
      start: lastFriday.toISOString(), 
      end: nextFriday.toISOString(),
      startDate: lastFriday,
      endDate: nextFriday
    };
  };

  // -----------------------------
  // Helper: Check if transaction is within current week
  // -----------------------------
  const isTransactionInCurrentWeek = (transactionDate) => {
    const boundaries = getCurrentWeekBoundaries();
    const txDate = new Date(transactionDate);
    
    return txDate >= new Date(boundaries.start) && txDate < new Date(boundaries.end);
  };

  // -----------------------------
  // Helper: Calculate this week's income from transactions
  // -----------------------------
  const calculateThisWeekIncome = (txList) => {
    if (!txList || txList.length === 0) return 0;
    
    const boundaries = getCurrentWeekBoundaries();
    const weekStart = new Date(boundaries.start);
    const weekEnd = new Date(boundaries.end);
    
    console.log("Calculating week income from", weekStart, "to", weekEnd);
    
    let total = 0;
    
    txList.forEach(tx => {
      const txDate = new Date(tx.created_at);
      
      // Debug each transaction
      console.log(`Transaction ${tx.id}:`, {
        type: tx.transaction_type,
        amount: tx.amount,
        date: txDate,
        isDeposit: tx.transaction_type === "deposit",
        isInWeek: txDate >= weekStart && txDate < weekEnd,
        isThisWeek: isTransactionInCurrentWeek(tx.created_at)
      });
      
      // Count only deposits that are within current week
      if (tx.transaction_type === "deposit" && 
          tx.amount > 0 &&
          txDate >= weekStart && 
          txDate < weekEnd) {
        total += parseFloat(tx.amount);
        console.log(`✓ Added R${tx.amount} to weekly total. New total: R${total}`);
      }
    });
    
    console.log("Final this week income total:", total);
    return total;
  };

  // -----------------------------
  // 1️⃣ Get wallet from EXTERNAL API
  // -----------------------------
  const fetchWallet = async () => {
    try {
      setLoading(true);

      const url = `${EXTERNAL_API}/api/wallets/user/${user.id}`;
      const res = await fetch(url);
      const json = await res.json();

      if (json.success && json.data.has_wallet) {
        const w = json.data.wallet;
        setWallet(w);

        // load recent transactions from external API
        const recentTx = json.data.recent_transactions || [];
        setTransactions(recentTx);
        
        // Calculate this week's income
        const weeklyIncome = calculateThisWeekIncome(recentTx);
        setThisWeekIncome(weeklyIncome);
        console.log("This week income after initial load:", weeklyIncome);

        // load balance from INTERNAL API
        await fetchRealBalance(w.id);

        // fetch subscription for next payment
        await fetchUserSubscription();

        // full history
        await fetchTransactions(w.id, 1);
      }
    } catch (err) {
      console.log("Wallet fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // 2️⃣ Get REAL BALANCE from INTERNAL API
  // -----------------------------
  const fetchRealBalance = async (walletId) => {
    try {
      const url = `${INTERNAL_API}/api/wallet/${walletId}/balance`;
      const res = await fetch(url);
      const json = await res.json();

      if (json.success) setBalance(json.data.balance);
    } catch (err) {
      console.log("Balance fetch error:", err);
    }
  };

  // -----------------------------
  // 3️⃣ Get user subscription for next payment amount
  // -----------------------------
  const fetchUserSubscription = async () => {
    try {
      const url = `${INTERNAL_API}/api/subscriptions/user/${user.id}`;
      const res = await fetch(url);
      const json = await res.json();

      if (json.success && json.data) {
        // Next payment is the current_weekly_price from subscription
        const paymentAmount = json.data.current_weekly_price || 0;
        setNextPayment(paymentAmount);
        console.log("Next payment amount:", paymentAmount);
      }
    } catch (err) {
      console.log("Subscription fetch error:", err);
    }
  };

  // -----------------------------
  // 4️⃣ Full transaction history (paginated)
  // -----------------------------
  const fetchTransactions = async (walletId, pageNum) => {
    try {
      const url = `${EXTERNAL_API}/api/wallets/${walletId}/transactions?page=${pageNum}&limit=10`;
      const res = await fetch(url);
      const json = await res.json();

      if (json.success) {
        let allTransactions;
        if (pageNum === 1) {
          allTransactions = json.data.transactions || [];
          setTransactions(allTransactions);
        } else {
          allTransactions = [...transactions, ...(json.data.transactions || [])];
          setTransactions(allTransactions);
        }

        // Recalculate this week's income with all transactions
        const weeklyIncome = calculateThisWeekIncome(allTransactions);
        setThisWeekIncome(weeklyIncome);
        console.log("This week income after full transaction load:", weeklyIncome);
      }
    } catch (err) {
      console.log("Transaction fetch error:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWallet();
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <TopBar title="Wallet" subtitle="Careful this is the wallet" showBackButton={true} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* BALANCE CARD */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>R {balance.toFixed(2)}</Text>

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

        {/* INFO CARDS */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Ionicons name="arrow-up-circle" size={26} color="#2AB576" />
            <Text style={styles.infoLabel}>This Week</Text>
            <Text style={styles.infoAmount}>R {thisWeekIncome.toFixed(2)}</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="arrow-down-circle" size={26} color="#D9534F" />
            <Text style={styles.infoLabel}>Next Payment</Text>
            <Text style={styles.infoAmount}>R {nextPayment.toFixed(2)}</Text>
          </View>
        </View>

        {/* TRANSACTIONS */}
        <Text style={styles.recentTitle}>Recent Transactions</Text>

        {transactions.map((tx) => (
          <View key={tx.id} style={styles.txCard}>
            <Ionicons
              name={tx.transaction_type === "deposit" ? "arrow-up" : "arrow-down"}
              size={22}
              color={tx.transaction_type === "deposit" ? "#2AB576" : "#D9534F"}
              style={{ marginRight: 10 }}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.txTitle}>{tx.description}</Text>
              <Text style={styles.txDate}>
                {new Date(tx.created_at).toLocaleDateString()}
              </Text>
            </View>

            <Text
              style={[
                styles.txAmount,
                { color: tx.transaction_type === "deposit" ? "#2AB576" : "#D9534F" },
              ]}
            >
              {tx.transaction_type === "deposit"
                ? `+R ${tx.amount}`
                : `-R ${tx.amount}`}
            </Text>
          </View>
        ))}

        {loading && <ActivityIndicator size="small" color="#2AB576" />}

        {/* STATEMENTS */}
        <TouchableOpacity
          style={styles.statementBtn}
          onPress={() => navigation.navigate("StatementsScreen")}
        >
          <Text style={styles.statementBtnText}>View All Statements</Text>
        </TouchableOpacity>

        {/* PROMO */}
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

/* ---------------------- STYLES ---------------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  content: { paddingHorizontal: 20, paddingBottom: 140 },

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
  balanceSubLabel: { color: "#9CA3AF", fontSize: 12 },
  balanceSubAmount: { color: "#FFF", fontSize: 14, fontWeight: "600" },

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
  infoAmount: { marginTop: 6, fontSize: 16, fontWeight: "700" },

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

  noTransactions: {
    textAlign: "center",
    color: "#6B7280",
    fontStyle: "italic",
    marginVertical: 20,
  },

  statementBtn: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#2AB576",
  },
  statementBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  bannerWrapper: {
    flexDirection: "row",
    marginTop: 22,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1.4,
    borderColor: "#B4D4FF",
    overflow: "hidden",
  },
  bannerLeftAccent: { width: 12, backgroundColor: "#0A4AAA" },
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
  bannerSubtitle: { fontSize: 13, color: "#0A4AAA", marginTop: 4, lineHeight: 18 },
});