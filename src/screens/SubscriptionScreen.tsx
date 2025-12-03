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
} from "react-native";
import TopBar from "../../components/TopBar";
import BottomNav from "../../components/BottomNav";
import { Ionicons } from "@expo/vector-icons";

// Enable animation on Android
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SubscriptionScreen() {
  const currentPlan = "Professional Driver";
  const [expanded, setExpanded] = useState(null);

  const toggleExpand = (name) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(expanded === name ? null : name);
  };

  const tiers = [
    {
      name: "On-The-Go",
      price: "R75.00",
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
      name: "Professional Driver",
      price: "R125.00",
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
      name: "MyOwnBoss",
      price: "R175.00",
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

  return (
    <View style={styles.container}>
      <TopBar
        title="Subscription"
        subtitle="Manage your plan"
        showBackButton={true}
      />

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {tiers.map((tier, index) => {
          const isExpanded = expanded === tier.name;
          const isCurrent = tier.name === currentPlan;

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

                  {isCurrent && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Current Plan</Text>
                    </View>
                  )}

                  <Text style={styles.description}>{tier.description}</Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.price}>{tier.price}</Text>
                    <Text style={styles.period}> / {tier.period}</Text>
                  </View>
                </View>

                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={22}
                  color="#444"
                />
              </View>

              {/* COLLAPSED HINT */}
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

                  {isCurrent ? (
                    <View style={styles.activeBox}>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#2AB576"
                      />
                      <Text style={styles.activeText}>Active Plan</Text>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.subscribeButton}>
                      <Text style={styles.subscribeText}>Subscribe</Text>
                    </TouchableOpacity>
                  )}
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
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },

  contentContainer: {
    padding: 16,
    paddingBottom: 120,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  headerText: {
    flex: 1,
    paddingRight: 10,
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },

  currentBadge: {
    marginTop: 4,
    alignSelf: "flex-start",
    backgroundColor: "#E0F2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  currentBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0A4AAA",
  },

  description: {
    marginTop: 6,
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },

  priceRow: {
    flexDirection: "row",
    marginTop: 10,
  },

  price: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2AB576",
  },

  period: {
    fontSize: 14,
    color: "#777",
    marginTop: 6,
    marginLeft: 4,
  },

  tapHint: {
    marginTop: 12,
    fontSize: 13,
    color: "#888",
    textAlign: "left",
  },

  expanded: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
    paddingTop: 16,
  },

  benefitsTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },

  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  benefitText: {
    fontSize: 14,
    color: "#444",
    flex: 1,
    lineHeight: 20,
  },

  subscribeButton: {
    marginTop: 20,
    backgroundColor: "#2AB576",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  subscribeText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },

  activeBox: {
    marginTop: 20,
    backgroundColor: "#EDFDF5",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2AB576",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  activeText: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: "700",
    color: "#2AB576",
  },
});
