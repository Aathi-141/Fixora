import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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
  { name: 'AC Technician', icon: 'snow-outline' },
  { name: 'Painter', icon: 'color-palette-outline' },
  { name: 'Carpenter', icon: 'hammer-outline' },
];

const SRI_LANKAN_PROVIDERS = [
  {
    _id: 'p1',
    category: 'Electrician',
    specialization: 'Senior Certified Electrician & Specialist',
    hourlyRate: 700,
    rating: 4.8,
    reviewCount: 124,
    experienceYears: 15,
    user: {
      name: 'Ramesh Mendis',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop',
      address: 'Colombo 05, Sri Lanka',
    },
  },
  {
    _id: 'p2',
    category: 'Plumber',
    specialization: 'Master High-Pressure Plumber',
    hourlyRate: 650,
    rating: 4.9,
    reviewCount: 168,
    experienceYears: 12,
    user: {
      name: 'Sunil Perera',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop',
      address: 'Gothatuwa, Colombo',
    },
  },
  {
    _id: 'p3',
    category: 'Cleaner',
    specialization: 'Deep Home Botanical & Floor Cleaning',
    hourlyRate: 500,
    rating: 4.9,
    reviewCount: 204,
    experienceYears: 8,
    user: {
      name: 'Chaminda Wickramasinghe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop',
      address: 'Malabe, Colombo',
    },
  },
  {
    _id: 'p4',
    category: 'AC Technician',
    specialization: 'Inverter AC & Refrigeration Expert',
    hourlyRate: 850,
    rating: 4.8,
    reviewCount: 92,
    experienceYears: 10,
    user: {
      name: 'Nuwan Pradeep',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=300&auto=format&fit=crop',
      address: 'Rajagiriya, Colombo',
    },
  },
  {
    _id: 'p5',
    category: 'Painter',
    specialization: 'Interior Weather-Shield & Wall Artisan',
    hourlyRate: 600,
    rating: 4.7,
    reviewCount: 88,
    experienceYears: 11,
    user: {
      name: 'Rohan Wickramasinghe',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop',
      address: 'Nugegoda, Colombo',
    },
  },
  {
    _id: 'p6',
    category: 'Carpenter',
    specialization: 'Master Furniture & Timber Specialist',
    hourlyRate: 750,
    rating: 4.9,
    reviewCount: 142,
    experienceYears: 16,
    user: {
      name: 'Bandara Wijethunga',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop',
      address: 'Moratuwa, Western Province',
    },
  },
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
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
      search: searchQuery,
      minRating: filterParams.minRating,
      maxPrice: filterParams.maxPrice,
      city: filterParams.city,
    };
    const res = await getProviders(params);
    if (res.success && res.data && res.data.length > 0) {
      setProviders(res.data);
    } else {
      // Filter mock data locally if backend not yet seeded with all 6
      let filtered = [...SRI_LANKAN_PROVIDERS];
      if (selectedCategory && selectedCategory !== 'All') {
        filtered = filtered.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.category.toLowerCase().includes(q) ||
            p.user.name.toLowerCase().includes(q) ||
            p.specialization.toLowerCase().includes(q)
        );
      }
      if (filterParams.maxPrice) {
        filtered = filtered.filter((p) => p.hourlyRate <= filterParams.maxPrice);
      }
      if (filterParams.minRating) {
        filtered = filtered.filter((p) => p.rating >= Number(filterParams.minRating));
      }
      setProviders(filtered);
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
          onPress={() => navigation.navigate('ProfileTab')}
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
            placeholder="Search plumber, electrician, cleaner, AC..."
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
          <TouchableOpacity onPress={() => setSelectedCategory('All')}>
            <Text style={styles.seeAllText}>Show All</Text>
          </TouchableOpacity>
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
          <Text style={styles.sectionTitle}>Top Rated Sri Lankan Professionals</Text>
          <Text style={styles.countBadge}>{providers.length} Available</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.forestGreen} style={{ marginTop: 30 }} />
        ) : providers.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="search" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No specialists found matching your search.</Text>
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
    paddingBottom: 90, // Plenty of room for elevated bottom tab bar
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  seeAllText: {
    fontSize: 13,
    color: colors.emerald,
    fontWeight: '600',
  },
  categoryScroll: {
    paddingRight: 20,
    gap: 12,
  },
  categoryCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minWidth: 84,
  },
  categoryCardActive: {
    backgroundColor: colors.forestGreen,
    borderColor: colors.forestGreen,
  },
  catIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  catIconCircleActive: {
    backgroundColor: colors.emerald,
  },
  catName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  catNameActive: {
    color: colors.white,
    fontWeight: '700',
  },
  countBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  providerCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  providerImg: {
    width: 82,
    height: 82,
    borderRadius: 14,
    marginRight: 12,
  },
  providerInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    marginLeft: 3,
  },
  providerSpec: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.forestGreen,
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
    marginLeft: 3,
  },
  dot: {
    marginHorizontal: 5,
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
    color: colors.emerald,
  },
  perHour: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  bookNowBtn: {
    backgroundColor: colors.emerald,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  bookNowBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
