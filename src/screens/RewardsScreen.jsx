import React from "react";
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

export default function RewardsScreen({ navigation }) {
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
        {/* POINTS CARD */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsHeaderRow}>
            <Ionicons name="gift-outline" size={22} color="#FFF" />
            <Text style={styles.pointsLabel}>Your Points</Text>
          </View>

          <Text style={styles.pointsValue}>0</Text>
          <Text style={styles.pointsSub}>
            Earn points on qualifying fuel advances
          </Text>
        </View>

        {/* HOW TO EARN POINTS */}
        <View style={styles.earnCard}>
          <Text style={styles.sectionTitle}>How to Earn Points</Text>

          {/* Fuel Advances */}
          <View style={styles.earnItem}>
            <View style={[styles.dot, { backgroundColor: "#A3E59F" }]}>
              <Ionicons name="car-outline" size={14} color="#256029" />
            </View>
            <View style={styles.earnTextBox}>
              <Text style={styles.earnTitle}>Fuel Advances</Text>
              <Text style={styles.earnDesc}>
                Earn 10 points per R100 fuel advance
              </Text>
            </View>
          </View>

          {/* Weekly Driving */}
          <View style={styles.earnItem}>
            <View style={[styles.dot, { backgroundColor: "#9CC6FF" }]}>
              <Ionicons name="speedometer-outline" size={14} color="#0A4AAA" />
            </View>
            <View style={styles.earnTextBox}>
              <Text style={styles.earnTitle}>Weekly Driving</Text>
              <Text style={styles.earnDesc}>
                Bonus points for consistent weekly activity
              </Text>
            </View>
          </View>

          {/* On-time Repayments */}
          <View style={styles.earnItem}>
            <View style={[styles.dot, { backgroundColor: "#FFB7B7" }]}>
              <Ionicons name="checkmark-done-outline" size={14} color="#8A0000" />
            </View>
            <View style={styles.earnTextBox}>
              <Text style={styles.earnTitle}>On-time Repayments</Text>
              <Text style={styles.earnDesc}>
                Extra points for timely repayments
              </Text>
            </View>
          </View>
        </View>

        {/* REDEEM POINTS */}
        <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Redeem Points</Text>

        {/* Meals */}
        <TouchableOpacity style={styles.redeemCard}>
          <View style={styles.redeemIconBox}>
            <Ionicons name="fast-food-outline" size={26} color="#C78A00" />
          </View>
          <View style={styles.redeemInfo}>
            <Text style={styles.redeemTitle}>Meals</Text>
            <Text style={styles.redeemSub}>From 500 points</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        {/* Airtime */}
        <TouchableOpacity style={styles.redeemCard}>
          <View style={styles.redeemIconBox}>
            <Ionicons name="phone-portrait-outline" size={26} color="#4A90E2" />
          </View>
          <View style={styles.redeemInfo}>
            <Text style={styles.redeemTitle}>Airtime</Text>
            <Text style={styles.redeemSub}>From 200 points</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        {/* Data */}
        <TouchableOpacity style={styles.redeemCard}>
          <View style={styles.redeemIconBox}>
            <Ionicons name="flash-outline" size={26} color="#AD64FF" />
          </View>
          <View style={styles.redeemInfo}>
            <Text style={styles.redeemTitle}>Data</Text>
            <Text style={styles.redeemSub}>From 300 points</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        {/* PROMO BANNER */}
        <View style={styles.bannerWrapper}>
          <View style={styles.bannerLeftAccent} />
          <View style={styles.bannerCard}>
            <Text style={styles.bannerTitle}>Rewards that fit your life</Text>
            <Text style={styles.bannerSubtitle}>
              Redeem points for meals, mobile data, airtime and other everyday
              essentials that matter to you.
            </Text>
          </View>
        </View>

      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { padding: 20, paddingBottom: 120 },

  /* POINTS CARD */
  pointsCard: {
    backgroundColor: "#F4A320",
    padding: 20,
    borderRadius: 16,
    marginBottom: 28,
  },
  pointsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pointsLabel: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  pointsValue: {
    color: "#FFF",
    fontSize: 42,
    fontWeight: "800",
    marginVertical: 6,
  },
  pointsSub: { color: "#FFF", opacity: 0.9, fontSize: 14 },

  /* SECTION TITLE */
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
    color: "#000",
  },

  /* HOW TO EARN CARD */
  earnCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },

  earnItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  dot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  earnTextBox: { marginLeft: 12, flex: 1 },
  earnTitle: { fontSize: 15, fontWeight: "700", color: "#000" },
  earnDesc: { fontSize: 13, color: "#666", marginTop: 2 },

  /* REDEEM CARDS */
  redeemCard: {
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  redeemIconBox: {
    width: 40,
    height: 40,
    backgroundColor: "#F5F6F8",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  redeemInfo: { flex: 1, marginLeft: 12 },
  redeemTitle: { fontSize: 16, fontWeight: "700", color: "#000" },
  redeemSub: { fontSize: 12, color: "#666", marginTop: 2 },

  /* PROMO BANNER */
  bannerWrapper: {
    flexDirection: "row",
    marginTop: 22,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1.4,
    borderColor: "#F4DFA3",
    overflow: "hidden",
  },
  bannerLeftAccent: {
    width: 12,
    backgroundColor: "#B48300",
  },
  bannerCard: {
    flex: 1,
    backgroundColor: "#FFF7D9",
    padding: 16,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#B48300",
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "#B48300",
    marginTop: 4,
    lineHeight: 18,
  },
});
