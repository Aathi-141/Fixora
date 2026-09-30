import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';

// Member 1 Screens
import SplashScreen from '../screens/member1/SplashScreen';
import LoginScreen from '../screens/member1/LoginScreen';
import AccountTypeScreen from '../screens/member1/AccountTypeScreen';
import CustomerSignUpScreen from '../screens/member1/CustomerSignUpScreen';
import ProviderSignUpScreen from '../screens/member1/ProviderSignUpScreen';
import HomeScreen from '../screens/member1/HomeScreen';
import FiltersScreen from '../screens/member1/FiltersScreen';
import ProviderProfileScreen from '../screens/member1/ProviderProfileScreen';

// Member 2 Screens
import DateTimeSelectionScreen from '../screens/member2/DateTimeSelectionScreen';
import BookingDetailsScreen from '../screens/member2/BookingDetailsScreen';
import BookingSuccessfulScreen from '../screens/member2/BookingSuccessfulScreen';
import CancelRescheduleScreen from '../screens/member2/CancelRescheduleScreen';

// Member 3 Screens
import RequestStatusTrackingScreen from '../screens/member3/RequestStatusTrackingScreen';
import ChatScreen from '../screens/member3/ChatScreen';
import CallScreen from '../screens/member3/CallScreen';
import RateReviewScreen from '../screens/member3/RateReviewScreen';
import ServiceHistoryScreen from '../screens/member3/ServiceHistoryScreen';

// Member 4 Screens
import ProviderRequestsScreen from '../screens/member4/ProviderRequestsScreen';
import ProviderAvailabilityScreen from '../screens/member4/ProviderAvailabilityScreen';
import AdminDashboardScreen from '../screens/member4/AdminDashboardScreen';
import FinalBillPaymentScreen from '../screens/member4/FinalBillPaymentScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.forestGreen,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.cardBorder,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'HistoryTab') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'ProviderTab') {
            iconName = focused ? 'construct' : 'construct-outline';
          } else if (route.name === 'AvailabilityTab') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'AdminTab') {
            iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Explore' }} />
      <Tab.Screen name="HistoryTab" component={ServiceHistoryScreen} options={{ title: 'Bookings' }} />
      <Tab.Screen name="ProviderTab" component={ProviderRequestsScreen} options={{ title: 'Requests' }} />
      <Tab.Screen name="AvailabilityTab" component={ProviderAvailabilityScreen} options={{ title: 'Schedule' }} />
      <Tab.Screen name="AdminTab" component={AdminDashboardScreen} options={{ title: 'Admin' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.background },
        }}
      >
        {/* Onboarding & Auth (Member 1) */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AccountType" component={AccountTypeScreen} />
        <Stack.Screen name="CustomerSignUp" component={CustomerSignUpScreen} />
        <Stack.Screen name="ProviderSignUp" component={ProviderSignUpScreen} />

        {/* Main Tabs Container */}
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />

        {/* Service Discovery (Member 1) */}
        <Stack.Screen
          name="Filters"
          component={FiltersScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="ProviderProfile" component={ProviderProfileScreen} />

        {/* Booking Flow (Member 2) */}
        <Stack.Screen name="DateTimeSelection" component={DateTimeSelectionScreen} />
        <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
        <Stack.Screen name="BookingSuccessful" component={BookingSuccessfulScreen} />
        <Stack.Screen name="CancelReschedule" component={CancelRescheduleScreen} />

        {/* Status, Chat & Reviews (Member 3) */}
        <Stack.Screen name="RequestStatusTracking" component={RequestStatusTrackingScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen
          name="Call"
          component={CallScreen}
          options={{ presentation: 'fullScreenModal' }}
        />
        <Stack.Screen name="RateReview" component={RateReviewScreen} />

        {/* Provider & Admin Management (Member 4) */}
        <Stack.Screen name="ProviderRequests" component={ProviderRequestsScreen} />
        <Stack.Screen name="ProviderAvailability" component={ProviderAvailabilityScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="FinalBillPayment" component={FinalBillPaymentScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
