import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import WelcomeScreen from "./src/app/auth/WelcomeScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import LoginScreen from "./src/app/auth/LoginScreen";
import SignUpScreen from "./src/app/auth/SignUpScreen";
import EmailVerificationScreen from "./src/screens/EmailVerificationScreen";
import KYCScreen from "./src/screens/KYCScreen"; // Import the KYC screen
import SubscriptionScreen from "./src/screens/SubscriptionScreen";
import AdvanceScreen from "./src/screens/AdvanceScreen";
import BuyScreen from "./src/screens/BuyScreen";
import WithdrawalScreen from "./src/screens/WithdrawalScreen";
import RewardsScreen from "./src/screens/RewardsScreen";
import WalletScreen from "./src/screens/WalletScreen";
import StatementsScreen from "./src/screens/StatementsScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import { ActivityIndicator, View, StatusBar } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Stack = createNativeStackNavigator();

// Create separate navigator components with React.memo to prevent unnecessary re-renders
const AuthStack = React.memo(() => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FFFFFF" },
        animation: "slide_from_right",
        gestureEnabled: true,
      }}
      initialRouteName="Welcome"
    >
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
    </Stack.Navigator>
  );
});

const AppStack = React.memo(() => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FFFFFF" },
        animation: "slide_from_right",
        gestureEnabled: true,
      }}
      initialRouteName="Dashboard"
    >
      {/* Dashboard Screen */}
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ 
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
      {/* KYC Screen */}
      <Stack.Screen 
        name="KYC" 
        component={KYCScreen}
        options={{ 
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      />
      {/* Subscription Screen */}
      <Stack.Screen 
        name="Subscription" 
        component={SubscriptionScreen}
        options={{ 
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      />
      {/* Advance Screen */}
      <Stack.Screen 
        name="Advance" 
        component={AdvanceScreen}
        options={{ 
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      />
      {/* Buy Screen */}
      <Stack.Screen 
        name="Buy" 
        component={BuyScreen}
        options={{ 
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      />
      {/* Withdrawal Screen */}
      <Stack.Screen 
        name="Withdrawal" 
        component={WithdrawalScreen}
        options={{ 
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      />
      {/* Rewards Screen */}
      <Stack.Screen 
        name="Rewards" 
        component={RewardsScreen}
        options={{ 
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      />
      {/* Wallet Screen */}
      <Stack.Screen 
        name="Wallet" 
        component={WalletScreen}
        options={{ 
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      />
      {/* Statements Screen */}
      <Stack.Screen 
        name="Statements" 
        component={StatementsScreen}
        options={{ 
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      />
      {/* Profile Screen */}
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      />
      {/* Add other authenticated screens here as needed */}
    </Stack.Navigator>
  );
});

// Main AppNavigator component - wraps everything
function AppNavigator() {
  const { user, isLoading } = useAuth();

  // Show loading screen only during initial auth check
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

  // Return the appropriate stack based on auth state
  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#FFFFFF" 
        translucent={false}
      />
      {user ? <AppStack /> : <AuthStack />}
    </>
  );
}

// Memoize the AuthProvider to prevent unnecessary re-renders
const MemoizedAuthProvider = React.memo(AuthProvider);

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <MemoizedAuthProvider>
          <NavigationContainer
            // Minimal onStateChange to reduce re-renders
            onStateChange={(state) => {
              // Only log in development
              if (__DEV__) {
                console.log('Navigation state changed:', state);
              }
            }}
            // Remove fallback to prevent conflicts with our loading screen
          >
            <AppNavigator />
          </NavigationContainer>
        </MemoizedAuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}