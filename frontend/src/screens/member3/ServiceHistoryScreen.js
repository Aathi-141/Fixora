import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { getMyBookings } from '../../services/api';

export default function ServiceHistoryScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('ongoing');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
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
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      },
      scheduledDate: '12 Sep 2026',
      timeSlot: '02:00 PM',
      status: 'Completed',
      pricing: { totalAmount: 3350 },
      transactionId: 'TXN-77319200',
    },
  ];

  const currentList = activeTab === 'ongoing' ? ongoingBookings : completedBookings;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
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
        {currentList.map((item) => (
          <View key={item._id} style={styles.bookingCard}>
            {/* Top row: Ref and Status */}
            <View style={styles.cardHeader}>
              <Text style={styles.bookingRefText}>#{item.bookingRef}</Text>
              <View
                style={[
                  styles.statusBadge,
                  activeTab === 'ongoing' ? styles.statusBadgeActive : styles.statusBadgeDone,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    activeTab === 'ongoing' ? styles.statusTextActive : styles.statusTextDone,
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>

            {/* Service & Provider */}
            <Text style={styles.serviceTitleText}>{item.serviceTitle}</Text>
            <View style={styles.providerRow}>
              <Image source={{ uri: item.provider.avatar }} style={styles.providerImg} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.providerNameText}>{item.provider.name}</Text>
                <Text style={styles.providerSpecText}>{item.provider.specialization}</Text>
              </View>
              <Text style={styles.priceText}>
                LKR {item.pricing.totalAmount.toLocaleString()}
              </Text>
            </View>

            <View style={styles.dateSlotRow}>
              <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
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
                    style={styles.receiptBtn}
                    onPress={() => setSelectedReceipt(item)}
                  >
                    <Ionicons name="receipt-outline" size={16} color={colors.forestGreen} style={{ marginRight: 4 }} />
                    <Text style={styles.receiptBtnText}>Receipt</Text>
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
          </View>
        ))}
      </ScrollView>

      {/* Official Payment Receipt Modal */}
      <Modal visible={!!selectedReceipt} transparent animationType="slide">
        <View style={styles.receiptModalBackdrop}>
          <View style={styles.receiptModalCard}>
            <View style={styles.receiptModalHeader}>
              <View style={styles.brandIconCircle}>
                <Ionicons name="checkmark-done" size={24} color={colors.forestGreen} />
              </View>
              <Text style={styles.receiptTitle}>Payment Receipt</Text>
              <Text style={styles.receiptRefCode}>Ref: #{selectedReceipt?.bookingRef}</Text>
            </View>

            <View style={styles.amountDisplayBox}>
              <Text style={styles.amountSub}>Total Paid</Text>
              <Text style={styles.amountValue}>
                LKR {selectedReceipt?.pricing?.totalAmount.toLocaleString()}
              </Text>
              <Text style={styles.amountMethod}>Paid via Visa ending in 4892</Text>
            </View>

            {/* Breakdown */}
            <View style={styles.receiptBreakdown}>
              <View style={styles.breakdownRow}>
                <Text style={styles.bLabel}>Service: {selectedReceipt?.serviceTitle}</Text>
                <Text style={styles.bVal}>LKR 2,500</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.bLabel}>Diagnostic & Safety Inspection</Text>
                <Text style={styles.bVal}>LKR 1,000</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.bLabel}>Fixora Platform Guarantee Fee</Text>
                <Text style={styles.bVal}>LKR 250</Text>
              </View>
              <View style={styles.modalDivider} />
              <View style={styles.breakdownRow}>
                <Text style={styles.bLabelTotal}>Total Settled</Text>
                <Text style={styles.bValTotal}>
                  LKR {selectedReceipt?.pricing?.totalAmount.toLocaleString()}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeReceiptBtn}
              onPress={() => setSelectedReceipt(null)}
            >
              <Text style={styles.closeReceiptBtnText}>Close Receipt</Text>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 6,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: colors.forestGreen,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 32,
  },
  bookingCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingRefText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeDone: {
    backgroundColor: '#EBF4EE',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextActive: {
    color: '#92400E',
  },
  statusTextDone: {
    color: colors.forestGreen,
  },
  serviceTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  providerImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  providerNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  providerSpecText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  dateSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 8,
    marginBottom: 14,
  },
  dateSlotText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
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
    height: 42,
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
    backgroundColor: '#EBF4EE',
    borderWidth: 1,
    borderColor: colors.sageGreen,
    height: 42,
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
    backgroundColor: '#EBF4EE',
    borderWidth: 1,
    borderColor: colors.sageGreen,
    height: 42,
    borderRadius: 10,
  },
  receiptBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  bookAgainBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forestGreen,
    height: 42,
    borderRadius: 10,
  },
  bookAgainBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  receiptModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  receiptModalCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
  },
  receiptModalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  brandIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  receiptRefCode: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  amountDisplayBox: {
    backgroundColor: '#F3F9F5',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  amountSub: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.forestGreen,
    marginVertical: 4,
  },
  amountMethod: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  receiptBreakdown: {
    marginBottom: 20,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
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
    marginVertical: 8,
  },
  bLabelTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  bValTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  closeReceiptBtn: {
    backgroundColor: colors.forestGreen,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeReceiptBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
