// src/app/onboarding/KYCScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Image,
  Modal,
  Keyboard,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import RNPickerSelect from "react-native-picker-select";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const { height } = Dimensions.get("window");

const BANKS = [
  { label: "Select Bank Name", value: "" },
  { label: "FNB", value: "FNB" },
  { label: "Standard Bank", value: "Standard Bank" },
  { label: "Absa", value: "Absa" },
  { label: "Nedbank", value: "Nedbank" },
  { label: "Capitec", value: "Capitec" },
  { label: "TymeBank", value: "TymeBank" },
  { label: "African Bank", value: "African Bank" },
  { label: "Other", value: "Other" },
];

const DOC = {
  ID: "id_document",
  ADDRESS: "proof_of_address",
  SELFIE: "selfie",
};

export default function KYCScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  // ---------------------------
  // FORM STATE
  // ---------------------------
  const [idNumber, setIdNumber] = useState("");
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [bank, setBank] = useState("");
  const [otherBank, setOtherBank] = useState("");
  const [account, setAccount] = useState("");

  // Documents
  const [idDoc, setIdDoc] = useState(null);
  const [proof, setProof] = useState(null);
  const [selfie, setSelfie] = useState(null);

  // Loaders
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // OTP modal
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [checkingOtp, setCheckingOtp] = useState(false);

  // ---------------------------
  // VALIDATION (TRIGGER ONLY ON SUBMIT)
  // ---------------------------
  const validate = () => {
    if (!idNumber.trim()) return setError("Enter your ID number"), false;
    if (!firstName.trim()) return setError("Enter your first name"), false;
    if (!lastName.trim()) return setError("Enter your last name"), false;
    if (!dob.trim()) return setError("Enter your date of birth (YYYY-MM-DD)"), false;
    if (!phone.trim()) return setError("Enter your phone number"), false;
    if (!address.trim()) return setError("Enter your residential address"), false;

    if (!account.trim()) return setError("Enter bank account number"), false;
    if (!bank) return setError("Select your bank"), false;
    if (bank === "Other" && !otherBank.trim())
      return setError("Specify your bank name"), false;

    if (!idDoc) return setError("Upload your ID document"), false;
    if (!proof) return setError("Upload proof of address"), false;
    if (!selfie) return setError("Upload a selfie"), false;

    return true;
  };

  // ---------------------------
  // PICK DOCUMENT
  // ---------------------------
  const pickDoc = async (type) => {
    let picked;
    try {
      if (type === DOC.SELFIE) {
        const perms = await ImagePicker.requestCameraPermissionsAsync();
        if (!perms.granted) {
          Alert.alert("Permission Required", "Enable camera to capture selfie.");
          return;
        }

        picked = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.8,
        });
      } else {
        picked = await DocumentPicker.getDocumentAsync({
          type: ["image/*", "application/pdf"],
        });
      }

      if (!picked.canceled && picked.assets?.[0]) {
        const file = picked.assets[0];

        const obj = {
          uri: file.uri,
          name: file.name || `${type}_${Date.now()}.jpg`,
          type: file.mimeType || "image/jpeg",
        };

        if (type === DOC.ID) setIdDoc(obj);
        if (type === DOC.ADDRESS) setProof(obj);
        if (type === DOC.SELFIE) setSelfie(obj);
      }
    } catch (err) {
      console.log("Document error:", err);
      Alert.alert("Error", "Failed to pick document.");
    }
  };

  // ---------------------------
  // UPLOAD DOCUMENT
  // ---------------------------
  const uploadFile = async (file, tag) => {
    const ext = file.name.split(".").pop();
    const fileName = `${tag}_${Date.now()}.${ext}`;
    const path = `${idNumber}/${fileName}`;

    const form = new FormData();
    form.append("file", {
      uri: file.uri,
      name: fileName,
      type: file.type,
    });

    const res = await fetch(
      `https://rfbngcyvdzrrebyudawo.supabase.co/storage/v1/object/KYC_Bucket/${path}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: form,
      }
    );

    if (!res.ok) throw new Error("Upload failed");

    return `https://rfbngcyvdzrrebyudawo.supabase.co/storage/v1/object/public/KYC_Bucket/${path}`;
  };

  // ---------------------------
  // SUBMIT KYC
  // ---------------------------
  const submit = async () => {
    setError("");
    setSuccess("");

    if (!validate()) return;

    setIsLoading(true);

    try {
      const finalBank = bank === "Other" ? otherBank : bank;

      // Insert KYC first
      const { data, error: insertErr } = await supabase
        .from("kyc_information")
        .insert({
          user_id: user.id,
          id_number: idNumber.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          date_of_birth: dob.trim(),
          phone_number: phone.trim(),
          address: address.trim(),
          bank_name: finalBank,
          bank_account_number: account.trim(),
          kyc_status: "pending",
          bav_status: "pending",
        })
        .select()
        .single();

      if (insertErr) {
        setIsLoading(false);
        setError(insertErr.message);
        return;
      }

      setUploading(true);

      const idURL = await uploadFile(idDoc, DOC.ID);
      const proofURL = await uploadFile(proof, DOC.ADDRESS);
      const selfieURL = await uploadFile(selfie, DOC.SELFIE);

      await supabase
        .from("kyc_information")
        .update({
          id_document_url: idURL,
          proof_of_address_url: proofURL,
          selfie_url: selfieURL,
        })
        .eq("id", data.id);

      setUploading(false);

      // Now phone OTP
      const sent = await sendOtp();
      if (sent.success) setShowOtp(true);
      else setError("KYC saved but OTP failed, verify later.");

    } catch (e) {
      console.log("Submit error:", e);
      setError("Unexpected error, try again.");
    }

    setIsLoading(false);
  };

  // ---------------------------
  // SEND OTP
  // ---------------------------
  const sendOtp = async () => {
    try {
      const res = await fetch(
        "https://sjkixfkta8.us-east-1.awsapprunner.com/api/auth/send-phone-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id, phone_number: phone }),
        }
      );
      return await res.json();
    } catch {
      return { success: false };
    }
  };

  // ---------------------------
  // VERIFY OTP
  // ---------------------------
  const verify = async () => {
    if (otp.length !== 6) return setOtpError("Enter 6-digit code");

    setCheckingOtp(true);

    const res = await fetch(
      "https://sjkixfkta8.us-east-1.awsapprunner.com/api/auth/verify-phone-otp",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, otp_code: otp }),
      }
    );

    const data = await res.json();

    if (data.success) {
      setOtpSuccess(true);
      setTimeout(() => {
        setShowOtp(false);
        navigation.navigate("Dashboard");
      }, 1500);
    } else {
      setOtpError("Invalid code");
    }

    setCheckingOtp(false);
  };

  // ---------------------------
  // RENDER
  // ---------------------------
  const docButton = (type, label, obj) => (
    <TouchableOpacity
      style={[styles.docBtn, obj && styles.docBtnSelected]}
      onPress={() => pickDoc(type)}
    >
      <Ionicons
        name={type === DOC.SELFIE ? "camera" : "document-attach"}
        size={22}
        color={obj ? "#2AB576" : "#666"}
      />
      <Text
        style={[
          styles.docText,
          obj && { color: "#2AB576", fontWeight: "600" },
        ]}
      >
        {obj ? `${label} ✓` : label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.inner}>
          {/* Title */}
          <Text style={styles.title}>KYC Verification</Text>
          <Text style={styles.sub}>Complete verification to continue</Text>

          {error ? (
            <View style={[styles.msg, styles.msgErr]}>
              <Ionicons name="warning" size={18} color="#FF4D4D" />
              <Text style={styles.msgText}>{error}</Text>
            </View>
          ) : null}

          {/* FORM */}
          <View style={styles.form}>
            {/* ID */}
            <View style={styles.inputWrap}>
              <Ionicons name="card-outline" size={20} style={styles.i} />
              <TextInput
                placeholder="ID/Passport Number"
                style={styles.input}
                value={idNumber}
                onChangeText={setIdNumber}
                maxLength={13}
              />
            </View>

            {/* First */}
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={20} style={styles.i} />
              <TextInput
                placeholder="First Name"
                style={styles.input}
                value={firstName}
                onChangeText={setFirst}
              />
            </View>

            {/* Last */}
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={20} style={styles.i} />
              <TextInput
                placeholder="Last Name"
                style={styles.input}
                value={lastName}
                onChangeText={setLast}
              />
            </View>

            {/* DOB */}
            <View style={styles.inputWrap}>
              <Ionicons name="calendar-outline" size={20} style={styles.i} />
              <TextInput
                placeholder="YYYY-MM-DD"
                style={styles.input}
                value={dob}
                onChangeText={setDob}
                maxLength={10}
              />
            </View>

            {/* Phone */}
            <View style={styles.inputWrap}>
              <Ionicons name="call-outline" size={20} style={styles.i} />
              <TextInput
                placeholder="Phone Number"
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Address */}
            <View style={[styles.inputWrap, { height: 110 }]}>
              <Ionicons name="home-outline" size={20} style={styles.i} />
              <TextInput
                placeholder="Residential Address"
                style={[styles.input, { height: 100 }]}
                value={address}
                onChangeText={setAddress}
                multiline
              />
            </View>

            {/* Account */}
            <View style={styles.inputWrap}>
              <Ionicons name="card-outline" size={20} style={styles.i} />
              <TextInput
                placeholder="Bank Account Number"
                style={styles.input}
                value={account}
                onChangeText={setAccount}
                keyboardType="numeric"
              />
            </View>

            {/* BANK SELECT */}
            <View style={[styles.inputWrap, { paddingRight: 40 }]}>
              <Ionicons name="business-outline" size={20} style={styles.i} />
              <RNPickerSelect
                items={BANKS}
                value={bank}
                onValueChange={setBank}
                placeholder={{ label: "Select Bank Name", value: "" }}
                style={{
                  inputAndroid: styles.select,
                  inputIOS: styles.select,
                }}
                Icon={() => (
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color="#666"
                    style={{ marginRight: 10 }}
                  />
                )}
              />
            </View>

            {/* OTHER BANK */}
            {bank === "Other" && (
              <View style={styles.inputWrap}>
                <Ionicons name="business-outline" size={20} style={styles.i} />
                <TextInput
                  placeholder="Specify Bank Name"
                  style={styles.input}
                  value={otherBank}
                  onChangeText={setOtherBank}
                />
              </View>
            )}

            {/* DOCUMENTS */}
            <Text style={styles.docsTitle}>Upload Documents *</Text>
            {docButton(DOC.ID, "ID Document", idDoc)}
            {docButton(DOC.ADDRESS, "Proof of Address", proof)}
            {docButton(DOC.SELFIE, "Selfie", selfie)}

            {/* SUBMIT */}
            <TouchableOpacity
              style={[
                styles.submit,
                (isLoading || uploading) && { opacity: 0.5 },
              ]}
              disabled={isLoading || uploading}
              onPress={submit}
            >
              {isLoading || uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={20} color="#fff" />
                  <Text style={styles.submitText}>Submit Verification</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* OTP MODAL */}
      <Modal visible={showOtp} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={Keyboard.dismiss}
        >
          <View style={styles.modal}>
            <TouchableOpacity
              style={styles.close}
              onPress={() => setShowOtp(false)}
            >
              <Ionicons name="close" size={26} color="#555" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Verify Phone Number</Text>
            <Text style={styles.modalSub}>Enter the OTP sent to your phone</Text>

            {otpError ? (
              <Text style={styles.otpError}>{otpError}</Text>
            ) : null}

            <TextInput
              style={styles.otpInput}
              value={otp}
              onChangeText={setOtp}
              maxLength={6}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={[
                styles.verifyBtn,
                (otp.length !== 6 || checkingOtp) && { opacity: 0.5 },
              ]}
              disabled={otp.length !== 6 || checkingOtp}
              onPress={verify}
            >
              {checkingOtp ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.verifyText}>Verify</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

