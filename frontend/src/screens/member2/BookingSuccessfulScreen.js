import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function BookingSuccessfulScreen({ navigation, route }) {
  const [booking, setBooking] = useState(route.params?.booking || null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (route.params?.booking) {
      setBooking(route.params.booking);
    }
  }, [route.params?.booking]);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('fixora_latest_booking').then((stored) => {
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed) {
              setBooking(parsed);
            }
          } catch (e) {}
        }
      });
    }, [])
  );

  const bookingRef = booking?.bookingRef || '#FX-88431';
  const providerName =
    booking?.provider?.user?.name || booking?.provider?.name || 'Selected Specialist';
  const scheduledDate = booking?.scheduledDate || 'Thursday, Oct 24, 2026';
  const timeSlot = booking?.timeSlot || '08:30 AM';
  const totalAmount = booking?.pricing?.totalAmount || 3750;

  const specialInstructions =
    booking?.notes && booking.notes.trim().length > 0
      ? booking.notes.trim()
      : 'No special instructions given';

  const handleCopyRef = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCancelled = booking?.status?.toLowerCase() === 'cancelled';

  const navigateToHome = () => {
    try {
      const state = navigation.getState?.();
      const routeNames = state?.routeNames || [];
      if (routeNames.includes('Home')) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
        return;
      }
    } catch (e) {
      console.warn('Reset error on navigateToHome:', e);
    }

    try {
      if (navigation.canGoBack()) {
        navigation.popToTop();
      }
    } catch (_) {}

    navigation.navigate('HomeTab', {
      screen: 'Home',
    });
  };

  const navigateToBookings = () => {
    const parent = navigation.getParent?.();
    try {
      const state = navigation.getState?.();
      const routeNames = state?.routeNames || [];
      if (routeNames.includes('Home')) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    } catch (e) {
      console.warn('Reset error before history:', e);
    }

    if (parent) {
      parent.navigate('HistoryTab', {
        screen: 'ServiceHistory',
        params: { refresh: Date.now() },
      });
    } else {
      navigation.navigate('HistoryTab', {
        screen: 'ServiceHistory',
        params: { refresh: Date.now() },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={navigateToHome}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isCancelled ? 'Booking Cancelled' : 'Booking Confirmed'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Celebration / Status Badge */}
        <View style={styles.celebrationCard}>
          <View style={[styles.checkCircle, isCancelled && { backgroundColor: '#EF4444' }]}>
            <Ionicons name={isCancelled ? 'close' : 'checkmark'} size={44} color={colors.white} />
          </View>
          <Text style={[styles.successTitle, isCancelled && { color: '#B91C1C' }]}>
            {isCancelled ? 'Booking Cancelled' : 'Booking Successful!'}
          </Text>
          <Text style={styles.successSub}>
            {isCancelled
              ? `This service request has been cancelled. A 100% refund of LKR ${totalAmount.toLocaleString()} has been initiated to your original payment method.`
              : 'Your service request has been confirmed and scheduled with the specialist.'}
          </Text>

          {/* Reference Pill with Copy Button */}
          <View style={styles.refContainer}>
            <Text style={styles.refLabel}>Booking Reference:</Text>
            <View style={styles.refRow}>
              <Text style={styles.refCode}>{bookingRef}</Text>
              <TouchableOpacity style={styles.copyBtn} onPress={handleCopyRef}>
                <Ionicons
                  name={copied ? 'checkmark' : 'copy-outline'}
                  size={16}
                  color={copied ? colors.forestGreen : colors.textSecondary}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.copyBtnText, copied && { color: colors.forestGreen }]}>
                  {copied ? 'Copied!' : 'Copy'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Appointment Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryHeading}>Appointment Summary</Text>

          {isCancelled && (
            <View style={styles.detailItem}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" style={styles.iconStyle} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>Booking Status</Text>
                <Text style={[styles.itemSub, { color: '#DC2626', fontWeight: '700' }]}>
                  Cancelled (100% Refund Initiated)
                </Text>
              </View>
            </View>
          )}

          <View style={styles.detailItem}>
            <Ionicons name="person-outline" size={18} color={colors.forestGreen} style={styles.iconStyle} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Assigned Specialist</Text>
              <Text style={styles.itemSub}>{providerName}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={18} color={colors.forestGreen} style={styles.iconStyle} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Date & Time</Text>
              <Text style={styles.itemSub}>
                {scheduledDate} at {timeSlot}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={18} color={colors.forestGreen} style={styles.iconStyle} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Service Address</Text>
              <Text style={styles.itemSub}>
                {booking?.serviceAddress || 'No 42, New Kandy Road, Malabe'}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="document-text-outline" size={18} color={colors.forestGreen} style={styles.iconStyle} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Special Instructions</Text>
              <Text
                style={[
                  styles.itemSub,
                  (!booking?.notes || !booking.notes.trim()) && {
                    fontStyle: 'italic',
                    color: colors.textMuted,
                  },
                ]}
              >
                {specialInstructions}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="wallet-outline" size={18} color={colors.forestGreen} style={styles.iconStyle} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Confirmed Total</Text>
              <Text style={styles.itemSub}>LKR {totalAmount.toLocaleString()} (Pay after service)</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionSection}>
          {isCancelled ? (
            <>
              <TouchableOpacity
                style={styles.trackStatusBtn}
                onPress={navigateToHome}
                activeOpacity={0.85}
              >
                <Ionicons name="compass-outline" size={20} color={colors.white} style={{ marginRight: 8 }} />
                <Text style={styles.trackStatusBtnText}>Explore Other Specialists</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.manageLinkBtn}
                onPress={navigateToBookings}
              >
                <Text style={styles.manageLinkText}>View In Service Request History</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.trackStatusBtn}
                onPress={() => navigation.navigate('RequestStatusTracking', { booking })}
                activeOpacity={0.85}
              >
                <Ionicons name="navigate-outline" size={20} color={colors.white} style={{ marginRight: 8 }} />
                <Text style={styles.trackStatusBtnText}>Track Specialist in Timeline</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.manageLinkBtn}
                onPress={() => navigation.navigate('CancelReschedule', { booking })}
              >
                <Text style={styles.manageLinkText}>Need to change time? Reschedule / Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.forestGreen,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  scrollBody: {
    padding: 20,
    paddingBottom: 110,
  },
  celebrationCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.forestGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.forestGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  successSub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  refContainer: {
    backgroundColor: '#F8FAF9',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  refLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  refCode: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.forestGreen,
    letterSpacing: 1,
    marginRight: 10,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 14,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconStyle: {
    marginRight: 14,
    marginTop: 2,
  },
  itemTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  itemSub: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  actionSection: {
    gap: 12,
  },
  trackStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forestGreen,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: colors.forestGreen,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  trackStatusBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  manageLinkBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  manageLinkText: {
    fontSize: 13,
    color: colors.emerald,
    fontWeight: '600',
  },
});
