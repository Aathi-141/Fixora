import React, { useContext } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
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

// Member 2 Screens (Aathika: Booking Flow & Customer Profile)
import DateTimeSelectionScreen from '../screens/member2/DateTimeSelectionScreen';
import BookingDetailsScreen from '../screens/member2/BookingDetailsScreen';
import BookingSuccessfulScreen from '../screens/member2/BookingSuccessfulScreen';
import CancelRescheduleScreen from '../screens/member2/CancelRescheduleScreen';
import CustomerProfileScreen from '../screens/member2/CustomerProfileScreen';

// Member 3 Screens
import RequestStatusTrackingScreen from '../screens/member3/RequestStatusTrackingScreen';
import ChatScreen from '../screens/member3/ChatScreen';
import CallScreen from '../screens/member3/CallScreen';
import RateReviewScreen from '../screens/member3/RateReviewScreen';
import ServiceHistoryScreen from '../screens/member3/ServiceHistoryScreen';

// Member 4 Screens
import ProviderRequestsScreen from '../screens/member4/ProviderRequestsScreen';
import ProviderAvailabilityScreen from '../screens/member4/ProviderAvailabilityScreen';
import ProviderAccountScreen from '../screens/member4/ProviderAccountScreen';
import AdminDashboardScreen from '../screens/member4/AdminDashboardScreen';
import FinalBillPaymentScreen from '../screens/member4/FinalBillPaymentScreen';

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const BookingsStack = createNativeStackNavigator();

// Breathable, non-clipping tab bar options for Android and iOS
const commonTabScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.forestGreen,
  tabBarInactiveTintColor: '#8A9A8E',
  tabBarStyle: {
    backgroundColor: '#FFFFFF',
    height: Platform.OS === 'ios' ? 84 : 70,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: Platform.OS === 'android' ? 2 : 0,
  },
};

// 1. Home / Explore Stack (Keeps bottom tab bar visible across the entire booking journey)
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen
        name="Filters"
        component={FiltersScreen}
        options={{ presentation: 'modal' }}
      />
      <HomeStack.Screen name="ProviderProfile" component={ProviderProfileScreen} />
      <HomeStack.Screen name="DateTimeSelection" component={DateTimeSelectionScreen} />
      <HomeStack.Screen name="BookingDetails" component={BookingDetailsScreen} />
      <HomeStack.Screen name="BookingSuccessful" component={BookingSuccessfulScreen} />
      <HomeStack.Screen name="CancelReschedule" component={CancelRescheduleScreen} />
      <HomeStack.Screen name="RequestStatusTracking" component={RequestStatusTrackingScreen} />
      <HomeStack.Screen name="Chat" component={ChatScreen} />
      <HomeStack.Screen name="Call" component={CallScreen} />
      <HomeStack.Screen name="RateReview" component={RateReviewScreen} />
      <HomeStack.Screen name="FinalBillPayment" component={FinalBillPaymentScreen} />
    </HomeStack.Navigator>
  );
}

// 2. Bookings & History Stack (Keeps bottom tab bar visible during management & tracking)
function BookingsStackNavigator() {
  return (
    <BookingsStack.Navigator screenOptions={{ headerShown: false }}>
      <BookingsStack.Screen name="ServiceHistory" component={ServiceHistoryScreen} />
      <BookingsStack.Screen name="DateTimeSelection" component={DateTimeSelectionScreen} />
      <BookingsStack.Screen name="BookingDetails" component={BookingDetailsScreen} />
      <BookingsStack.Screen name="BookingSuccessful" component={BookingSuccessfulScreen} />
      <BookingsStack.Screen name="ProviderProfile" component={ProviderProfileScreen} />
      <BookingsStack.Screen name="RequestStatusTracking" component={RequestStatusTrackingScreen} />
      <BookingsStack.Screen name="Chat" component={ChatScreen} />
      <BookingsStack.Screen name="Call" component={CallScreen} />
      <BookingsStack.Screen name="CancelReschedule" component={CancelRescheduleScreen} />
      <BookingsStack.Screen name="RateReview" component={RateReviewScreen} />
      <BookingsStack.Screen name="FinalBillPayment" component={FinalBillPaymentScreen} />
    </BookingsStack.Navigator>
  );
}

// Customer Portal (Explore, Bookings, Messages, Profile)
function CustomerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...commonTabScreenOptions,
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === 'HomeTab') iconName = focused ? 'compass' : 'compass-outline';
          else if (route.name === 'HistoryTab') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'ChatTab') iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
          else if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: 'Explore' }} />
      <Tab.Screen name="HistoryTab" component={BookingsStackNavigator} options={{ title: 'Bookings' }} />
      <Tab.Screen name="ChatTab" component={ChatScreen} options={{ title: 'Messages' }} />
      <Tab.Screen name="ProfileTab" component={CustomerProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

// Provider Portal (Requests, Schedule, My Jobs, Profile)
function ProviderTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...commonTabScreenOptions,
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === 'ProviderRequestsTab') iconName = focused ? 'clipboard' : 'clipboard-outline';
          else if (route.name === 'AvailabilityTab') iconName = focused ? 'time' : 'time-outline';
          else if (route.name === 'ProviderJobsTab') iconName = focused ? 'briefcase' : 'briefcase-outline';
          else if (route.name === 'ProviderProfileTab') iconName = focused ? 'person-circle' : 'person-circle-outline';

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="ProviderRequestsTab" component={ProviderRequestsScreen} options={{ title: 'Requests' }} />
      <Tab.Screen name="AvailabilityTab" component={ProviderAvailabilityScreen} options={{ title: 'Schedule' }} />
      <Tab.Screen name="ProviderJobsTab" component={ServiceHistoryScreen} options={{ title: 'My Jobs' }} />
      <Tab.Screen name="ProviderProfileTab" component={ProviderAccountScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

// Admin Management Portal (KPIs, Verifications & Disputes)
function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...commonTabScreenOptions,
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === 'AdminDashboardTab') iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
          else if (route.name === 'AdminBookingsTab') iconName = focused ? 'clipboard' : 'clipboard-outline';
          else if (route.name === 'AdminProfileTab') iconName = focused ? 'settings' : 'settings-outline';

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="AdminDashboardTab" component={AdminDashboardScreen} options={{ title: 'Overview' }} />
      <Tab.Screen name="AdminBookingsTab" component={ServiceHistoryScreen} options={{ title: 'All Bookings' }} />
      <Tab.Screen name="AdminProfileTab" component={CustomerProfileScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

function MainTabNavigator() {
  const { user } = useContext(AuthContext);

  if (user?.role === 'admin') {
    return <AdminTabNavigator />;
  } else if (user?.role === 'provider') {
    return <ProviderTabNavigator />;
  }
  return <CustomerTabNavigator />;
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.background },
        }}
      >
        {/* Onboarding & Auth */}
        <RootStack.Screen name="Splash" component={SplashScreen} />
        <RootStack.Screen name="Login" component={LoginScreen} />
        <RootStack.Screen name="AccountType" component={AccountTypeScreen} />
        <RootStack.Screen name="CustomerSignUp" component={CustomerSignUpScreen} />
        <RootStack.Screen name="ProviderSignUp" component={ProviderSignUpScreen} />

        {/* Role-Based Tab Navigator */}
        <RootStack.Screen name="MainTabs" component={MainTabNavigator} />

        {/* VoIP Call Screen (Full Screen Modal) */}
        <RootStack.Screen
          name="Call"
          component={CallScreen}
          options={{ presentation: 'fullScreenModal' }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
