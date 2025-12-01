import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
} from "react-native";
import TopBar from "../../components/TopBar";
import BottomNav from "../../components/BottomNav";

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <TopBar />
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>$1,250</Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>18</Text>
            <Text style={styles.statLabel}>Completed Trips</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <View style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: "#FFE8E8" }]}>
                <Text style={[styles.actionEmoji, { color: "#FF6B6B" }]}>🚗</Text>
              </View>
              <Text style={styles.actionText}>Start Trip</Text>
            </View>
            
            <View style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: "#E8F5FF" }]}>
                <Text style={[styles.actionEmoji, { color: "#4D96FF" }]}>💰</Text>
              </View>
              <Text style={styles.actionText}>Withdraw</Text>
            </View>
            
            <View style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: "#E8FFED" }]}>
                <Text style={[styles.actionEmoji, { color: "#2AB576" }]}>🎯</Text>
              </View>
              <Text style={styles.actionText}>Goals</Text>
            </View>
            
            <View style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: "#FFF5E8" }]}>
                <Text style={[styles.actionEmoji, { color: "#FFA500" }]}>📊</Text>
              </View>
              <Text style={styles.actionText}>Analytics</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {["Airport Trip - $85", "Downtown - $42", "University - $38", "Shopping Mall - $55"].map((item, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityDot} />
                <Text style={styles.activityText}>{item}</Text>
                <Text style={styles.activityTime}>2h ago</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2AB576",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionItem: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  activityList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2AB576",
    marginRight: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  activityTime: {
    fontSize: 13,
    color: "#999",
  },
});