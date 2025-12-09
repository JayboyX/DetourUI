import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
} from "react-native";

import TopBar from "../../components/TopBar";
import BottomNav from "../../components/BottomNav";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/contexts/AuthContext";

// APIs
const INTERNAL_API = process.env.EXPO_PUBLIC_API_BASE_URL;
const EXTERNAL_API = process.env.EXPO_PUBLIC_EXTERNAL_API;

export default function WalletScreen({ navigation }) {
  const { user } = useAuth();

  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [thisWeekIncome, setThisWeekIncome] = useState(0);
  const [nextPayment, setNextPayment] = useState(0);
  const [loading, setLoading] = useState(true);

  // -----------------------------------------------------------
  // SHIMMER LOADING ANIMATION
  // -----------------------------------------------------------
  const shimmer = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const Skeleton = ({ height, width, radius = 10, mt = 0 }) => (
    <Animated.View
      style={{
        height,
        width,
        borderRadius: radius,
        marginTop: mt,
        backgroundColor: "#E3E3E3",
        opacity: shimmer,
      }}
    />
  );

  // ------- WEEK CALCULATIONS (kept exactly as you wrote) -------
  const getCurrentWeekBoundaries = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const jhbNow = new Date(utc + 3600000 * 2);

    const currentDay = jhbNow.getDay();
    const lastFriday = new Date(jhbNow);

    let diff = currentDay - 5;
    if (diff < 0) diff += 7;
    lastFriday.setDate(jhbNow.getDate() - diff);
    lastFriday.setHours(1, 0, 0, 0);

    const nextFriday = new Date(lastFriday);
    nextFriday.setDate(lastFriday.getDate() + 7);

    return { start: lastFriday, end: nextFriday };
  };

  const isTransactionInCurrentWeek = (date) => {
    const { start, end } = getCurrentWeekBoundaries();
    const d = new Date(date);
    return d >= start && d < end;
  };

  const calculateThisWeekIncome = (txs) => {
    let total = 0;
    txs.forEach((tx) => {
      if (tx.transaction_type === "deposit" && isTransactionInCurrentWeek(tx.created_at)) {
        total += Number(tx.amount);
      }
    });
    return total;
  };

  // ----------------------------------------------------------
  // FETCH WALLET (kept exactly as your logic)
  // ----------------------------------------------------------
  const fetchWallet = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${EXTERNAL_API}/api/wallets/user/${user.id}`);
      const json = await res.json();

      if (json.success && json.data.has_wallet) {
        const w = json.data.wallet;
        setWallet(w);

        const tx = json.data.recent_transactions || [];
        setTransactions(tx);
        setThisWeekIncome(calculateThisWeekIncome(tx));

        await fetchRealBalance(w.id);
        await fetchUserSubscription();
        await fetchTransactions(w.id, 1);
      }
    } catch (err) {
      console.log("Wallet fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealBalance = async (walletId) => {
    try {
      const res = await fetch(`${INTERNAL_API}/api/wallet/${walletId}/balance`);
      const json = await res.json();
      if (json.success) setBalance(json.data.balance);
    } catch (err) {}
  };

  const fetchUserSubscription = async () => {
    try {
      const res = await fetch(`${INTERNAL_API}/api/subscriptions/user/${user.id}`);
      const json = await res.json();
      if (json.success) setNextPayment(json.data.current_weekly_price || 0);
    } catch (err) {}
  };

  const fetchTransactions = async (walletId, pageNum) => {
    try {
      const res = await fetch(`${EXTERNAL_API}/api/wallets/${walletId}/transactions?page=${pageNum}&limit=10`);
      const json = await res.json();

      if (json.success) {
        const allTx = pageNum === 1 ? json.data.transactions : [...transactions, ...json.data.transactions];
        setTransactions(allTx);
        setThisWeekIncome(calculateThisWeekIncome(allTx));
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (user) fetchWallet();
  }, [user]);

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------
  return (
    <View style={styles.container}>
      <TopBar title="Wallet" subtitle="Careful this is the wallet" showBackButton={true} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* -----------------------------------------------------
            SKELETON LOADING STATE (entire top section)
        ----------------------------------------------------- */}
        {loading ? (
          <>
            {/* BALANCE CARD SKELETON */}
            <View style={styles.balanceCard}>
              <Skeleton height={18} width={"40%"} />
              <Skeleton height={42} width={"60%"} mt={8} />
              <View style={styles.balanceRow}>
                <Skeleton height={16} width={80} />
                <Skeleton height={16} width={80} />
              </View>
            </View>

            {/* INFO CARDS SKELETON */}
            <View style={styles.infoRow}>
              <Skeleton height={100} width={"48%"} radius={12} />
              <Skeleton height={100} width={"48%"} radius={12} />
            </View>

            {/* TRANSACTION TITLE SKELETON */}
            <Skeleton height={22} width={150} mt={20} />

            {/* 3 TRANSACTION SKELETONS */}
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.txCard}>
                <Skeleton height={22} width={22} radius={11} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Skeleton height={16} width={"60%"} />
                  <Skeleton height={14} width={"40%"} mt={6} />
                </View>
                <Skeleton height={16} width={60} />
              </View>
            ))}

            {/* BUTTON SKELETON */}
            <Skeleton height={48} width={"100%"} radius={10} mt={20} />

            {/* BANNER SKELETON */}
            <Skeleton height={120} width={"100%"} radius={14} mt={20} />
          </>
        ) : (
          <>
            {/* ----------------------- REAL UI ----------------------- */}

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

            <Text style={styles.recentTitle}>Recent Transactions</Text>

            {transactions.map((tx) => (
              <View key={tx.id} style={styles.txCard}>
                <Ionicons
                  name={tx.transaction_type === "deposit" ? "arrow-up" : "arrow-down"}
                  size={22}
                  color={tx.transaction_type === "deposit" ? "#2AB576" : "#D9534F"}
                />

                <View style={{ flex: 1, marginLeft: 10 }}>
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

            {/* STATEMENTS BUTTON */}
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
          </>
        )}

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

  recentTitle: { fontSize: 17, fontWeight: "700", marginTop: 15, marginBottom: 12 },

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
  bannerTitle: { fontSize: 15, fontWeight: "700", color: "#0A4AAA" },
  bannerSubtitle: { fontSize: 13, color: "#0A4AAA", marginTop: 4, lineHeight: 18 },
});
