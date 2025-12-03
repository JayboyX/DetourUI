import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import TopBar from "../../components/TopBar";
import BottomNav from "../../components/BottomNav";

export default function CashOutScreen() {
  const [amount, setAmount] = useState("");

  // Card storage placeholder (later from DB)
  const [cards, setCards] = useState([
    { id: 1, name: "John M", last4: "5364", default: true },
  ]);

  const [selectedCard, setSelectedCard] = useState(cards[0]);
  const [showCardFields, setShowCardFields] = useState(false);
  const [newCard, setNewCard] = useState({
    number: "",
    name: "",
    cvv: "",
    expiry: "",
  });

  const [askDefault, setAskDefault] = useState(false);

  const walletBalance = 0.0;

  // Function to save new card
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

    // Reset new card inputs
    setNewCard({ number: "", name: "", cvv: "", expiry: "" });

    // Auto cash out if default is chosen
    if (makeDefault) {
      handleCashOut(newCardObj);
    }
  };

  // Cash out handler
  const handleCashOut = (card) => {
    const usedCard = card || selectedCard;

    console.log("Processing Cash Out:", {
      amount,
      cardUsed: usedCard,
    });

    // Later integrate API call here
    alert(`Cash Out of R${amount} processed using card ****${usedCard.last4}`);
  };

  const multipleCardsAvailable = cards.length > 1;

  return (
    <View style={styles.container}>
      <TopBar title="Cash Out" subtitle="Withdraw to your card" showBackButton />

      <ScrollView contentContainerStyle={styles.content}>
        {/* AVAILABLE BALANCE */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available to Cash out</Text>
          <Text style={styles.balanceAmount}>R{walletBalance.toFixed(2)}</Text>
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

        {/* CARD SELECTION */}
        {!showCardFields && !askDefault && (
          <>
            {/* Default Card */}
            <Text style={styles.sectionTitle}>Card to use</Text>

            <TouchableOpacity
              style={styles.cardSelectBox}
              onPress={() =>
                multipleCardsAvailable && setShowCardFields(false)
              }
            >
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

            {/* Switch Card Option */}
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

            {/* Add New Card */}
            <TouchableOpacity
              onPress={() => setShowCardFields(true)}
              style={styles.changeCardBtn}
            >
              <Text style={styles.changeCardText}>Click to change card</Text>
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
                placeholder="Name on card"
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
                  keyboardType="numeric"
                  maxLength={4}
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

            {/* CONTINUE BUTTON */}
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
            <Text style={styles.sectionTitle}>
              Make this your default card?
            </Text>

            {/* YES */}
            <TouchableOpacity
              style={styles.defaultBtn}
              onPress={() => saveNewCard(true)}
            >
              <Text style={styles.defaultBtnText}>Yes, make it default</Text>
            </TouchableOpacity>

            {/* NO */}
            <TouchableOpacity
              style={[styles.defaultBtn, { backgroundColor: "#DDD" }]}
              onPress={() => saveNewCard(false)}
            >
              <Text
                style={[styles.defaultBtnText, { color: "#000" }]}
              >
                No, keep old default
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* CASH OUT BUTTON */}
        {!showCardFields && !askDefault && (
          <TouchableOpacity
            style={styles.cashOutBtn}
            onPress={() => handleCashOut()}
          >
            <Text style={styles.cashOutText}>Cash Out</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },

  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 140 },

  /* Balance */
  balanceCard: {
    backgroundColor: "#0F172A",
    padding: 20,
    borderRadius: 14,
    marginBottom: 20,
  },
  balanceLabel: { color: "#C9D1D9", fontSize: 13 },
  balanceAmount: { color: "#FFF", fontSize: 36, fontWeight: "800" },

  /* Input */
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

  /* Sections */
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: "#2E2E2E",
  },

  /* Default Card Display */
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

  /* Card Options */
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

  /* Change card */
  changeCardBtn: { marginTop: 10, marginBottom: 20 },
  changeCardText: {
    color: "#2AB576",
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  /* Buttons */
  saveCardBtn: {
    backgroundColor: "#2AB576",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  saveCardText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },

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
});
