import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme/colors';
import { rescheduleBooking, cancelBooking } from '../../services/api';

const DATES = [
  { day: 5, weekday: 'MON', month: 'Oct', fullDate: 'Monday, Oct 5, 2026' },
  { day: 6, weekday: 'TUE', month: 'Oct', fullDate: 'Tuesday, Oct 6, 2026' },
  { day: 7, weekday: 'WED', month: 'Oct', fullDate: 'Wednesday, Oct 7, 2026' },
  { day: 8, weekday: 'THU', month: 'Oct', fullDate: 'Thursday, Oct 8, 2026' },
  { day: 9, weekday: 'FRI', month: 'Oct', fullDate: 'Friday, Oct 9, 2026' },
  { day: 10, weekday: 'SAT', month: 'Oct', fullDate: 'Saturday, Oct 10, 2026' },
  { day: 11, weekday: 'SUN', month: 'Oct', fullDate: 'Sunday, Oct 11, 2026' },
  { day: 12, weekday: 'MON', month: 'Oct', fullDate: 'Monday, Oct 12, 2026' },
  { day: 13, weekday: 'TUE', month: 'Oct', fullDate: 'Tuesday, Oct 13, 2026' },
  { day: 14, weekday: 'WED', month: 'Oct', fullDate: 'Wednesday, Oct 14, 2026' },
];

const MORNING_SLOTS = [
  { time: '08:30 AM', badge: 'Most Popular', label: 'Early Morning Slot', icon: 'partly-sunny-outline' },
  { time: '10:00 AM', label: 'Mid Morning Slot', icon: 'sunny-outline' },
  { time: '11:30 AM', label: 'Late Morning Slot', icon: 'sunny-outline' },
];

