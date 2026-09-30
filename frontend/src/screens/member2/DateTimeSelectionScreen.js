import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const TIME_SLOTS = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];

const INITIAL_ADDONS = [
  { id: '1', name: 'Oven Deep Clean', price: 1500, selected: false },
  { id: '2', name: 'Window Polish', price: 1200, selected: false },
  { id: '3', name: 'Fridge Sanitization', price: 1000, selected: true }, // Pre-selected matching Milestone 02 user test task!
];

export default function DateTimeSelectionScreen({ navigation, route }) {
  const { provider } = route.params || {};

  const [selectedDay, setSelectedDay] = useState(15);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('11:00 AM');
  const [addOns, setAddOns] = useState(INITIAL_ADDONS);

  const basePrice = (provider?.hourlyRate || 700) * 3.5; // ~2,500 LKR
  const addOnsTotal = addOns
    .filter((a) => a.selected)
    .reduce((sum, item) => sum + item.price, 0);
  const serviceFee = 250;
  const totalPrice = Math.round(basePrice + addOnsTotal + serviceFee);

  const toggleAddOn = (id) => {
    setAddOns(
      addOns.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleProceed = () => {
    navigation.navigate('BookingDetails', {
      provider,
      bookingData: {
        scheduledDate: `2026-10-${selectedDay < 10 ? '0' + selectedDay : selectedDay}`,
        timeSlot: selectedTimeSlot,
        addOns,
        pricing: {
          basePrice: Math.round(basePrice),
          addOnsTotal,
          serviceFee,
          totalAmount: totalPrice,
        },
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header Banner */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerSubtitle}>Select Booking Date & Time</Text>
          <Text style={styles.headerTitle}>
            {provider?.specialization || 'Deep Home Botanical Cleaning'}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Month Calendar Grid Card */}
        <View style={styles.card}>
          <View style={styles.calendarMonthHeader}>
            <Text style={styles.monthTitle}>October 2026</Text>
            <View style={styles.monthNav}>
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </View>

          {/* Weekday Labels */}
          <View style={styles.weekdayRow}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
              <Text key={idx} style={styles.weekdayLabel}>
                {day}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
              const isSelected = selectedDay === d;
              const isPast = d < 5;
              return (
                <TouchableOpacity
                  key={d}
                  disabled={isPast}
                  style={[
                    styles.dayTile,
                    isSelected && styles.dayTileSelected,
                    isPast && styles.dayTileDisabled,
                  ]}
                  onPress={() => setSelectedDay(d)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.dayTextSelected,
                      isPast && styles.dayTextDisabled,
                    ]}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Time Slots */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Available Slots</Text>
          <View style={styles.timeSlotRow}>
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedTimeSlot === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[styles.slotChip, isSelected && styles.slotChipSelected]}
                  onPress={() => setSelectedTimeSlot(slot)}
                >
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={isSelected ? colors.white : colors.forestGreen}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.slotChipText, isSelected && styles.slotChipTextSelected]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Popular Add-Ons */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Popular Add-Ons</Text>
          <Text style={styles.sectionSub}>Recommended extras with instant price calculation</Text>

          {addOns.map((item) => (
            <View key={item.id} style={styles.addonItem}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.addonName}>{item.name}</Text>
                <Text style={styles.addonPrice}>+ LKR {item.price.toLocaleString()}</Text>
              </View>
              <Switch
                value={item.selected}
                onValueChange={() => toggleAddOn(item.id)}
                trackColor={{ false: '#D1D5DB', true: colors.sageGreen }}
                thumbColor={item.selected ? colors.forestGreen : '#FFF'}
              />
            </View>
          ))}
        </View>

        {/* Trust Banner */}
        <View style={styles.trustBanner}>
          <Ionicons name="shield-checkmark" size={20} color={colors.forestGreen} style={{ marginRight: 10 }} />
          <Text style={styles.trustText}>
            Transparent Pricing • Free Reschedule up to 24h before appointment.
          </Text>
        </View>
      </ScrollView>

      {/* Fixed Sticky Bottom Price Bar */}
      <View style={styles.stickyFooter}>
        <View>
          <Text style={styles.footerTotalLabel}>Total Estimated Price</Text>
          <Text style={styles.footerPrice}>LKR {totalPrice.toLocaleString()}</Text>
        </View>

        <TouchableOpacity style={styles.bookNowBtn} onPress={handleProceed} activeOpacity={0.85}>
          <Text style={styles.bookNowBtnText}>Book Now</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} style={{ marginLeft: 6 }} />
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
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#D1E7DD',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginTop: 2,
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
  calendarMonthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  monthNav: {
    flexDirection: 'row',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekdayLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    width: 38,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 6,
  },
  dayTile: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayTileSelected: {
    backgroundColor: colors.emerald,
  },
  dayTileDisabled: {
    opacity: 0.25,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dayTextSelected: {
    color: colors.white,
    fontWeight: '800',
  },
  dayTextDisabled: {
    color: colors.textMuted,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.forestGreen,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  timeSlotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  slotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
  },
  slotChipSelected: {
    backgroundColor: colors.forestGreen,
    borderColor: colors.forestGreen,
  },
  slotChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  slotChipTextSelected: {
    color: colors.white,
  },
  addonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  addonName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addonPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.forestGreen,
    marginTop: 2,
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4EE',
    padding: 12,
    borderRadius: 12,
  },
  trustText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
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
  footerTotalLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  footerPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  bookNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emerald,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 12,
  },
  bookNowBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
