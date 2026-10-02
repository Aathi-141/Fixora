import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { rescheduleBooking, cancelBooking } from '../../services/api';

const DATES = [
  { day: 24, weekday: 'Thu', label: 'Thu, Oct 24' },
  { day: 25, weekday: 'Fri', label: 'Fri, Oct 25' },
  { day: 26, weekday: 'Sat', label: 'Sat, Oct 26' },
  { day: 27, weekday: 'Sun', label: 'Sun, Oct 27' },
  { day: 28, weekday: 'Mon', label: 'Mon, Oct 28' },
  { day: 29, weekday: 'Tue', label: 'Tue, Oct 29' },
  { day: 30, weekday: 'Wed', label: 'Wed, Oct 30' },
  { day: 31, weekday: 'Thu', label: 'Thu, Oct 31' },
  { day: 1, weekday: 'Fri', label: 'Fri, Nov 01' },
  { day: 2, weekday: 'Sat', label: 'Sat, Nov 02' },
];

const TIME_SLOTS = [
  '08:30 AM',
  '10:00 AM',
  '11:30 AM',
  '01:30 PM',
  '03:00 PM',
  '04:30 PM',
  '06:00 PM',
];

export default function CancelRescheduleScreen({ navigation, route }) {
  const { booking } = route.params || {};

  const bookingId = booking?._id || 'bk_default';
  const bookingRef = booking?.bookingRef || '#FX-88431';
  const serviceTitle =
    booking?.serviceTitle || booking?.provider?.specialization || 'On-Demand Home Service';
  const providerName =
    booking?.provider?.user?.name || booking?.provider?.name || 'Selected Specialist';

  const [selectedDay, setSelectedDay] = useState(26);
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [showCancelModal, setShowCancelModal] = useState(false);
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
    await cancelBooking(bookingId, 'Customer requested schedule cancellation');
    setIsSubmitting(false);
    setShowCancelModal(false);

    Alert.alert(
      'Booking Cancelled',
      'Your service request has been cancelled. Any payment refund has been processed.',
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
      {/* Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Booking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Current Booking Summary Card */}
        <View style={styles.card}>
          <View style={styles.refRow}>
            <Text style={styles.refTag}>{bookingRef}</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>Active Booking</Text>
            </View>
          </View>
          <Text style={styles.serviceName}>{serviceTitle}</Text>
          <Text style={styles.providerName}>Specialist: {providerName}</Text>
          <View style={styles.currentSlotRow}>
            <Ionicons name="time" size={16} color={colors.forestGreen} style={{ marginRight: 6 }} />
            <Text style={styles.currentSlotText}>
              Current: {booking?.scheduledDate || 'Thu, Oct 24'} • {booking?.timeSlot || '08:30 AM'}
            </Text>
          </View>
        </View>

        {/* Cancellation Policy Banner */}
        <View style={styles.policyCard}>
          <Ionicons name="information-circle" size={22} color={colors.forestGreen} style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.policyTitle}>Free Cancellation Guarantee</Text>
            <Text style={styles.policyText}>
              No penalty fee for cancellations or rescheduling requested 24 hours prior to appointment.
            </Text>
          </View>
        </View>

        {/* Reschedule Section */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Reschedule Appointment</Text>
          <Text style={styles.subPrompt}>Swipe to select a new preferred date:</Text>
          
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
                  style={[styles.dateChip, isSelected && styles.dateChipActive]}
                  onPress={() => setSelectedDay(item.day)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dateDayName, isSelected && styles.textWhite]}>
                    {item.weekday}
                  </Text>
                  <Text style={[styles.dateDayNumber, isSelected && styles.textWhite]}>
                    {item.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[styles.subPrompt, { marginTop: 18 }]}>Select new time slot:</Text>
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedTime === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[styles.timeChip, isSelected && styles.timeChipActive]}
                  onPress={() => setSelectedTime(slot)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.timeChipText, isSelected && styles.textWhite]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.rescheduleBtn}
            onPress={handleReschedule}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.rescheduleBtnText}>Confirm Reschedule</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Cancel Action */}
        <TouchableOpacity
          style={styles.cancelActionBtn}
          onPress={() => setShowCancelModal(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} style={{ marginRight: 6 }} />
          <Text style={styles.cancelActionText}>Cancel Booking</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Dimmed Overlay Modal for Cancel Confirmation */}
      <Modal visible={showCancelModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.warningCircle}>
              <Ionicons name="warning" size={32} color={colors.danger} />
            </View>

            <Text style={styles.modalTitle}>Cancel Booking?</Text>
            <Text style={styles.modalSub}>
              You are about to cancel this home service request. A full refund will be processed to
              your original payment method within 2-3 business days.
            </Text>

            <TouchableOpacity
              style={styles.yesCancelBtn}
              onPress={handleConfirmCancel}
              disabled={isSubmitting}
            >
              <Text style={styles.yesCancelBtnText}>Yes, Cancel Booking</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.keepBookingBtn}
              onPress={() => setShowCancelModal(false)}
            >
              <Text style={styles.keepBookingBtnText}>Keep Booking</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 110,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  refRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  refTag: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  statusPill: {
    backgroundColor: '#EBF4EE',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  providerName: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  currentSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
    padding: 10,
    borderRadius: 10,
  },
  currentSlotText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  policyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4EE',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
  },
  policyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  policyText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subPrompt: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  dateSliderRow: {
    paddingVertical: 6,
    gap: 10,
  },
  dateChip: {
    width: 58,
    height: 68,
    borderRadius: 14,
    backgroundColor: '#F8FAF9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateChipActive: {
    backgroundColor: colors.forestGreen,
    borderColor: colors.forestGreen,
  },
  dateDayName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dateDayNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  timeChip: {
    backgroundColor: '#F8FAF9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  timeChipActive: {
    backgroundColor: colors.forestGreen,
    borderColor: colors.forestGreen,
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  textWhite: {
    color: colors.white,
  },
  rescheduleBtn: {
    backgroundColor: colors.forestGreen,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.forestGreen,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  rescheduleBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  cancelActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.danger,
    paddingVertical: 14,
    borderRadius: 14,
  },
  cancelActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.danger,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    width: '100%',
  },
  warningCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  modalSub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  yesCancelBtn: {
    width: '100%',
    backgroundColor: colors.danger,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  yesCancelBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  keepBookingBtn: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  keepBookingBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
