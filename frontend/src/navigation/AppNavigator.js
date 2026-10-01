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
import CustomerProfileScreen from '../screens/member1/CustomerProfileScreen';

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
import ProviderAccountScreen from '../screens/member4/ProviderAccountScreen';
import AdminDashboardScreen from '../screens/member4/AdminDashboardScreen';
import FinalBillPaymentScreen from '../screens/member4/FinalBillPaymentScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const commonTabScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.forestGreen,
  tabBarInactiveTintColor: '#8A9A8E',
  tabBarStyle: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    height: Platform.OS === 'ios' ? 78 : 66,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 8,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 0,
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10,
  },
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
};

// 1. Customer Portal (Explore, Bookings, Messages, Profile)
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

          return (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ionicons name={iconName} size={22} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Explore' }} />
      <Tab.Screen name="HistoryTab" component={ServiceHistoryScreen} options={{ title: 'Bookings' }} />
      <Tab.Screen name="ChatTab" component={ChatScreen} options={{ title: 'Messages' }} />
      <Tab.Screen name="ProfileTab" component={CustomerProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

// 2. Provider Portal (Requests, Schedule, My Jobs, Profile)
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

          return (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ionicons name={iconName} size={22} color={color} />
            </View>
          );
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

// 3. Admin Management Portal (KPIs, Verifications & Disputes)
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

          return (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ionicons name={iconName} size={22} color={color} />
            </View>
          );
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

        {/* Role-Based Tab Navigator */}
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
        <Stack.Screen name="ProviderAccount" component={ProviderAccountScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="FinalBillPayment" component={FinalBillPaymentScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: '#EBF5EE',
  },
});
