import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { getMyBookings } from '../../services/api';

export default function ServiceHistoryScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('ongoing');
  const [expandedReceiptId, setExpandedReceiptId] = useState('b_comp_1'); // Pre-expand receipt on first completed booking so user sees it immediately!
  const [loading, setLoading] = useState(false);

  // Pre-seeded records matching Milestone 02 Figma wireframes
  const ongoingBookings = [
    {
      _id: 'b_on_1',
      bookingRef: 'BK-8402',
      serviceTitle: 'Plumbing Repair - Leaking Kitchen Pipe',
      category: 'Plumber',
      provider: {
        name: 'Sunil Perera',
        specialization: 'Master Plumber • 12 Yrs Exp',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      },
      scheduledDate: 'Today, Oct 02, 2026',
      timeSlot: '10:00 AM',
      status: 'On the Way (15m ETA)',
      pricing: { totalAmount: 4250 },
    },
  ];

  const completedBookings = [
    {
      _id: 'b_comp_1',
      bookingRef: 'FX-76210',
      serviceTitle: 'Deep Home Cleaning & Disinfection',
      category: 'Cleaner',
      provider: {
        name: 'Chaminda Wickramasinghe',
        specialization: 'Cleaning Specialist',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      },
      scheduledDate: '25 Sep 2026',
      timeSlot: '09:00 AM',
      status: 'Completed',
      pricing: { totalAmount: 3750 },
      transactionId: 'TXN-98432100',
    },
    {
      _id: 'b_comp_2',
      bookingRef: 'FX-64301',
      serviceTitle: 'Electrical Wiring Safety Inspection',
      category: 'Electrician',
      provider: {
        name: 'Ramesh Mendis',
        specialization: 'Senior Electrician',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
      },
      scheduledDate: '12 Sep 2026',
      timeSlot: '02:00 PM',
      status: 'Completed',
      pricing: { totalAmount: 3350 },
      transactionId: 'TXN-77319200',
    },
  ];

  const currentList = activeTab === 'ongoing' ? ongoingBookings : completedBookings;

  const handleDownloadReceipt = (bookingRef) => {
    Alert.alert(
      'Receipt Downloaded',
      `Official Fixora Tax Invoice #${bookingRef} has been saved to your downloads as PDF.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('HomeTab')}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Request History</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Segmented Tabs with Counters */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'ongoing' && styles.tabBtnActive]}
          onPress={() => setActiveTab('ongoing')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'ongoing' && styles.tabBtnTextActive]}>
            Ongoing ({ongoingBookings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'completed' && styles.tabBtnActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'completed' && styles.tabBtnTextActive]}>
            Completed ({completedBookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {currentList.map((item) => {
          const isReceiptOpen = expandedReceiptId === item._id;

          return (
            <View key={item._id} style={styles.bookingCard}>
              {/* Top row: Ref and Status */}
              <View style={styles.cardHeader}>
                <Text style={styles.bookingRefText}>#{item.bookingRef}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    item.status === 'Completed' ? styles.statusBadgeCompleted : styles.statusBadgeOngoing,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      item.status === 'Completed' ? styles.statusTextCompleted : styles.statusTextOngoing,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              {/* Service & Provider Details */}
              <View style={styles.providerRow}>
                <Image source={{ uri: item.provider.avatar }} style={styles.providerThumb} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceTitle}>{item.serviceTitle}</Text>
                  <Text style={styles.providerName}>{item.provider.name}</Text>
                  <Text style={styles.providerSpec}>{item.provider.specialization}</Text>
                </View>
              </View>

              {/* Date & Time Slot */}
              <View style={styles.slotRow}>
                <Ionicons name="calendar-outline" size={15} color={colors.textSecondary} style={{ marginRight: 6 }} />
                <Text style={styles.dateSlotText}>
                  {item.scheduledDate} • {item.timeSlot}
                </Text>
              </View>

              {/* Card Actions */}
              <View style={styles.cardActionsRow}>
                {activeTab === 'ongoing' ? (
                  <>
                    <TouchableOpacity
                      style={styles.trackBtn}
                      onPress={() => navigation.navigate('RequestStatusTracking', { booking: item })}
                    >
                      <Ionicons name="navigate-outline" size={16} color={colors.white} style={{ marginRight: 4 }} />
                      <Text style={styles.trackBtnText}>Track Status</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.chatBtn}
                      onPress={() => navigation.navigate('Chat', { booking: item })}
                    >
                      <Ionicons name="chatbubble-outline" size={16} color={colors.forestGreen} style={{ marginRight: 4 }} />
                      <Text style={styles.chatBtnText}>Chat</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.receiptBtn, isReceiptOpen && styles.receiptBtnActive]}
                      onPress={() => setExpandedReceiptId(isReceiptOpen ? null : item._id)}
                    >
                      <Ionicons
                        name={isReceiptOpen ? 'chevron-up' : 'receipt-outline'}
                        size={16}
                        color={isReceiptOpen ? colors.white : colors.forestGreen}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.receiptBtnText, isReceiptOpen && styles.receiptBtnTextActive]}>
                        {isReceiptOpen ? 'Hide Receipt' : 'View Receipt'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.bookAgainBtn}
                      onPress={() => navigation.navigate('DateTimeSelection', { provider: item.provider })}
                    >
                      <Ionicons name="repeat" size={16} color={colors.white} style={{ marginRight: 4 }} />
                      <Text style={styles.bookAgainBtnText}>Book Again</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {/* Expandable Official Payment Receipt Card */}
              {activeTab === 'completed' && isReceiptOpen && (
                <View style={styles.receiptCardWrapper}>
                  <View style={styles.receiptInnerCard}>
                    <View style={styles.receiptCardHeader}>
                      <View style={styles.brandIconCircle}>
                        <Ionicons name="checkmark-done" size={20} color={colors.forestGreen} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.receiptTitle}>Fixora Payment Receipt</Text>
                        <Text style={styles.receiptRefCode}>
                          Ref: #{item.bookingRef} • {item.transactionId || 'TXN-98432100'}
                        </Text>
                      </View>
                      <View style={styles.paidStampBadge}>
                        <Ionicons name="shield-checkmark" size={12} color="#15803D" style={{ marginRight: 3 }} />
                        <Text style={styles.paidStampText}>PAID</Text>
                      </View>
                    </View>

                    <View style={styles.amountDisplayBox}>
                      <Text style={styles.amountSub}>Total Settled in LKR</Text>
                      <Text style={styles.amountValue}>
                        Rs. {item.pricing?.totalAmount?.toLocaleString()}
                      </Text>
                      <Text style={styles.amountMethod}>Paid via Visa ending in 4892</Text>
                    </View>

                    {/* Breakdown */}
                    <View style={styles.receiptBreakdown}>
                      <View style={styles.breakdownRow}>
                        <Text style={styles.bLabel}>Base Service Rate</Text>
                        <Text style={styles.bVal}>Rs. 2,500</Text>
                      </View>
                      <View style={styles.breakdownRow}>
                        <Text style={styles.bLabel}>Diagnostic & Labor Inspection</Text>
                        <Text style={styles.bVal}>Rs. 1,000</Text>
                      </View>
                      <View style={styles.breakdownRow}>
                        <Text style={styles.bLabel}>Fixora Guarantee & Platform Fee</Text>
                        <Text style={styles.bVal}>Rs. 250</Text>
                      </View>
                      <View style={styles.modalDivider} />
                      <View style={styles.breakdownRow}>
                        <Text style={styles.bLabelTotal}>Total Paid</Text>
                        <Text style={styles.bValTotal}>
                          Rs. {item.pricing?.totalAmount?.toLocaleString()}
                        </Text>
                      </View>
                    </View>

                    {/* Download & Share Button */}
                    <TouchableOpacity
                      style={styles.downloadReceiptBtn}
                      onPress={() => handleDownloadReceipt(item.bookingRef)}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="download-outline" size={16} color={colors.white} style={{ marginRight: 6 }} />
                      <Text style={styles.downloadReceiptBtnText}>Download Official PDF Invoice</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: colors.background,
    marginHorizontal: 4,
  },
  tabBtnActive: {
    backgroundColor: colors.forestGreen,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    color: colors.white,
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 100, // Plenty of clearance for bottom navigation bar
  },
  bookingCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingRefText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeOngoing: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeCompleted: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextOngoing: {
    color: '#92400E',
  },
  statusTextCompleted: {
    color: '#15803D',
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  providerThumb: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 12,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  providerName: {
    fontSize: 13,
    color: colors.forestGreen,
    fontWeight: '600',
    marginTop: 2,
  },
  providerSpec: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  dateSlotText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  trackBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.emerald,
    height: 40,
    borderRadius: 10,
  },
  trackBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.forestGreen,
    height: 40,
    borderRadius: 10,
  },
  chatBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  receiptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.forestGreen,
    height: 40,
    borderRadius: 10,
  },
  receiptBtnActive: {
    backgroundColor: colors.forestGreen,
  },
  receiptBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  receiptBtnTextActive: {
    color: colors.white,
  },
  bookAgainBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forestGreen,
    height: 40,
    borderRadius: 10,
  },
  bookAgainBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  receiptCardWrapper: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 14,
  },
  receiptInnerCard: {
    backgroundColor: '#F9FCFA',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#CBE5D3',
  },
  receiptCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  receiptRefCode: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  paidStampBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  paidStampText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  amountDisplayBox: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1EFE6',
  },
  amountSub: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.forestGreen,
    marginVertical: 2,
  },
  amountMethod: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  receiptBreakdown: {
    marginBottom: 14,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  bLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  bVal: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalDivider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 6,
  },
  bLabelTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  bValTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  downloadReceiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forestGreen,
    height: 42,
    borderRadius: 10,
  },
  downloadReceiptBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
