import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
  Animated,
  Alert,
  Pressable,
  Platform,
  UIManager,
  Keyboard,
} from "react-native";

import TopBar from "../../components/TopBar";
import BottomNav from "../../components/BottomNav";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/contexts/AuthContext";

import AnimatedRe, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

import { PanGestureHandler } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

// Enable layout animations on Android
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SubscriptionScreen({ navigation }) {
  const { user } = useAuth();

  const [packages, setPackages] = useState([]);
  const [activeSub, setActiveSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [confirmType, setConfirmType] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const successAnim = useRef(new Animated.Value(0)).current;

  // ---- bottom sheet animation ----
  const sheetY = useSharedValue(350);

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    try {
      setLoading(true);

      const pkgRes = await fetch(`${API_BASE}/api/subscriptions/packages`);
      const pkgJson = await pkgRes.json();

      const subRes = await fetch(`${API_BASE}/api/subscriptions/user/${user.id}`);
      const subJson = await subRes.json();

      setPackages(pkgJson?.data?.packages || []);
      setActiveSub(subJson?.data || null);
    } catch (err) {
      console.log("Subscription load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (name) => {
    setExpanded(expanded === name ? null : name);
  };

  // -------------------------------------------------------------
  // OPEN BOTTOM SHEET
  // -------------------------------------------------------------
  const openSheet = () => {
    Keyboard.dismiss();
    setConfirmVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    sheetY.value = withSpring(0, {
      damping: 16,
      stiffness: 160,
      mass: 0.6,
    });
  };

  // -------------------------------------------------------------
  // CLOSE BOTTOM SHEET
  // -------------------------------------------------------------
  const closeSheet = () => {
    Keyboard.dismiss();
    sheetY.value = withSpring(350, { damping: 14 }, () => {
      runOnJS(() => {
        setConfirmVisible(false);
        setConfirmText("");
      })();
    });
  };

  // -------------------------------------------------------------
  // DRAG GESTURE
  // -------------------------------------------------------------
  const onGesture = (event) => {
    if (event.translationY > 0) {
      sheetY.value = event.translationY;
    }
  };

  const onGestureEnd = (event) => {
    if (event.translationY > 120) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      closeSheet();
    } else {
      sheetY.value = withSpring(0);
    }
  };

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetY.value }],
    opacity: interpolate(sheetY.value, [0, 350], [1, 0.85], Extrapolate.CLAMP),
  }));

  // -------------------------------------------------------------
  // Subscription Logic
  // -------------------------------------------------------------
  const handleSubscribePress = (pkg) => {
    const newPrice = Number(pkg.price);
    const currentPrice = activeSub ? Number(activeSub.current_weekly_price) : null;

    if (!activeSub) setConfirmType("SUBSCRIBE");
    else if (newPrice > currentPrice) setConfirmType("UPGRADE");
    else if (newPrice < currentPrice) setConfirmType("DOWNGRADE");
    else setConfirmType("SUBSCRIBE");

    setSelectedPackage(pkg);
    openSheet();
  };

  const animateSuccess = () => {
    successAnim.setValue(0);
    Animated.timing(successAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const processSubscription = async () => {
    const word = confirmType;

    if (confirmText.trim() !== word) {
      Alert.alert("Incorrect Confirmation", `You must type "${word}" exactly.`);
      return;
    }

    try {
      setLoadingPlan(selectedPackage.id);

      let endpoint = "/api/subscriptions/activate";
      if (confirmType === "UPGRADE") endpoint = "/api/subscriptions/upgrade";
      if (confirmType === "DOWNGRADE") endpoint = "/api/subscriptions/downgrade";

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          package_id: selectedPackage.id,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        Alert.alert("Failed", json.message);
        setLoadingPlan(null);
        closeSheet();
        return;
      }

      animateSuccess();
      closeSheet();

      setTimeout(() => {
        navigation.navigate("Dashboard");
      }, 2000);

      loadPage();
      setLoadingPlan(null);
    } catch (err) {
      console.log("Subscription Error:", err);
      Alert.alert("Error", "Something went wrong.");
      setLoadingPlan(null);
    }
  };

  // -------------------------------------------------------------
  // LOADING SCREEN
  // -------------------------------------------------------------
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2AB576" />
      </View>
    );
  }

  // -------------------------------------------------------------
  // MAIN RENDER
  // -------------------------------------------------------------
  return (
    <View style={styles.container}>
      <TopBar title="Subscription" subtitle="Manage your plan" showBackButton />

      {/* SUCCESS TOAST */}
      <Animated.View
        style={[
          styles.successToast,
          {
            opacity: successAnim,
            transform: [
              {
                translateY: successAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-60, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.successToastText}>Subscription Updated!</Text>
      </Animated.View>

      {/* PLANS LIST */}
      <ScrollView contentContainerStyle={styles.content}>
        {packages.map((pkg) => {
          const isActive = activeSub && activeSub.package_id === pkg.id;
          const expandedState = expanded === pkg.name;

          return (
            <View key={pkg.id} style={[styles.card, isActive && styles.activeCard]}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => toggleExpand(pkg.name)}
                style={styles.headerRow}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{pkg.name}</Text>

                  {isActive && (
                    <View style={styles.tagActive}>
                      <Text style={styles.tagActiveText}>ACTIVE</Text>
                    </View>
                  )}

                  <Text style={styles.description}>{pkg.description}</Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.price}>R{pkg.price}</Text>
                    <Text style={styles.period}> / {pkg.period}</Text>
                  </View>
                </View>

                <Ionicons
                  name={expandedState ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#333"
                />
              </TouchableOpacity>

              {expandedState && (
                <View style={styles.expanded}>
                  <Text style={styles.benefitsTitle}>Benefits</Text>

                  {(pkg.benefits || []).map((b, i) => (
                    <View key={i} style={styles.benefitRow}>
                      <Ionicons name="checkmark-circle" size={18} color="#2AB576" style={{ marginRight: 8 }} />
                      <Text style={styles.benefitText}>{b}</Text>
                    </View>
                  ))}

                  {!isActive ? (
                    <TouchableOpacity
                      style={styles.btnPrimary}
                      onPress={() => handleSubscribePress(pkg)}
                    >
                      {loadingPlan === pkg.id ? (
                        <ActivityIndicator color="#FFF" />
                      ) : (
                        <Text style={styles.btnPrimaryText}>
                          {activeSub ? "Change Plan" : "Subscribe"}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.activeBox}>
                      <Ionicons name="shield-checkmark" size={20} color="#2AB576" />
                      <Text style={styles.activeBoxText}>Active Plan</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* ================= BOTTOM SHEET CONFIRMATION ================= */}

      <Modal visible={confirmVisible} transparent animationType="none">
        <Pressable style={styles.overlay} onPress={closeSheet} />

        <PanGestureHandler onGestureEvent={onGesture} onEnded={onGestureEnd}>
          <AnimatedRe.View style={[styles.bottomSheet, sheetStyle]}>
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitle}>
              {confirmType === "UPGRADE"
                ? "Confirm Upgrade"
                : confirmType === "DOWNGRADE"
                ? "Confirm Downgrade"
                : "Confirm Subscription"}
            </Text>

            <Text style={styles.sheetDesc}>
              Type <Text style={{ fontWeight: "bold" }}>"{confirmType}"</Text> to confirm.
            </Text>

            <TextInput
              style={styles.sheetInput}
              placeholder={confirmType}
              placeholderTextColor="#999"
              value={confirmText}
              onChangeText={setConfirmText}
              autoCapitalize="characters"
            />

            <TouchableOpacity style={styles.btnConfirm} onPress={processSubscription}>
              {loadingPlan ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.btnConfirmText}>Confirm</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnCancel} onPress={closeSheet}>
              <Text style={styles.btnCancelText}>Cancel</Text>
            </TouchableOpacity>
          </AnimatedRe.View>
        </PanGestureHandler>
      </Modal>

      <BottomNav />
    </View>
  );
}

// -------------------------------------------------------------
// STYLES
// -------------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // SUCCESS TOAST
  successToast: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    backgroundColor: "#2AB576",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    zIndex: 200,
  },
  successToastText: { color: "#FFF", fontWeight: "700" },

  content: { padding: 16, paddingBottom: 140 },

  // PLAN CARD
  card: {
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#EEE",
    elevation: 3,
  },

  activeCard: {
    borderColor: "#2AB576",
    borderWidth: 2,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  name: { fontSize: 20, fontWeight: "700" },

  tagActive: {
    backgroundColor: "#CFF8E6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  tagActiveText: { color: "#2AB576", fontWeight: "700", fontSize: 12 },

  description: { marginTop: 6, color: "#666" },

  priceRow: { flexDirection: "row", marginTop: 10 },
  price: { fontSize: 24, fontWeight: "800", color: "#2AB576" },
  period: { marginTop: 6, marginLeft: 4, color: "#777" },

  expanded: { marginTop: 16 },

  benefitsTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  benefitRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  benefitText: { flex: 1, color: "#444" },

  btnPrimary: {
    backgroundColor: "#2AB576",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  btnPrimaryText: { color: "#FFF", fontSize: 16, fontWeight: "700" },

  activeBox: {
    marginTop: 20,
    backgroundColor: "#EFFFF6",
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  activeBoxText: {
    marginLeft: 8,
    color: "#2AB576",
    fontWeight: "700",
    fontSize: 15,
  },

  // BACKDROP
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  // BOTTOM SHEET
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 22,
    paddingBottom: 36,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    elevation: 40,
  },

  sheetHandle: {
    width: 50,
    height: 5,
    backgroundColor: "#DDD",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 14,
  },

  sheetTitle: { textAlign: "center", fontSize: 18, fontWeight: "700" },
  sheetDesc: { textAlign: "center", marginBottom: 12, color: "#555" },

  sheetInput: {
    backgroundColor: "#F2F2F2",
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
    marginBottom: 16,
    textTransform: "uppercase",
  },

  btnConfirm: {
    backgroundColor: "#2AB576",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },

  btnConfirmText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },

  btnCancel: {
    backgroundColor: "#EEE",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnCancelText: {
    fontWeight: "700",
    color: "#666",
  },
});
