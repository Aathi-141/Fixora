import React, { useState, useEffect, useContext, useCallback } from 'react';
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
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import {
  updateBookingStatus,
  getProviderRequests,
  getMyProfile,
} from '../../services/api';

export default function ProviderRequestsScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [providerProfileId, setProviderProfileId] = useState(
    user?.providerProfileId || user?.providerProfile?._id || null
  );

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'active'
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isNotLinked, setIsNotLinked] = useState(false);

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingBooking, setRejectingBooking] = useState(null);
  const [rejectReason, setRejectReason] = useState('Outside scheduled service zone');
  const [submittingId, setSubmittingId] = useState(null);

  // Automatically refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [user])
  );

  const loadRequests = async (isPull = false) => {
    if (isPull) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // 1. Resolve providerProfileId from user or API
      let profId = providerProfileId || user?.providerProfileId || user?.providerProfile?._id;

      if (!profId) {
        const meRes = await getMyProfile();
        if (
          meRes.success &&
          (meRes.user?.providerProfileId || meRes.user?.providerProfile?._id)
        ) {
          profId = meRes.user.providerProfileId || meRes.user.providerProfile._id;
          setProviderProfileId(profId);
        }
      }

      if (!profId) {
        setIsNotLinked(true);
        setError(null);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      setIsNotLinked(false);

      // 2. Fetch real bookings from MongoDB for this provider
      const res = await getProviderRequests(profId);

      if (res.success && Array.isArray(res.data)) {
        setError(null);
        const pending = res.data.filter((b) => b.status === 'pending');
        const active = res.data.filter(
          (b) => b.status === 'accepted' || b.status === 'on_the_way'
        );
        setPendingRequests(pending);
        setActiveJobs(active);
      } else {
        // Backend reported an error or database issue
        setError(
          res.message ||
            'Unable to fetch requests from server. Please verify backend database connectivity.'
        );
      }
    } catch (err) {
      console.error('Error fetching provider requests:', err);
      setError(err.message || 'An unexpected error occurred while loading requests.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCallCustomer = (phone, name) => {
    if (!phone) {
      Alert.alert('Notice', 'No contact phone number provided for this customer.');
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Customer Phone', `Calling ${name || 'Customer'} at ${phone}`);
    });
  };

  // Accept booking by real MongoDB _id
  const handleAccept = async (booking) => {
    setSubmittingId(booking._id);
    const res = await updateBookingStatus(booking._id, 'accepted');
    setSubmittingId(null);

    if (res.success) {
      Alert.alert(
        'Service Accepted!',
        `You have accepted booking #${booking.bookingRef || booking._id.slice(-6)}. The customer has been notified and is expecting your arrival.`,
        [
          {
            text: 'View in Active Jobs',
            onPress: () => setActiveTab('active'),
          },
          { text: 'OK' },
        ]
      );
      await loadRequests();
    } else {
      Alert.alert('Action Failed', res.message || 'Failed to accept booking. Please try again.');
    }
  };

  // Initiate Reject Modal for specific booking
  const handleOpenRejectModal = (booking) => {
    setRejectingBooking(booking);
    setRejectReason('Outside scheduled service zone');
    setShowRejectModal(true);
  };

  // Confirm rejection in backend
  const handleConfirmReject = async () => {
    if (!rejectingBooking) return;
    setSubmittingId(rejectingBooking._id);
    const bookingId = rejectingBooking._id;
    const ref = rejectingBooking.bookingRef || bookingId.slice(-6);

    const res = await updateBookingStatus(bookingId, 'rejected', null, rejectReason);
    setSubmittingId(null);
    setShowRejectModal(false);
    setRejectingBooking(null);

    if (res.success) {
      Alert.alert(
        'Request Declined',
        `Booking #${ref} was declined and returned to the regional dispatch queue.`,
        [{ text: 'OK' }]
      );
      await loadRequests();
    } else {
      Alert.alert('Action Failed', res.message || 'Failed to decline request. Please try again.');
    }
  };

  // Advance status to "On The Way"
  const handleSetOnTheWay = async (booking) => {
    setSubmittingId(booking._id);
    const res = await updateBookingStatus(booking._id, 'on_the_way', 15);
    setSubmittingId(null);

    if (res.success) {
      Alert.alert(
        'Status: On The Way',
        'Customer was notified with your real-time ETA (~15 mins). Tap "Mark Service Completed" once the job is finished.',
        [{ text: 'OK' }]
      );
      await loadRequests();
    } else {
      Alert.alert('Action Failed', res.message || 'Failed to update status.');
    }
  };

  // Advance status to "Completed"
  const handleSetCompleted = async (booking) => {
    setSubmittingId(booking._id);
    const res = await updateBookingStatus(booking._id, 'completed');
    setSubmittingId(null);

    if (res.success) {
      Alert.alert(
        'Service Completed!',
        'Job completed successfully. The final bill is now ready for customer payment and review.',
        [{ text: 'OK' }]
      );
      await loadRequests();
    } else {
      Alert.alert('Action Failed', res.message || 'Failed to update status.');
    }
  };

  const currentList = activeTab === 'pending' ? pendingRequests : activeJobs;

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
        <TouchableOpacity
          style={styles.refreshIconBtn}
          onPress={() => loadRequests(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Tab Segment: Pending Requests vs Active Jobs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'pending' && styles.tabBtnActive]}
          onPress={() => setActiveTab('pending')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabBtnText, activeTab === 'pending' && styles.tabBtnTextActive]}>
            Pending Requests
          </Text>
          {pendingRequests.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{pendingRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'active' && styles.tabBtnActive]}
          onPress={() => setActiveTab('active')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabBtnText, activeTab === 'active' && styles.tabBtnTextActive]}>
            Active Jobs
          </Text>
          {activeJobs.length > 0 && (
            <View style={[styles.tabBadge, { backgroundColor: colors.forestGreen }]}>
              <Text style={styles.tabBadgeText}>{activeJobs.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadRequests(true)}
            colors={[colors.forestGreen]}
            tintColor={colors.forestGreen}
          />
        }
      >
        {/* Loading Spinner */}
        {loading && !refreshing ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.forestGreen} />
            <Text style={styles.loadingText}>Fetching real bookings from MongoDB Atlas...</Text>
          </View>
        ) : error ? (
          /* Error State: MongoDB Disconnected or API Error */
          <View style={styles.errorCard}>
            <View style={styles.errorIconCircle}>
              <Ionicons name="cloud-offline-outline" size={44} color={colors.danger} />
            </View>
            <Text style={styles.errorTitle}>Backend Connection Issue</Text>
            <Text style={styles.errorDesc}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => loadRequests(false)}
              activeOpacity={0.85}
            >
              <Ionicons name="refresh" size={18} color={colors.white} style={{ marginRight: 6 }} />
              <Text style={styles.retryBtnText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        ) : isNotLinked ? (
          /* Unlinked Provider Profile State */
          <View style={styles.unlinkedCard}>
            <View style={styles.unlinkedIconCircle}>
              <Ionicons name="person-circle-outline" size={48} color="#D97706" />
            </View>
            <Text style={styles.unlinkedTitle}>Provider Profile Not Linked</Text>
            <Text style={styles.unlinkedDesc}>
              This account ({user?.email || 'Provider'}) is signed in, but no linked service provider profile was found in the database.
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => loadRequests(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.retryBtnText}>Refresh Profile</Text>
            </TouchableOpacity>
          </View>
        ) : currentList.length === 0 ? (
          /* Empty State: Genuinely No Requests */
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="notifications-outline" size={44} color={colors.forestGreen} />
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === 'pending'
                ? 'No pending booking requests'
                : 'No active jobs in progress'}
            </Text>
            <Text style={styles.emptyProviderBadge}>
              {user?.name || 'Partner'} • {user?.category || 'Service Specialist'}
            </Text>
            <Text style={styles.emptyDesc}>
              {activeTab === 'pending'
                ? `You are currently online and available in your service area. When customers book your services, incoming bookings will appear here in real-time.`
                : 'Jobs you have accepted will appear here. You can mark status as "On The Way" and "Service Completed".'}
            </Text>

            <View style={styles.onlineStatusRow}>
              <View style={styles.greenPulseDot} />
              <Text style={styles.onlineStatusText}>Listening for incoming customer bookings</Text>
            </View>
          </View>
        ) : (
          /* Render Real Bookings */
          currentList.map((item) => {
            const customerName =
              item.customer?.name || item.customerName || 'Customer';
            const customerPhone =
              item.customerPhone || item.customer?.phone || '';
            const customerAddress =
              item.serviceAddress || 'No Address Provided';
            const serviceTitle =
              item.serviceTitle || `${item.serviceCategory || 'Home'} Service`;
            const scheduledTimeText = `${item.scheduledDate || 'Scheduled'} • ${item.timeSlot || 'Window'}`;
            const ticketRef = item.bookingRef || item._id.slice(-6);

            const totalAmount = item.pricing?.totalAmount || 0;
            const basePrice = item.pricing?.basePrice || 0;
            const addOnsTotal = item.pricing?.addOnsTotal || 0;

            const isItemSubmitting = submittingId === item._id;

            return (
              <View key={item._id} style={styles.ticketCard}>
                {/* Ticket Bar */}
                <View style={styles.ticketBar}>
                  <Text style={styles.ticketId}>Ticket #{ticketRef}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      item.status === 'on_the_way'
                        ? styles.badgeOnTheWay
                        : item.status === 'completed'
                        ? styles.badgeCompleted
                        : item.status === 'accepted'
                        ? styles.badgeAccepted
                        : styles.badgePending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        item.status === 'on_the_way'
                          ? styles.textOnTheWay
                          : item.status === 'completed'
                          ? styles.textCompleted
                          : item.status === 'accepted'
                          ? styles.textAccepted
                          : styles.textPending,
                      ]}
                    >
                      {item.status === 'on_the_way'
                        ? 'On The Way'
                        : item.status === 'completed'
                        ? 'Completed'
                        : item.status === 'accepted'
                        ? 'Accepted'
                        : 'Pending Review'}
                    </Text>
                  </View>
                </View>

                {/* Customer Information */}
                <View style={styles.customerRow}>
                  <Image
                    source={{
                      uri:
                        item.customer?.avatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
                    }}
                    style={styles.customerAvatar}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.customerName}>{customerName}</Text>
                    <View style={styles.verifiedRow}>
                      <Ionicons
                        name="shield-checkmark"
                        size={13}
                        color={colors.forestGreen}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.verifiedText}>Verified Customer</Text>
                    </View>
                    {customerPhone ? (
                      <Text style={styles.customerPhone}>{customerPhone}</Text>
                    ) : null}
                  </View>

                  {/* Call Customer Button */}
                  {customerPhone ? (
                    <TouchableOpacity
                      style={styles.phoneIconBtn}
                      onPress={() => handleCallCustomer(customerPhone, customerName)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="call" size={18} color={colors.forestGreen} />
                    </TouchableOpacity>
                  ) : null}
                </View>

                <View style={styles.cardDivider} />

                {/* Service Details */}
                <Text style={styles.serviceTitle}>{serviceTitle}</Text>

                {/* Special Instructions Note */}
                <View style={styles.instructionsContainer}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Ionicons
                      name="document-text"
                      size={15}
                      color={colors.forestGreen}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.instructionsHeading}>Special Instructions / Notes:</Text>
                  </View>
                  <Text
                    style={[
                      styles.issueNotes,
                      (!item.notes || !item.notes.trim()) && {
                        fontStyle: 'italic',
                        color: colors.textMuted,
                      },
                    ]}
                  >
                    {item.notes && item.notes.trim().length > 0
                      ? item.notes.trim()
                      : 'No special instructions given by customer.'}
                  </Text>
                </View>

                {/* Location & Time */}
                <View style={styles.infoRow}>
                  <Ionicons name="location" size={17} color={colors.forestGreen} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoTitle}>Service Location</Text>
                    <Text style={styles.infoSub}>{customerAddress}</Text>
                  </View>
                </View>

                <View style={[styles.infoRow, { marginTop: 10 }]}>
                  <Ionicons name="time" size={17} color={colors.forestGreen} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoTitle}>Scheduled Window</Text>
                    <Text style={styles.infoSub}>{scheduledTimeText}</Text>
                  </View>
                </View>

                {/* Payout Summary */}
                <View style={styles.payoutCard}>
                  <View>
                    <Text style={styles.payoutLabel}>Total Provider Payout</Text>
                    <Text style={styles.payoutAmount}>
                      LKR {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <View style={styles.feeBreakdown}>
                    <Text style={styles.feeItem}>
                      Base: LKR {basePrice.toLocaleString()}
                    </Text>
                    <Text style={styles.feeItem}>
                      Add-Ons: LKR {addOnsTotal.toLocaleString()}
                    </Text>
                  </View>
                </View>

                {/* Actions Based on Tab & Status */}
                {item.status === 'pending' ? (
                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => handleOpenRejectModal(item)}
                      disabled={isItemSubmitting}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.acceptBtn}
                      onPress={() => handleAccept(item)}
                      disabled={isItemSubmitting}
                      activeOpacity={0.85}
                    >
                      {isItemSubmitting ? (
                        <ActivityIndicator color={colors.white} />
                      ) : (
                        <>
                          <Ionicons name="checkmark-circle" size={18} color={colors.white} style={{ marginRight: 6 }} />
                          <Text style={styles.acceptBtnText}>Accept Request</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : item.status === 'accepted' ? (
                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      style={styles.onTheWayBtn}
                      onPress={() => handleSetOnTheWay(item)}
                      disabled={isItemSubmitting}
                      activeOpacity={0.85}
                    >
                      {isItemSubmitting ? (
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
                      onPress={() => handleSetCompleted(item)}
                      disabled={isItemSubmitting}
                      activeOpacity={0.85}
                    >
                      {isItemSubmitting ? (
                        <ActivityIndicator color={colors.white} />
                      ) : (
                        <>
                          <Ionicons name="checkmark-done-circle" size={18} color={colors.white} style={{ marginRight: 6 }} />
                          <Text style={styles.actionBtnText}>Service Completed</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : item.status === 'on_the_way' ? (
                  <View>
                    <View style={styles.enRouteBanner}>
                      <Ionicons name="car" size={18} color="#0369A1" style={{ marginRight: 6 }} />
                      <Text style={styles.enRouteBannerText}>
                        En route to customer location (~15 mins ETA).
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.completedBtn, { width: '100%', height: 48, marginTop: 8 }]}
                      onPress={() => handleSetCompleted(item)}
                      disabled={isItemSubmitting}
                      activeOpacity={0.85}
                    >
                      {isItemSubmitting ? (
                        <ActivityIndicator color={colors.white} />
                      ) : (
                        <>
                          <Ionicons name="checkmark-done-circle" size={18} color={colors.white} style={{ marginRight: 8 }} />
                          <Text style={styles.actionBtnText}>Mark "Service Completed"</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Reject Modal */}
      <Modal visible={showRejectModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Reject this request?</Text>
            <Text style={styles.modalPrompt}>
              Customer {rejectingBooking?.customer?.name || 'Customer'} will be notified and booking #{rejectingBooking?.bookingRef || rejectingBooking?._id?.slice(-6)} will be returned to dispatch.
            </Text>

            {['Outside scheduled service zone', 'Schedule conflict', 'Specialized tools unavailable', 'Other operational reason'].map(
              (reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[styles.reasonOption, rejectReason === reason && styles.reasonOptionActive]}
                  onPress={() => setRejectReason(reason)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={rejectReason === reason ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={rejectReason === reason ? colors.forestGreen : colors.textMuted}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.reasonText}>{reason}</Text>
                </TouchableOpacity>
              )
            )}

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectingBooking(null);
                }}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmRejectBtn}
                onPress={handleConfirmReject}
                disabled={submittingId !== null}
              >
                {submittingId ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.modalConfirmRejectText}>Confirm Rejection</Text>
                )}
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
  refreshIconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: colors.forestGreen,
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    color: colors.forestGreen,
    fontWeight: '800',
  },
  tabBadge: {
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 6,
  },
  tabBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 40,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
  errorCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    elevation: 2,
  },
  errorIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.danger,
    marginBottom: 8,
  },
  errorDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.forestGreen,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  unlinkedCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    elevation: 2,
  },
  unlinkedIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  unlinkedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 8,
  },
  unlinkedDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
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
    fontSize: 19,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
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
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  onlineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F9F5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
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
  ticketCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  ticketBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketId: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
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
  statusBadgeText: {
    fontSize: 11,
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
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 11,
    color: colors.forestGreen,
    fontWeight: '600',
  },
  customerPhone: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  phoneIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  instructionsContainer: {
    backgroundColor: '#F8FAF9',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  instructionsHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  issueNotes: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
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
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D2E7D8',
    marginVertical: 14,
  },
  payoutLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  payoutAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.forestGreen,
    marginTop: 2,
  },
  feeBreakdown: {
    alignItems: 'flex-end',
  },
  feeItem: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rejectBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.danger,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
  acceptBtn: {
    flex: 1.6,
    height: 46,
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
  acceptBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  onTheWayBtn: {
    flex: 1,
    height: 46,
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
    flex: 1.3,
    height: 46,
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
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  enRouteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 10,
    borderRadius: 10,
  },
  enRouteBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
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
