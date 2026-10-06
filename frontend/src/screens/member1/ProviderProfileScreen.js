import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { getProviderById, updateProviderProfile } from '../../services/api';

export default function ProviderProfileScreen({ navigation, route }) {
  const { user, updateUser } = useContext(AuthContext);
  const { providerId, provider: initialProvider } = route.params || {};
  const [provider, setProvider] = useState(initialProvider || null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(!initialProvider);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [isPickingImage, setIsPickingImage] = useState(false);

  useEffect(() => {
    if (providerId) {
      loadProfile();
    }
  }, [providerId]);

  const loadProfile = async () => {
    const res = await getProviderById(providerId);
    if (res.success && res.data) {
      setProvider(res.data);
      setReviews(res.data.reviews || []);
    }
    setLoading(false);
  };

  const handleSelectAvatar = async (uri) => {
    if (updateUser) {
      await updateUser({ avatar: uri });
    }
    try {
      await updateProviderProfile({ avatar: uri, providerId: provider?._id });
    } catch (e) {
      console.log('Provider avatar sync error:', e);
    }
    setProvider((prev) => (prev ? { ...prev, avatar: uri, user: { ...prev.user, avatar: uri } } : prev));
    setShowPhotoModal(false);
    Alert.alert('Profile Photo Updated', 'Provider profile picture has been updated and saved.');
  };

  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Fixora needs photo library access to upload your profile photo.'
        );
        return;
      }

      setIsPickingImage(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const permanentUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        await handleSelectAvatar(permanentUri);
      }
    } catch (err) {
      console.warn('Image picker error:', err);
      Alert.alert('Image Selection Error', 'Could not open device photo library.');
    } finally {
      setIsPickingImage(false);
    }
  };

  const handleSaveCustomPhotoUrl = () => {
    if (!photoUrlInput.trim()) {
      Alert.alert('Please enter a valid photo link');
      return;
    }
    handleSelectAvatar(photoUrlInput.trim());
    setPhotoUrlInput('');
  };

  const name = provider?.user?.name || provider?.name || 'Ramesh Mendis';
  const avatarUrl =
    provider?.user?.avatar ||
    provider?.avatar ||
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300';
  const category = provider?.category || 'Electrician';
  const specialization = provider?.specialization || 'Senior Electrician & Specialist';
  const hourlyRate = provider?.hourlyRate || 700;
  const rating = provider?.rating?.toFixed(1) || '4.8';
  const reviewCount = provider?.reviewCount || 124;
  const expYears = provider?.experienceYears || 15;
  const skills = provider?.skills || ['Wiring Repairs', 'Circuit Breakers', 'EV Chargers', 'Lighting Design'];
  const about =
    provider?.about ||
    'Certified home service technician specializing in residential electrical setups, safety inspections, diagnostic repairs, and commercial maintenance.';

  const isOwner =
    user?.role === 'provider' &&
    ((provider?._id && (user?.providerProfileId === provider._id || user?.providerProfile?._id === provider._id)) ||
     (provider?.user?._id && (user?.id === provider.user._id || user?._id === provider.user._id)) ||
     (provider?.user && (user?.id === provider.user || user?._id === provider.user)));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Custom Header Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Details</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="share-social-outline" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Cover / Profile Card */}
        <View style={styles.profileHeaderCard}>
          {isOwner ? (
            <TouchableOpacity
              style={styles.avatarWrap}
              onPress={() => setShowPhotoModal(true)}
              activeOpacity={0.85}
            >
              <Image source={{ uri: avatarUrl }} style={styles.avatarLarge} />
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={14} color={colors.white} />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.avatarWrap}>
              <Image source={{ uri: avatarUrl }} style={styles.avatarLarge} />
            </View>
          )}
          <Text style={styles.providerNameText}>{name}</Text>
          <View style={styles.specBadge}>
            <Ionicons name="shield-checkmark" size={14} color={colors.forestGreen} style={{ marginRight: 4 }} />
            <Text style={styles.specBadgeText}>{specialization}</Text>
          </View>

          {/* Key Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statCol}>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={styles.statVal}>{rating}</Text>
              </View>
              <Text style={styles.statLabel}>({reviewCount} reviews)</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCol}>
              <Text style={styles.statVal}>{expYears}+ Yrs</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCol}>
              <Text style={styles.priceVal}>Rs. {hourlyRate}</Text>
              <Text style={styles.statLabel}>per hour</Text>
            </View>
          </View>
        </View>

        {/* 100% Satisfaction Guarantee Banner */}
        <View style={styles.guaranteeBanner}>
          <Ionicons name="ribbon" size={22} color={colors.forestGreen} style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.guaranteeTitle}>100% Satisfaction Guarantee</Text>
            <Text style={styles.guaranteeSub}>
              Verified Sri Lankan background check, upfront pricing, and free re-service if unsatisfied.
            </Text>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>About {name.split(' ')[0]}</Text>
          <Text style={styles.aboutText}>{about}</Text>
        </View>

        {/* Expertise & Skills */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>Expertise & Skills</Text>
          <View style={styles.skillsGrid}>
            {skills.map((skill, index) => (
              <View key={index} style={styles.skillPill}>
                <Ionicons name="checkmark-circle" size={16} color={colors.sageGreen} style={{ marginRight: 6 }} />
                <Text style={styles.skillPillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.sectionCard}>
          <View style={styles.reviewHeaderRow}>
            <Text style={styles.sectionCardTitle}>Customer Reviews</Text>
            <Text style={styles.reviewCountText}>{reviews.length > 0 ? reviews.length : 2} verified</Text>
          </View>

          {/* Sample Review 1 */}
          <View style={styles.reviewItem}>
            <View style={styles.reviewUserRow}>
              <View style={styles.reviewAvatar}>
                <Text style={styles.reviewAvatarText}>KP</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.reviewerName}>Kasun Perera</Text>
                <Text style={styles.reviewDate}>2 days ago • Verified Booking</Text>
              </View>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons key={s} name="star" size={13} color="#F59E0B" />
                ))}
              </View>
            </View>
            <Text style={styles.reviewComment}>
              "Exceptional service! Arrived right on time and fixed our tripping breaker within 45 minutes. Very professional."
            </Text>
          </View>

          {/* Sample Review 2 */}
          <View style={styles.reviewItem}>
            <View style={styles.reviewUserRow}>
              <View style={[styles.reviewAvatar, { backgroundColor: '#E0F2FE' }]}>
                <Text style={[styles.reviewAvatarText, { color: '#0369A1' }]}>LS</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.reviewerName}>Lakmini Silva</Text>
                <Text style={styles.reviewDate}>1 week ago • Verified Booking</Text>
              </View>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons key={s} name="star" size={13} color="#F59E0B" />
                ))}
              </View>
            </View>
            <Text style={styles.reviewComment}>
              "Very clear with pricing and clean work area. Highly recommended for any household work!"
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Book Appointment CTA Button */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.rateCaption}>Starting Hourly Rate</Text>
          <Text style={styles.rateDisplay}>
            LKR {hourlyRate} <Text style={styles.rateSub}>/ hr</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={styles.bookCtaBtn}
          onPress={() => navigation.navigate('DateTimeSelection', { provider })}
          activeOpacity={0.85}
        >
          <Text style={styles.bookCtaBtnText}>Book Appointment</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>

      {/* Photo Picker Modal */}
      <Modal visible={showPhotoModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Provider Photo</Text>
              <TouchableOpacity onPress={() => setShowPhotoModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>
              Select a photo from your gallery or paste an image URL to update your profile photo.
            </Text>

            {/* Gallery Upload Option */}
            <TouchableOpacity
              style={styles.galleryUploadBtn}
              onPress={handlePickFromGallery}
              disabled={isPickingImage}
              activeOpacity={0.85}
            >
              {isPickingImage ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Ionicons name="images-outline" size={20} color={colors.white} style={{ marginRight: 8 }} />
                  <Text style={styles.galleryUploadBtnText}>Choose from Device Gallery</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.orDividerContainer}>
              <View style={styles.orDividerLine} />
              <Text style={styles.orDividerText}>OR PASTE IMAGE URL</Text>
              <View style={styles.orDividerLine} />
            </View>

            <Text style={styles.inputLabel}>Provider Photo Image URL</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                value={photoUrlInput}
                onChangeText={setPhotoUrlInput}
                placeholder="https://... photo link"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.modalSaveBtn, { justifyContent: 'center' }]}
                onPress={handleSaveCustomPhotoUrl}
              >
                <Text style={styles.modalSaveText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    backgroundColor: colors.forestGreen,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  scrollBody: {
    paddingBottom: 24,
  },
  profileHeaderCard: {
    backgroundColor: colors.white,
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: colors.sageGreen,
    marginBottom: 12,
  },
  providerNameText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  specBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4EE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 16,
  },
  specBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.forestGreen,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  statCol: {
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  priceVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.cardBorder,
  },
  guaranteeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4EE',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D2E7D8',
  },
  guaranteeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  guaranteeSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  sectionCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sectionCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.forestGreen,
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  skillPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewCountText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  reviewItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  reviewUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reviewDate: {
    fontSize: 11,
    color: colors.textMuted,
  },
  starsRow: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  bottomBar: {
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
  rateCaption: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  rateDisplay: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  rateSub: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  bookCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emerald,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 12,
  },
  bookCtaBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 12,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.forestGreen,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  galleryUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forestGreen,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: colors.forestGreen,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  galleryUploadBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  orDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  orDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  orDividerText: {
    marginHorizontal: 10,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAF9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
  },
  modalSaveBtn: {
    backgroundColor: colors.forestGreen,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
});