//
// =======================
// STYLES
// =======================
//
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  scroll: { paddingBottom: 60 },
  inner: { padding: 20, paddingTop: 50, minHeight: height },

  title: { fontSize: 28, fontWeight: "700", color: "#000", marginBottom: 5 },
  sub: { fontSize: 16, color: "#666", marginBottom: 25 },

  msg: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  msgErr: {
    backgroundColor: "#FFF2F2",
    borderColor: "#FFC8C8",
  },
  msgText: { marginLeft: 10, color: "#FF4D4D", fontWeight: "500" },

  form: { width: "100%" },

  inputWrap: {
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 14,
    paddingLeft: 48,
    paddingRight: 16,
    height: 56,
    justifyContent: "center",
  },

  i: {
    position: "absolute",
    left: 16,
    top: 18,
    color: "#666",
  },

  input: { fontSize: 16, color: "#222" },

  select: {
    fontSize: 16,
    color: "#222",
    paddingLeft: 0,
    marginLeft: -5,
  },

  docsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 10,
    marginBottom: 14,
  },

  docBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E4E4E4",
    marginBottom: 10,
  },

  docBtnSelected: {
    backgroundColor: "#EDFDF4",
    borderColor: "#2AB576",
  },

  docText: { marginLeft: 12, fontSize: 16, color: "#666" },

  submit: {
    backgroundColor: "#2AB576",
    borderRadius: 12,
    marginTop: 20,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  submitText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  // OTP modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  modal: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
  },
  close: { position: "absolute", right: 20, top: 20 },

  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginTop: 20,
  },
  modalSub: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 5,
  },

  otpInput: {
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 22,
    textAlign: "center",
    letterSpacing: 8,
    marginBottom: 20,
  },

  otpError: { color: "#FF3B30", textAlign: "center", marginBottom: 10 },

  verifyBtn: {
    backgroundColor: "#2AB576",
    paddingVertical: 16,
    borderRadius: 12,
  },
  verifyText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
