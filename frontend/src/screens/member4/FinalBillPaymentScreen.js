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
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { payBooking } from '../../services/api';

const PAYMENT_METHODS = [
  { id: 'card', name: 'Visa ending in 4892', icon: 'card-outline' },
  { id: 'apple', name: 'Apple Pay / Google Pay', icon: 'wallet-outline' },
  { id: 'cash', name: 'Cash on Delivery', icon: 'cash-outline' },
];

export default function FinalBillPaymentScreen({ navigation, route }) {
  const { booking } = route.params || {};

  const bookingId = booking?._id || '66fa_default_bk';
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [isPaying, setIsPaying] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [txnId, setTxnId] = useState('TXN-98432100');

  const billItems = [
    { name: 'Diagnostic Inspection', cost: 750 },
    { name: 'Certified Field Labor (2.5 hrs)', cost: 1500 },
    { name: 'Parts & Materials (Seals & Valves)', cost: 425 },
    { name: 'Antimicrobial Eco-Coating', cost: 320 },
    { name: 'Protection Guarantee', cost: 150 },
  ];

  const totalAmount = billItems.reduce((sum, item) => sum + item.cost, 0);

  const handlePayNow = async () => {
    setIsPaying(true);
    const res = await payBooking(bookingId, selectedMethod);
    setIsPaying(false);

    if (res.success && res.data?.transactionId) {
      setTxnId(res.data.transactionId);
    }
    setShowSuccessModal(true);
  };

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
          <Text style={styles.serviceTitle}>HVAC System Overhaul & Repair</Text>
          <View style={styles.providerRow}>
            <View style={styles.providerAvatarBox}>
              <Ionicons name="construct" size={20} color={colors.forestGreen} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.providerName}>Marcus Sterling</Text>
              <Text style={styles.completedTag}>Completed Today • 100% Guaranteed</Text>
            </View>
          </View>
        </View>

        {/* Itemized Financial Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Itemized Breakdown</Text>
          {billItems.map((item, idx) => (
            <View key={idx} style={styles.breakdownRow}>
              <Text style={styles.itemLabel}>{item.name}</Text>
              <Text style={styles.itemVal}>Rs. {item.cost.toFixed(2)}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Due</Text>
            <Text style={styles.totalVal}>Rs. {totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Method Selector */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Payment Method</Text>
          {PAYMENT_METHODS.map((method) => {
            const isSelected = selectedMethod === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                style={[styles.methodRow, isSelected && styles.methodRowActive]}
                onPress={() => setSelectedMethod(method.id)}
              >
                <Ionicons
                  name={method.icon}
                  size={22}
                  color={isSelected ? colors.forestGreen : colors.textSecondary}
                  style={{ marginRight: 12 }}
                />
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

      {/* Payment Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={44} color={colors.white} />
            </View>

            <Text style={styles.modalTitle}>Payment Successful!</Text>
            <Text style={styles.modalSub}>
              Your booking payment has been confirmed. A receipt has been issued and emailed.
            </Text>

            <View style={styles.amountPill}>
              <Text style={styles.amountPillSub}>Settled</Text>
              <Text style={styles.amountPillValue}>Rs. {totalAmount.toFixed(2)}</Text>
              <Text style={styles.txnIdText}>{txnId}</Text>
            </View>

            <TouchableOpacity
              style={styles.viewReceiptBtn}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate('HistoryTab');
              }}
            >
              <Text style={styles.viewReceiptBtnText}>View Receipt & History</Text>
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
  serviceTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerAvatarBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  completedTag: {
    fontSize: 12,
    color: colors.forestGreen,
    fontWeight: '600',
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.forestGreen,
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  itemLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  itemVal: {
    fontSize: 13,
    fontWeight: '600',
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
    marginBottom: 10,
    backgroundColor: colors.background,
  },
  methodRowActive: {
    borderColor: colors.forestGreen,
    backgroundColor: '#F3F9F5',
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  checkCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.emerald,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.forestGreen,
    marginBottom: 6,
  },
  modalSub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  amountPill: {
    backgroundColor: '#F3F9F5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  amountPillSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  amountPillValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.forestGreen,
    marginVertical: 2,
  },
  txnIdText: {
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  viewReceiptBtn: {
    backgroundColor: colors.forestGreen,
    width: '100%',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewReceiptBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
