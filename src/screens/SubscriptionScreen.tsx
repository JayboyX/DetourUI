import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";

import TopBar from "../../components/TopBar";
import BottomNav from "../../components/BottomNav";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useAuth } from "../../src/contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";

// Enable animation on Android
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SubscriptionScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [expanded, setExpanded] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null);

  const toggleExpand = (name) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(expanded === name ? null : name);
  };

  const tiers = [
    {
      id: "on_the_go",
      name: "On-The-Go",
      price: 75,
      period: "Weekly for 12 Months",
      description:
        "For new Uber drivers who need basic support and starting benefits.",
      benefits: [
        "Free South African Bank Account",
        "24/7 Emergency Support (Aura)",
        "Early withdrawals: 30% of earnings",
        "Driver mentorship & check-ins",
        "Health checks (twice a year)",
        "Basic reward access",
      ],
    },
    {
      id: "professional_driver",
      name: "Professional Driver",
      price: 125,
      period: "Weekly for 12 Months",
      description:
        "For full-time Uber drivers who rely on driving as their primary income.",
      benefits: [
        "Free South African Bank Account",
        "24/7 Emergency Support (Aura)",
        "Early withdrawals: 50% of earnings",
        "Commercial & legal support",
        "Hospital cover while online",
        "Financial coaching & mentorship",
      ],
    },
    {
      id: "my_own_boss",
      name: "MyOwnBoss",
      price: 175,
      period: "Weekly for 12 Months",
      description:
        "For business-focused drivers wanting long-term financial stability.",
      benefits: [
        "0% interest fuel advances",
        "50% early withdrawal access",
        "Full commercial & business support",
        "Health, funeral & income cover",
        "Weekly financial planning",
        "Driver rewards & loyalty",
      ],
    },
  ];

  // ----------------------------------------------------------
  // SUBSCRIBE ACTION — Calls Backend /subscriptions/activate
  // ----------------------------------------------------------
  const handleSubscribe = async (tier) => {
    try {
      if (!user?.id) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      setLoadingPlan(tier.id);

      const { data, error } = await supabase.functions.invoke(
        "proxy-subscriptions-activate",
        {
          method: "POST",
          body: {
            user_id: user.id,
            package_id: tier.id,
          },
        }
      );

      setLoadingPlan(null);

      if (error || !data?.success) {
        Alert.alert("Subscription Failed", data?.message || "Unable to subscribe");
        return;
      }

      Alert.alert("Success", "Your subscription has been activated!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Dashboard"),
        },
      ]);
    } catch (err) {
      console.error(err);
      setLoadingPlan(null);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      <TopBar title="Subscription" subtitle="Manage your plan" showBackButton />

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {tiers.map((tier, index) => {
          const isExpanded = expanded === tier.name;

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.9}
              onPress={() => toggleExpand(tier.name)}
              style={styles.card}
            >
              {/* HEADER */}
              <View style={styles.headerRow}>
                <View style={styles.headerText}>
                  <Text style={styles.name}>{tier.name}</Text>

                  <Text style={styles.description}>{tier.description}</Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.price}>R{tier.price}.00</Text>
                    <Text style={styles.period}> / {tier.period}</Text>
                  </View>
                </View>

                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={22}
                  color="#444"
                />
              </View>

              {/* COLLAPSED */}
              {!isExpanded && (
                <Text style={styles.tapHint}>Tap to view details</Text>
              )}

              {/* EXPANDED CONTENT */}
              {isExpanded && (
                <View style={styles.expanded}>
                  <Text style={styles.benefitsTitle}>Plan Benefits</Text>

                  {tier.benefits.map((b, i) => (
                    <View key={i} style={styles.benefitRow}>
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color="#2AB576"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.benefitText}>{b}</Text>
                    </View>
                  ))}

                  {/* SUBSCRIBE BUTTON */}
                  <TouchableOpacity
                    style={styles.subscribeButton}
                    onPress={() => handleSubscribe(tier)}
                    disabled={loadingPlan === tier.id}
                  >
                    {loadingPlan === tier.id ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text style={styles.subscribeText}>Subscribe</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  contentContainer: { padding: 16, paddingBottom: 120 },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },

  headerRow: { flexDirection: "row", justifyContent: "space-between" },
  headerText: { flex: 1, paddingRight: 10 },

  name: { fontSize: 20, fontWeight: "700", color: "#000" },

  description: {
    marginTop: 6,
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },

  priceRow: { flexDirection: "row", marginTop: 10 },
  price: { fontSize: 22, fontWeight: "800", color: "#2AB576" },
  period: { fontSize: 14, color: "#777", marginTop: 6, marginLeft: 4 },

  tapHint: { marginTop: 12, fontSize: 13, color: "#888" },

  expanded: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
    paddingTop: 16,
  },

  benefitsTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },

  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  benefitText: { fontSize: 14, color: "#444", flex: 1, lineHeight: 20 },

  subscribeButton: {
    marginTop: 20,
    backgroundColor: "#2AB576",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  subscribeText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