const AFTERNOON_SLOTS = [
  { time: '01:30 PM', label: 'Early Afternoon Slot', icon: 'sunny' },
  { time: '03:00 PM', badge: 'Recommended', label: 'Mid Afternoon Slot', icon: 'sunny' },
  { time: '04:30 PM', label: 'Late Afternoon Slot', icon: 'time-outline' },
  { time: '06:00 PM', label: 'Evening Slot', icon: 'moon-outline' },
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
  const totalAmount = booking?.pricing?.totalAmount || 3750;

  // Active view: 'reschedule' or 'cancel'
  const [activeTab, setActiveTab] = useState('reschedule');
  const [selectedDateItem, setSelectedDateItem] = useState(DATES[1]);
  const [period, setPeriod] = useState('Morning');
  const [selectedTime, setSelectedTime] = useState(MORNING_SLOTS[0].time);
  const [specialNotes, setSpecialNotes] = useState(booking?.notes || '');
  const [cancelReason, setCancelReason] = useState(CANCELLATION_REASONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (booking?.timeSlot) {
      setSelectedTime(booking.timeSlot);
      const isMorning = MORNING_SLOTS.some((s) => s.time === booking.timeSlot);
      setPeriod(isMorning ? 'Morning' : 'Afternoon');
    }
    if (booking?.notes) {
      setSpecialNotes(booking.notes);
    }
  }, [booking]);

  const currentSlots = period === 'Morning' ? MORNING_SLOTS : AFTERNOON_SLOTS;

  const handleReschedule = async () => {
    setIsSubmitting(true);
    const newFormattedDate = selectedDateItem.fullDate;
    const newTime = selectedTime;
    const trimmedNotes = specialNotes.trim();

    // Construct updated booking object
    const updatedBooking = {
      ...(booking || {}),
      _id: bookingId,
      scheduledDate: newFormattedDate,
      timeSlot: newTime,
      notes: trimmedNotes,
    };

    // 1. Call backend API
    try {
      await rescheduleBooking(bookingId, newFormattedDate, newTime, trimmedNotes);
    } catch (e) {
      console.warn('API reschedule warning:', e.message);
    }

    // 2. Persist updated booking to local AsyncStorage
    try {
      await AsyncStorage.setItem('fixora_latest_booking', JSON.stringify(updatedBooking));

      const allBookingsRaw = await AsyncStorage.getItem('fixora_all_bookings');
      if (allBookingsRaw) {
        const allBookings = JSON.parse(allBookingsRaw);
        const updatedList = allBookings.map((b) =>
          b._id === bookingId || (b.bookingRef && b.bookingRef === updatedBooking.bookingRef)
            ? { ...b, ...updatedBooking }
            : b
        );
        await AsyncStorage.setItem('fixora_all_bookings', JSON.stringify(updatedList));
      }
    } catch (e) {
      console.warn('AsyncStorage update error:', e);
    }

    setIsSubmitting(false);

    Alert.alert(
      'Rescheduled Successfully',
      `Your booking has been shifted to ${newFormattedDate} at ${newTime}.`,
      [
        {
          text: 'View Confirmed Booking',
          onPress: () => {
            navigation.navigate('BookingSuccessful', { booking: updatedBooking });
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
        {/* Top Policy Card */}
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
                const isSelected = selectedDateItem.day === item.day;
                return (
                  <TouchableOpacity
                    key={item.day}
                    style={[styles.dateCard, isSelected && styles.dateCardActive]}
                    onPress={() => setSelectedDateItem(item)}
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

            {/* Available Start Times with Morning & Afternoon segment buttons */}
            <View style={[styles.sectionHeaderRow, { marginTop: 22 }]}>
              <View>
                <Text style={styles.sectionHeading}>Available Start Times</Text>
                <Text style={styles.subHeadingRight}>{selectedDateItem.fullDate}</Text>
              </View>

              {/* Morning vs Afternoon Segmented Pill */}
              <View style={styles.periodPillContainer}>
                <TouchableOpacity
                  style={[styles.periodBtn, period === 'Morning' && styles.periodBtnActive]}
                  onPress={() => {
                    setPeriod('Morning');
                    setSelectedTime(MORNING_SLOTS[0].time);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.periodBtnText, period === 'Morning' && styles.periodBtnTextActive]}>
                    Morning
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.periodBtn, period === 'Afternoon' && styles.periodBtnActive]}
                  onPress={() => {
                    setPeriod('Afternoon');
                    setSelectedTime(AFTERNOON_SLOTS[0].time);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.periodBtnText, period === 'Afternoon' && styles.periodBtnTextActive]}>
                    Afternoon
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Time Slot Cards */}
            <View style={styles.timeSlotsContainer}>
              {currentSlots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                return (
                  <TouchableOpacity
                    key={slot.time}
                    style={[styles.timeSlotCard, isSelected && styles.timeSlotCardActive]}
                    onPress={() => setSelectedTime(slot.time)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.timeSlotIconBox, isSelected && styles.timeSlotIconBoxActive]}>
                      <Ionicons
                        name={slot.icon}
                        size={20}
                        color={isSelected ? colors.forestGreen : colors.textSecondary}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.timeSlotTime, isSelected && styles.timeSlotTimeActive]}>
                          {slot.time}
                        </Text>
                        {slot.badge && (
                          <View style={[styles.slotBadge, isSelected && styles.slotBadgeActive]}>
                            <Text style={[styles.slotBadgeText, isSelected && styles.slotBadgeTextActive]}>
                              {slot.badge}
                            </Text>
                          </View>
                        )}
                      </View>
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

            {/* Special Instructions / Gate Access */}
            <View style={[styles.sectionHeaderRow, { marginTop: 14 }]}>
              <Text style={styles.sectionHeading}>Special Instructions / Gate Access</Text>
              <Text style={styles.subHeadingRight}>Optional</Text>
            </View>
            <View style={styles.instructionsCard}>
              <View style={styles.instructionsHeaderRow}>
                <Ionicons name="create-outline" size={18} color={colors.forestGreen} style={{ marginRight: 6 }} />
                <Text style={styles.instructionsHelperText}>Update directions or notes for the specialist</Text>
              </View>
              <TextInput
                style={styles.instructionsInput}
                value={specialNotes}
                onChangeText={setSpecialNotes}
                placeholder="e.g. Ring the bell at gate #2, beware of the dog, park in driveway..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
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

      {/* Sticky Bottom Bar for Reschedule Mode */}
      {activeTab === 'reschedule' && (
        <View style={styles.stickyBottomBar}>
          <View style={styles.feeBannerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="checkmark-circle" size={16} color={colors.emerald} style={{ marginRight: 6 }} />
              <Text style={styles.feeBannerText}>Instant free schedule update</Text>
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
    paddingBottom: 160,
  },
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
  // Segmented Pill for Morning vs Afternoon
  periodPillContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F7F4',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: '#EDF2EE',
  },
  periodBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },
  periodBtnActive: {
    backgroundColor: colors.forestGreen,
  },
  periodBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  periodBtnTextActive: {
    color: colors.white,
    fontWeight: '700',
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
  timeSlotIconBoxActive: {
    backgroundColor: '#E1EFE6',
  },
  timeSlotTime: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  timeSlotTimeActive: {
    color: colors.forestGreen,
  },
  slotBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  slotBadgeActive: {
    backgroundColor: colors.forestGreen,
  },
  slotBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  slotBadgeTextActive: {
    color: colors.white,
  },
  timeSlotLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Special Instructions Box
  instructionsCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  instructionsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionsHelperText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  instructionsInput: {
    minHeight: 70,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
    backgroundColor: '#FAFAF9',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  // Sticky Bottom Bar
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
