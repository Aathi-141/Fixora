import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { rescheduleBooking, cancelBooking } from '../../services/api';

const DATES = [
  { day: 25, label: 'Fri, Oct 25' },
  { day: 26, label: 'Sat, Oct 26' },
  { day: 27, label: 'Sun, Oct 27' },
  { day: 28, label: 'Mon, Oct 28' },
];

const TIME_SLOTS = ['09:00 AM', '11:30 AM', '02:30 PM', '05:00 PM'];

export default function CancelRescheduleScreen({ navigation, route }) {
  const { booking } = route.params || {};

  const bookingId = booking?._id || 'bk_default';
  const bookingRef = booking?.bookingRef || '#FX-88431';
  const serviceTitle =
    booking?.serviceTitle || booking?.provider?.specialization || 'Botanical Care Clean';
  const providerName =
    booking?.provider?.user?.name || booking?.provider?.name || 'Kasun Perera / Chaminda';

  const [selectedDay, setSelectedDay] = useState(27);
  const [selectedTime, setSelectedTime] = useState('02:30 PM');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReschedule = async () => {
    setIsSubmitting(true);
    const newDate = `2026-10-${selectedDay}`;
    const res = await rescheduleBooking(bookingId, newDate, selectedTime);
    setIsSubmitting(false);

    Alert.alert(
      'Rescheduled Successfully',
      `Your booking has been shifted to ${newDate} at ${selectedTime}.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('HistoryTab'),
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
      'Your service request has been cancelled. Any pre-authorization or payment refund has been processed.',
      [
        {
          text: 'Back to Bookings',
          onPress: () => navigation.navigate('HistoryTab'),
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
              Current: {booking?.scheduledDate || 'Thu, Oct 15'} • {booking?.timeSlot || '11:00 AM'}
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
          <Text style={styles.subPrompt}>Select a new preferred date:</Text>
          <View style={styles.dateRow}>
            {DATES.map((item) => {
              const isSelected = selectedDay === item.day;
              return (
                <TouchableOpacity
                  key={item.day}
                  style={[styles.dateChip, isSelected && styles.dateChipActive]}
                  onPress={() => setSelectedDay(item.day)}
                >
                  <Text style={[styles.dateDayNumber, isSelected && styles.textWhite]}>
                    {item.day}
                  </Text>
                  <Text style={[styles.dateDayName, isSelected && styles.textWhite]}>
                    {item.label.split(',')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.subPrompt, { marginTop: 18 }]}>Select new time slot:</Text>
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedTime === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[styles.timeChip, isSelected && styles.timeChipActive]}
                  onPress={() => setSelectedTime(slot)}
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
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  refRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  refTag: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  statusPill: {
    backgroundColor: '#EBF4EE',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  providerName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  currentSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 8,
  },
  currentSlotText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.forestGreen,
  },
  policyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4EE',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#D2E7D8',
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
    lineHeight: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.forestGreen,
    marginBottom: 6,
  },
  subPrompt: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  dateChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
  },
  dateChipActive: {
    backgroundColor: colors.forestGreen,
    borderColor: colors.forestGreen,
  },
  dateDayNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  dateDayName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
  },
  textWhite: {
    color: colors.white,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  timeChip: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
  },
  timeChipActive: {
    backgroundColor: colors.emerald,
    borderColor: colors.emerald,
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  rescheduleBtn: {
    backgroundColor: colors.emerald,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderRadius: 12,
    height: 48,
    marginTop: 6,
  },
  cancelActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  warningCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  modalSub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  yesCancelBtn: {
    width: '100%',
    backgroundColor: colors.danger,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
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
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keepBookingBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
