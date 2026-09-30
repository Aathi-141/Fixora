import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function BookingSuccessfulScreen({ navigation, route }) {
  const { booking } = route.params || {};
  const [copied, setCopied] = useState(false);

  const bookingRef = booking?.bookingRef || '#FX-88431';
  const providerName =
    booking?.provider?.user?.name || booking?.provider?.name || 'Kasun Perera / Chaminda';
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
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
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

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.viewBookingsBtn}
            onPress={() => navigation.navigate('HistoryTab')}
            activeOpacity={0.85}
          >
            <Text style={styles.viewBookingsBtnText}>View My Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manageBookingBtn}
            onPress={() => navigation.navigate('CancelReschedule', { booking })}
          >
            <Ionicons name="options-outline" size={18} color={colors.forestGreen} style={{ marginRight: 6 }} />
            <Text style={styles.manageBookingText}>Manage Booking (Cancel / Reschedule)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backHomeBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.backHomeText}>Back to Home</Text>
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
    paddingBottom: 32,
  },
  celebrationCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.emerald,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
    marginBottom: 20,
  },
  refContainer: {
    backgroundColor: '#EBF4EE',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  refLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  refCode: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.forestGreen,
    marginRight: 10,
    letterSpacing: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
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
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 20,
  },
  summaryHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.forestGreen,
    marginBottom: 14,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconStyle: {
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  itemSub: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 1,
  },
  actionSection: {
    width: '100%',
  },
  viewBookingsBtn: {
    backgroundColor: colors.emerald,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  viewBookingsBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  manageBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.sageGreen,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F3F9F5',
    marginBottom: 12,
  },
  manageBookingText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  backHomeBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  backHomeText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
