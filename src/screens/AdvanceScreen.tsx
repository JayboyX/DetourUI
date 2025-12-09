import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import TopBar from "../../components/TopBar";
import BottomNav from "../../components/BottomNav";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/contexts/AuthContext";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

// Enable smooth animation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AdvanceScreen() {
  const { user } = useAuth();

  const [type, setType] = useState("fuel");
  const [amount, setAmount] = useState("0");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [requesting, setRequesting] = useState(false);

  const quickAmounts = ["50", "100", "150", "200", "250"];

  // -------------------------------------
  // SHIMMER LOADING ANIMATION
  // -------------------------------------
  const shimmer = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const Skeleton = ({ height, width, radius = 10 }) => (
    <Animated.View
      style={{
        height,
        width,
        borderRadius: radius,
        opacity: shimmer,
        backgroundColor: "#E2E2E2",
        marginVertical: 6,
      }}
    />
  );

  // ------------------------------------------------------------
  // Fetch availability
  // ------------------------------------------------------------
  const loadAvailability = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);

      const res = await fetch(`${API_BASE}/api/advances/available/${user?.id}`);
      const json = await res.json();

      if (json?.success) {
        LayoutAnimation.easeInEaseOut();
        setAvailability(json.data);
      }
    } catch (err) {
      console.log("Advance availability error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, refreshing]);

  useEffect(() => {
    loadAvailability();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadAvailability();
  };

  // ------------------------------------------------------------
  // Request Advance
  // ------------------------------------------------------------
  const requestAdvance = async () => {
    try {
      setRequesting(true);

      const payload = {
        user_id: user.id,
        amount: Number(amount),
        type: type,
      };

      const res = await fetch(`${API_BASE}/api/advances/take`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      alert(json.message);

      if (json.success) {
        LayoutAnimation.easeInEaseOut();
        setAmount("0");
        await loadAvailability();
      }
    } catch (err) {
      console.log("Request Advance error:", err);
    } finally {
      setRequesting(false);
    }
  };

  // ------------------------------------------------------------
  // UI CONDITIONS
  // ------------------------------------------------------------
  const available = availability?.available ?? 0;
  const outstanding = availability?.outstanding ?? 0;
  const weeklyLimit = availability?.weekly_limit ?? 0;

  const buttonDisabled =
    !availability || Number(amount) <= 0 || Number(amount) > available || requesting;

  return (
    <View style={styles.container}>
      <TopBar title="Advance" subtitle="Request fuel or cash" showBackButton={true} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2AB576" />
        }
      >
        {/* ---------------------- LOADING SKELETON UI ---------------------- */}
        {loading ? (
          <>
            {/* AVAILABLE CARD */}
            <View style={styles.availableCard}>
              <Skeleton height={16} width={"40%"} radius={6} />
              <Skeleton height={40} width={"55%"} radius={10} />
              <Skeleton height={14} width={"50%"} radius={6} />
            </View>

            {/* TYPE BUTTONS */}
            <Text style={styles.sectionTitle}>Advance Type</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Skeleton height={80} width={"48%"} radius={14} />
              <Skeleton height={80} width={"48%"} radius={14} />
            </View>

            {/* AMOUNT INPUT */}
            <Text style={styles.sectionTitle}>Amount</Text>
            <Skeleton height={60} width={"100%"} radius={14} />

            {/* CHIPS */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 10 }}>
              <Skeleton height={30} width={70} radius={10} />
              <Skeleton height={30} width={70} radius={10} />
              <Skeleton height={30} width={70} radius={10} />
              <Skeleton height={30} width={70} radius={10} />
            </View>

            {/* INFO BANNER */}
            <Skeleton height={60} width={"100%"} radius={14} />

            {/* HOW IT WORKS */}
            <Text style={styles.sectionTitle}>How it works</Text>
            <Skeleton height={140} width={"100%"} radius={16} />

            {/* BUTTON */}
            <Skeleton height={55} width={"100%"} radius={14} />
          </>
        ) : (
          <>
            {/* ----------------------- AVAILABLE CARD ----------------------- */}
            <View style={styles.availableCard}>
              <Text style={styles.availableLabel}>Current Available</Text>
              <Text style={styles.availableAmount}>R {available.toFixed(2)}</Text>

              {outstanding > 0 ? (
                <Text style={styles.warningText}>
                  You must fully repay your current advance before borrowing again.
                </Text>
              ) : (
                <Text style={styles.availableSub}>
                  Weekly Limit: R {weeklyLimit.toFixed(2)}
                </Text>
              )}
            </View>

            {/* ----------------------- ADVANCE TYPE ----------------------- */}
            <Text style={styles.sectionTitle}>Advance Type</Text>

            <View style={styles.typeRow}>
              <TouchableOpacity
                onPress={() => setType("fuel")}
                style={[styles.typeButton, type === "fuel" && styles.typeButtonActive]}
              >
                <Ionicons
                  name="car-outline"
                  size={28}
                  color={type === "fuel" ? "#fff" : "#000"}
                />
                <Text style={[styles.typeText, type === "fuel" && styles.typeTextActive]}>
                  Fuel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setType("cash")}
                style={[styles.typeButton, type === "cash" && styles.typeButtonActive]}
              >
                <Ionicons
                  name="cash-outline"
                  size={28}
                  color={type === "cash" ? "#fff" : "#000"}
                />
                <Text style={[styles.typeText, type === "cash" && styles.typeTextActive]}>
                  Cash
                </Text>
              </TouchableOpacity>
            </View>

            {/* ----------------------- AMOUNT INPUT ----------------------- */}
            <Text style={styles.sectionTitle}>Amount</Text>

            <View style={styles.inputBox}>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>

            {/* QUICK AMOUNTS */}
            <View style={styles.chipRow}>
              {quickAmounts.map((amt, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.chip}
                  onPress={() => {
                    LayoutAnimation.easeInEaseOut();
                    setAmount(amt);
                  }}
                >
                  <Text style={styles.chipText}>R{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ----------------------- INFO BANNER ----------------------- */}
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle" size={20} color="#B48300" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.infoTitle}>0% Interest</Text>
                <Text style={styles.infoDesc}>Weekly repayment deducted every Friday.</Text>
              </View>
            </View>

            {/* ----------------------- HOW IT WORKS ----------------------- */}
            <Text style={styles.sectionTitle}>How it works</Text>

            <View style={styles.howCard}>
              {[1, 2, 3].map((step, i) => {
                const titles = ["Request advance", "Instant decision", "Auto repayment"];
                const descs = [
                  "Choose fuel or cash and enter your amount.",
                  "Approval is automatic when no outstanding balance exists.",
                  "A fixed weekly repayment is deducted each Friday.",
                ];

                return (
                  <View style={styles.howItem} key={i}>
                    <View style={styles.howNumber}>
                      <Text style={styles.howNumberText}>{step}</Text>
                    </View>
                    <View style={styles.howContent}>
                      <Text style={styles.howTitle}>{titles[i]}</Text>
                      <Text style={styles.howDesc}>{descs[i]}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* ----------------------- REQUEST BUTTON ----------------------- */}
            <TouchableOpacity
              disabled={buttonDisabled}
              onPress={requestAdvance}
              style={[
                styles.requestBtn,
                buttonDisabled && { backgroundColor: "#9DDDC1" },
              ]}
            >
              {requesting ? (
                <Text style={styles.requestText}>Processing...</Text>
              ) : (
                <Text style={styles.requestText}>Request R{amount || "0"} Advance</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { padding: 20, paddingBottom: 120 },

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
    fontSize: 42,
    fontWeight: "800",
    marginVertical: 6,
  },
  availableSub: { color: "#FFF", opacity: 0.9 },
  warningText: { color: "#FFE7E7", marginTop: 6, fontSize: 14 },

  /* SECTION */
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 10,
    color: "#000",
  },

  /* TYPE BUTTONS */
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
  typeText: { fontSize: 15, fontWeight: "700", color: "#000" },
  typeTextActive: { color: "#FFF" },

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

  /* QUICK CHIPS */
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
  chipText: { fontSize: 14, fontWeight: "600" },

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

  /* HOW IT WORKS */
  howCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
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
  howNumberText: { color: "#0A4AAA", fontWeight: "700", fontSize: 15 },
  howContent: { flex: 1 },
  howTitle: { fontSize: 15, fontWeight: "700", color: "#000" },
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
