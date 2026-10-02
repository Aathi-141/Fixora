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

const POPULAR_SERVICES = [
  { id: '1', title: 'House Cleaning', icon: 'home-outline', category: 'Cleaner' },
  { id: '2', title: 'AC Repair', icon: 'snow-outline', category: 'AC Technician' },
  { id: '3', title: 'Plumbing', icon: 'water-outline', category: 'Plumber' },
  { id: '4', title: 'Electrical', icon: 'flash-outline', category: 'Electrician' },
  { id: '5', title: 'Washing Machine', icon: 'hardware-chip-outline', category: 'Electrician' },
  { id: '6', title: 'Refrigerator', icon: 'cube-outline', category: 'AC Technician' },
  { id: '7', title: 'Painting', icon: 'color-palette-outline', category: 'Painter' },
  { id: '8', title: 'Carpentry', icon: 'hammer-outline', category: 'Carpenter' },
];

const CATEGORY_BANNERS = {
  Electrician: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop',
  Plumber: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop',
  Cleaner: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop',
  'AC Technician': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&auto=format&fit=crop',
  Painter: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop',
  Carpenter: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&auto=format&fit=crop',
};

const SRI_LANKAN_PROVIDERS = [
  {
    _id: 'p1',
    category: 'Electrician',
    specialization: 'Senior Certified Electrician & Wiring Specialist',
    hourlyRate: 700,
    rating: 4.8,
    reviewCount: 124,
    experienceYears: 15,
    tag: 'Bestseller',
    user: {
      name: 'Ramesh Mendis',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop',
      address: 'Colombo 05, Sri Lanka',
    },
  },
  {
    _id: 'p2',
    category: 'Plumber',
    specialization: 'Master High-Pressure Plumbing & Pipe Diagnostics',
    hourlyRate: 650,
    rating: 4.9,
    reviewCount: 168,
    experienceYears: 12,
    tag: 'Top Rated',
    user: {
      name: 'Sunil Perera',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop',
      address: 'Gothatuwa, Colombo',
    },
  },
  {
    _id: 'p3',
    category: 'Cleaner',
    specialization: 'Deep Home Sanitization & Surface Detailing',
    hourlyRate: 500,
    rating: 4.9,
    reviewCount: 204,
    experienceYears: 8,
    tag: 'Popular',
    user: {
      name: 'Chaminda Wickramasinghe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop',
      address: 'Malabe, Colombo',
    },
  },
  {
    _id: 'p4',
    category: 'AC Technician',
    specialization: 'Inverter AC & Eco-Freon Refrigeration Expert',
    hourlyRate: 850,
    rating: 4.8,
    reviewCount: 92,
    experienceYears: 10,
    tag: 'Instant 30m',
    user: {
      name: 'Nuwan Pradeep',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=300&auto=format&fit=crop',
      address: 'Rajagiriya, Colombo',
    },
  },
  {
    _id: 'p5',
    category: 'Painter',
    specialization: 'Interior Weather-Shield & Wall Artisan Prep',
    hourlyRate: 600,
    rating: 4.7,
    reviewCount: 88,
    experienceYears: 11,
    tag: 'Verified',
    user: {
      name: 'Rohan Wickramasinghe',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop',
      address: 'Nugegoda, Colombo',
    },
  },
  {
    _id: 'p6',
    category: 'Carpenter',
    specialization: 'Master Furniture Fitting & Timber Overhaul',
    hourlyRate: 750,
    rating: 4.9,
    reviewCount: 142,
    experienceYears: 16,
    tag: 'Bestseller',
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
      let filtered = [...SRI_LANKAN_PROVIDERS];
      if (selectedCategory && selectedCategory !== 'All') {
        filtered = filtered.filter(
          (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
        );
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

  const handleSelectPopularService = (categoryName) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory('All');
    } else {
      setSelectedCategory(categoryName);
    }
  };

  const userAddress = user?.address || 'No. 42, New Kandy Road, Malabe';
  const displayAddress = userAddress.split(',')[0];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />

      {/* 1. Top Location Header Bar (Matching Reference) */}
      <View style={styles.locationHeaderRow}>
        <View style={styles.locationWrap}>
          <View style={styles.pinCircle}>
            <Ionicons name="location-sharp" size={18} color={colors.forestGreen} />
          </View>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={styles.addressTouch}
              onPress={() => navigation.navigate('ProfileTab')}
              activeOpacity={0.7}
            >
              <Text style={styles.addressMain} numberOfLines={1}>
                {displayAddress}
              </Text>
              <Ionicons name="chevron-down" size={14} color={colors.textPrimary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
            <Text style={styles.addressSub}>Delivering to your location</Text>
          </View>
        </View>

        {/* Right Action Icons: Notification Bell & Cart */}
        <View style={styles.topRightActions}>
          <TouchableOpacity
            style={styles.iconCircleBtn}
            onPress={() => navigation.navigate('HistoryTab')}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
            <View style={styles.notifDot} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconCircleBtn}
            onPress={() => navigation.navigate('HistoryTab')}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Clean Search Bar with Filter Adjustment Sliders (Matching Reference) */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={19} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for appliance or service"
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
          activeOpacity={0.8}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={filterParams.applied ? colors.white : colors.forestGreen}
          />
        </TouchableOpacity>
      </View>

      {/* Main Scroll Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
      >
        {/* 3. Hero Promo Banner (Matching Reference Image) */}
        <View style={styles.heroBanner}>
          <View style={styles.heroContentLeft}>
            <Text style={styles.heroHeading}>AC not cooling?{'\n'}We'll fix it fast.</Text>

            <View style={styles.heroBulletRow}>
              <Ionicons name="flash" size={13} color="#FBBF24" style={{ marginRight: 6 }} />
              <Text style={styles.heroBulletText}>Instant service in 30 mins</Text>
            </View>

            <View style={styles.heroBulletRow}>
              <Ionicons name="shield-checkmark" size={13} color="#A7F3D0" style={{ marginRight: 6 }} />
              <Text style={styles.heroBulletText}>Expert technicians • Genuine parts</Text>
            </View>

            {/* Quick Action Buttons */}
            <View style={styles.heroBtnRow}>
              <TouchableOpacity
                style={styles.instantPillBtn}
                onPress={() => handleSelectPopularService('AC Technician')}
                activeOpacity={0.85}
              >
                <Ionicons name="flash" size={14} color={colors.forestGreen} style={{ marginRight: 4 }} />
                <Text style={styles.instantPillText}>Instant Service</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.schedulePillBtn}
                onPress={() => {
                  if (providers.length > 0) {
                    navigation.navigate('DateTimeSelection', { provider: providers[0] });
                  }
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="calendar-outline" size={14} color={colors.white} style={{ marginRight: 4 }} />
                <Text style={styles.schedulePillText}>Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Banner Graphic Technician */}
          <View style={styles.heroGraphicBox}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&auto=format&fit=crop' }}
              style={styles.heroTechnicianImg}
            />
          </View>
        </View>

        {/* Carousel Pagination Dots */}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* 4. Popular Services Section (2x4 Grid Matching Reference) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Popular Services</Text>
          <TouchableOpacity onPress={() => setSelectedCategory('All')}>
            <Text style={styles.seeAllLink}>
              {selectedCategory !== 'All' ? 'Clear Filter' : 'See all >'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.servicesGrid}>
          {POPULAR_SERVICES.map((item) => {
            const isSelected = selectedCategory === item.category;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.serviceTile, isSelected && styles.serviceTileActive]}
                onPress={() => handleSelectPopularService(item.category)}
                activeOpacity={0.8}
              >
                <View style={[styles.serviceIconWrap, isSelected && styles.serviceIconWrapActive]}>
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={isSelected ? colors.white : colors.forestGreen}
                  />
                </View>
                <Text
                  style={[styles.serviceTileTitle, isSelected && styles.serviceTileTitleActive]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 5. Recommended For You Section (Clean Cards Matching Reference) */}
        <View style={[styles.sectionHeaderRow, { marginTop: 26 }]}>
          <Text style={styles.sectionTitle}>Recommended for you</Text>
          <TouchableOpacity onPress={() => setSelectedCategory('All')}>
            <Text style={styles.seeAllLink}>View all &gt;</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.forestGreen} style={{ marginVertical: 30 }} />
        ) : providers.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="search" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No specialists found matching your search.</Text>
            <TouchableOpacity style={styles.resetFilterBtn} onPress={() => setSelectedCategory('All')}>
              <Text style={styles.resetFilterText}>Show All Services</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            {providers.map((p, index) => {
              const providerName = p.user?.name || 'Verified Professional';
              const bannerUrl =
                CATEGORY_BANNERS[p.category] ||
                'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop';
              const strikePrice = Math.round((p.hourlyRate || 700) * 1.25);
              const cardTag = p.tag || (index % 2 === 0 ? 'Bestseller' : 'Top Rated');

              return (
                <TouchableOpacity
                  key={p._id}
                  style={styles.recommendedCard}
                  onPress={() => navigation.navigate('ProviderProfile', { providerId: p._id, provider: p })}
                  activeOpacity={0.92}
                >
                  {/* Top Image Banner with Tag Badge */}
                  <View style={styles.cardBannerWrap}>
                    <Image source={{ uri: bannerUrl }} style={styles.cardBannerImg} />
                    <View style={styles.bestsellerBadge}>
                      <Text style={styles.bestsellerText}>{cardTag}</Text>
                    </View>
                  </View>

                  {/* Card Content Body */}
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {providerName} • {p.category}
                    </Text>

                    {/* Rating & Estimated Duration Row */}
                    <View style={styles.cardRatingRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="star" size={13} color="#F59E0B" style={{ marginRight: 3 }} />
                        <Text style={styles.cardRatingNum}>{p.rating?.toFixed(1) || '4.8'}</Text>
                        <Text style={styles.cardReviewCount}>({p.reviewCount || 124})</Text>
                      </View>
                      <View style={styles.dotDivider} />
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="time-outline" size={13} color={colors.textSecondary} style={{ marginRight: 3 }} />
                        <Text style={styles.cardDurationText}>60 mins</Text>
                      </View>
                    </View>

                    {/* Verified Professional Pill */}
                    <View style={styles.verifiedProfessionalPill}>
                      <Ionicons name="shield-checkmark" size={12} color={colors.forestGreen} style={{ marginRight: 4 }} />
                      <Text style={styles.verifiedProfessionalText}>Verified Professional</Text>
                    </View>

                    {/* Price and Book Now Action Row */}
                    <View style={styles.cardBottomRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                        <Text style={styles.cardPriceAmount}>Rs. {p.hourlyRate?.toLocaleString() || p.hourlyRate}</Text>
                        <Text style={styles.cardStrikePrice}>Rs. {strikePrice.toLocaleString()}</Text>
                      </View>

                      <TouchableOpacity
                        style={styles.bookNowCompactBtn}
                        onPress={() => navigation.navigate('DateTimeSelection', { provider: p })}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.bookNowCompactText}>Book Now</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* 6. Fixora Trust Guarantee Badges (Matching Reference Footer) */}
        <View style={styles.trustBadgesRow}>
          <View style={styles.trustBadgeItem}>
            <View style={styles.trustIconCircle}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.forestGreen} />
            </View>
            <Text style={styles.trustBadgeLabel}>Verified{'\n'}Professionals</Text>
          </View>

          <View style={styles.trustBadgeItem}>
            <View style={styles.trustIconCircle}>
              <Ionicons name="pricetag-outline" size={18} color={colors.forestGreen} />
            </View>
            <Text style={styles.trustBadgeLabel}>Transparent{'\n'}Pricing</Text>
          </View>

          <View style={styles.trustBadgeItem}>
            <View style={styles.trustIconCircle}>
              <Ionicons name="ribbon-outline" size={18} color={colors.forestGreen} />
            </View>
            <Text style={styles.trustBadgeLabel}>Up to 30 Days{'\n'}Warranty</Text>
          </View>

          <View style={styles.trustBadgeItem}>
            <View style={styles.trustIconCircle}>
              <Ionicons name="navigate-outline" size={18} color={colors.forestGreen} />
            </View>
            <Text style={styles.trustBadgeLabel}>Live{'\n'}Tracking</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  // 1. Top Location Header Bar
  locationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: colors.white,
  },
  locationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  addressTouch: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressMain: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    maxWidth: 200,
  },
  addressSub: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.emerald,
  },

  // 2. Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: colors.emerald,
  },

  // Main Scroll Body
  scrollBody: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 40,
  },

  // 3. Hero Promo Banner
  heroBanner: {
    backgroundColor: '#1E4D2B',
    borderRadius: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  heroContentLeft: {
    flex: 1.15,
    padding: 18,
    justifyContent: 'center',
  },
  heroHeading: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.white,
    lineHeight: 24,
    marginBottom: 8,
  },
  heroBulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  heroBulletText: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  heroBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  instantPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  instantPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  schedulePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },
  schedulePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  heroGraphicBox: {
    flex: 0.85,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  heroTechnicianImg: {
    width: '100%',
    height: '100%',
    minHeight: 140,
    resizeMode: 'cover',
  },

  // Carousel Dots
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    marginBottom: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.forestGreen,
  },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  seeAllLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.forestGreen,
  },

  // 4. Popular Services Grid (4 Columns x 2 Rows)
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceTile: {
    width: '22.7%', // 4 items per row with gap
    aspectRatio: 0.9,
    backgroundColor: '#EBF5EE',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  serviceTileActive: {
    backgroundColor: colors.forestGreen,
    borderColor: colors.forestGreen,
  },
  serviceIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceIconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  serviceTileTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 13,
  },
  serviceTileTitleActive: {
    color: colors.white,
  },

  // 5. Recommended Cards
  cardsContainer: {
    gap: 14,
  },
  recommendedCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardBannerWrap: {
    height: 125,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  cardBannerImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bestsellerBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  bestsellerText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  cardBody: {
    padding: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  cardRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardRatingNum: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: 2,
  },
  cardReviewCount: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  dotDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 8,
  },
  cardDurationText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  verifiedProfessionalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EBF4EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 12,
  },
  verifiedProfessionalText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  cardPriceAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginRight: 6,
  },
  cardStrikePrice: {
    fontSize: 13,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  bookNowCompactBtn: {
    backgroundColor: colors.forestGreen,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  bookNowCompactText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },

  // Empty state
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  resetFilterBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EBF4EE',
    borderRadius: 10,
  },
  resetFilterText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.forestGreen,
  },

  // 6. Trust Badges Row
  trustBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 18,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  trustBadgeItem: {
    alignItems: 'center',
    flex: 1,
  },
  trustIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  trustBadgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 13,
  },
});
