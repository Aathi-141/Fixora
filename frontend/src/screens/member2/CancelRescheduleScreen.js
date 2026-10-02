import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { rescheduleBooking, cancelBooking } from '../../services/api';

const DATES = [
  { day: 25, weekday: 'FRI', month: 'Oct' },
  { day: 26, weekday: 'SAT', month: 'Oct' },
  { day: 27, weekday: 'SUN', month: 'Oct' },
  { day: 28, weekday: 'MON', month: 'Oct' },
  { day: 29, weekday: 'TUE', month: 'Oct' },
  { day: 30, weekday: 'WED', month: 'Oct' },
  { day: 31, weekday: 'THU', month: 'Oct' },
];

const TIME_SLOTS = [
  { time: '09:00 AM', label: 'Morning quiet window', icon: 'partly-sunny-outline' },
  { time: '11:30 AM', label: 'Optimal sunlight & service window', icon: 'sunny-outline' },
  { time: '02:00 PM', label: 'Afternoon session', icon: 'sunny' },
  { time: '04:30 PM', label: 'Late afternoon quiet slot', icon: 'time-outline' },
];

const CANCELLATION_REASONS = [
  'Schedule conflict / Change of plans',
  'Need service on a different day',
  'Booked by mistake',
  'Found alternative solution',
  'Other reason',
];

