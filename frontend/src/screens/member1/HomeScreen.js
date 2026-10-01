import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { getProviders } from '../../services/api';

const CATEGORIES = [
  { name: 'All', icon: 'grid-outline' },
  { name: 'Electrician', icon: 'flash-outline' },
  { name: 'Plumber', icon: 'water-outline' },
  { name: 'Cleaner', icon: 'sparkles-outline' },
  { name: 'HVAC & AC', icon: 'snow-outline' },
  { name: 'Carpentry', icon: 'hammer-outline' },
  { name: 'Painting', icon: 'color-palette-outline' },
];

export default function HomeScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  // If filters were passed back from FiltersScreen
  const filterParams = route.params?.filters || {};

  useEffect(() => {
    fetchProviders();
  }, [selectedCategory, searchQuery, route.params?.filters]);

  const fetchProviders = async () => {
    setLoading(true);
    const params = {
      category: selectedCategory,
      search: searchQuery,
      minRating: filterParams.minRating,
      maxPrice: filterParams.maxPrice,
      city: filterParams.city,
    };
    const res = await getProviders(params);
    if (res.success && res.data) {
      setProviders(res.data);
    } else {
      // Fallback default mock data if backend not yet running
      setProviders([
        {
          _id: 'p1',
          category: 'Electrician',
          specialization: 'Senior Electrician & Specialist',
          hourlyRate: 700,
          rating: 4.8,
          reviewCount: 124,
          experienceYears: 15,
          user: {
            name: 'Ramesh Mendis',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop',
            address: 'Colombo, Sri Lanka',
          },
        },
        {
          _id: 'p2',
          category: 'Plumber',
          specialization: 'Master Plumber',
          hourlyRate: 650,
          rating: 4.9,
          reviewCount: 168,
          experienceYears: 12,
          user: {
            name: 'Sunil Perera',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop',
            address: 'Gothatuwa, Colombo',
          },
        },
        {
          _id: 'p3',
          category: 'Cleaner',
          specialization: 'Deep Home Botanical Cleaning',
          hourlyRate: 500,
          rating: 4.9,
          reviewCount: 204,
          experienceYears: 8,
          user: {
            name: 'Chaminda Wickramasinghe',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop',
            address: 'Malabe, Colombo',
          },
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Top Bar with user greeting and role badge */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greetingSub}>Welcome back,</Text>
          <Text style={styles.greetingTitle}>Need a service today?</Text>
        </View>
        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={() => navigation.navigate('HistoryTab')}
        >
          <Image
            source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200' }}
            style={styles.avatarImg}
          />
        </TouchableOpacity>
      </View>

      {/* Search Input Bar with Filter Button */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search plumber, electrician, cleaner..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.filterBtn, filterParams.applied && styles.filterBtnActive]}
          onPress={() => navigation.navigate('Filters', { currentFilters: filterParams })}
        >
          <Ionicons
            name="options-outline"
            size={22}
            color={filterParams.applied ? colors.white : colors.forestGreen}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <Text style={styles.seeAllText}>See All</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.name;
            return (
              <TouchableOpacity
                key={cat.name}
                style={[styles.categoryCard, isActive && styles.categoryCardActive]}
                onPress={() => setSelectedCategory(cat.name)}
                activeOpacity={0.8}
              >
                <View style={[styles.catIconCircle, isActive && styles.catIconCircleActive]}>
                  <Ionicons
                    name={cat.icon}
                    size={22}
                    color={isActive ? colors.white : colors.forestGreen}
                  />
                </View>
                <Text style={[styles.catName, isActive && styles.catNameActive]}>{cat.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Top Rated Providers Header */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Top Rated Providers</Text>
          <Text style={styles.countBadge}>{providers.length} Available</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.forestGreen} style={{ marginTop: 30 }} />
        ) : providers.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="search" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No providers found matching your criteria.</Text>
          </View>
        ) : (
          providers.map((p) => {
            const providerName = p.user?.name || 'Verified Professional';
            const avatarUrl =
              p.user?.avatar ||
              p.avatar ||
              'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200';

            return (
              <TouchableOpacity
                key={p._id}
                style={styles.providerCard}
                onPress={() => navigation.navigate('ProviderProfile', { providerId: p._id, provider: p })}
                activeOpacity={0.9}
              >
                <Image source={{ uri: avatarUrl }} style={styles.providerImg} />
                <View style={styles.providerInfo}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.providerName}>{providerName}</Text>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={styles.ratingText}>{p.rating?.toFixed(1) || '4.8'}</Text>
                    </View>
                  </View>

                  <Text style={styles.providerSpec}>{p.specialization || p.category}</Text>

                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.cityText}>{p.user?.address || p.city || 'Colombo'}</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.expText}>{p.experienceYears || 5}+ yrs exp</Text>
                  </View>

                  <View style={styles.cardBottomRow}>
                    <Text style={styles.priceTag}>
                      Rs. {p.hourlyRate} <Text style={styles.perHour}>/hr</Text>
                    </Text>

                    <TouchableOpacity
                      style={styles.bookNowBtn}
                      onPress={() => navigation.navigate('DateTimeSelection', { provider: p })}
                    >
                      <Text style={styles.bookNowBtnText}>Book Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: colors.white,
  },
  greetingSub: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  avatarBtn: {
    padding: 2,
    borderWidth: 2,
    borderColor: colors.sageGreen,
    borderRadius: 24,
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: colors.emerald,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  seeAllText: {
    fontSize: 13,
    color: colors.emerald,
    fontWeight: '600',
  },
  countBadge: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  categoryScroll: {
    gap: 12,
    paddingVertical: 4,
  },
  categoryCard: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    minWidth: 84,
  },
  categoryCardActive: {
    backgroundColor: '#EBF4EE',
    borderColor: colors.forestGreen,
  },
  catIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  catIconCircleActive: {
    backgroundColor: colors.forestGreen,
  },
  catName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  catNameActive: {
    color: colors.forestGreen,
    fontWeight: '700',
  },
  providerCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  providerImg: {
    width: 80,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#EEE',
  },
  providerInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  providerSpec: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cityText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  dot: {
    marginHorizontal: 6,
    color: colors.textMuted,
  },
  expText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceTag: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  perHour: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  bookNowBtn: {
    backgroundColor: colors.emerald,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
  },
  bookNowBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 10,
    textAlign: 'center',
  },
});
