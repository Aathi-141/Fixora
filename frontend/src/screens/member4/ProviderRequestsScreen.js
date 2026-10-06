import React, { useState, useEffect, useContext } from 'react';
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
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { updateBookingStatus, getProviderRequests } from '../../services/api';

const TRADE_REQUEST_TEMPLATES = {
  Electrician: {
    serviceTitle: 'Electrical Power Trip & Circuit Breaker Fault',
    notes:
      'Main trip switch keeps tripping when living room AC is switched on. Burning smell near distribution board. Urgent diagnostic and circuit repair needed.',
    payout: 'LKR 3,850.00',
    base: 'LKR 2,250',
    addons: 'LKR 1,600',
  },
  Plumber: {
    serviceTitle: 'Plumbing & Pipe Leak Emergency Repair',
    notes:
      'Burst water pipe under kitchen sink, flooding kitchen area. Emergency shut off valve applied. Need urgent repair and pressure leak test confirmed today.',
    payout: 'LKR 4,250.00',
    base: 'LKR 2,250',
    addons: 'LKR 2,000',
  },
  Cleaner: {
    serviceTitle: 'Deep Residential Cleaning & Disinfection',
    notes:
      'Full 3-bedroom house deep cleaning before a family event. Includes tile scrubbing, window glass polishing, and bathroom sanitation.',
    payout: 'LKR 4,500.00',
    base: 'LKR 2,500',
    addons: 'LKR 2,000',
  },
  'AC Technician': {
    serviceTitle: 'Inverter AC Gas Top-up & Chemical Coil Clean',
    notes:
      '18,000 BTU Panasonic unit blowing warm air only. Outdoor condenser noisy. Requires refrigerant top-up and antibacterial coil wash.',
    payout: 'LKR 5,200.00',
    base: 'LKR 3,200',
    addons: 'LKR 2,000',
  },
  Painter: {
    serviceTitle: 'Living Room Wall Plastering & Repainting',
    notes:
      'Wall moisture patches and hairline cracks along living room walls. Needs scraping, putty application, and 2 coats of emulsion paint.',
    payout: 'LKR 6,000.00',
    base: 'LKR 3,500',
    addons: 'LKR 2,500',
  },
  Carpenter: {
    serviceTitle: 'Teak Door Frame Alignment & Lock Fitting',
    notes:
      'Main entrance teak door dragging on floor tiles, cylinder mortise lock jammed. Requires precision planing, hinges readjustment, and latch fix.',
    payout: 'LKR 4,200.00',
    base: 'LKR 2,500',
    addons: 'LKR 1,700',
  },
};

