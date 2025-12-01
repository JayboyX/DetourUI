import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import LoginScreen from "./src/screens/LoginScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import EmailVerificationScreen from "./src/screens/EmailVerificationScreen";
import { ActivityIndicator, View, StatusBar } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#FFFFFF' 
      }}>
        <ActivityIndicator size="large" color="#2AB576" />
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      </View>
    );
  }

  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#FFFFFF" 
        translucent={false}
      />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#FFFFFF" },
          animation: "slide_from_right",
          gestureEnabled: true,
        }}
        initialRouteName="Welcome"
      >
        {!user ? (
          // Auth screens - User is NOT logged in
          <>
            <Stack.Screen 
              name="Welcome" 
              component={WelcomeScreen}
              options={{ 
                animation: 'fade',
                gestureEnabled: false,
              }}
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ 
                animation: 'slide_from_bottom',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="SignUp" 
              component={SignUpScreen}
              options={{ 
                animation: 'slide_from_bottom',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="EmailVerification" 
              component={EmailVerificationScreen}
              options={{ 
                animation: 'slide_from_right',
                gestureEnabled: true,
              }}
            />
          </>
        ) : (
          // App screens - User IS logged in
          <>
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardScreen}
              options={{ 
                animation: 'fade',
                gestureEnabled: false,
              }}
            />
            {/* Add other authenticated screens here */}
            {/* Example:
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{ animation: 'slide_from_right' }}
            />
            */}
          </>
        )}
      </Stack.Navigator>
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}