// ---------------------------------------------------------
// 1. IMPORTS
// ---------------------------------------------------------
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
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import TopBar from "../../../components/TopBar";

const { height } = Dimensions.get("window");

// ---------------------------------------------------------
// 2. COMPONENT: LoginScreen
// ---------------------------------------------------------
export default function LoginScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // -----------------------------------------------------
  // 2.1 STATE MANAGEMENT
  // -----------------------------------------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showResendOption, setShowResendOption] = useState(false);

  const { signIn, resendVerification } = useAuth();

  // -----------------------------------------------------
  // 2.2 HANDLE AUTO-PREFILL AFTER VERIFICATION
  // -----------------------------------------------------
  useEffect(() => {
    const autoLoginEmail = route.params?.autoLoginEmail;
    const message = route.params?.message;

    if (autoLoginEmail) {
      setEmail(autoLoginEmail);
      if (message) setErrorMessage(message);
    }
  }, [route.params]);

  // -----------------------------------------------------
  // 2.3 CLEAR ERRORS WHEN USER TYPES
  // -----------------------------------------------------
  useEffect(() => {
    setErrorMessage("");
    setShowResendOption(false);
  }, [email, password]);

  // -----------------------------------------------------
  // 2.4 HANDLE LOGIN
  // -----------------------------------------------------
  const handleLogin = async () => {
    setErrorMessage("");
    setShowResendOption(false);

    if (!email.trim()) return setErrorMessage("Please enter your email address");
    if (!password) return setErrorMessage("Please enter your password");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim()))
      return setErrorMessage("Please enter a valid email address");

    setIsLoading(true);

    try {
      const result = await signIn({ email: email.toLowerCase(), password });

      if (!result.success) {
        const msg = result.error || "Invalid email or password";
        setErrorMessage(msg);

        if (
          msg.toLowerCase().includes("verify") ||
          msg.toLowerCase().includes("not verified")
        ) {
          setShowResendOption(true);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------------------------------
  // 2.5 HANDLE FORGOT PASSWORD
  // -----------------------------------------------------
  const handleForgotPassword = () => {
    if (!email.trim())
      return setErrorMessage("Enter your email address first");

    setErrorMessage("Password reset link sent to your email");
  };

  // -----------------------------------------------------
  // 2.6 RESEND VERIFICATION EMAIL
  // -----------------------------------------------------
  const handleResendVerification = async () => {
    if (!email) return;

    setIsLoading(true);

    try {
      const result = await resendVerification(email.toLowerCase());
      if (result.success) {
        setErrorMessage("Verification email resent. Check your inbox.");
        setShowResendOption(false);
      } else {
        setErrorMessage(result.message || "Failed to resend email");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------------------------------
  // 2.7 NAVIGATE TO SIGN UP
  // -----------------------------------------------------
  const handleCreateAccount = () => navigation.navigate("SignUp");

  // -----------------------------------------------------
  // 2.8 HANDLE KEYBOARD DISMISS
  // -----------------------------------------------------
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // -----------------------------------------------------
  // 2.9 RENDER UI
  // -----------------------------------------------------
  return (
    <View style={styles.container}>
      <TopBar 
        title="Welcome Back" 
        subtitle="Sign in to continue to your account"
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
            {/* ---------------------------------------------------
                MESSAGE / ERRORS
            --------------------------------------------------- */}
            {errorMessage !== "" && (
              <View
                style={[
                  styles.messageContainer,
                  errorMessage.includes("sent") || errorMessage.includes("resent")
                    ? styles.messageSuccess
                    : styles.messageError,
                ]}
              >
                <Ionicons
                  name={
                    errorMessage.includes("sent") || errorMessage.includes("resent")
                      ? "checkmark-circle"
                      : "warning"
                  }
                  size={18}
                  color={
                    errorMessage.includes("sent") || errorMessage.includes("resent")
                      ? "#2AB576"
                      : "#FF4D4D"
                  }
                />
                <Text
                  style={[
                    styles.messageText,
                    {
                      color:
                        errorMessage.includes("sent") ||
                        errorMessage.includes("resent")
                          ? "#2AB576"
                          : "#FF4D4D",
                    },
                  ]}
                >
                  {errorMessage}
                </Text>
              </View>
            )}

            {/* ---------------------------------------------------
                FORM FIELDS
            --------------------------------------------------- */}
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  placeholder="Email Address"
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  editable={!isLoading}
                  placeholderTextColor="#999"
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    // Focus next input if needed, or just continue
                  }}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  placeholder="Password"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!isLoading}
                  placeholderTextColor="#999"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  (!email.trim() || !password || isLoading) && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={!email.trim() || !password || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.loginText}>Sign In</Text>
                )}
              </TouchableOpacity>

              {/* Resend Verification */}
              {showResendOption && (
                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleResendVerification}
                >
                  <Ionicons name="refresh-outline" size={16} color="#2AB576" />
                  <Text style={styles.resendText}>Resend verification email</Text>
                </TouchableOpacity>
              )}

              {/* Create Account */}
              <TouchableOpacity
                onPress={handleCreateAccount}
                style={styles.signupButton}
              >
                <Text style={styles.signupText}>Don't have an account? </Text>
                <Text style={styles.signupLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ---------------------------------------------------------
// 3. STYLES
// ---------------------------------------------------------
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FFFFFF" 
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

  // Error / Success message
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  messageError: {
    backgroundColor: "#FFECEC",
    borderColor: "#FFB4B4",
    borderWidth: 1,
  },
  messageSuccess: {
    backgroundColor: "#E7FFF1",
    borderColor: "#B4FFD3",
    borderWidth: 1,
  },
  messageText: { 
    marginLeft: 10, 
    fontSize: 14, 
    fontWeight: "500" 
  },

  // Form
  form: { 
    width: "100%" 
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 56,
    marginBottom: 14,
  },
  
  inputIcon: { 
    marginRight: 12 
  },
  
  input: { 
    flex: 1, 
    fontSize: 16, 
    color: "#222" 
  },

  eyeButton: { 
    padding: 6 
  },

  forgotPassword: { 
    alignSelf: "flex-end", 
    marginBottom: 20 
  },
  
  forgotPasswordText: { 
    color: "#2AB576", 
    fontSize: 14, 
    fontWeight: "500" 
  },

  loginButton: {
    backgroundColor: "#2AB576",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  
  loginButtonDisabled: { 
    opacity: 0.6 
  },
  
  loginText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  resendButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#F3FFF8",
  },
  
  resendText: {
    marginLeft: 8,
    color: "#2AB576",
    fontWeight: "600",
  },

  signupButton: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  
  signupText: { 
    color: "#666", 
    fontSize: 14 
  },
  
  signupLink: { 
    color: "#2AB576", 
    fontSize: 14, 
    fontWeight: "600" 
  },
});