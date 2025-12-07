// ---------------------------------------------------------
// 1. IMPORTS
// ---------------------------------------------------------
import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  SafeAreaView,
  Image,
  Animated,
  Dimensions,
  View,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");


// ---------------------------------------------------------
// 2. COMPONENT: WelcomeScreen
// ---------------------------------------------------------
export default function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp<any>>();

  // -------------------------------------------------------
  // 2.1 ANIMATION VALUES
  // -------------------------------------------------------
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;


  // -------------------------------------------------------
  // 2.2 RUN ENTRY ANIMATION + AUTO NAVIGATION
  // -------------------------------------------------------
  useEffect(() => {
    // Logo fade + scale in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-transition after 3 seconds
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => navigation.navigate("Login" as never));
    }, 3000);

    return () => clearTimeout(timer);
  }, []);


  // -------------------------------------------------------
  // 2.3 RENDER UI
  // -------------------------------------------------------
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={require("../../../assets/detourlogo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}


// ---------------------------------------------------------
// 3. STYLES
// ---------------------------------------------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 220,
    height: 220,
  },
});
