import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const MONTHS = ['October 2026', 'November 2026', 'December 2026'];

// Generate 14 selectable consecutive days
const GENERATED_DAYS = [
  { day: 21, weekday: 'M', month: 'Oct', full: 'Monday, Oct 21, 2026' },
  { day: 22, weekday: 'T', month: 'Oct', full: 'Tuesday, Oct 22, 2026' },
  { day: 23, weekday: 'W', month: 'Oct', full: 'Wednesday, Oct 23, 2026' },
  { day: 24, weekday: 'T', month: 'Oct', full: 'Thursday, Oct 24, 2026' },
  { day: 25, weekday: 'F', month: 'Oct', full: 'Friday, Oct 25, 2026' },
  { day: 26, weekday: 'S', month: 'Oct', full: 'Saturday, Oct 26, 2026' },
  { day: 27, weekday: 'S', month: 'Oct', full: 'Sunday, Oct 27, 2026' },
  { day: 28, weekday: 'M', month: 'Oct', full: 'Monday, Oct 28, 2026' },
  { day: 29, weekday: 'T', month: 'Oct', full: 'Tuesday, Oct 29, 2026' },
  { day: 30, weekday: 'W', month: 'Oct', full: 'Wednesday, Oct 30, 2026' },
  { day: 31, weekday: 'T', month: 'Oct', full: 'Thursday, Oct 31, 2026' },
  { day: 1, weekday: 'F', month: 'Nov', full: 'Friday, Nov 01, 2026' },
  { day: 2, weekday: 'S', month: 'Nov', full: 'Saturday, Nov 02, 2026' },
  { day: 3, weekday: 'S', month: 'Nov', full: 'Sunday, Nov 03, 2026' },
  { day: 4, weekday: 'M', month: 'Nov', full: 'Monday, Nov 04, 2026' },
  { day: 5, weekday: 'T', month: 'Nov', full: 'Tuesday, Nov 05, 2026' },
];

const MORNING_SLOTS = [
  { time: '08:30 AM', badge: 'Most Popular', label: 'Early Bird' },
  { time: '10:00 AM', label: 'Mid Morning' },
  { time: '11:30 AM', label: 'Late Morning' },
];

const AFTERNOON_SLOTS = [
  { time: '01:30 PM', label: 'Early Afternoon' },
  { time: '03:00 PM', badge: 'Recommended', label: 'Mid Afternoon' },
  { time: '04:30 PM', label: 'Late Afternoon' },
  { time: '06:00 PM', label: 'Evening Slot' },
];

const DOMAIN_ADDONS = {
  Electrician: [
    { id: 'e1', name: 'Power Switch & Socket Replacement', price: 850, selected: true },
    { id: 'e2', name: 'Ceiling Fan / Fixture Mounting', price: 1200, selected: false },
    { id: 'e3', name: 'Safety MCB / Trip Switch Inspection', price: 1500, selected: false },
    { id: 'e4', name: 'Surge Protection Wiring Check', price: 1100, selected: false },
  ],
  Plumber: [
    { id: 'p1', name: 'Sink Tap & Faucet Replacement', price: 900, selected: true },
    { id: 'p2', name: 'High-Pressure Drain Unclogging', price: 1400, selected: false },
    { id: 'p3', name: 'Water Tank & Valve Pressure Check', price: 1800, selected: false },
    { id: 'p4', name: 'Pipe Leak Sealant & Teflon Joint Overhaul', price: 650, selected: false },
  ],
  Cleaner: [
    { id: 'c1', name: 'Oven Deep Clean & Degrease', price: 1750, selected: true },
    { id: 'c2', name: 'Window Polish & Glass Treatment', price: 2250, selected: false },
    { id: 'c3', name: 'Fridge & Freezer Sanitization', price: 1100, selected: false },
    { id: 'c4', name: 'Bathroom Tile Machine Scrub', price: 1400, selected: false },
  ],
  'AC Technician': [
    { id: 'ac1', name: 'Eco-Freon Gas Top-Up (R32/R410A)', price: 3500, selected: false },
    { id: 'ac2', name: 'Blower & Evaporator Coil Foam Wash', price: 1800, selected: true },
    { id: 'ac3', name: 'Drain Pipe Flush & Anti-Bacterial Deodorize', price: 1000, selected: false },
  ],
  Painter: [
    { id: 'pt1', name: 'Anti-Fungal Undercoat Primer (1 Room)', price: 2000, selected: false },
    { id: 'pt2', name: 'Wall Crack Plastering & Putty Prep', price: 1500, selected: true },
    { id: 'pt3', name: 'Waterproof Silicon Seal Coat', price: 2500, selected: false },
  ],
  Carpenter: [
    { id: 'cp1', name: 'Mortise Door Lock & Deadbolt Fitting', price: 1500, selected: true },
    { id: 'cp2', name: 'Hinge Alignment & Silent Dampers', price: 800, selected: false },
    { id: 'cp3', name: 'Teak Wood Sanding & Lacquer Coat', price: 2000, selected: false },
  ],
};

