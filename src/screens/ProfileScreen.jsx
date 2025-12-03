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
import { useAuth } from "../contexts/AuthContext";

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();

  const getInitial = () => {
    if (!user?.full_name) return "D";
    return user.full_name.charAt(0).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <TopBar title="Profile" subtitle="Manage your account" showBackButton={true} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitial()}</Text>
          </View>

          <Text style={styles.name}>{user?.full_name || "Driver Name"}</Text>
          <Text style={styles.email}>{user?.email || "driver@example.com"}</Text>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>Nov 2025</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Plan</Text>
              <Text style={[styles.infoValue, { color: "#2AB576" }]}>
                Standard
              </Text>
            </View>
          </View>
        </View>

        {/* MENU LIST */}
        <MenuItem
          icon="person-outline"
          color="#CFE0FF"
          title="Personal Information"
        />

        <MenuItem
          icon="car-outline"
          color="#DAF4D9"
          title="Vehicle Details"
        />

        <MenuItem
          icon="shield-checkmark-outline"
          color="#E8D7FF"
          title="Health & Safety Plan"
        />

        <MenuItem
          icon="document-text-outline"
          color="#FFF3C7"
          title="Documents"
        />

        <MenuItem icon="settings-outline" color="#EEE" title="Settings" />

        <MenuItem
          icon="help-circle-outline"
          color="#FFE4D6"
          title="Help & Support"
        />

        {/* UPGRADE BANNER */}
        <View style={styles.bannerWrapper}>
          <View style={styles.bannerLeftAccent} />
          <View style={styles.bannerCard}>
            <Text style={styles.bannerTitle}>Upgrade Your Plan</Text>
            <Text style={styles.bannerSubtitle}>
              Access financial planning, mentorship and bookkeeping support to
              grow from driver to business owner.
            </Text>

            <TouchableOpacity
                style={styles.learnBtn}
                onPress={() => navigation.navigate("Subscription")}>
              <Text style={styles.learnText}>Learn More</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            try {
              await signOut();
            } catch (err) {}
          }}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Detour Drive v1.0.0</Text>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

/* REUSABLE MENU ITEM */
function MenuItem({ icon, title, color }) {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <View style={[styles.menuIconBox, { backgroundColor: color }]}>
        <Ionicons name={icon} size={22} color="#000" />
      </View>

      <Text style={styles.menuTitle}>{title}</Text>

      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { padding: 20, paddingBottom: 120 },

  /* PROFILE CARD */
  profileCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: "#2AB576",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "#FFF",
    fontSize: 36,
    fontWeight: "700",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#777",
  },
  divider: {
    height: 1,
    width: "80%",
    backgroundColor: "#EEE",
    marginVertical: 18,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  infoBox: { alignItems: "center", flex: 1 },
  infoLabel: { fontSize: 13, color: "#666" },
  infoValue: { fontSize: 15, fontWeight: "700", color: "#000" },

  /* MENU ITEMS */
  menuItem: {
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    flex: 1,
    marginLeft: 12,
  },

  /* BANNER */
  bannerWrapper: {
    flexDirection: "row",
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1.3,
    borderColor: "#B4D4FF",
    overflow: "hidden",
    marginBottom: 20,
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
    lineHeight: 18,
  },
  learnBtn: {
    marginTop: 14,
    backgroundColor: "#0A4AAA",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  learnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },

  /* LOGOUT */
  logoutBtn: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFD9D9",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  logoutText: { color: "#D80000", fontWeight: "700", fontSize: 15 },

  version: {
    textAlign: "center",
    marginTop: 16,
    color: "#AAA",
    fontSize: 12,
    marginBottom: 40,
  },
});
