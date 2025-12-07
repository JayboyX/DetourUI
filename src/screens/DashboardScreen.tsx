// src/screens/DashboardScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import TopBar from "../../components/TopBar";
import BottomNav from "../../components/BottomNav";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/contexts/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../lib/supabase";

interface Wallet {
  id: string;
  user_id: string;
  balance: string;
  currency: string;
  wallet_number: string;
  status: string;
}

export default function DashboardScreen({ navigation }) {
  const { user, checkKYCStatus } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // -------------------------------
  // CHECK ACTIVE SUBSCRIPTION
  // -------------------------------
  const checkUserSubscription = async () => {
    try {
      if (!user?.id) return false;

      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("Subscription check error:", error);
        return false;
      }

      return !!data; // true if subscription exists
    } catch (error) {
      console.error("Subscription check exception:", error);
      return false;
    }
  };

  // -------------------------------
  // FETCH WALLET
  // -------------------------------
  const fetchWallet = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (error) {
        console.error("Wallet fetch error:", error);
        setWallet(null);
      } else {
        setWallet(data);
      }
    } catch (error) {
      console.error("Fetch wallet error:", error);
      setWallet(null);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // -------------------------------
  // REALTIME WALLET UPDATES
  // -------------------------------
  useEffect(() => {
    if (!user?.id) return;

    fetchWallet();

    const channel = supabase
      .channel(`wallet_changes_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wallets",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && payload.new.status === "active") {
            setWallet(payload.new as Wallet);
          } else if (payload.eventType === "DELETE") {
            setWallet(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // -------------------------------
  // FLOW CONTROL (KYC + SUBSCRIPTION)
  // -------------------------------
  useFocusEffect(
    React.useCallback(() => {
      const runChecks = async () => {
        try {
          // 1. KYC CHECK
          const kycResult = await checkKYCStatus();

          if (!kycResult.isComplete) {
            console.log("KYC incomplete → redirecting to KYC");
            navigation.reset({
              index: 0,
              routes: [{ name: "KYC" }],
            });
            return;
          }

          // 2. SUBSCRIPTION CHECK
          const hasSub = await checkUserSubscription();

          if (!hasSub) {
            console.log("No subscription → redirecting to Subscription");
            navigation.reset({
              index: 0,
              routes: [{ name: "Subscription" }],
            });
            return;
          }
        } catch (error) {
          console.error("Flow error:", error);
        }
      };

      runChecks();
    }, [navigation, checkKYCStatus])
  );

  // Initial load
  useEffect(() => {
    fetchWallet();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWallet();
  };

  // -------------------------------
  // UI HELPERS
  // -------------------------------

  const formatBalance = (balance: string) => {
    const amount = parseFloat(balance || "0");
    return `R ${amount.toFixed(2)}`;
  };

  const calculateAvailableAdvance = () => {
    if (!wallet?.balance) return "0.00";
    const balance = parseFloat(wallet.balance);
    return (balance * 0.8).toFixed(2);
  };

  // -------------------------------
  // RENDER
  // -------------------------------
  return (
    <View style={styles.container}>
      <TopBar />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2AB576"]}
            tintColor="#2AB576"
          />
        }
      >
        {/* WALLET CARD */}
        <View style={styles.walletCard}>
          {isLoading ? (
            <>
              <Text style={styles.balanceText}>Loading...</Text>
              <View style={styles.divider} />
              <View style={styles.walletRow}>
                <View>
                  <Text style={styles.walletLabel}>Available Advance</Text>
                  <Text style={styles.walletValueGreen}>Loading...</Text>
                </View>
                <View>
                  <Text style={styles.walletLabel}>Reward Points</Text>
                  <Text style={styles.walletValue}>Loading...</Text>
                </View>
              </View>
            </>
          ) : wallet ? (
            <>
              <Text style={styles.balanceText}>
                {formatBalance(wallet.balance)}
              </Text>

              <View style={styles.divider} />

              <View style={styles.walletRow}>
                <View>
                  <Text style={styles.walletLabel}>Available Advance</Text>
                  <Text style={styles.walletValueGreen}>
                    R {calculateAvailableAdvance()}
                  </Text>
                </View>

                <View>
                  <Text style={styles.walletLabel}>Reward Points</Text>
                  <Text style={styles.walletValue}>0</Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.balanceText}>R 0.00</Text>
              <View style={styles.divider} />

              <View style={styles.walletRow}>
                <View>
                  <Text style={styles.walletLabel}>Available Advance</Text>
                  <Text style={styles.walletValueGreen}>R 0.00</Text>
                </View>

                <View>
                  <Text style={styles.walletLabel}>Reward Points</Text>
                  <Text style={styles.walletValue}>0</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.greenButton}
            onPress={() => navigation.navigate("Advance")}
          >
            <Ionicons name="trending-up" size={22} color="#fff" />
            <Text style={styles.greenButtonText}>Get Advance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.whiteButton}
            onPress={() => navigation.navigate("Wallet")}
          >
            <Ionicons name="wallet-outline" size={22} color="#000" />
            <Text style={styles.whiteButtonText}>View Wallet</Text>
          </TouchableOpacity>
        </View>

        {/* BENEFITS */}
        <Text style={styles.sectionTitle}>Your Benefits</Text>

        <TouchableOpacity style={styles.benefitCard}>
          <Ionicons name="shield-checkmark-outline" size={26} color="#2AB576" />
          <View style={styles.benefitInfo}>
            <Text style={styles.benefitTitle}>Health & Safety</Text>
            <Text style={styles.benefitSubtitle}>
              24/7 emergency & hospital cover
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.benefitCard}
          onPress={() => navigation.navigate("Rewards")}
        >
          <Ionicons name="gift-outline" size={26} color="#D6A300" />
          <View style={styles.benefitInfo}>
            <Text style={styles.benefitTitle}>Rewards</Text>
            <Text style={styles.benefitSubtitle}>
              Earn on fuel, redeem for essentials
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.benefitCard}>
          <Ionicons name="flame-outline" size={26} color="#4CAF50" />
          <View style={styles.benefitInfo}>
            <Text style={styles.benefitTitle}>Detour Energy</Text>
            <Text style={styles.benefitSubtitle}>
              Refuel at major brands nationwide
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.benefitCard}
          onPress={() => navigation.navigate("Buy")}
        >
          <Ionicons name="cart-outline" size={26} color="#2AB576" />
          <View style={styles.benefitInfo}>
            <Text style={styles.benefitTitle}>Buy</Text>
            <Text style={styles.benefitSubtitle}>
              Airtime, data, and essential bundles
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.benefitCard}
          onPress={() => navigation.navigate("Statements")}
        >
          <Ionicons name="document-text-outline" size={26} color="#2AB576" />
          <View style={styles.benefitInfo}>
            <Text style={styles.benefitTitle}>Statements</Text>
            <Text style={styles.benefitSubtitle}>
              View transaction & wallet history
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.benefitCard}
          onPress={() => navigation.navigate("Withdrawal")}
        >
          <Ionicons name="cash-outline" size={26} color="#008CFF" />
          <View style={styles.benefitInfo}>
            <Text style={styles.benefitTitle}>Withdrawal</Text>
            <Text style={styles.benefitSubtitle}>
              Cashout to your bank account
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.benefitCard}
          onPress={() => navigation.navigate("Subscription")}
        >
          <Ionicons name="repeat-outline" size={26} color="#0A4AAA" />
          <View style={styles.benefitInfo}>
            <Text style={styles.benefitTitle}>Subscription</Text>
            <Text style={styles.benefitSubtitle}>
              Update your current subscription
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        {/* Promo Banner */}
        <View style={styles.bannerWrapper}>
          <View style={styles.bannerLeftAccent} />
          <View style={styles.bannerCard}>
            <Text style={styles.bannerTitle}>From driver to business owner</Text>
            <Text style={styles.bannerSubtitle}>
              Access financial planning, mentorship and bookkeeping.
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

// ---------------------------------------------------
// STYLES
// ---------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  walletCard: {
    backgroundColor: "#fff",
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },
  balanceText: {
    fontSize: 34,
    fontWeight: "800",
    color: "#000",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 14,
  },
  walletRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  walletLabel: {
    fontSize: 14,
    color: "#666",
  },
  walletValue: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  walletValueGreen: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2AB576",
    marginTop: 4,
  },
  sectionTitle: {
    marginTop: 25,
    marginLeft: 18,
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 16,
  },
  greenButton: {
    backgroundColor: "#2AB576",
    flex: 1,
    marginRight: 8,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  greenButtonText: {
    color: "#fff",
    marginTop: 6,
    fontWeight: "700",
  },
  whiteButton: {
    backgroundColor: "#fff",
    flex: 1,
    marginLeft: 8,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDE0E5",
  },
  whiteButtonText: {
    color: "#000",
    marginTop: 6,
    fontWeight: "700",
  },
  benefitCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 16,
  },
  benefitInfo: {
    flex: 1,
    marginLeft: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  benefitSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  bannerWrapper: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1.4,
    borderColor: "#B4D4FF",
  },
  bannerLeftAccent: {
    width: 10,
    backgroundColor: "#0A4AAA",
  },
  bannerCard: {
    flex: 1,
    backgroundColor: "#E9F3FF",
    padding: 16,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0A4AAA",
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "#444",
    marginTop: 4,
  },
});

