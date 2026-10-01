import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { updateBookingStatus } from '../../services/api';

export default function ProviderRequestsScreen({ navigation, route }) {
  const [ticketStatus, setTicketStatus] = useState('Pending Review');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('Outside scheduled service zone');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccept = async () => {
    setIsSubmitting(true);
    await updateBookingStatus('66f000000000000000000003', 'accepted');
    setIsSubmitting(false);
    setTicketStatus('Accepted - In Progress');

    Alert.alert(
      'Service Accepted!',
      'You have accepted this service request. The customer has been notified and expects arrival.',
      [{ text: 'View Schedule', onPress: () => navigation.navigate('ProviderAvailability') }]
    );
  };

  const handleConfirmReject = async () => {
    setIsSubmitting(true);
    await updateBookingStatus('66f000000000000000000003', 'rejected', null, rejectReason);
    setIsSubmitting(false);
    setShowRejectModal(false);
    setTicketStatus('Rejected');

    Alert.alert('Request Declined', 'This service request was rejected and returned to dispatch queue.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Request Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Ticket Bar */}
        <View style={styles.ticketBar}>
          <Text style={styles.ticketId}>Ticket #SR-88431</Text>
          <View
            style={[
              styles.statusBadge,
              ticketStatus.includes('Accepted')
                ? styles.badgeAccepted
                : ticketStatus === 'Rejected'
                ? styles.badgeRejected
                : styles.badgePending,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                ticketStatus.includes('Accepted')
                  ? styles.textAccepted
                  : ticketStatus === 'Rejected'
                  ? styles.textRejected
                  : styles.textPending,
              ]}
            >
              {ticketStatus}
            </Text>
          </View>
        </View>

        {/* Customer Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>CUSTOMER DETAILS</Text>
          <View style={styles.customerRow}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200' }}
              style={styles.customerAvatar}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.customerName}>Kasun Perera</Text>
              <View style={styles.verifiedRow}>
                <Ionicons name="shield-checkmark" size={13} color={colors.forestGreen} style={{ marginRight: 4 }} />
                <Text style={styles.verifiedText}>Verified Customer • 14 Bookings</Text>
              </View>
              <Text style={styles.customerPhone}>+94 77 123 4567</Text>
            </View>

            <TouchableOpacity style={styles.phoneIconBtn}>
              <Ionicons name="call" size={18} color={colors.forestGreen} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Service Requested */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>SERVICE TYPE & NOTES</Text>
          <Text style={styles.serviceTitle}>Plumbing & Pipe Repair</Text>
          <Text style={styles.issueNotes}>
            "Burst water pipe under kitchen sink, flooding kitchen area. Emergency shut off valve
            applied. Need urgent repair and pressure leak test confirmed today."
          </Text>

          <View style={styles.divider} />

          {/* Location Preview */}
          <View style={styles.infoRow}>
            <Ionicons name="location" size={18} color={colors.forestGreen} style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Service Location</Text>
              <Text style={styles.infoSub}>No 42, New Kandy Road, Malabe</Text>
            </View>
          </View>

          {/* Time Slot */}
          <View style={[styles.infoRow, { marginTop: 12 }]}>
            <Ionicons name="time" size={18} color={colors.forestGreen} style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Scheduled Window</Text>
              <Text style={styles.infoSub}>Today, Oct 02 • 02:30 PM - 04:00 PM</Text>
            </View>
          </View>
        </View>

        {/* Payout Summary */}
        <View style={styles.payoutCard}>
          <View>
            <Text style={styles.payoutLabel}>Total Provider Payout</Text>
            <Text style={styles.payoutAmount}>LKR 4,250.00</Text>
          </View>
          <View style={styles.feeBreakdown}>
            <Text style={styles.feeItem}>Base: LKR 2,250</Text>
            <Text style={styles.feeItem}>Add-Ons: LKR 2,000</Text>
          </View>
        </View>

        {/* Accept / Reject Buttons */}
        {ticketStatus === 'Pending Review' && (
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => setShowRejectModal(true)}
              disabled={isSubmitting}
            >
              <Text style={styles.rejectBtnText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={handleAccept}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.acceptBtnText}>Accept Request</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Reject Modal */}
      <Modal visible={showRejectModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Reject this request?</Text>
            <Text style={styles.modalPrompt}>
              Kasun Perera will be notified and this booking will return to the regional dispatch queue.
            </Text>

            {['Schedule conflict', 'Outside scheduled service zone', 'Specialized tools unavailable'].map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[styles.reasonOption, rejectReason === reason && styles.reasonOptionActive]}
                onPress={() => setRejectReason(reason)}
              >
                <Ionicons
                  name={rejectReason === reason ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                  color={rejectReason === reason ? colors.forestGreen : colors.textMuted}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.reasonText}>{reason}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowRejectModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmRejectBtn}
                onPress={handleConfirmReject}
              >
                <Text style={styles.modalConfirmRejectText}>Confirm Rejection</Text>
              </TouchableOpacity>
            </View>
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
  ticketBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketId: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
  },
  badgeAccepted: {
    backgroundColor: '#EBF4EE',
  },
  badgeRejected: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textPending: {
    color: '#92400E',
  },
  textAccepted: {
    color: colors.forestGreen,
  },
  textRejected: {
    color: colors.danger,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 10,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  verifiedText: {
    fontSize: 12,
    color: colors.forestGreen,
    fontWeight: '600',
  },
  customerPhone: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  phoneIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  issueNotes: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  infoSub: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: 1,
  },
  payoutCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F9F5',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D2E7D8',
    marginBottom: 20,
  },
  payoutLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  payoutAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.forestGreen,
    marginTop: 2,
  },
  feeBreakdown: {
    alignItems: 'flex-end',
  },
  feeItem: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.danger,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.danger,
  },
  acceptBtn: {
    flex: 1.6,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.emerald,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  acceptBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 22,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  modalPrompt: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  reasonOptionActive: {
    backgroundColor: '#F3F9F5',
  },
  reasonText: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalCancelBtnText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalConfirmRejectBtn: {
    backgroundColor: colors.danger,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalConfirmRejectText: {
    color: colors.white,
    fontWeight: '700',
  },
});
