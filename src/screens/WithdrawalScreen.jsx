import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import TopBar from "../../components/TopBar";
import BottomNav from "../../components/BottomNav";
import { useAuth } from "../../src/contexts/AuthContext";

const EXTERNAL_API = process.env.EXPO_PUBLIC_EXTERNAL_API; // Withdrawals + wallet

export default function CashOutScreen() {
  const { user } = useAuth();

  const [amount, setAmount] = useState("");

  const [wallet, setWallet] = useState(null);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Card Management
  const [cards, setCards] = useState([
    { id: 1, name: "John M", last4: "5364", default: true },
  ]);

  const [selectedCard, setSelectedCard] = useState(cards[0]);
  const [showCardFields, setShowCardFields] = useState(false);
  const [askDefault, setAskDefault] = useState(false);

  const [newCard, setNewCard] = useState({
    number: "",
    name: "",
    cvv: "",
    expiry: "",
  });

  // -------------------------------
  // FETCH WALLET
  // -------------------------------
  const fetchWallet = async () => {
    try {
      const url = `${EXTERNAL_API}/api/wallets/user/${user.id}`;
      const res = await fetch(url);
      const json = await res.json();

      if (json.success && json.data.has_wallet) {
        setWallet(json.data.wallet);
      } else {
        Alert.alert("Error", "Wallet not found.");
      }
    } catch (err) {
      console.log("Wallet fetch error:", err);
      Alert.alert("Error", "Unable to fetch wallet.");
    } finally {
      setLoadingWallet(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  // -------------------------------
  // PERFORM REAL WITHDRAWAL
  // -------------------------------
  const performWithdrawal = async () => {
    if (!wallet) return Alert.alert("Error", "Wallet unavailable.");
    if (!amount || Number(amount) <= 0)
      return Alert.alert("Invalid Amount", "Enter a valid amount.");

    setSubmitting(true);

    try {
      const url = `${EXTERNAL_API}/api/wallets/${wallet.id}/withdraw/quick?amount=${amount}&currency=ZAR&description=Quick%20withdrawal`;

      const res = await fetch(url, { method: "POST" });
      const json = await res.json();

      if (!json.success) {
        Alert.alert("Withdrawal Failed", json.message);
        setSubmitting(false);
        return;
      }

      Alert.alert(
        "Success",
        `R${amount} withdrawn successfully.\nReference: ${json.data?.withdrawal_details?.provider_reference}`
      );

      // Reset UI input
      setAmount("");

      // 🔥 QUICK REFRESH AFTER CASH OUT
      await fetchWallet();
    } catch (err) {
      console.log("Withdraw error:", err);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------
  // CARD SAVING FLOW
  // -------------------------------
  const saveNewCard = (makeDefault) => {
    const last4 = newCard.number.slice(-4);

    const newCardObj = {
      id: Date.now(),
      name: newCard.name,
      last4,
      default: makeDefault,
    };

    let updatedCards;

    if (makeDefault) {
      updatedCards = [
        { ...newCardObj, default: true },
        ...cards.map((c) => ({ ...c, default: false })),
      ];
      setSelectedCard(newCardObj);
    } else {
      updatedCards = [...cards, newCardObj];
    }

    setCards(updatedCards);
    setShowCardFields(false);
    setAskDefault(false);

    setNewCard({ number: "", name: "", cvv: "", expiry: "" });

    // AUTO-CASH OUT if new default
    if (makeDefault) performWithdrawal();
  };

  const multipleCardsAvailable = cards.length > 1;

  // -------------------------------
  // UI
  // -------------------------------
  if (loadingWallet) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#2AB576" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar title="Cash Out" subtitle="Withdraw to your card" showBackButton />

      <ScrollView contentContainerStyle={styles.content}>
        {/* BALANCE */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available to Cash Out</Text>
          <Text style={styles.balanceAmount}>
            R{Number(wallet?.balance || 0).toFixed(2)}
          </Text>
        </View>

        {/* AMOUNT INPUT */}
        <View style={styles.inputBox}>
          <TextInput
            style={styles.inputText}
            placeholder="Enter amount"
            placeholderTextColor="#9b9b9b"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* CARD SWITCHING */}
        {!showCardFields && !askDefault && (
          <>
            <Text style={styles.sectionTitle}>Card to use</Text>

            <TouchableOpacity style={styles.cardSelectBox}>
              <View>
                <Text style={styles.cardSelectLabel}>Name:</Text>
                <Text style={styles.cardSelectValue}>{selectedCard.name}</Text>
              </View>

              <View>
                <Text style={styles.cardSelectLabel}>Card:</Text>
                <Text style={styles.cardSelectValue}>
                  **** {selectedCard.last4}
                </Text>
              </View>
            </TouchableOpacity>

            {multipleCardsAvailable && (
              <>
                <Text style={styles.sectionTitle}>Switch Card</Text>

                {cards.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.cardOption,
                      selectedCard.id === c.id && styles.cardOptionActive,
                    ]}
                    onPress={() => setSelectedCard(c)}
                  >
                    <Text style={styles.cardOptionText}>
                      {c.name} — **** {c.last4}
                      {c.default ? " (Default)" : ""}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* ADD NEW CARD */}
            <TouchableOpacity
              onPress={() => setShowCardFields(true)}
              style={styles.changeCardBtn}
            >
              <Text style={styles.changeCardText}>Add / Change Card</Text>
            </TouchableOpacity>
          </>
        )}

        {/* NEW CARD FIELDS */}
        {showCardFields && !askDefault && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.sectionTitle}>Add New Card</Text>

            <View style={styles.inputBox}>
              <TextInput
                style={styles.inputText}
                placeholder="Card Number"
                placeholderTextColor="#9b9b9b"
                keyboardType="numeric"
                value={newCard.number}
                onChangeText={(t) => setNewCard({ ...newCard, number: t })}
              />
            </View>

            <View style={styles.inputBox}>
              <TextInput
                style={styles.inputText}
                placeholder="Name on Card"
                placeholderTextColor="#9b9b9b"
                value={newCard.name}
                onChangeText={(t) => setNewCard({ ...newCard, name: t })}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputBox, { flex: 1, marginRight: 10 }]}>
                <TextInput
                  style={styles.inputText}
                  placeholder="CVV"
                  placeholderTextColor="#9b9b9b"
                  maxLength={4}
                  keyboardType="numeric"
                  value={newCard.cvv}
                  onChangeText={(t) => setNewCard({ ...newCard, cvv: t })}
                />
              </View>

              <View style={[styles.inputBox, { flex: 1 }]}>
                <TextInput
                  style={styles.inputText}
                  placeholder="Expiry (MM/YY)"
                  placeholderTextColor="#9b9b9b"
                  value={newCard.expiry}
                  onChangeText={(t) => setNewCard({ ...newCard, expiry: t })}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveCardBtn}
              onPress={() => setAskDefault(true)}
            >
              <Text style={styles.saveCardText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ASK IF DEFAULT */}
        {askDefault && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.sectionTitle}>Make this your default card?</Text>

            <TouchableOpacity
              style={styles.defaultBtn}
              onPress={() => saveNewCard(true)}
            >
              <Text style={styles.defaultBtnText}>Yes — Set as Default</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.defaultBtn, { backgroundColor: "#DDD" }]}
              onPress={() => saveNewCard(false)}
            >
              <Text style={[styles.defaultBtnText, { color: "#000" }]}>
                No — Keep Old Default
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* CASH OUT BUTTON */}
        {!showCardFields && !askDefault && (
          <TouchableOpacity
            style={styles.cashOutBtn}
            onPress={performWithdrawal}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.cashOutText}>Cash Out</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

// -------------------------------
// STYLES
// -------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 140 },

  balanceCard: {
    backgroundColor: "#0F172A",
    padding: 20,
    borderRadius: 14,
    marginBottom: 20,
  },
  balanceLabel: { color: "#C9D1D9", fontSize: 13 },
  balanceAmount: { color: "#FFF", fontSize: 36, fontWeight: "800" },

  inputBox: {
    borderWidth: 1,
    borderColor: "#D9D9D9",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  inputText: { fontSize: 15, color: "#000" },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: "#2E2E2E",
  },

  cardSelectBox: {
    backgroundColor: "#F4F4F4",
    padding: 14,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardSelectLabel: { color: "#555" },
  cardSelectValue: { fontWeight: "700", color: "#111" },

  cardOption: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#EEE",
    marginBottom: 8,
  },
  cardOptionActive: {
    backgroundColor: "#2AB57633",
    borderWidth: 1,
    borderColor: "#2AB576",
  },
  cardOptionText: { fontSize: 14, color: "#111" },

  changeCardBtn: { marginTop: 10, marginBottom: 20 },
  changeCardText: {
    color: "#2AB576",
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  saveCardBtn: {
    backgroundColor: "#2AB576",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  saveCardText: { color: "#FFF", fontSize: 16, fontWeight: "700" },

  defaultBtn: {
    backgroundColor: "#2AB576",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  defaultBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },

  cashOutBtn: {
    backgroundColor: "#2AB576",
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  cashOutText: { color: "#FFF", fontSize: 16, fontWeight: "700" },

  row: { flexDirection: "row", justifyContent: "space-between" },
});
