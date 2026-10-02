import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const SERVICE_TYPES = ['Electrician', 'Plumber', 'Cleaner', 'AC Technician', 'Painter', 'Carpenter'];
const RATINGS = ['Any', '3.0+', '4.0+', '4.5+', '5.0'];
const RADII = [5, 10, 15, 25, 50];
const PRICE_PRESETS = ['600', '800', '1000', '1500', '2500'];

export default function FiltersScreen({ navigation, route }) {
  const currentFilters = route.params?.currentFilters || {};

  const [location, setLocation] = useState(currentFilters.city || 'Colombo, Western Province');
  const [selectedRadius, setSelectedRadius] = useState(currentFilters.radius || 15);
  const [selectedTypes, setSelectedTypes] = useState(
    currentFilters.category ? [currentFilters.category] : ['Electrician']
  );
  const [minRating, setMinRating] = useState(currentFilters.minRating || '4.0+');
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice ? String(currentFilters.maxPrice) : '1500');

  const toggleType = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleClear = () => {
    setLocation('');
    setSelectedRadius(15);
    setSelectedTypes([]);
    setMinRating('Any');
    setMaxPrice('');
  };

  const handleApply = () => {
    navigation.navigate('Home', {
      filters: {
        applied: true,
        city: location,
        radius: selectedRadius,
        category: selectedTypes[0] || 'All',
        minRating: minRating === 'Any' ? null : minRating.replace('+', ''),
        maxPrice: maxPrice ? Number(maxPrice) : null,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Filters</Text>
        <TouchableOpacity onPress={handleClear}>
          <Text style={styles.clearBtnText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Applied Filter Count */}
          <View style={styles.appliedBadge}>
            <Ionicons name="funnel" size={14} color={colors.forestGreen} style={{ marginRight: 6 }} />
            <Text style={styles.appliedText}>Refine Specialist Search</Text>
          </View>

          {/* Location Section */}
          <Text style={styles.filterGroupTitle}>Location</Text>
          <View style={styles.locationBox}>
            <Ionicons name="location" size={18} color={colors.forestGreen} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.locationInput}
              value={location}
              onChangeText={setLocation}
              placeholder="Enter city or district (e.g. Colombo, Malabe)"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Search Radius */}
          <View style={styles.groupHeaderRow}>
            <Text style={styles.filterGroupTitle}>Search Radius</Text>
            <Text style={styles.radiusValText}>{selectedRadius} km</Text>
          </View>
          <View style={styles.chipRow}>
            {RADII.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.radiusChip, selectedRadius === r && styles.radiusChipActive]}
                onPress={() => setSelectedRadius(r)}
              >
                <Text style={[styles.radiusChipText, selectedRadius === r && styles.radiusChipTextActive]}>
                  {r} km
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Service Type */}
          <Text style={[styles.filterGroupTitle, { marginTop: 24 }]}>Service Category</Text>
          <View style={styles.typeGrid}>
            {SERVICE_TYPES.map((type) => {
              const isSelected = selectedTypes.includes(type);
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeChip, isSelected && styles.typeChipActive]}
                  onPress={() => toggleType(type)}
                >
                  <Ionicons
                    name={isSelected ? 'checkbox' : 'square-outline'}
                    size={16}
                    color={isSelected ? colors.white : colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.typeChipText, isSelected && styles.typeChipTextActive]}>{type}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Minimum Rating */}
          <Text style={[styles.filterGroupTitle, { marginTop: 24 }]}>Minimum Rating</Text>
          <View style={styles.chipRow}>
            {RATINGS.map((rate) => {
              const isSelected = minRating === rate;
              return (
                <TouchableOpacity
                  key={rate}
                  style={[styles.ratingChip, isSelected && styles.ratingChipActive]}
                  onPress={() => setMinRating(rate)}
                >
                  {rate !== 'Any' && (
                    <Ionicons
                      name="star"
                      size={14}
                      color={isSelected ? colors.white : '#F59E0B'}
                      style={{ marginRight: 4 }}
                    />
                  )}
                  <Text style={[styles.ratingChipText, isSelected && styles.ratingChipTextActive]}>
                    {rate}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Price Range */}
          <Text style={[styles.filterGroupTitle, { marginTop: 24 }]}>Max Hourly Rate (LKR)</Text>

          {/* Quick Price Preset Chips */}
          <View style={[styles.chipRow, { marginBottom: 10 }]}>
            {PRICE_PRESETS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.pricePresetChip, maxPrice === p && styles.pricePresetChipActive]}
                onPress={() => setMaxPrice(p)}
              >
                <Text style={[styles.pricePresetText, maxPrice === p && styles.pricePresetTextActive]}>
                  Rs. {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.priceInputBox}>
            <Text style={styles.lkrLabel}>Rs.</Text>
            <TextInput
              style={styles.priceInput}
              value={maxPrice}
              onChangeText={setMaxPrice}
              placeholder="e.g. 1000"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Bottom Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.85}>
          <Text style={styles.applyBtnText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  clearBtnText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 150, // Ensures plenty of room above keyboard and sticky footer
  },
  appliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EBF4EE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 20,
  },
  appliedText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  filterGroupTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.forestGreen,
    marginBottom: 10,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  radiusValText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.emerald,
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: colors.background,
  },
  locationInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radiusChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  radiusChipActive: {
    backgroundColor: colors.emerald,
    borderColor: colors.emerald,
  },
  radiusChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  radiusChipTextActive: {
    color: colors.white,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  typeChipActive: {
    backgroundColor: colors.forestGreen,
    borderColor: colors.forestGreen,
  },
  typeChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  typeChipTextActive: {
    color: colors.white,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  ratingChipActive: {
    backgroundColor: colors.forestGreen,
    borderColor: colors.forestGreen,
  },
  ratingChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  ratingChipTextActive: {
    color: colors.white,
  },
  pricePresetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pricePresetChipActive: {
    backgroundColor: colors.forestGreen,
    borderColor: colors.forestGreen,
  },
  pricePresetText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  pricePresetTextActive: {
    color: colors.white,
  },
  priceInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: colors.background,
  },
  lkrLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.forestGreen,
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    backgroundColor: colors.white,
  },
  applyBtn: {
    backgroundColor: colors.emerald,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
