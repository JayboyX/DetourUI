import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";

import { useNavigation, NavigationProp } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp<any>>();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current; // opacity
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // slight zoom

  useEffect(() => {
    // Fade-in + scale-in
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

    // Stay for 3 seconds, then fade out + navigate
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
      ]).start(() => navigation.navigate("Dashboard"));
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>

        {/* FADE-IN / FADE-OUT LOGO */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            alignItems: "center",
          }}
        >
          <Image
            source={require("../assets/detourlogo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },

  logo: {
    width: 220,
    height: 220,
  },
});
