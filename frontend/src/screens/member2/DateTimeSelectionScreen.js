import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// Baseline active date matching the reference screenshot (5 October 2026)
const BASE_YEAR = 2026;
const BASE_MONTH = 9; // 0-indexed (9 = October)
const BASE_DAY = 5;

const MORNING_SLOTS = [
  { time: '08:30 AM', badge: 'Most Popular', label: 'Early Morning Slot' },
  { time: '10:00 AM', label: 'Mid Morning Slot' },
  { time: '11:30 AM', label: 'Late Morning Slot' },
];

const AFTERNOON_SLOTS = [
  { time: '01:30 PM', label: 'Early Afternoon Slot' },
  { time: '03:00 PM', badge: 'Recommended', label: 'Mid Afternoon Slot' },
  { time: '04:30 PM', label: 'Late Afternoon Slot' },
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
  const category = provider?.category || 'Plumber';

  const defaultAddOns = DOMAIN_ADDONS[category] || DOMAIN_ADDONS['Plumber'];

  // Real Dynamic Calendar Navigation
  const [viewYear, setViewYear] = useState(BASE_YEAR);
  const [viewMonth, setViewMonth] = useState(BASE_MONTH);
  const [selectedDate, setSelectedDate] = useState({ year: BASE_YEAR, month: BASE_MONTH, day: BASE_DAY });

  const [period, setPeriod] = useState('Afternoon');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('04:30 PM');
  const [addOns, setAddOns] = useState(defaultAddOns);

  const basePrice = Math.round((provider?.hourlyRate || 650) * 3.5);
  const addOnsTotal = addOns
    .filter((a) => a.selected)
    .reduce((sum, item) => sum + item.price, 0);
  const totalPrice = Math.round(basePrice + addOnsTotal);

  // Real Calendar Navigation Handlers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Compute days in currently viewed month and Monday-based offset
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sun, 1 is Mon...
  const startDayOffset = firstDay === 0 ? 6 : firstDay - 1; // Mon = 0, Sun = 6

  const calendarCells = [];
  for (let i = 0; i < startDayOffset; i++) {
    calendarCells.push({ empty: true, key: `empty-${i}` });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({ day: d, empty: false, key: `day-${d}` });
  }

  const toggleAddOn = (id) => {
    setAddOns(
      addOns.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const getFullFormattedDate = () => {
    return `${selectedDate.day} ${MONTH_NAMES[selectedDate.month]} ${selectedDate.year}`;
  };

  const handleProceed = () => {
    navigation.navigate('BookingDetails', {
      provider,
      bookingData: {
        scheduledDate: getFullFormattedDate(),
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
    <SafeAreaView edges={['top']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 1. Top Header with curved bottom corners matching reference */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerSubtitle}>Select Schedule</Text>
          <Text style={styles.headerTitle}>
            {provider?.user?.name || provider?.name || 'Sunil Perera'} • {category}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.headerSettingsBtn}
          onPress={() => navigation.navigate('Filters')}
          activeOpacity={0.8}
        >
          <Ionicons name="settings-sharp" size={18} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
      >
        {/* 2. Calendar Card - Clean White Surface */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.calIconBox}>
                <Ionicons name="calendar" size={18} color={colors.forestGreen} />
              </View>
              <Text style={styles.monthTitle}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </Text>
            </View>

            {/* Previous & Next Month Navigation Buttons */}
            <View style={styles.monthNav}>
              <TouchableOpacity
                onPress={handlePrevMonth}
                style={styles.chevronBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={18} color={colors.forestGreen} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNextMonth}
                style={styles.chevronBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-forward" size={18} color={colors.forestGreen} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Weekdays Row: M T W T F S S */}
          <View style={styles.weekdaysRow}>
            {WEEKDAYS.map((wd, i) => (
              <View key={i} style={styles.weekdayCell}>
                <Text style={styles.weekdayText}>{wd}</Text>
              </View>
            ))}
          </View>

          {/* 7-column Calendar Grid with Past Days Frozen */}
          <View style={styles.gridContainer}>
            {calendarCells.map((cell) => {
              if (cell.empty) {
                return <View key={cell.key} style={styles.dayCellEmpty} />;
              }

              // Freeze all days prior to October 5, 2026
              const isPast =
                viewYear < BASE_YEAR ||
                (viewYear === BASE_YEAR && viewMonth < BASE_MONTH) ||
                (viewYear === BASE_YEAR && viewMonth === BASE_MONTH && cell.day < BASE_DAY);

              const isSelected =
                selectedDate.year === viewYear &&
                selectedDate.month === viewMonth &&
                selectedDate.day === cell.day;

              return (
                <TouchableOpacity
                  key={cell.key}
                  style={styles.dayCellTouch}
                  onPress={() => {
                    if (!isPast) {
                      setSelectedDate({ year: viewYear, month: viewMonth, day: cell.day });
                    }
                  }}
                  disabled={isPast}
                  activeOpacity={0.75}
                >
                  <View
                    style={[
                      styles.dayCircle,
                      isSelected && styles.dayCircleActive,
                      isPast && styles.dayCircleDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayNumberText,
                        isSelected && styles.dayNumberActive,
                        isPast && styles.dayNumberDisabled,
                      ]}
                    >
                      {cell.day}
                    </Text>
                  </View>
                  {isSelected && <View style={styles.selectedDot} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Date Confirmation Bar & Legend */}
          <View style={styles.calendarFooter}>
            <View style={styles.confirmedDateBadge}>
              <Ionicons name="checkmark-circle" size={15} color={colors.forestGreen} style={{ marginRight: 6 }} />
              <Text style={styles.confirmedDateText}>Selected: {getFullFormattedDate()}</Text>
            </View>
            <View style={styles.legendWrap}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.forestGreen }]} />
                <Text style={styles.legendLabel}>Selected</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#CBD5E1' }]} />
                <Text style={styles.legendLabel}>Available</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3. Available Slots Section */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Available Slots</Text>
            <Text style={styles.sectionSubtitle}>Duration: ~3.5 hours</Text>
          </View>

          {/* Morning vs Afternoon Segmented Pill */}
          <View style={styles.periodPillContainer}>
            <TouchableOpacity
              style={[styles.periodBtn, period === 'Morning' && styles.periodBtnActive]}
              onPress={() => {
                setPeriod('Morning');
                setSelectedTimeSlot(MORNING_SLOTS[0].time);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.periodBtnText, period === 'Morning' && styles.periodBtnTextActive]}>
                Morning
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.periodBtn, period === 'Afternoon' && styles.periodBtnActive]}
              onPress={() => {
                setPeriod('Afternoon');
                setSelectedTimeSlot(AFTERNOON_SLOTS[2].time); // 04:30 PM
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.periodBtnText, period === 'Afternoon' && styles.periodBtnTextActive]}>
                Afternoon
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Single Unified White Container for Slots matching reference (No grey cards) */}
        <View style={styles.slotsCardContainer}>
          {currentSlots.map((slot, index) => {
            const isSelected = selectedTimeSlot === slot.time;
            return (
              <TouchableOpacity
                key={slot.time}
                style={[
                  styles.slotRow,
                  isSelected && styles.slotRowActive,
                  index < currentSlots.length - 1 && !isSelected && styles.slotRowDivider,
                ]}
                onPress={() => setSelectedTimeSlot(slot.time)}
                activeOpacity={0.85}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.slotTimeText, isSelected && styles.slotTimeTextActive]}>
                      {slot.time}
                    </Text>
                    {slot.badge && (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedBadgeText}>{slot.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.slotLabelText, isSelected && styles.slotLabelTextActive]}>
                    {slot.label}
                  </Text>
                </View>

                <Ionicons
                  name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={isSelected ? colors.forestGreen : '#CBD5E1'}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 4. Domain Add-Ons Section */}
        <View style={[styles.sectionHeaderRow, { marginTop: 10 }]}>
          <View>
            <Text style={styles.sectionTitle}>Domain Add-Ons ({category})</Text>
            <Text style={styles.sectionSubtitle}>Complement your service with expert additions</Text>
          </View>
        </View>

        <View style={styles.addOnCard}>
          {addOns.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.addOnRow,
                index === addOns.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={styles.addOnIconBox}>
                <Ionicons name="sparkles" size={17} color={colors.forestGreen} />
              </View>
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <Text style={styles.addOnName}>{item.name}</Text>
                <Text style={styles.addOnPrice}>+Rs. {item.price.toLocaleString()}</Text>
              </View>
              <Switch
                value={item.selected}
                onValueChange={() => toggleAddOn(item.id)}
                trackColor={{ false: '#D1D5DB', true: colors.forestGreen }}
                thumbColor={colors.white}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 5. Total Estimated Price Floating Card Docked Above Tab Bar */}
      <View style={styles.totalPriceCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.totalPriceLabel}>TOTAL ESTIMATED PRICE</Text>
          <Text style={styles.totalPriceAmount}>Rs. {totalPrice.toLocaleString()}</Text>
          <Text style={styles.totalPriceBreakdown}>
            Base Rs. {Math.round(basePrice).toLocaleString()} + Add-ons Rs. {addOnsTotal.toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity style={styles.bookNowBtn} onPress={handleProceed} activeOpacity={0.85}>
          <Text style={styles.bookNowBtnText}>Book Now</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.white} />
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

  // 1. Top Header
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#163820',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 14 : 10,
    paddingBottom: 16,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#D1E7DD',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.white,
    marginTop: 2,
  },
  headerSettingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Scroll Content Body
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },

  // 2. Calendar Card
  calendarCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EDF2EE',
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EBF5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  monthNav: {
    flexDirection: 'row',
    gap: 8,
  },
  chevronBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F7F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
  },
  weekdayCell: {
    width: '14.28%',
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellEmpty: {
    width: '14.28%',
    height: 44,
  },
  dayCellTouch: {
    width: '14.28%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleActive: {
    backgroundColor: colors.forestGreen,
  },
  dayCircleDisabled: {
    opacity: 0.35,
  },
  dayNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  dayNumberActive: {
    color: colors.white,
    fontWeight: '800',
  },
  dayNumberDisabled: {
    color: '#9CA3AF',
  },
  selectedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.forestGreen,
    marginTop: 2,
  },
  calendarFooter: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmedDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5EE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  confirmedDateText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  legendWrap: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 5,
  },
  legendLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },

  // Segmented Pill
  periodPillContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F7F4',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: '#EDF2EE',
  },
  periodBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },
  periodBtnActive: {
    backgroundColor: colors.forestGreen,
  },
  periodBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  periodBtnTextActive: {
    color: colors.white,
    fontWeight: '700',
  },

  // 3. Slots List Container (Single Clean White Card matching screenshot)
  slotsCardContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EDF2EE',
    padding: 6,
    marginBottom: 20,
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 14,
  },
  slotRowActive: {
    backgroundColor: '#F4FAF6',
    borderWidth: 1.5,
    borderColor: colors.forestGreen,
  },
  slotRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAF9',
  },
  slotTimeText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  slotTimeTextActive: {
    color: colors.forestGreen,
  },
  recommendedBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  recommendedBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#065F46',
  },
  slotLabelText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  slotLabelTextActive: {
    color: colors.forestGreen,
    fontWeight: '600',
  },

  // 4. Add-ons Card
  addOnCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EDF2EE',
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  addOnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
  },
  addOnPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.forestGreen,
    marginTop: 2,
  },

  // 5. Total Estimated Price Floating Docked Card
  totalPriceCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EDF2EE',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  totalPriceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  totalPriceAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.forestGreen,
    marginVertical: 1,
  },
  totalPriceBreakdown: {
    fontSize: 10.5,
    color: '#6B7280',
    fontWeight: '500',
  },
  bookNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.forestGreen,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 12,
    shadowColor: colors.forestGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  bookNowBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    marginRight: 6,
  },
});
