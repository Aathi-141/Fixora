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

const MONTH_DATA = [
  { name: 'October 2026', daysInMonth: 31, startDayOffset: 3 }, // 1st is Thursday
  { name: 'November 2026', daysInMonth: 30, startDayOffset: 6 }, // 1st is Sunday
  { name: 'December 2026', daysInMonth: 31, startDayOffset: 1 }, // 1st is Tuesday
];

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

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
  const category = provider?.category || 'Electrician';

  const defaultAddOns = DOMAIN_ADDONS[category] || DOMAIN_ADDONS['Electrician'];
  const todayDate = new Date().getDate();
  const [monthIdx, setMonthIdx] = useState(0);
  const [selectedDay, setSelectedDay] = useState(todayDate);
  const [period, setPeriod] = useState('Afternoon');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('04:30 PM');
  const [addOns, setAddOns] = useState(defaultAddOns);

  const basePrice = (provider?.hourlyRate || 700) * 3.5;
  const addOnsTotal = addOns
    .filter((a) => a.selected)
    .reduce((sum, item) => sum + item.price, 0);
  const totalPrice = Math.round(basePrice + addOnsTotal);

  const currentMonth = MONTH_DATA[monthIdx];
  const TODAY_DAY = todayDate; // Freeze all previous days dynamically

  const toggleAddOn = (id) => {
    setAddOns(
      addOns.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const getFullFormattedDate = () => {
    return `${selectedDay} ${currentMonth.name}`;
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

  // Build full month calendar cells
  const calendarCells = [];
  for (let i = 0; i < currentMonth.startDayOffset; i++) {
    calendarCells.push({ empty: true, key: `empty-${i}` });
  }
  for (let d = 1; d <= currentMonth.daysInMonth; d++) {
    calendarCells.push({ day: d, empty: false, key: `day-${d}` });
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerSubtitle}>Select Schedule</Text>
          <Text style={styles.headerTitle}>
            {provider?.user?.name || provider?.name || 'Selected Specialist'} • {category}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Calendar Surface Card - Single clean card, no nested boxes */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.calIconBox}>
                <Ionicons name="calendar" size={18} color={colors.forestGreen} />
              </View>
              <Text style={styles.monthTitle}>{currentMonth.name}</Text>
            </View>
            <View style={styles.monthNav}>
              <TouchableOpacity
                onPress={() => {
                  if (monthIdx > 0) {
                    setMonthIdx(monthIdx - 1);
                    setSelectedDay(2);
                  }
                }}
                style={[styles.chevronBtn, monthIdx === 0 && styles.chevronDisabled]}
                disabled={monthIdx === 0}
              >
                <Ionicons
                  name="chevron-back"
                  size={18}
                  color={monthIdx === 0 ? colors.textMuted : colors.forestGreen}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (monthIdx < MONTH_DATA.length - 1) {
                    setMonthIdx(monthIdx + 1);
                    setSelectedDay(1);
                  }
                }}
                style={[
                  styles.chevronBtn,
                  monthIdx === MONTH_DATA.length - 1 && styles.chevronDisabled,
                ]}
                disabled={monthIdx === MONTH_DATA.length - 1}
              >
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={monthIdx === MONTH_DATA.length - 1 ? colors.textMuted : colors.forestGreen}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Weekday headers: M T W T F S S */}
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

              // Freeze/disable all days before today in current month
              const isPast = monthIdx === 0 && cell.day < TODAY_DAY;
              const isSelected = cell.day === selectedDay;

              return (
                <TouchableOpacity
                  key={cell.key}
                  style={styles.dayCellTouch}
                  onPress={() => !isPast && setSelectedDay(cell.day)}
                  disabled={isPast}
                  activeOpacity={0.7}
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
              <Ionicons name="checkmark-circle" size={15} color={colors.emerald} style={{ marginRight: 6 }} />
              <Text style={styles.confirmedDateText}>Selected: {getFullFormattedDate()}</Text>
            </View>
            <View style={styles.legendWrap}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.forestGreen }]} />
                <Text style={styles.legendLabel}>Selected</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#E2E8F0' }]} />
                <Text style={styles.legendLabel}>Available</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section Heading directly on page (No nested box inside box) */}
        <View style={styles.sectionHeaderRow}>
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
                setSelectedTimeSlot(AFTERNOON_SLOTS[1].time); // 03:00 PM
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

        {/* Standalone Slot Cards matching reference design */}
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
                  size={22}
                  color={isSelected ? colors.forestGreen : colors.textMuted}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Domain-Specific Add-Ons Section */}
        <View style={[styles.sectionHeaderRow, { marginTop: 26 }]}>
          <View>
            <Text style={styles.sectionHeading}>Domain Add-Ons ({category})</Text>
            <Text style={styles.sectionSub}>Complement your service with expert additions</Text>
          </View>
        </View>

        <View style={styles.addOnCard}>
          {addOns.map((item, index) => (
            <View
              key={item.id}
              style={[styles.addOnRow, index === addOns.length - 1 && { borderBottomWidth: 0 }]}
            >
              <View style={styles.addOnIconBox}>
                <Ionicons name="sparkles" size={18} color={colors.forestGreen} />
              </View>
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <Text style={styles.addOnName}>{item.name}</Text>
                <Text style={styles.addOnPrice}>+Rs. {item.price.toLocaleString()}</Text>
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
      </ScrollView>

      {/* Solid Opaque Sticky Bottom Bar with High zIndex so no text overlaps */}
      <View style={styles.bottomBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.totalEstimatedLabel}>Total Estimated Price</Text>
          <Text style={styles.totalEstimatedAmount}>Rs. {totalPrice.toLocaleString()}</Text>
          <Text style={styles.breakdownText}>
            Base Rs. {Math.round(basePrice).toLocaleString()} + Add-ons Rs. {addOnsTotal.toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity style={styles.bookNowStickyBtn} onPress={handleProceed} activeOpacity={0.85}>
          <Text style={styles.bookNowStickyText}>Book Now</Text>
          <Ionicons name="arrow-forward" size={17} color={colors.white} style={{ marginLeft: 6 }} />
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
    paddingBottom: 110,
  },
  // Single Clean Calendar Surface Card
  calendarCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  monthNav: {
    flexDirection: 'row',
    gap: 8,
  },
  chevronBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronDisabled: {
    opacity: 0.35,
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  weekdayCell: {
    width: '14.28%',
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
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
    shadowColor: colors.forestGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  dayCircleDisabled: {
    opacity: 0.3,
  },
  dayNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dayNumberActive: {
    color: colors.white,
    fontWeight: '800',
  },
  dayNumberDisabled: {
    color: '#94A3B8',
  },
  selectedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.emerald,
    marginTop: 2,
  },
  calendarFooter: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmedDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4EE',
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
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  legendLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  // Section Headings sitting directly on the canvas (No nested box inside box)
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    backgroundColor: '#EBF4EE',
    borderRadius: 12,
    padding: 3,
  },
  periodBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  periodBtnActive: {
    backgroundColor: colors.forestGreen,
    shadowColor: colors.forestGreen,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  periodBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  periodBtnTextActive: {
    color: colors.white,
  },
  // Standalone slot cards
  slotsList: {
    gap: 10,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  slotCardActive: {
    backgroundColor: '#EBF4EE',
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
    fontWeight: '600',
  },
  // Add-ons Card
  addOnCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    borderBottomColor: '#F1F5F9',
  },
  addOnIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EBF4EE',
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
  // 100% Solid, Opaque White Bottom Bar - flex footer docked at bottom so content never collides
  bottomBar: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  totalEstimatedLabel: {
    fontSize: 10.5,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalEstimatedAmount: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  breakdownText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
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