export default function CancelRescheduleScreen({ navigation, route }) {
  const { booking } = route.params || {};

  const bookingId = booking?._id || 'bk_default';
  const providerName =
    booking?.provider?.user?.name || booking?.provider?.name || 'Kasun Perera';
  const totalAmount = booking?.pricing?.totalAmount || 3750;

  // Active view: 'reschedule' or 'cancel'
  const [activeTab, setActiveTab] = useState('reschedule');
  const [selectedDay, setSelectedDay] = useState(26);
  const [selectedTime, setSelectedTime] = useState('09:00 AM');
  const [keepSpecialist, setKeepSpecialist] = useState(true);
  const [cancelReason, setCancelReason] = useState(CANCELLATION_REASONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReschedule = async () => {
    setIsSubmitting(true);
    const newDate = `2026-10-${selectedDay}`;
    await rescheduleBooking(bookingId, newDate, selectedTime);
    setIsSubmitting(false);

    Alert.alert(
      'Rescheduled Successfully',
      `Your booking has been shifted to ${newDate} at ${selectedTime}.`,
      [
        {
          text: 'OK',
          onPress: () => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('HistoryTab');
            }
          },
        },
      ]
    );
  };

  const handleConfirmCancel = async () => {
    setIsSubmitting(true);
    await cancelBooking(bookingId, cancelReason);
    setIsSubmitting(false);

    Alert.alert(
      'Booking Cancelled',
      `Your booking has been cancelled. A 100% refund of Rs. ${totalAmount.toLocaleString()} has been initiated to your original payment method.`,
      [
        {
          text: 'Back to Bookings',
          onPress: () => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('HistoryTab');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Booking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Top Flexible Policy Card matching exact Figma design */}
        <View style={styles.policyCard}>
          <View style={styles.policyHeaderRow}>
            <View style={styles.shieldIconCircle}>
              <Ionicons name="shield-checkmark" size={20} color={colors.white} />
            </View>
            <Text style={styles.policyTitle}>Fixora Flexible Policy</Text>
          </View>
          <Text style={styles.policyBody}>
            Free cancellation & unlimited rescheduling available until{' '}
            <Text style={styles.boldText}>Oct 24, 05:00 AM (4 hrs prior)</Text>. Late changes within 4 hours may incur a 30% dispatch fee to protect dedicated staff time.
          </Text>

          {/* Refund Window Sub-Card */}
          <View style={styles.refundWindowCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time-outline" size={17} color={colors.forestGreen} style={{ marginRight: 6 }} />
              <Text style={styles.refundWindowLabel}>Full Refund Window:</Text>
            </View>
            <View style={styles.refundTimeBadge}>
              <Text style={styles.refundTimeText}>18h 45m left</Text>
            </View>
          </View>
        </View>

        {/* 2-Segmented Action Switcher: [ Reschedule ] vs [ Cancel ] */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'reschedule' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('reschedule')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={activeTab === 'reschedule' ? colors.white : colors.forestGreen}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.segmentText,
                activeTab === 'reschedule' && styles.segmentTextActive,
              ]}
            >
              Reschedule
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'cancel' && styles.segmentBtnActiveCancel]}
            onPress={() => setActiveTab('cancel')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="close-circle-outline"
              size={18}
              color={activeTab === 'cancel' ? colors.white : colors.danger}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.segmentText,
                activeTab === 'cancel' ? styles.segmentTextActive : { color: colors.danger },
              ]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= RESCHEDULE VIEW ================= */}
        {activeTab === 'reschedule' && (
          <View>
            {/* Select New Date Header */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Select New Date</Text>
              <Text style={styles.subHeadingRight}>Oct - Nov 2026</Text>
            </View>

            {/* Horizontal Swipeable Dates Strip */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateSliderRow}
            >
              {DATES.map((item) => {
                const isSelected = selectedDay === item.day;
                return (
                  <TouchableOpacity
                    key={item.day}
                    style={[styles.dateCard, isSelected && styles.dateCardActive]}
                    onPress={() => setSelectedDay(item.day)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dateWeekday, isSelected && styles.dateWeekdayActive]}>
                      {item.weekday}
                    </Text>
                    <Text style={[styles.dateDayNumber, isSelected && styles.dateDayNumberActive]}>
                      {item.day}
                    </Text>
                    <Text style={[styles.dateMonth, isSelected && styles.dateMonthActive]}>
                      {item.month}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Available Start Times */}
            <View style={[styles.sectionHeaderRow, { marginTop: 22 }]}>
              <Text style={styles.sectionHeading}>Available Start Times</Text>
              <Text style={styles.subHeadingRight}>Saturday, Oct {selectedDay}</Text>
            </View>

            <View style={styles.timeSlotsContainer}>
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedTime === slot.time;
                return (
                  <TouchableOpacity
                    key={slot.time}
                    style={[styles.timeSlotCard, isSelected && styles.timeSlotCardActive]}
                    onPress={() => setSelectedTime(slot.time)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.timeSlotIconBox}>
                      <Ionicons
                        name={slot.icon}
                        size={20}
                        color={isSelected ? colors.forestGreen : colors.textSecondary}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.timeSlotTime, isSelected && styles.timeSlotTimeActive]}>
                        {slot.time}
                      </Text>
                      <Text style={styles.timeSlotLabel}>{slot.label}</Text>
                    </View>
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={isSelected ? colors.forestGreen : colors.textMuted}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Keep Specialist Confirmation Card */}
            <TouchableOpacity
              style={styles.specialistCard}
              onPress={() => setKeepSpecialist(!keepSpecialist)}
              activeOpacity={0.85}
            >
              <View style={styles.checkCircle}>
                <Ionicons
                  name={keepSpecialist ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={keepSpecialist ? colors.forestGreen : colors.textMuted}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.specialistTitle}>Keep {providerName} as specialist</Text>
                <Text style={styles.specialistSub}>Available on selected date & slot</Text>
              </View>
              <Ionicons name="leaf-outline" size={18} color={colors.forestGreen} />
            </TouchableOpacity>
          </View>
        )}

        {/* ================= CANCEL VIEW ================= */}
        {activeTab === 'cancel' && (
          <View style={styles.cancelSection}>
            {/* Refund Calculation Box */}
            <View style={styles.refundBox}>
              <View style={styles.refundIconCircle}>
                <Ionicons name="cash-outline" size={24} color={colors.forestGreen} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.refundTitle}>Eligible for 100% Full Refund</Text>
                <Text style={styles.refundAmount}>Rs. {totalAmount.toLocaleString()}</Text>
                <Text style={styles.refundSub}>
                  Processed back to your payment account within 2-3 business days.
                </Text>
              </View>
            </View>

            {/* Reason for Cancellation */}
            <Text style={styles.cancelReasonHeading}>Reason for Cancellation</Text>
            <View style={styles.reasonsList}>
              {CANCELLATION_REASONS.map((reason) => {
                const isSelected = cancelReason === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    style={[styles.reasonOption, isSelected && styles.reasonOptionActive]}
                    onPress={() => setCancelReason(reason)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={isSelected ? colors.danger : colors.textMuted}
                      style={{ marginRight: 12 }}
                    />
                    <Text style={[styles.reasonText, isSelected && styles.reasonTextActive]}>
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Confirmation Buttons */}
            <TouchableOpacity
              style={styles.confirmCancelBtn}
              onPress={handleConfirmCancel}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={18} color={colors.white} style={{ marginRight: 8 }} />
                  <Text style={styles.confirmCancelBtnText}>Confirm Cancellation & Refund</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.keepBookingBtn}
              onPress={() => setActiveTab('reschedule')}
              activeOpacity={0.8}
            >
              <Text style={styles.keepBookingBtnText}>Nevermind, Keep My Booking</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Bar for Reschedule Mode matching Reference Image */}
      {activeTab === 'reschedule' && (
        <View style={styles.stickyBottomBar}>
          <View style={styles.feeBannerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="checkmark-circle" size={16} color={colors.emerald} style={{ marginRight: 6 }} />
              <Text style={styles.feeBannerText}>Instant free confirmation</Text>
            </View>
            <Text style={styles.zeroFeeText}>ZERO FEE</Text>
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.bottomCancelBtn}
              onPress={() => setActiveTab('cancel')}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={18} color="#DC2626" style={{ marginRight: 4 }} />
              <Text style={styles.bottomCancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomRescheduleBtn}
              onPress={handleReschedule}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Text style={styles.bottomRescheduleBtnText}>Confirm Reschedule</Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.white} style={{ marginLeft: 6 }} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    padding: 16,
    paddingBottom: 150,
  },
  // Top Policy Card - Clean single white surface, no nested boxes
  policyCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  policyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  shieldIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.forestGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  policyBody: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 12,
  },
  boldText: {
    fontWeight: '700',
    color: colors.forestGreen,
  },
  refundWindowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  refundWindowLabel: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
  },
  refundTimeBadge: {
    backgroundColor: '#EBF4EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  refundTimeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  // Segmented control [ Reschedule ] vs [ Cancel ]
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#EBF5EE',
    borderRadius: 14,
    padding: 4,
    marginBottom: 18,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 11,
  },
  segmentBtnActive: {
    backgroundColor: colors.forestGreen,
    shadowColor: colors.forestGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentBtnActiveCancel: {
    backgroundColor: colors.danger,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  segmentTextActive: {
    color: colors.white,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subHeadingRight: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  // Horizontal Date Cards
  dateSliderRow: {
    paddingVertical: 4,
    gap: 10,
  },
  dateCard: {
    width: 66,
    height: 82,
    backgroundColor: colors.white,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  dateCardActive: {
    borderColor: colors.forestGreen,
    backgroundColor: '#EBF5EE',
  },
  dateWeekday: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  dateWeekdayActive: {
    color: colors.forestGreen,
  },
  dateDayNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginVertical: 2,
  },
  dateDayNumberActive: {
    color: colors.forestGreen,
  },
  dateMonth: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  dateMonthActive: {
    color: colors.forestGreen,
  },
  // Time Slots
  timeSlotsContainer: {
    gap: 10,
    marginBottom: 16,
  },
  timeSlotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  timeSlotCardActive: {
    borderColor: colors.forestGreen,
    backgroundColor: '#EBF5EE',
  },
  timeSlotIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAF9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeSlotTime: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  timeSlotTimeActive: {
    color: colors.forestGreen,
  },
  timeSlotLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Specialist Keep Card
  specialistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  checkCircle: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  specialistTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  specialistSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Cancel View Styles
  cancelSection: {
    marginTop: 6,
  },
  refundBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF7F0',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#C7EAD4',
    marginBottom: 20,
  },
  refundIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refundTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  refundAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.forestGreen,
    marginVertical: 2,
  },
  refundSub: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  cancelReasonHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  reasonsList: {
    gap: 10,
    marginBottom: 24,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reasonOptionActive: {
    borderColor: colors.danger,
    backgroundColor: '#FEF2F2',
  },
  reasonText: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  reasonTextActive: {
    fontWeight: '700',
    color: colors.danger,
  },
  confirmCancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    paddingVertical: 15,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmCancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  keepBookingBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  keepBookingBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  // Sticky Bottom Bar matching Reference Image
  stickyBottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  feeBannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  feeBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.emerald,
  },
  zeroFeeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bottomCancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
  },
  bottomCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  bottomRescheduleBtn: {
    flex: 1,
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
  bottomRescheduleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
});
