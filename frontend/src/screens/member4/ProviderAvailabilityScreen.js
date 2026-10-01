import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { updateProviderAvailability } from '../../services/api';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ProviderAvailabilityScreen({ navigation }) {
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeDays, setActiveDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const [radius, setRadius] = useState(15);
  const [emergencyCallouts, setEmergencyCallouts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleDay = (day) => {
    if (activeDays.includes(day)) {
      setActiveDays(activeDays.filter((d) => d !== day));
    } else {
      setActiveDays([...activeDays, day]);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    await updateProviderAvailability({
      isAvailable,
      weeklySchedule: activeDays,
      serviceRadiusKm: radius,
    });
    setIsSubmitting(false);

    Alert.alert('Settings Updated', 'Your work availability and operating schedule have been saved.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Work Management & Profile</Text>
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Provider Profile Summary */}
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View>
              <Text style={styles.providerName}>Ramesh Mendis</Text>
              <Text style={styles.tradeName}>Senior Electrician & Specialist</Text>
            </View>
            <View style={[styles.statusPill, isAvailable ? styles.pillOnline : styles.pillOffline]}>
              <View style={[styles.dot, isAvailable ? styles.dotOnline : styles.dotOffline]} />
              <Text style={[styles.statusText, isAvailable ? styles.textOnline : styles.textOffline]}>
                {isAvailable ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>

          {/* 3 Metric Stats */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>99.4%</Text>
              <Text style={styles.metricLabel}>On-Time</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>840+</Text>
              <Text style={styles.metricLabel}>Jobs Done</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>15 yrs</Text>
              <Text style={styles.metricLabel}>Experience</Text>
            </View>
          </View>
        </View>

        {/* Available for Jobs Toggle */}
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.toggleTitle}>Available for Jobs</Text>
              <Text style={styles.toggleSub}>
                When toggled on, you receive real-time customer service alerts.
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: '#D1D5DB', true: colors.sageGreen }}
              thumbColor={isAvailable ? colors.forestGreen : '#FFF'}
            />
          </View>
        </View>

        {/* Weekly Schedule Days */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Weekly Working Days</Text>
          <Text style={styles.sectionSub}>Select days you are available for bookings</Text>
          <View style={styles.daysRow}>
            {DAYS.map((d) => {
              const isSelected = activeDays.includes(d);
              return (
                <TouchableOpacity
                  key={d}
                  style={[styles.dayChip, isSelected && styles.dayChipActive]}
                  onPress={() => toggleDay(d)}
                >
                  <Text style={[styles.dayChipText, isSelected && styles.dayChipTextActive]}>
                    {d.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Standard Working Hours */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Operating Hours & Radius</Text>

          <View style={styles.hoursBox}>
            <Ionicons name="time-outline" size={20} color={colors.forestGreen} style={{ marginRight: 8 }} />
            <Text style={styles.hoursText}>08:00 AM — 06:00 PM (Daily)</Text>
          </View>

          <Text style={[styles.subHeading, { marginTop: 16 }]}>Service Operating Radius</Text>
          <View style={styles.radiusRow}>
            {[10, 15, 25, 40].map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.radiusBtn, radius === r && styles.radiusBtnActive]}
                onPress={() => setRadius(r)}
              >
                <Text style={[styles.radiusBtnText, radius === r && styles.radiusBtnTextActive]}>
                  {r} km
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.emergencyRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.emergencyTitle}>Emergency Callouts</Text>
              <Text style={styles.emergencySub}>Receive urgent night & weekend requests</Text>
            </View>
            <Switch
              value={emergencyCallouts}
              onValueChange={setEmergencyCallouts}
              trackColor={{ false: '#D1D5DB', true: colors.sageGreen }}
              thumbColor={emergencyCallouts ? colors.forestGreen : '#FFF'}
            />
          </View>
        </View>

        {/* Profile & Credentials */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Profile & Credentials</Text>
          <View style={styles.credentialItem}>
            <Ionicons name="ribbon-outline" size={20} color={colors.forestGreen} style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.credTitle}>Govt. Trade License</Text>
              <Text style={styles.credCode}>LK-ELEC-4402 (Active & Verified)</Text>
            </View>
            <View style={styles.verifiedTag}>
              <Text style={styles.verifiedTagText}>VERIFIED</Text>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
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
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  editBtn: {
    paddingHorizontal: 8,
  },
  editBtnText: {
    color: '#A7F3D0',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  profileTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  providerName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  tradeName: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillOnline: {
    backgroundColor: '#EBF4EE',
  },
  pillOffline: {
    backgroundColor: '#F3F4F6',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotOnline: {
    backgroundColor: '#10B981',
  },
  dotOffline: {
    backgroundColor: '#9CA3AF',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textOnline: {
    color: colors.forestGreen,
  },
  textOffline: {
    color: colors.textSecondary,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.cardBorder,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  toggleSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.forestGreen,
    marginBottom: 2,
  },
  sectionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayChip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayChipActive: {
    backgroundColor: colors.forestGreen,
    borderColor: colors.forestGreen,
  },
  dayChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  dayChipTextActive: {
    color: colors.white,
  },
  hoursBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 10,
  },
  hoursText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subHeading: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  radiusRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  radiusBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  radiusBtnActive: {
    backgroundColor: colors.emerald,
    borderColor: colors.emerald,
  },
  radiusBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  radiusBtnTextActive: {
    color: colors.white,
  },
  emergencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 12,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emergencySub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  credentialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 10,
  },
  credTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  credCode: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  verifiedTag: {
    backgroundColor: '#EBF4EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  saveBtn: {
    backgroundColor: colors.emerald,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
