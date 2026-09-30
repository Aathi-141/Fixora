import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Standard port is 5000. In Android emulator use 10.0.2.2, otherwise localhost or LAN IP.
export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:5000',
  default: 'http://localhost:5000',
});

// Helper for fetch with auth token
const apiRequest = async (endpoint, method = 'GET', body = null) => {
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
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn(`API call error on ${endpoint}:`, error.message);
    return { success: false, message: error.message };
  }
};

// ----------------- Auth API (Member 1) -----------------
export const loginUser = (email, password) => apiRequest('/api/auth/login', 'POST', { email, password });
export const registerUser = (userData) => apiRequest('/api/auth/register', 'POST', userData);
export const googleAuthUser = (googleData) => apiRequest('/api/auth/google', 'POST', googleData);
export const getMyProfile = () => apiRequest('/api/auth/me');

// ----------------- Providers API (Member 1 & 4) -----------------
export const getProviders = (params = {}) => {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'All') query.append('category', params.category);
  if (params.search) query.append('search', params.search);
  if (params.minRating) query.append('minRating', params.minRating);
  if (params.maxPrice) query.append('maxPrice', params.maxPrice);
  const qStr = query.toString() ? `?${query.toString()}` : '';
  return apiRequest(`/api/providers${qStr}`);
};
export const getProviderById = (id) => apiRequest(`/api/providers/${id}`);
export const updateProviderAvailability = (data) => apiRequest('/api/provider/availability', 'PUT', data);
export const updateProviderProfile = (data) => apiRequest('/api/provider/profile', 'PUT', data);
export const getProviderRequests = (providerId) =>
  apiRequest(providerId ? `/api/provider/requests?providerId=${providerId}` : '/api/provider/requests');

// ----------------- Bookings API (Member 2, 3 & 4) -----------------
export const createBooking = (bookingData) => apiRequest('/api/bookings', 'POST', bookingData);
export const getBookingById = (id) => apiRequest(`/api/bookings/${id}`);
export const getMyBookings = () => apiRequest('/api/bookings/my-history');
export const rescheduleBooking = (id, scheduledDate, timeSlot) =>
  apiRequest(`/api/bookings/${id}/reschedule`, 'PUT', { scheduledDate, timeSlot });
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
export const getAdminProviders = () => apiRequest('/api/admin/providers');
export const verifyProvider = (id, status) => apiRequest(`/api/admin/providers/${id}/verify`, 'PUT', { status });
export const getAdminDisputes = () => apiRequest('/api/admin/disputes');
export const resolveDispute = (id, resolutionNotes) => apiRequest(`/api/admin/disputes/${id}/resolve`, 'PUT', { resolutionNotes });
