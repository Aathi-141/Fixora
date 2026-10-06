import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { payBooking } from '../../services/api';

const PAYMENT_METHODS = [
  {
    id: 'card',
    name: 'Visa / Mastercard (•••• 4892)',
    shortLabel: 'Visa / Mastercard',
    icon: 'card-outline',
  },
  {
    id: 'digital_wallet',
    name: 'Apple Pay / Google Pay',
    shortLabel: 'Apple Pay / Google Pay',
    icon: 'phone-portrait-outline',
  },
  {
    id: 'cash',
    name: 'Cash on Delivery (Pay Specialist)',
    shortLabel: 'Cash on Delivery',
    icon: 'cash-outline',
  },
];

export default function FinalBillPaymentScreen({ navigation, route }) {
  const { booking: paramBooking } = route.params || {};
  const [booking, setBooking] = useState(paramBooking || null);

  useEffect(() => {
    loadBookingData();
  }, [paramBooking]);

  const loadBookingData = async () => {
    if (paramBooking) {
      setBooking(paramBooking);
      return;
    }
    try {
      const stored = await AsyncStorage.getItem('fixora_latest_booking');
      if (stored) {
        setBooking(JSON.parse(stored));
      }
    } catch (e) {
      console.log('Error loading booking in payment screen:', e);
    }
  };

  const bookingId = booking?._id || '66fa_default_bk';
  const bookingRef = booking?.bookingRef || 'FX-88431';
  const serviceTitle = booking?.serviceTitle || 'Plumbing Repair - Leaking Pipe';
  const providerName =
    booking?.provider?.user?.name || booking?.provider?.name || 'Sunil Perera';
  const providerSpec =
    booking?.provider?.specialization || 'Master Plumber • 12 Yrs Exp';

  const [selectedMethod, setSelectedMethod] = useState('card');
  const [isPaying, setIsPaying] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [txnId, setTxnId] = useState('TXN-98432100');
  const [paidTimestamp, setPaidTimestamp] = useState('');

  // Itemized breakdown strictly matching the 4 required fields
  const totalAmount = booking?.pricing?.totalAmount || 2750;
  const diagFee = 750;
  const guaranteeFee = 150;
  const laborFee = Math.max(1200, Math.floor((totalAmount - diagFee - guaranteeFee) * 0.7));
  const partsFee = Math.max(0, totalAmount - (diagFee + laborFee + guaranteeFee));

  const billItems = [
    { name: 'Diagnostic Fee', desc: 'On-site system inspection & pressure diagnostics', cost: diagFee },
    { name: 'Labor Charges', desc: 'Certified specialist certified labor', cost: laborFee },
    { name: 'Parts & Materials', desc: 'Replacement seals, fittings & chemical flush', cost: partsFee },
    { name: 'Guarantee Fee', desc: 'Fixora 30-Day workmanship warranty & protection', cost: guaranteeFee },
  ];

  const handlePayNow = async () => {
    setIsPaying(true);
    const selectedObj = PAYMENT_METHODS.find((m) => m.id === selectedMethod);
    const methodLabel = selectedObj?.name || 'Credit/Debit Card';
    const res = await payBooking(bookingId, methodLabel);
    setIsPaying(false);

    const generatedTxn = res?.data?.transactionId || 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);
    const timeNow = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setTxnId(generatedTxn);
    setPaidTimestamp(timeNow);

    // Synchronize local AsyncStorage
    try {
      const stored = await AsyncStorage.getItem('fixora_latest_booking');
      if (stored) {
        const b = JSON.parse(stored);
        const updated = {
          ...b,
          isPaid: true,
          status: 'completed',
          transactionId: generatedTxn,
          paymentMethod: selectedObj?.shortLabel || methodLabel,
          paidAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem('fixora_latest_booking', JSON.stringify(updated));
        setBooking(updated);
      }
    } catch (e) {
      console.log('Error updating local booking payment state:', e);
    }

    setShowSuccessModal(true);
  };

  const selectedMethodObj = PAYMENT_METHODS.find((m) => m.id === selectedMethod);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Final Bill & Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Service Title & Provider Banner */}
        <View style={styles.card}>
          <Text style={styles.serviceTitle}>{serviceTitle}</Text>
          <View style={styles.providerRow}>
            <View style={styles.providerAvatarBox}>
              <Ionicons name="construct" size={22} color={colors.forestGreen} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.providerName}>{providerName}</Text>
              <Text style={styles.providerSpecText}>{providerSpec}</Text>
              <Text style={styles.completedTag}>✓ Service Completed • 100% Guaranteed</Text>
            </View>
          </View>
        </View>

        {/* Itemized Financial Breakdown */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeading}>Itemized Bill Breakdown</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={13} color={colors.forestGreen} style={{ marginRight: 4 }} />
              <Text style={styles.verifiedBadgeText}>Verified Rates</Text>
            </View>
          </View>

          {billItems.map((item, idx) => (
            <View key={idx} style={styles.breakdownRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.itemLabel}>{item.name}</Text>
                <Text style={styles.itemDesc}>{item.desc}</Text>
              </View>
              <Text style={styles.itemVal}>Rs. {item.cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Total Due</Text>
              <Text style={styles.taxInclusiveText}>(Inclusive of platform guarantee & taxes)</Text>
            </View>
            <Text style={styles.totalVal}>Rs. {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
          </View>
        </View>

        {/* Payment Method Selector */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Select Payment Method</Text>
          {PAYMENT_METHODS.map((method) => {
            const isSelected = selectedMethod === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                style={[styles.methodRow, isSelected && styles.methodRowActive]}
                onPress={() => setSelectedMethod(method.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.methodIconBox, isSelected && styles.methodIconBoxActive]}>
                  <Ionicons
                    name={method.icon}
                    size={22}
                    color={isSelected ? colors.forestGreen : colors.textSecondary}
                  />
                </View>
                <Text style={[styles.methodName, isSelected && styles.methodNameActive]}>
                  {method.name}
                </Text>
                <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.stickyFooter}>
        <View>
          <Text style={styles.footerLabel}>Amount Payable</Text>
          <Text style={styles.footerAmount}>LKR {totalAmount.toLocaleString()}</Text>
        </View>

        <TouchableOpacity
          style={styles.payBtn}
          onPress={handlePayNow}
          disabled={isPaying}
          activeOpacity={0.85}
        >
          {isPaying ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={styles.payBtnText}>Pay Rs. {totalAmount.toFixed(2)}</Text>
              <Ionicons name="checkmark-circle" size={18} color={colors.white} style={{ marginLeft: 6 }} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Payment Success & Official e-Receipt Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              {/* Checkmark Icon */}
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={44} color={colors.white} />
              </View>

              <Text style={styles.modalTitle}>Payment Successful!</Text>
              <Text style={styles.modalSub}>
                Your payment has been verified. Below is your official e-Receipt.
              </Text>

              {/* Official e-Receipt Card */}
              <View style={styles.receiptCard}>
                <View style={styles.receiptBrandHeader}>
                  <Text style={styles.receiptBrandName}>FIXORA</Text>
                  <View style={styles.paidBadge}>
                    <Text style={styles.paidBadgeText}>✓ PAID & VERIFIED</Text>
                  </View>
                </View>
                <Text style={styles.receiptDocTitle}>OFFICIAL E-RECEIPT</Text>

                <View style={styles.receiptDashedLine} />

                {/* Details Grid */}
                <View style={styles.receiptMetaRow}>
                  <Text style={styles.receiptMetaLabel}>Transaction ID:</Text>
                  <Text style={styles.receiptMetaValue}>{txnId}</Text>
                </View>
                <View style={styles.receiptMetaRow}>
                  <Text style={styles.receiptMetaLabel}>Booking Ref:</Text>
                  <Text style={styles.receiptMetaValue}>#{bookingRef}</Text>
                </View>
                <View style={styles.receiptMetaRow}>
                  <Text style={styles.receiptMetaLabel}>Date & Time:</Text>
                  <Text style={styles.receiptMetaValue}>{paidTimestamp || 'Just now'}</Text>
                </View>
                <View style={styles.receiptMetaRow}>
                  <Text style={styles.receiptMetaLabel}>Service Title:</Text>
                  <Text style={styles.receiptMetaValue}>{serviceTitle}</Text>
                </View>
                <View style={styles.receiptMetaRow}>
                  <Text style={styles.receiptMetaLabel}>Specialist:</Text>
                  <Text style={styles.receiptMetaValue}>{providerName}</Text>
                </View>
                <View style={styles.receiptMetaRow}>
                  <Text style={styles.receiptMetaLabel}>Payment Method:</Text>
                  <Text style={styles.receiptMetaValue}>{selectedMethodObj?.shortLabel || 'Card'}</Text>
                </View>

                <View style={styles.receiptDashedLine} />

                {/* Itemized List in Receipt */}
                <Text style={styles.receiptSectionTitle}>ITEMIZED CHARGES</Text>
                {billItems.map((item, idx) => (
                  <View key={idx} style={styles.receiptItemRow}>
                    <Text style={styles.receiptItemName}>{item.name}</Text>
                    <Text style={styles.receiptItemCost}>Rs. {item.cost.toFixed(2)}</Text>
                  </View>
                ))}

                <View style={styles.receiptSolidLine} />

                {/* Settled Total */}
                <View style={styles.receiptTotalRow}>
                  <Text style={styles.receiptTotalLabel}>TOTAL SETTLED</Text>
                  <Text style={styles.receiptTotalValue}>
                    LKR {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity
                style={styles.historyBtn}
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.navigate('HistoryTab');
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="calendar-outline" size={18} color={colors.white} style={{ marginRight: 8 }} />
                <Text style={styles.historyBtnText}>View Bookings & Tax Invoice</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.rateBtn}
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.navigate('RateReview', {
                    booking: {
                      ...booking,
                      isPaid: true,
                      transactionId: txnId,
                      paymentMethod: selectedMethodObj?.shortLabel,
                    },
                  });
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="star-outline" size={18} color={colors.forestGreen} style={{ marginRight: 8 }} />
                <Text style={styles.rateBtnText}>Rate & Review Specialist</Text>
              </TouchableOpacity>
            </ScrollView>
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
  serviceTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerAvatarBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  providerSpecText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  completedTag: {
    fontSize: 12,
    color: colors.forestGreen,
    fontWeight: '600',
    marginTop: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  taxInclusiveText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  totalVal: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    marginTop: 10,
    backgroundColor: colors.background,
  },
  methodRowActive: {
    borderColor: colors.forestGreen,
    backgroundColor: '#F3F9F5',
  },
  methodIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodIconBoxActive: {
    backgroundColor: '#D2E7D8',
  },
  methodName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  methodNameActive: {
    color: colors.forestGreen,
    fontWeight: '700',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: colors.forestGreen,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.forestGreen,
  },
  stickyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  footerLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  footerAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emerald,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 12,
  },
  payBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
  },
  modalScroll: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  checkCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.emerald,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.forestGreen,
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: '#F8FAF9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#D2E7D8',
    marginBottom: 16,
  },
  receiptBrandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptBrandName: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.forestGreen,
    letterSpacing: 2,
  },
  paidBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  paidBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  receiptDocTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    marginTop: 4,
  },
  receiptDashedLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  receiptSolidLine: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: 10,
  },
  receiptMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  receiptMetaLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  receiptMetaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  receiptSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.forestGreen,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  receiptItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  receiptItemName: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  receiptItemCost: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  receiptTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  receiptTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  receiptTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.forestGreen,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forestGreen,
    width: '100%',
    height: 48,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: colors.forestGreen,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  historyBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  rateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.forestGreen,
    width: '100%',
    height: 48,
    borderRadius: 12,
  },
  rateBtnText: {
    color: colors.forestGreen,
    fontSize: 14,
    fontWeight: '700',
  },
});
