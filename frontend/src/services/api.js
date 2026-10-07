import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Automatically detect host computer IP when using Expo Go on physical device or emulator
export const getApiBaseUrl = () => {
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      Constants.manifest2?.extra?.expoClient?.hostUri ||
      Constants.manifest?.debuggerHost;

    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (
        ip &&
        ip !== 'localhost' &&
        ip !== '127.0.0.1' &&
        !ip.startsWith('192.168.139.') &&
        !ip.startsWith('192.168.200.') &&
        !ip.startsWith('10.0.1.')
      ) {
        return `http://${ip}:5000`;
      }
    }
  } catch (e) {
    // fallback
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:5000';
  }

  // Active Wi-Fi IP address
  return 'http://192.168.8.176:5000';
};

export let API_BASE_URL = getApiBaseUrl();

// Helper for fetch with auth token and timeout
const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout for reliable cloud database requests

  try {
    const token = await AsyncStorage.getItem('fixora_token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers,
      signal: controller.signal,
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    // Refresh base URL dynamically in case network changed
    API_BASE_URL = getApiBaseUrl();

    const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
    clearTimeout(timeoutId);
    const data = await res.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`API call error on ${endpoint}:`, error.message);
    return { success: false, message: error.message, isNetworkError: true };
  }
};

// ----------------- Auth API (Member 1) -----------------
export const loginUser = (email, password) => apiRequest('/api/auth/login', 'POST', { email, password });
export const registerUser = (userData) => apiRequest('/api/auth/register', 'POST', userData);
export const googleAuthUser = (googleData) => apiRequest('/api/auth/google', 'POST', googleData);
export const getMyProfile = () => apiRequest('/api/auth/me');
export const updateUserProfile = (profileData) => apiRequest('/api/auth/profile', 'PUT', profileData);

// ----------------- Providers API (Member 1 & 4) -----------------
export const getProviders = (params = {}) => {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'All') query.append('category', params.category);
  if (params.search) query.append('search', params.search);
  if (params.minRating) query.append('minRating', params.minRating);
  if (params.maxPrice) query.append('maxPrice', params.maxPrice);
  if (params.city) query.append('city', params.city);
  if (params.radius) query.append('radius', params.radius);
  if (params.availableOnly) query.append('availableOnly', params.availableOnly);
  const qStr = query.toString() ? `?${query.toString()}` : '';
  return apiRequest(`/api/providers${qStr}`);
};
export const getProviderById = (id) => apiRequest(`/api/providers/${id}`);
export const updateProviderAvailability = (data) => apiRequest('/api/provider/availability', 'PUT', data);
export const updateProviderProfile = (data) => apiRequest('/api/provider/profile', 'PUT', data);
export const getProviderRequests = (providerId, status) => {
  const query = new URLSearchParams();
  if (providerId) query.append('providerId', providerId);
  if (status) query.append('status', status);
  const qStr = query.toString() ? `?${query.toString()}` : '';
  return apiRequest(`/api/provider/requests${qStr}`);
};

// ----------------- Bookings API (Member 2, 3 & 4) -----------------
export const createBooking = (bookingData) => apiRequest('/api/bookings', 'POST', bookingData);
export const getBookingById = (id) => apiRequest(`/api/bookings/${id}`);
export const getMyBookings = () => apiRequest('/api/bookings/my-history');
export const rescheduleBooking = (id, scheduledDate, timeSlot, notes) =>
  apiRequest(`/api/bookings/${id}/reschedule`, 'PUT', { scheduledDate, timeSlot, notes });
export const cancelBooking = (id, cancellationReason) =>
  apiRequest(`/api/bookings/${id}/cancel`, 'PUT', { cancellationReason });
export const updateBookingStatus = (id, status, etaMinutes, rejectionReason) =>
  apiRequest(`/api/bookings/${id}/status`, 'PUT', { status, etaMinutes, rejectionReason });
export const payBooking = (id, paymentMethod) => apiRequest(`/api/bookings/${id}/pay`, 'POST', { paymentMethod });

// ----------------- Chat API (Member 3) -----------------
export const getChatMessages = (bookingId) => apiRequest(`/api/bookings/${bookingId}/messages`);
export const sendChatMessage = (bookingId, msgData) => apiRequest(`/api/bookings/${bookingId}/messages`, 'POST', msgData);

// ----------------- Reviews API (Member 3) -----------------
export const submitReview = (reviewData) => apiRequest('/api/reviews', 'POST', reviewData);
export const getProviderReviews = (providerId) => apiRequest(`/api/reviews/provider/${providerId}`);

// ----------------- Admin API (Member 4) -----------------
export const getAdminOverview = () => apiRequest('/api/admin/overview');
export const getAdminUsers = () => apiRequest('/api/admin/users');
export const getAdminProviders = () => apiRequest('/api/admin/providers');
export const verifyProvider = (id, status) => apiRequest(`/api/admin/providers/${id}/verify`, 'PUT', { status });
export const getAdminBookings = () => apiRequest('/api/admin/bookings');
export const getAdminDisputes = () => apiRequest('/api/admin/disputes');
export const resolveDispute = (id, resolutionNotes) => apiRequest(`/api/admin/disputes/${id}/resolve`, 'PUT', { resolutionNotes });
