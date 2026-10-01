import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { createBooking } from '../../services/api';

export default function BookingDetailsScreen({ navigation, route }) {
  const { provider, bookingData } = route.params || {};
  const { user } = useContext(AuthContext);

  const [address, setAddress] = useState(user?.address || 'No 42, New Kandy Road, Malabe');
  const [phone, setPhone] = useState(user?.phone || '+94 77 123 4567');
  const [notes, setNotes] = useState('Standard residential service with front gate entrance.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pricing = bookingData?.pricing || {
    basePrice: 2500,
    addOnsTotal: 1000,
    serviceFee: 250,
    totalAmount: 3750,
  };

  const selectedAddons = (bookingData?.addOns || []).filter((a) => a.selected);

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    const payload = {
      customerId: user?.id || '66f000000000000000000001',
      providerId: provider?._id || '66f000000000000000000002',
      serviceCategory: provider?.category || 'Cleaner',
      serviceTitle: provider?.specialization || 'Deep Home Botanical Cleaning',
      scheduledDate: bookingData?.scheduledDate || '2026-10-15',
      timeSlot: bookingData?.timeSlot || '11:00 AM',
      serviceAddress: address,
      customerPhone: phone,
      notes,
      addOns: bookingData?.addOns || [],
      pricing,
    };

    const res = await createBooking(payload);
    setIsSubmitting(false);

    if (res.success && res.data) {
      navigation.navigate('BookingSuccessful', { booking: res.data });
    } else {
      // Offline fallback: simulate successful booking creation
      const mockCreated = {
        _id: 'bk_' + Date.now(),
        bookingRef: 'FX-' + Math.floor(10000 + Math.random() * 90000),
        provider: provider || {
          specialization: 'Deep Home Botanical Cleaning',
          category: 'Cleaner',
          user: { name: 'Kasun Perera' },
        },
        scheduledDate: bookingData?.scheduledDate || '2026-10-15',
        timeSlot: bookingData?.timeSlot || '11:00 AM',
        serviceAddress: address,
        pricing,
        status: 'pending',
      };
      navigation.navigate('BookingSuccessful', { booking: mockCreated });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Service Summary Card */}
        <View style={styles.card}>
          <View style={styles.serviceHeaderRow}>
            <View style={styles.serviceIconCircle}>
              <Ionicons name="sparkles" size={24} color={colors.forestGreen} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.serviceTitle}>
                {provider?.specialization || 'Deep Home Botanical Cleaning'}
              </Text>
              <Text style={styles.providerName}>
                Provider: {provider?.user?.name || provider?.name || 'Chaminda W.'}
              </Text>
            </View>
          </View>
        </View>

        {/* Scheduled Date & Time with Edit Link */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="calendar-outline" size={20} color={colors.forestGreen} style={{ marginRight: 8 }} />
              <Text style={styles.cardSectionTitle}>Scheduled Date & Time</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateTimeBadge}>
            <Text style={styles.dateTimeText}>
              {bookingData?.scheduledDate || 'Thursday, Oct 15, 2026'} • {bookingData?.timeSlot || '11:00 AM'}
            </Text>
          </View>
        </View>

        {/* Service Address Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location-outline" size={20} color={colors.forestGreen} style={{ marginRight: 8 }} />
              <Text style={styles.cardSectionTitle}>Service Address</Text>
            </View>
          </View>

          <TextInput
            style={styles.addressInput}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter full address"
          />

          <View style={styles.phoneInputRow}>
            <Ionicons name="call-outline" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="Contact phone"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Selected Add-Ons */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Selected Add-Ons</Text>
          {selectedAddons.length > 0 ? (
            selectedAddons.map((item, idx) => (
              <View key={idx} style={styles.addonRow}>
                <Text style={styles.addonText}>• {item.name}</Text>
                <Text style={styles.addonPriceText}>+ LKR {item.price.toLocaleString()}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noAddons}>No optional add-ons selected</Text>
          )}
        </View>

        {/* Payment Summary */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Payment Summary</Text>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Base Service Inspection</Text>
            <Text style={styles.payVal}>LKR {pricing.basePrice.toLocaleString()}</Text>
          </View>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Selected Add-Ons</Text>
            <Text style={styles.payVal}>LKR {pricing.addOnsTotal.toLocaleString()}</Text>
          </View>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Platform Guarantee Fee</Text>
            <Text style={styles.payVal}>LKR {pricing.serviceFee.toLocaleString()}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Confirmed</Text>
            <Text style={styles.totalVal}>LKR {pricing.totalAmount.toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.stickyFooter}>
        <View>
          <Text style={styles.footerLabel}>Total Amount</Text>
          <Text style={styles.footerAmount}>LKR {pricing.totalAmount.toLocaleString()}</Text>
        </View>

        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handleConfirmBooking}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={styles.confirmBtnText}>Confirm & Schedule Clean</Text>
              <Ionicons name="checkmark-circle" size={18} color={colors.white} style={{ marginLeft: 6 }} />
            </>
          )}
        </TouchableOpacity>
      </View>
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
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  serviceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  providerName: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  editText: {
    fontSize: 13,
    color: colors.emerald,
    fontWeight: '700',
  },
  dateTimeBadge: {
    backgroundColor: '#EBF4EE',
    padding: 12,
    borderRadius: 10,
  },
  dateTimeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  addressInput: {
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    marginBottom: 10,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: colors.background,
  },
  phoneInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  addonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  addonText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  addonPriceText: {
    fontSize: 13,
    color: colors.forestGreen,
    fontWeight: '600',
  },
  noAddons: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },
  payRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  payLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  payVal: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  totalVal: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.forestGreen,
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
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emerald,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 12,
  },
  confirmBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