export default function DateTimeSelectionScreen({ navigation, route }) {
  const { provider } = route.params || {};
  const category = provider?.category || 'Electrician';

  const defaultAddOns = DOMAIN_ADDONS[category] || DOMAIN_ADDONS['Electrician'];
  const [selectedDayObj, setSelectedDayObj] = useState(GENERATED_DAYS[3]); // 24 Oct
  const [monthIdx, setMonthIdx] = useState(0);
  const [period, setPeriod] = useState('Morning'); // 'Morning' | 'Afternoon'
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('08:30 AM');
  const [addOns, setAddOns] = useState(defaultAddOns);

  const basePrice = (provider?.hourlyRate || 700) * 3.5;
  const addOnsTotal = addOns
    .filter((a) => a.selected)
    .reduce((sum, item) => sum + item.price, 0);
  const totalPrice = Math.round(basePrice + addOnsTotal);

  const toggleAddOn = (id) => {
    setAddOns(
      addOns.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleProceed = () => {
    navigation.navigate('BookingDetails', {
      provider,
      bookingData: {
        scheduledDate: selectedDayObj.full,
        timeSlot: selectedTimeSlot,
        addOns,
        pricing: {
          basePrice: Math.round(basePrice),
          addOnsTotal,
          totalAmount: totalPrice,
        },
      },
    });
  };

  const currentSlots = period === 'Morning' ? MORNING_SLOTS : AFTERNOON_SLOTS;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerSubtitle}>Select Booking Slot</Text>
          <Text style={styles.headerTitle}>
            {provider?.user?.name || provider?.name || 'Selected Specialist'} • {category}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Month Calendar Card */}
        <View style={styles.card}>
          <View style={styles.calendarMonthHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="calendar-outline" size={20} color={colors.forestGreen} style={{ marginRight: 8 }} />
              <Text style={styles.monthTitle}>{MONTHS[monthIdx]}</Text>
            </View>
            <View style={styles.monthNav}>
              <TouchableOpacity
                onPress={() => setMonthIdx(Math.max(0, monthIdx - 1))}
                style={styles.chevronBtn}
              >
                <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setMonthIdx(Math.min(MONTHS.length - 1, monthIdx + 1))}
                style={styles.chevronBtn}
              >
                <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.selectedDateBanner}>Selected: {selectedDayObj.full}</Text>

          {/* Horizontal Slideable Dates Strip */}
          <Text style={styles.sliderInstruction}>Swipe dates to choose booking day:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateSliderRow}
          >
            {GENERATED_DAYS.map((item, idx) => {
              const isSelected =
                item.day === selectedDayObj.day && item.month === selectedDayObj.month;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.dateSlidePill, isSelected && styles.dateSlidePillActive]}
                  onPress={() => setSelectedDayObj(item)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayLetter, isSelected && styles.textWhite]}>
                    {item.weekday}
                  </Text>
                  <Text style={[styles.dayNumber, isSelected && styles.textWhite]}>
                    {item.day}
                  </Text>
                  <Text style={[styles.dayMonth, isSelected && styles.dayMonthActive]}>
                    {item.month}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.forestGreen }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Selected</Text>
            </View>
          </View>
        </View>

        {/* Available Slots Section matching Reference Figma */}
        <View style={styles.card}>
          <View style={styles.slotsHeaderRow}>
            <View>
              <Text style={styles.sectionHeading}>Available Slots</Text>
              <Text style={styles.sectionSub}>Duration: ~3.5 hours</Text>
            </View>

            {/* Morning vs Afternoon Segmented Pill */}
            <View style={styles.periodPillContainer}>
              <TouchableOpacity
                style={[styles.periodBtn, period === 'Morning' && styles.periodBtnActive]}
                onPress={() => {
                  setPeriod('Morning');
                  setSelectedTimeSlot(MORNING_SLOTS[0].time);
                }}
              >
                <Text
                  style={[
                    styles.periodBtnText,
                    period === 'Morning' && styles.periodBtnTextActive,
                  ]}
                >
                  Morning
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.periodBtn, period === 'Afternoon' && styles.periodBtnActive]}
                onPress={() => {
                  setPeriod('Afternoon');
                  setSelectedTimeSlot(AFTERNOON_SLOTS[0].time);
                }}
              >
                <Text
                  style={[
                    styles.periodBtnText,
                    period === 'Afternoon' && styles.periodBtnTextActive,
                  ]}
                >
                  Afternoon
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Time Slot Cards */}
          <View style={styles.slotsList}>
            {currentSlots.map((slot) => {
              const isSelected = selectedTimeSlot === slot.time;
              return (
                <TouchableOpacity
                  key={slot.time}
                  style={[styles.slotCard, isSelected && styles.slotCardActive]}
                  onPress={() => setSelectedTimeSlot(slot.time)}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.slotTime, isSelected && styles.slotTimeActive]}>
                        {slot.time}
                      </Text>
                      {slot.badge && (
                        <View style={styles.slotBadge}>
                          <Text style={styles.slotBadgeText}>{slot.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.slotLabel, isSelected && styles.slotLabelActive]}>
                      {slot.label}
                    </Text>
                  </View>
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={isSelected ? colors.forestGreen : colors.textMuted}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Popular Add-Ons with Live Pricing */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Popular Add-Ons</Text>
          <Text style={styles.sectionSub}>Complement your service with expert care</Text>

          <View style={styles.addOnList}>
            {addOns.map((item) => (
              <View key={item.id} style={styles.addOnRow}>
                <View style={styles.addOnIconBox}>
                  <Ionicons name="sparkles" size={18} color={colors.forestGreen} />
                </View>
                <View style={{ flex: 1, marginHorizontal: 12 }}>
                  <Text style={styles.addOnName}>{item.name}</Text>
                  <Text style={styles.addOnPrice}>+LKR {item.price.toLocaleString()}</Text>
                </View>
                <Switch
                  value={item.selected}
                  onValueChange={() => toggleAddOn(item.id)}
                  trackColor={{ false: '#D1D5DB', true: colors.sageGreen }}
                  thumbColor={item.selected ? colors.forestGreen : '#F3F4F6'}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Summary Bar matching Figma Reference */}
      <View style={styles.bottomBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.totalEstimatedLabel}>Total Estimated</Text>
          <Text style={styles.totalEstimatedAmount}>LKR {totalPrice.toLocaleString()}</Text>
          <Text style={styles.breakdownText}>
            Base {Math.round(basePrice).toLocaleString()} + Add-ons {addOnsTotal.toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity style={styles.bookNowStickyBtn} onPress={handleProceed} activeOpacity={0.85}>
          <Text style={styles.bookNowStickyText}>Book Now</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} style={{ marginLeft: 6 }} />
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
    fontSize: 15,
    fontWeight: '800',
    color: colors.white,
    marginTop: 1,
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 170, // Leave ample room for the sticky bottom calculation bar
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  calendarMonthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  monthNav: {
    flexDirection: 'row',
    gap: 8,
  },
  chevronBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDateBanner: {
    fontSize: 13,
    color: colors.forestGreen,
    fontWeight: '700',
    marginBottom: 12,
  },
  sliderInstruction: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  dateSliderRow: {
    paddingVertical: 6,
    gap: 10,
  },
  dateSlidePill: {
    width: 58,
    height: 74,
    borderRadius: 16,
    backgroundColor: '#F8FAF9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateSlidePillActive: {
    backgroundColor: colors.forestGreen,
    borderColor: colors.forestGreen,
  },
  dayLetter: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginVertical: 2,
  },
  dayMonth: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  dayMonthActive: {
    color: '#D1E7DD',
  },
  textWhite: {
    color: colors.white,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  slotsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  sectionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  periodPillContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
  },
  periodBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  periodBtnActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  periodBtnTextActive: {
    color: colors.forestGreen,
    fontWeight: '800',
  },
  slotsList: {
    gap: 10,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  slotCardActive: {
    backgroundColor: '#EBF5EE',
    borderColor: colors.forestGreen,
  },
  slotTime: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  slotTimeActive: {
    color: colors.forestGreen,
  },
  slotBadge: {
    backgroundColor: colors.forestGreen,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  slotBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  slotLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  slotLabelActive: {
    color: colors.forestGreen,
  },
  addOnList: {
    marginTop: 10,
  },
  addOnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  addOnIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EBF5EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addOnName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addOnPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.forestGreen,
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  totalEstimatedLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  totalEstimatedAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  breakdownText: {
    fontSize: 11,
    color: colors.forestGreen,
    fontWeight: '500',
  },
  bookNowStickyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emerald,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: colors.emerald,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  bookNowStickyText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
});
