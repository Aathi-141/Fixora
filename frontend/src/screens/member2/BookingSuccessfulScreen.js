import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function BookingSuccessfulScreen({ navigation, route }) {
  const { booking } = route.params || {};
  const [copied, setCopied] = useState(false);

  const bookingRef = booking?.bookingRef || '#FX-88431';
  const providerName =
    booking?.provider?.user?.name || booking?.provider?.name || 'Kasun Perera / Specialist';
  const scheduledDate = booking?.scheduledDate || 'Thursday, Oct 15, 2026';
  const timeSlot = booking?.timeSlot || '11:00 AM';
  const totalAmount = booking?.pricing?.totalAmount || 3750;

  const handleCopyRef = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Confirmed</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Celebration Badge */}
        <View style={styles.celebrationCard}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={44} color={colors.white} />
          </View>
          <Text style={styles.successTitle}>Booking Successful!</Text>
          <Text style={styles.successSub}>
            Your service request has been confirmed and scheduled with the specialist.
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

          <View style={styles.detailItem}>
            <Ionicons name="person-outline" size={18} color={colors.forestGreen} style={styles.iconStyle} />
            <View>
              <Text style={styles.itemTitle}>Assigned Specialist</Text>
              <Text style={styles.itemSub}>{providerName}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={18} color={colors.forestGreen} style={styles.iconStyle} />
            <View>
              <Text style={styles.itemTitle}>Date & Time</Text>
              <Text style={styles.itemSub}>
                {scheduledDate} at {timeSlot}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="wallet-outline" size={18} color={colors.forestGreen} style={styles.iconStyle} />
            <View>
              <Text style={styles.itemTitle}>Confirmed Total</Text>
              <Text style={styles.itemSub}>LKR {totalAmount.toLocaleString()} (Pay after service)</Text>
            </View>
          </View>
        </View>

        {/* Clean Action Section with direct nav bar integration */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.trackStatusBtn}
            onPress={() => navigation.navigate('RequestStatusTracking', { booking })}
            activeOpacity={0.85}
          >
            <Ionicons name="navigate-outline" size={20} color={colors.white} style={{ marginRight: 8 }} />
            <Text style={styles.trackStatusBtnText}>Track Specialist in Timeline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewBookingsBtn}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs', state: { routes: [{ name: 'HistoryTab' }] } }] })}
            activeOpacity={0.85}
          >
            <Ionicons name="calendar" size={18} color={colors.forestGreen} style={{ marginRight: 6 }} />
            <Text style={styles.viewBookingsBtnText}>Go to Bookings Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manageLinkBtn}
            onPress={() => navigation.navigate('CancelReschedule', { booking })}
          >
            <Text style={styles.manageLinkText}>Need to change time? Reschedule / Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  scrollBody: {
    padding: 20,
    paddingBottom: 40,
  },
  celebrationCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.emerald,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.forestGreen,
    marginBottom: 6,
  },
  successSub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  refContainer: {
    backgroundColor: '#EBF4EE',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  refLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refCode: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.forestGreen,
    letterSpacing: 1,
    marginRight: 12,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 8,
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
    borderColor: colors.cardBorder,
  },
  summaryHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconStyle: {
    marginRight: 12,
    width: 24,
  },
  itemTitle: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
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
    backgroundColor: colors.emerald,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  trackStatusBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  viewBookingsBtn: {
    flexDirection: 'row',
    backgroundColor: '#EBF4EE',
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C3DFCA',
  },
  viewBookingsBtnText: {
    color: colors.forestGreen,
    fontSize: 14,
    fontWeight: '700',
  },
  manageLinkBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  manageLinkText: {
    fontSize: 13,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
