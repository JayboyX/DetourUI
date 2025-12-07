// ---------------------------------------------------------
// 1. IMPORTS
// ---------------------------------------------------------
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import TopBar from "../../../components/TopBar";
import { useAuth, validatePassword } from "../../contexts/AuthContext";

const { height } = Dimensions.get("window");

// ---------------------------------------------------------
// 2. COMPONENT: SignUpScreen
// ---------------------------------------------------------
export default function SignUpScreen() {
  const navigation = useNavigation();

  // -----------------------------------------------------
  // 2.1 STATE MANAGEMENT
  // -----------------------------------------------------
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [pendingEmail, setPendingEmail] = useState("");
  const [showVerificationPending, setShowVerificationPending] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    requirements: [] as string[],
  });

  const { signUp, checkVerification, resendVerification, signIn } = useAuth();
  const verificationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // -----------------------------------------------------
  // 2.2 CHECK FOR PENDING VERIFICATION ON LOAD
  // -----------------------------------------------------
  useEffect(() => {
    checkPendingStatus();

    return () => {
      if (verificationIntervalRef.current) clearInterval(verificationIntervalRef.current);
    };
  }, []);

  const checkPendingStatus = async () => {
    const pending = await AsyncStorage.getItem("pending_verification_email");
    if (pending) {
      setPendingEmail(pending);
      setShowVerificationPending(true);
      startVerificationCheck(pending);
    }
  };

  // -----------------------------------------------------
  // 2.3 START AUTO VERIFICATION CHECK LOOP
  // -----------------------------------------------------
  const startVerificationCheck = (emailToCheck: string) => {
    if (verificationIntervalRef.current)
      clearInterval(verificationIntervalRef.current);

    verificationIntervalRef.current = setInterval(() => {
      verifyEmailStatus(emailToCheck);
    }, 5000);

    verifyEmailStatus(emailToCheck);
  };

  const verifyEmailStatus = async (emailToCheck: string) => {
    try {
      const result = await checkVerification(emailToCheck);

      if (result.success && result.email_verified) {
        await AsyncStorage.removeItem("pending_verification_email");

        if (verificationIntervalRef.current)
          clearInterval(verificationIntervalRef.current);

        const storedPassword = await AsyncStorage.getItem("temp_password");

        if (storedPassword) {
          const login = await signIn({ email: emailToCheck, password: storedPassword });
          await AsyncStorage.removeItem("temp_password");

          if (!login.success) {
            setErrorMessage("Email verified! Please log in manually.");
          }
        }
      }
    } catch (e) { }
  };

  // -----------------------------------------------------
  // 2.4 FORM VALIDATION
  // -----------------------------------------------------
  const validateForm = () => {
    if (!fullName.trim()) return setError("Please enter your full name");
    if (fullName.trim().length < 2) return setError("Full name is too short");

    if (!email.trim()) return setError("Enter your email address");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setError("Enter a valid email address");

    if (!password) return setError("Enter your password");
    if (!passwordValidation.isValid)
      return setError("Password does not meet requirements");

    if (password !== confirmPassword)
      return setError("Passwords do not match");

    if (!termsAgreed)
      return setError("You must accept the Terms & Conditions");

    return true;
  };

  const setError = (msg: string) => {
    setErrorMessage(msg);
    return false;
  };

  // -----------------------------------------------------
  // 2.5 PASSWORD LIVE VALIDATION
  // -----------------------------------------------------
  const handlePassword = (t: string) => {
    setPassword(t);
    setPasswordValidation(validatePassword(t));
    setErrorMessage("");
  };

  // -----------------------------------------------------
  // 2.6 HANDLE SIGN UP
  // -----------------------------------------------------
  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMessage("");

    const payload = {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      terms_agreed: termsAgreed,
    };

    const result = await signUp(payload);

    if (result.success) {
      const userEmail = email.trim().toLowerCase();

      await AsyncStorage.setItem("pending_verification_email", userEmail);
      await AsyncStorage.setItem("temp_password", password);

      setPendingEmail(userEmail);
      setShowVerificationPending(true);

      startVerificationCheck(userEmail);

      resetForm();
    } else {
      setErrorMessage(result.error || "Failed to create account");
    }

    setIsLoading(false);
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setTermsAgreed(false);
    setPasswordValidation({ isValid: false, requirements: [] });
  };

  // -----------------------------------------------------
  // 2.7 RESEND VERIFICATION
  // -----------------------------------------------------
  const resend = async () => {
    if (!pendingEmail || isResending) return;

    setIsResending(true);

    const result = await resendVerification(pendingEmail);
    if (!result.success) setErrorMessage(result.message || "Failed to resend email");
    else {
      setErrorMessage("Verification email resent!");
      setTimeout(() => setErrorMessage(""), 2000);
    }

    setIsResending(false);
  };

  // -----------------------------------------------------
  // 2.8 NAVIGATION
  // -----------------------------------------------------
  const goToLogin = () => navigation.navigate("Login");

  // -----------------------------------------------------
  // 2.9 HANDLE KEYBOARD DISMISS
  // -----------------------------------------------------
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // ---------------------------------------------------------
  // 3. RENDER UI
  // ---------------------------------------------------------
  return (
    <View style={styles.container}>
      <TopBar
        title="Create Account"
        subtitle="Join our driver community to start earning"
        showBackButton={false}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.content}
            onPress={dismissKeyboard}
          >
            {/* -----------------------------------------------
                VERIFICATION PENDING SCREEN
            ----------------------------------------------- */}
            {showVerificationPending ? (
              <View style={styles.verifyWrapper}>
                <View style={styles.verifyIconWrapper}>
                  <Ionicons name="mail-outline" size={64} color="#2AB576" />
                  <View style={styles.verifyBadge}>
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  </View>
                </View>

                <Text style={styles.verifyTitle}>Check Your Email</Text>
                <Text style={styles.verifySubtitle}>We sent a verification link to:</Text>
                <Text style={styles.verifyEmail}>{pendingEmail}</Text>

                {errorMessage !== "" && (
                  <View style={[styles.messageBox, styles.messageError]}>
                    <Ionicons name="warning" size={18} color="#FF4D4D" />
                    <Text style={styles.messageText}>{errorMessage}</Text>
                  </View>
                )}

                <Text style={styles.resendText}>
                  Didn't receive it?{" "}
                  <Text style={styles.resendLink} onPress={resend}>
                    {isResending ? "Sending..." : "Resend Email"}
                  </Text>
                </Text>

                {isResending && <ActivityIndicator size="small" color="#2AB576" />}
              </View>
            ) : (
              /* -----------------------------------------------
                  SIGN UP FORM UI
              ----------------------------------------------- */
              <>
                {errorMessage !== "" && (
                  <View style={[styles.messageBox, styles.messageError]}>
                    <Ionicons name="warning" size={18} color="#FF4D4D" />
                    <Text style={styles.messageText}>{errorMessage}</Text>
                  </View>
                )}

                <View style={styles.form}>
                  {/* Full Name */}
                  <View style={styles.inputWrap}>
                    <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Full Name"
                      style={styles.input}
                      value={fullName}
                      onChangeText={setFullName}
                      placeholderTextColor="#999"
                      returnKeyType="next"
                    />
                  </View>

                  {/* Email */}
                  <View style={styles.inputWrap}>
                    <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Email Address"
                      style={styles.input}
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      placeholderTextColor="#999"
                      returnKeyType="next"
                    />
                  </View>

                  {/* Password */}
                  <View style={styles.inputWrap}>
                    <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Password"
                      secureTextEntry={!showPassword}
                      style={styles.input}
                      onChangeText={handlePassword}
                      value={password}
                      placeholderTextColor="#999"
                      returnKeyType="next"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
                    </TouchableOpacity>
                  </View>

                  {/* Password Requirements */}
                  {password.length > 0 && (
                    <View style={styles.passwordBox}>
                      {passwordValidation.requirements.map((r, i) => (
                        <Text
                          key={i}
                          style={[
                            styles.requirement,
                            r.startsWith("✅") ? styles.reqGood : styles.reqBad,
                          ]}
                        >
                          {r}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Confirm Password */}
                  <View style={styles.inputWrap}>
                    <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Confirm Password"
                      secureTextEntry={!showConfirmPassword}
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholderTextColor="#999"
                      returnKeyType="done"
                      onSubmitEditing={handleSignUp}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
                    </TouchableOpacity>
                  </View>

                  {/* Terms */}
                  <View style={styles.termsWrap}>
                    <Checkbox value={termsAgreed} onValueChange={setTermsAgreed} color="#2AB576" />
                    <Text style={styles.termsText}>I agree to the Terms & Conditions</Text>
                  </View>

                  {/* Create Account Button */}
                  <TouchableOpacity
                    style={[
                      styles.signUpBtn,
                      (!passwordValidation.isValid || !termsAgreed) && styles.signUpDisabled,
                    ]}
                    disabled={!passwordValidation.isValid || !termsAgreed || isLoading}
                    onPress={handleSignUp}
                  >
                    {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.signUpText}>Create Account</Text>}
                  </TouchableOpacity>

                  {/* Login Redirect */}
                  <TouchableOpacity style={styles.loginRedirect} onPress={goToLogin}>
                    <Text style={styles.loginRedirectText}>Already have an account? Sign In</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ---------------------------------------------------------
// 4. STYLES
// ---------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF"
  },

  keyboardView: {
    flex: 1,
  },

  scrollView: {
    flex: 1
  },

  scrollContent: {
    flexGrow: 1
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    minHeight: height,
    flex: 1,
  },

  // VERIFICATION
  verifyWrapper: {
    alignItems: "center",
    marginTop: 40
  },

  verifyIconWrapper: {
    position: "relative",
    marginBottom: 20
  },

  verifyBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#2AB576",
    borderRadius: 10,
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  verifyTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4
  },

  verifySubtitle: {
    fontSize: 15,
    color: "#666"
  },

  verifyEmail: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2AB576",
    marginTop: 6
  },

  resendText: {
    fontSize: 14,
    color: "#666",
    marginTop: 20
  },

  resendLink: {
    color: "#2AB576",
    fontWeight: "700",
    textDecorationLine: "underline"
  },

  // MESSAGES
  messageBox: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
  },

  messageError: {
    backgroundColor: "#FFEAEA",
    borderColor: "#FFB3B3",
  },

  messageText: {
    marginLeft: 10,
    color: "#FF4D4D",
    fontWeight: "500"
  },

  // FORM
  form: {
    width: "100%",
    marginTop: 20
  },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderWidth: 1,
    borderColor: "#E2E2E2",
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 14,
  },

  inputIcon: {
    marginRight: 10
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#222"
  },

  passwordBox: {
    backgroundColor: "#F8F8F8",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    marginBottom: 14,
  },

  requirement: {
    fontSize: 13,
    marginBottom: 4
  },

  reqGood: {
    color: "#2AB576"
  },

  reqBad: {
    color: "#FF4D4D"
  },

  termsWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20
  },

  termsText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#555"
  },

  signUpBtn: {
    backgroundColor: "#2AB576",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  signUpDisabled: {
    opacity: 0.5
  },

  signUpText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600"
  },

  loginRedirect: {
    alignItems: "center"
  },

  loginRedirectText: {
    color: "#2AB576",
    fontSize: 16,
    fontWeight: "600"
  },
});