export default function ProviderRequestsScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const isSunil =
    user?.name === 'Sunil Perera' ||
    user?.email?.toLowerCase().includes('sunil');

  // If user is Sunil or there's a stored booking, show request.
  const [activeBooking, setActiveBooking] = useState(null);
  const [hasActiveRequest, setHasActiveRequest] = useState(isSunil);
  const [ticketStatus, setTicketStatus] = useState('Pending Review');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('Outside scheduled service zone');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const providerCategory = user?.category || 'Electrician';
  const requestTemplate =
    TRADE_REQUEST_TEMPLATES[providerCategory] ||
    TRADE_REQUEST_TEMPLATES['Electrician'];

  const getReadableStatus = (status) => {
    switch (status) {
      case 'accepted':
        return 'Accepted - In Progress';
      case 'on_the_way':
        return 'On The Way';
      case 'completed':
        return 'Service Completed';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending Review';
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  const loadRequests = async () => {
    try {
      // 1. Try to load from API for this provider
      const res = await getProviderRequests();
      if (res.success && res.data && res.data.length > 0) {
        const req = res.data[0];
        setActiveBooking(req);
        setHasActiveRequest(true);
        setTicketStatus(getReadableStatus(req.status));
        return;
      }

      // 2. Check local latest booking in AsyncStorage
      const stored = await AsyncStorage.getItem('fixora_latest_booking');
      if (stored) {
        const b = JSON.parse(stored);
        setActiveBooking(b);
        setHasActiveRequest(true);
        setTicketStatus(getReadableStatus(b.status));
        return;
      }
    } catch (e) {
      console.log('Error loading provider requests:', e);
    }
  };

  const customerName = activeBooking?.customer?.name || activeBooking?.customerName || (isSunil ? 'Kasun Perera' : 'Customer');
  const customerPhone = activeBooking?.customerPhone || activeBooking?.customer?.phone || '+94 77 123 4567';
  const customerAddress = activeBooking?.serviceAddress || 'No 42, New Kandy Road, Malabe';
  const scheduledTimeText = activeBooking
    ? `${activeBooking.scheduledDate || 'Today'} • ${activeBooking.timeSlot || '02:30 PM'}`
    : 'Today • 02:30 PM - 04:00 PM';
  const serviceTitle = activeBooking?.serviceTitle || requestTemplate.serviceTitle;
  const ticketRef = activeBooking?.bookingRef || 'SR-88431';

  // Special instructions given by customer
  const specialInstructions =
    activeBooking?.notes !== undefined
      ? activeBooking.notes && activeBooking.notes.trim().length > 0
        ? activeBooking.notes.trim()
        : 'No special instructions given by customer.'
      : requestTemplate.notes;

  const handleCallCustomer = () => {
    Linking.openURL(`tel:${customerPhone}`).catch(() => {
      Alert.alert(
        'Customer Phone',
        `Calling customer ${customerName} at ${customerPhone}`
      );
    });
  };

  const handleAccept = async () => {
    setIsSubmitting(true);
    const bookingId = activeBooking?._id || '66f000000000000000000003';
    await updateBookingStatus(bookingId, 'accepted');
    setIsSubmitting(false);
    setTicketStatus('Accepted - In Progress');

    if (activeBooking) {
      const updated = { ...activeBooking, status: 'accepted' };
      setActiveBooking(updated);
      AsyncStorage.setItem('fixora_latest_booking', JSON.stringify(updated));
    }

    Alert.alert(
      'Service Accepted!',
      'You have accepted this service request. You can now update status to "On The Way" when heading to customer location.',
      [
        {
          text: 'View Schedule',
          onPress: () => navigation.navigate('AvailabilityTab'),
        },
        { text: 'OK' },
      ]
    );
  };

  const handleSetOnTheWay = async () => {
    setIsSubmitting(true);
    const bookingId = activeBooking?._id || '66f000000000000000000003';
    await updateBookingStatus(bookingId, 'on_the_way', 15);
    setIsSubmitting(false);
    setTicketStatus('On The Way');

    if (activeBooking) {
      const updated = { ...activeBooking, status: 'on_the_way', etaMinutes: 15 };
      setActiveBooking(updated);
      AsyncStorage.setItem('fixora_latest_booking', JSON.stringify(updated));
    }

    Alert.alert(
      'Status Updated: On The Way',
      'The customer has been notified with your real-time ETA (~15 mins). Tap "Mark Service Completed" once the job is finished.',
      [{ text: 'OK' }]
    );
  };

  const handleSetCompleted = async () => {
    setIsSubmitting(true);
    const bookingId = activeBooking?._id || '66f000000000000000000003';
    await updateBookingStatus(bookingId, 'completed');
    setIsSubmitting(false);
    setTicketStatus('Service Completed');

    if (activeBooking) {
      const updated = { ...activeBooking, status: 'completed' };
      setActiveBooking(updated);
      AsyncStorage.setItem('fixora_latest_booking', JSON.stringify(updated));
    }

    Alert.alert(
      'Service Completed!',
      'Job completed successfully. The final bill is ready for customer review and payment.',
      [{ text: 'OK' }]
    );
  };

  const handleConfirmReject = async () => {
    setIsSubmitting(true);
    const bookingId = activeBooking?._id || '66f000000000000000000003';
    await updateBookingStatus(bookingId, 'rejected', null, rejectReason);
    setIsSubmitting(false);
    setShowRejectModal(false);
    setTicketStatus('Rejected');

    if (activeBooking) {
      const updated = { ...activeBooking, status: 'rejected' };
      setActiveBooking(updated);
      AsyncStorage.setItem('fixora_latest_booking', JSON.stringify(updated));
    }

    Alert.alert(
      'Request Declined',
      'This service request was rejected and returned to the regional dispatch queue.',
      [
        {
          text: 'Dismiss',
          onPress: () => {
            setHasActiveRequest(false);
            setTicketStatus('Pending Review');
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
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : null)}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Requests</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {!hasActiveRequest ? (
          // Realistic Empty State for new or unbooked providers
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="notifications-outline" size={44} color={colors.forestGreen} />
            </View>
            <Text style={styles.emptyTitle}>No Pending Requests</Text>
            <Text style={styles.emptyProviderBadge}>
              {user?.name || 'Partner'} • {user?.category || 'Service Specialist'}
            </Text>
            <Text style={styles.emptyDesc}>
              You are currently online and available. When a customer nearby books your{' '}
              <Text style={{ fontWeight: '700', color: colors.forestGreen }}>
                {user?.category || 'service'}
              </Text>{' '}
              work, incoming jobs will appear here in real-time.
            </Text>

            <View style={styles.onlineStatusRow}>
              <View style={styles.greenPulseDot} />
              <Text style={styles.onlineStatusText}>Listening for incoming customer bookings</Text>
            </View>

          </View>
        ) : (
          // Active Request View
          <>
            {/* Ticket Bar */}
            <View style={styles.ticketBar}>
              <Text style={styles.ticketId}>Ticket #{ticketRef}</Text>
              <View
                style={[
                  styles.statusBadge,
                  ticketStatus === 'On The Way'
                    ? styles.badgeOnTheWay
                    : ticketStatus === 'Service Completed'
                    ? styles.badgeCompleted
                    : ticketStatus.includes('Accepted')
                    ? styles.badgeAccepted
                    : ticketStatus === 'Rejected'
                    ? styles.badgeRejected
                    : styles.badgePending,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    ticketStatus === 'On The Way'
                      ? styles.textOnTheWay
                      : ticketStatus === 'Service Completed'
                      ? styles.textCompleted
                      : ticketStatus.includes('Accepted')
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
                  source={{ uri: activeBooking?.customer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200' }}
                  style={styles.customerAvatar}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.customerName}>{customerName}</Text>
                  <View style={styles.verifiedRow}>
                    <Ionicons name="shield-checkmark" size={13} color={colors.forestGreen} style={{ marginRight: 4 }} />
                    <Text style={styles.verifiedText}>Verified Customer</Text>
                  </View>
                  <Text style={styles.customerPhone}>{customerPhone}</Text>
                </View>

                {/* Direct Phone Call Button */}
                <TouchableOpacity
                  style={styles.phoneIconBtn}
                  onPress={handleCallCustomer}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={18} color={colors.forestGreen} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Service Requested - Dynamic based on customer booking & special instructions! */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>SERVICE TYPE & SPECIAL INSTRUCTIONS</Text>
              <Text style={styles.serviceTitle}>{serviceTitle}</Text>

              {/* Customer Special Instructions Box */}
              <View style={styles.instructionsContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Ionicons name="document-text" size={15} color={colors.forestGreen} style={{ marginRight: 6 }} />
                  <Text style={styles.instructionsHeading}>Special Instructions / Gate Access:</Text>
                </View>
                <Text
                  style={[
                    styles.issueNotes,
                    specialInstructions === 'No special instructions given by customer.' && {
                      fontStyle: 'italic',
                      color: colors.textMuted,
                    },
                  ]}
                >
                  {specialInstructions}
                </Text>
              </View>

              <View style={styles.divider} />

              {/* Location Preview */}
              <View style={styles.infoRow}>
                <Ionicons name="location" size={18} color={colors.forestGreen} style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>Service Location</Text>
                  <Text style={styles.infoSub}>{customerAddress}</Text>
                </View>
              </View>

              {/* Time Slot */}
              <View style={[styles.infoRow, { marginTop: 12 }]}>
                <Ionicons name="time" size={18} color={colors.forestGreen} style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>Scheduled Window</Text>
                  <Text style={styles.infoSub}>{scheduledTimeText}</Text>
                </View>
              </View>
            </View>

            {/* Payout Summary */}
            <View style={styles.payoutCard}>
              <View>
                <Text style={styles.payoutLabel}>Total Provider Payout</Text>
                <Text style={styles.payoutAmount}>
                  {activeBooking?.pricing?.totalAmount
                    ? `LKR ${activeBooking.pricing.totalAmount.toLocaleString()}`
                    : requestTemplate.payout}
                </Text>
              </View>
              <View style={styles.feeBreakdown}>
                <Text style={styles.feeItem}>
                  Base: {activeBooking?.pricing?.basePrice ? `LKR ${activeBooking.pricing.basePrice.toLocaleString()}` : requestTemplate.base}
                </Text>
                <Text style={styles.feeItem}>
                  Add-Ons: {activeBooking?.pricing?.addOnsTotal ? `LKR ${activeBooking.pricing.addOnsTotal.toLocaleString()}` : requestTemplate.addons}
                </Text>
              </View>
            </View>

            {/* Action Buttons: Pending Review -> Accepted -> On The Way -> Completed */}
            {ticketStatus === 'Pending Review' ? (
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
            ) : ticketStatus === 'Accepted - In Progress' ? (
              <View style={styles.statusUpdateContainer}>
                <View style={styles.statusBarBanner}>
                  <Ionicons name="information-circle" size={18} color={colors.forestGreen} style={{ marginRight: 6 }} />
                  <Text style={styles.statusBarBannerText}>
                    Request Accepted. Update service status as you proceed:
                  </Text>
                </View>
                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={styles.onTheWayBtn}
                    onPress={handleSetOnTheWay}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <>
                        <Ionicons name="navigate" size={17} color={colors.white} style={{ marginRight: 6 }} />
                        <Text style={styles.actionBtnText}>On The Way</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.completedBtn}
                    onPress={handleSetCompleted}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={17} color={colors.white} style={{ marginRight: 6 }} />
                        <Text style={styles.actionBtnText}>Service Completed</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : ticketStatus === 'On The Way' ? (
              <View style={styles.statusUpdateContainer}>
                <View style={[styles.statusBarBanner, { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' }]}>
                  <Ionicons name="car" size={18} color="#0369A1" style={{ marginRight: 6 }} />
                  <Text style={[styles.statusBarBannerText, { color: '#0369A1' }]}>
                    En route to customer location (~15 mins ETA).
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.completedBtn, { width: '100%', height: 50 }]}
                  onPress={handleSetCompleted}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <>
                      <Ionicons name="checkmark-done-circle" size={20} color={colors.white} style={{ marginRight: 8 }} />
                      <Text style={styles.actionBtnText}>Mark "Service Completed"</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : ticketStatus === 'Service Completed' ? (
              <View style={styles.statusUpdateContainer}>
                <View style={[styles.statusBarBanner, { backgroundColor: '#EBF4EE', borderColor: '#D2E7D8' }]}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.forestGreen} style={{ marginRight: 6 }} />
                  <Text style={[styles.statusBarBannerText, { color: colors.forestGreen, fontWeight: '700' }]}>
                    Service Completed! Final bill dispatched to customer.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.resetDemoBtn}
                  onPress={() => {
                    setHasActiveRequest(false);
                    setTicketStatus('Pending Review');
                  }}
                >
                  <Text style={styles.resetDemoText}>Return to Live Inbox</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.resetDemoBtn}
                onPress={() => {
                  setHasActiveRequest(false);
                  setTicketStatus('Pending Review');
                }}
              >
                <Text style={styles.resetDemoText}>Return to Live Inbox</Text>
              </TouchableOpacity>
            )}
          </>
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
    paddingBottom: 90,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  emptyIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#EBF5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptyProviderBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.forestGreen,
    backgroundColor: '#EBF5EE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 14,
  },
  emptyDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  onlineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F9F5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  greenPulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  onlineStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.forestGreen,
  },
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forestGreen,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: colors.forestGreen,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  simulateBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
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
  badgeOnTheWay: {
    backgroundColor: '#E0F2FE',
  },
  badgeCompleted: {
    backgroundColor: '#DCFCE7',
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
  textOnTheWay: {
    color: '#0369A1',
  },
  textCompleted: {
    color: '#15803D',
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
  instructionsContainer: {
    backgroundColor: '#F8FAF9',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
    marginBottom: 4,
  },
  instructionsHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.forestGreen,
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
  statusUpdateContainer: {
    marginTop: 6,
  },
  statusBarBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F9F5',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D2E7D8',
    marginBottom: 12,
  },
  statusBarBannerText: {
    flex: 1,
    fontSize: 13,
    color: colors.forestGreen,
    fontWeight: '600',
  },
  onTheWayBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#0284C7',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  completedBtn: {
    flex: 1.25,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.emerald,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.emerald,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  resetDemoBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.forestGreen,
    alignItems: 'center',
    backgroundColor: colors.white,
    marginTop: 10,
  },
  resetDemoText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.forestGreen,
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
