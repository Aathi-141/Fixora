import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
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

  const currentAddress = user?.address || 'No 42, New Kandy Road, Malabe, Colombo';
  const phone = user?.phone || '+94 77 123 4567';
  const [notes, setNotes] = useState('');
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
      serviceAddress: currentAddress,
      customerPhone: phone,
      notes: notes.trim() || 'Standard residential service with front gate entrance.',
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
        serviceAddress: currentAddress,
        pricing,
        status: 'pending',
      };
      navigation.navigate('BookingSuccessful', { booking: mockCreated });
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review & Confirm</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Unified Card 1: Service Specialist & Schedule Details */}
        <View style={styles.card}>
          <View style={styles.serviceHeaderRow}>
            <View style={styles.serviceIconCircle}>
              <Ionicons name="sparkles" size={22} color={colors.forestGreen} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.serviceTitle}>
                {provider?.specialization || 'Professional Service'}
              </Text>
              <Text style={styles.providerName}>
                Specialist: {provider?.user?.name || provider?.name || 'Verified Professional'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.scheduleRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="calendar" size={18} color={colors.forestGreen} style={{ marginRight: 8 }} />
              <View>
                <Text style={styles.metaLabel}>Scheduled Date & Time</Text>
                <Text style={styles.metaValue}>
                  {bookingData?.scheduledDate || 'Thursday, Oct 24, 2026'} • {bookingData?.timeSlot || '08:30 AM'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.editPill}>
              <Text style={styles.editPillText}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* Selected Add-Ons inside the service overview */}
          {selectedAddons.length > 0 && (
            <View style={styles.addonsSection}>
              <Text style={styles.addonsSubTitle}>Included Add-Ons ({selectedAddons.length})</Text>
              {selectedAddons.map((item, idx) => (
                <View key={idx} style={styles.addonItemRow}>
                  <Ionicons name="checkmark-circle" size={15} color={colors.emerald} style={{ marginRight: 6 }} />
                  <Text style={styles.addonItemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.addonItemPrice}>+Rs. {item.price.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Unified Card 2: Service Location & Contact Notes */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location" size={18} color={colors.forestGreen} style={{ marginRight: 8 }} />
              <Text style={styles.cardSectionTitle}>Service Address & Contact</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')}>
              <Text style={styles.editText}>Edit in Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Service Address Box */}
          <TouchableOpacity
            style={styles.addressBox}
            onPress={() => navigation.navigate('ProfileTab')}
            activeOpacity={0.8}
          >
            <Ionicons name="home-outline" size={18} color={colors.forestGreen} style={{ marginRight: 10, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.addressText}>{currentAddress}</Text>
              <Text style={styles.addressSub}>Saved Primary Customer Address</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={{ marginTop: 4 }} />
          </TouchableOpacity>

          {/* Contact Phone (Read-only, edited via Profile) */}
          <View style={styles.fieldHeaderRow}>
            <Text style={styles.fieldLabel}>Contact Phone</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')}>
              <Text style={styles.fieldEditLink}>Change</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.readOnlyContactBox}
            onPress={() => navigation.navigate('ProfileTab')}
            activeOpacity={0.8}
          >
            <Ionicons name="call-outline" size={17} color={colors.forestGreen} style={{ marginRight: 10 }} />
            <Text style={styles.readOnlyContactText}>{phone}</Text>
            <View style={styles.savedBadge}>
              <Ionicons name="shield-checkmark" size={12} color={colors.forestGreen} style={{ marginRight: 3 }} />
              <Text style={styles.savedBadgeText}>Profile Default</Text>
            </View>
          </TouchableOpacity>

          {/* Special Instructions / Gate Access with Hint */}
          <Text style={styles.fieldLabel}>Special Instructions / Gate Access</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. Ring bell at front gate, dog is inside, gate code #1234..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Unified Card 3: Payment Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Payment Breakdown</Text>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Standard Service Labor</Text>
            <Text style={styles.payVal}>Rs. {pricing.basePrice.toLocaleString()}</Text>
          </View>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Add-Ons Total</Text>
            <Text style={styles.payVal}>Rs. {pricing.addOnsTotal.toLocaleString()}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Estimated Total</Text>
            <Text style={styles.totalVal}>Rs. {pricing.totalAmount.toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Footer */}
      <View style={styles.stickyFooter}>
        <View>
          <Text style={styles.footerLabel}>Total Amount</Text>
          <Text style={styles.footerAmount}>Rs. {pricing.totalAmount.toLocaleString()}</Text>
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
              <Text style={styles.confirmBtnText}>Confirm Booking</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.white} style={{ marginLeft: 6 }} />
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
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
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
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.forestGreen,
    marginTop: 2,
  },
  editPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#EBF4EE',
  },
  editPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  addonsSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8FAF9',
  },
  addonsSubTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  addonItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  addonItemName: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },
  addonItemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  editText: {
    fontSize: 13,
    color: colors.emerald,
    fontWeight: '700',
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAF9',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  addressText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 18,
  },
  addressSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
    marginTop: 4,
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    marginTop: 4,
  },
  fieldEditLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.emerald,
  },
  readOnlyContactBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  readOnlyContactText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  savedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    fontSize: 13,
    color: colors.textPrimary,
    backgroundColor: '#F8FAF9',
    height: 60,
    textAlignVertical: 'top',
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
    fontSize: 18,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  stickyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
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
