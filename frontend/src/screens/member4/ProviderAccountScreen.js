import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Switch,
  Alert,
  StatusBar,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { updateProviderProfile } from '../../services/api';

export default function ProviderAccountScreen({ navigation }) {
  const { user, logout, updateUser } = useContext(AuthContext);

  const [name, setName] = useState(user?.name || 'Service Partner');
  const [phone, setPhone] = useState(user?.phone || '+94 77 123 4567');
  const [hourlyRate, setHourlyRate] = useState(
    user?.hourlyRate ? String(user.hourlyRate) : '700'
  );
  const [city, setCity] = useState(user?.city || 'Colombo');
  const [bio, setBio] = useState(
    user?.bio ||
      'Fixora certified master technician providing reliable on-demand domestic and commercial home repair services.'
  );
  const [isAvailable, setIsAvailable] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [isPickingImage, setIsPickingImage] = useState(false);

  const getInitials = (fullName) => {
    if (!fullName) return 'SP';
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  const PRESET_AVATARS = [
    { id: '1', label: 'Technician 1', uri: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop' },
    { id: '2', label: 'Technician 2', uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop' },
    { id: '3', label: 'Technician 3', uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop' },
  ];

  const handleSelectAvatar = async (uri) => {
    if (updateUser) {
      await updateUser({ avatar: uri });
    }
    try {
      await updateProviderProfile({ avatar: uri });
    } catch (e) {
      console.log('Provider profile avatar sync error:', e);
    }
    setShowPhotoModal(false);
    Alert.alert('Profile Photo Updated', 'Your provider profile picture has been updated and saved.');
  };

  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Fixora needs photo library access to upload your business/profile photo.'
        );
        return;
      }

      setIsPickingImage(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
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

  const handleClearAvatar = async () => {
    if (updateUser) {
      await updateUser({ avatar: null });
    }
    try {
      await updateProviderProfile({ avatar: null });
    } catch (e) {
      console.log('Provider profile avatar clear error:', e);
    }
    setShowPhotoModal(false);
    Alert.alert('Default Initials Set', 'Your provider card will now display your clean initials badge.');
  };

  const handleSaveCustomPhotoUrl = () => {
    if (!photoUrlInput.trim()) {
      Alert.alert('Please enter a valid photo link');
      return;
    }
    handleSelectAvatar(photoUrlInput.trim());
    setPhotoUrlInput('');
  };

  const providerCategory = user?.category || 'Specialist';

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name,
        phone,
        hourlyRate: parseFloat(hourlyRate) || 2250,
        city,
        bio,
      };

      const res = await updateProviderProfile(payload);
      setIsSaving(false);

      if (updateUser) {
        updateUser({
          ...user,
          ...payload,
        });
      }

      Alert.alert(
        'Profile Updated',
        'Your provider profile, rates, and contact details have been successfully saved.'
      );
    } catch (err) {
      setIsSaving(false);
      Alert.alert(
        'Saved Locally',
        'Your profile changes have been updated for your current active session.'
      );
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your Fixora Provider account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Provider Profile & Account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Identity Card */}
        <View style={styles.profileHeaderCard}>
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={() => setShowPhotoModal(true)}
            activeOpacity={0.85}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.initialsAvatar}>
                <Text style={styles.initialsText}>{getInitials(name)}</Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={13} color={colors.white} />
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{name || 'Service Partner'}</Text>
            <View style={styles.categoryBadge}>
              <Ionicons name="construct" size={13} color={colors.forestGreen} style={{ marginRight: 4 }} />
              <Text style={styles.categoryText}>{providerCategory} Partner</Text>
            </View>
            <Text style={styles.profileEmail}>{user?.email || 'provider@fixora.lk'}</Text>
            <TouchableOpacity
              onPress={() => setShowPhotoModal(true)}
              style={styles.changePhotoBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.changePhotoText}>
                {user?.avatar ? 'Change Photo' : 'Add Profile Photo +'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Verification & Partner Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.verifiedIconBox}>
              <Ionicons name="shield-checkmark" size={20} color={colors.white} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.statusTitle}>Fixora Verified Partner</Text>
              <Text style={styles.statusSubtitle}>National Trade License & ID Confirmed</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Online Toggle */}
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Available for Bookings</Text>
              <Text style={styles.switchHint}>
                {isAvailable ? 'Currently visible to customers' : 'Hidden from new job dispatch'}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: '#D1D5DB', true: colors.sageGreen }}
              thumbColor={isAvailable ? colors.forestGreen : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsCard}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>4.9 ★</Text>
            <Text style={styles.statLabel}>128 Ratings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>42</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>99.4%</Text>
            <Text style={styles.statLabel}>Acceptance</Text>
          </View>
        </View>

        {/* Editable Profile Form */}
        <View style={styles.formCard}>
          <Text style={styles.formSectionTitle}>EDIT WORK PROFILE</Text>

          <Text style={styles.inputLabel}>Full Name / Business Title</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.inputLabel}>Contact Phone Number</Text>
          <TextInput
            style={styles.textInput}
            value={phone}
            onChangeText={setPhone}
            placeholder="+94 77 XXX XXXX"
            keyboardType="phone-pad"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.inputLabel}>Base Hourly Rate (LKR)</Text>
          <View style={styles.rateInputRow}>
            <Text style={styles.rateCurrency}>LKR</Text>
            <TextInput
              style={[styles.textInput, { flex: 1, marginBottom: 0 }]}
              value={hourlyRate}
              onChangeText={setHourlyRate}
              placeholder="e.g. 2250"
              keyboardType="numeric"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <Text style={[styles.inputLabel, { marginTop: 14 }]}>Base City / Primary Region</Text>
          <TextInput
            style={styles.textInput}
            value={city}
            onChangeText={setCity}
            placeholder="City, District"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.inputLabel}>Professional Bio & Experience</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Describe your trade experience and specialties..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
          />

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSaveProfile}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color={colors.white} style={{ marginRight: 8 }} />
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Navigations */}
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AvailabilityTab')}
          >
            <Ionicons name="time-outline" size={22} color={colors.forestGreen} style={styles.menuIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Operating Hours & Radius</Text>
              <Text style={styles.menuSubtitle}>Configure weekly shifts and coverage km</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ProviderRequestsTab')}
          >
            <Ionicons name="clipboard-outline" size={22} color={colors.forestGreen} style={styles.menuIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Incoming Job Requests</Text>
              <Text style={styles.menuSubtitle}>Review and accept customer bookings</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Log Out from Fixora</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>Fixora Provider v1.0.0 • Verified Commercial Platform</Text>
      </ScrollView>

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
              Select a photo from your gallery, choose a pro badge, or paste an image URL.
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
              <Text style={styles.orDividerText}>OR CHOOSE PRO BADGE</Text>
              <View style={styles.orDividerLine} />
            </View>

            <Text style={styles.inputLabel}>Choose Pro Technician Photo</Text>
            <View style={styles.presetGrid}>
              {PRESET_AVATARS.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.presetItem}
                  onPress={() => handleSelectAvatar(p.uri)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: p.uri }} style={styles.presetImg} />
                  <Text style={styles.presetLabel}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.orDividerContainer, { marginTop: 14 }]}>
              <View style={styles.orDividerLine} />
              <Text style={styles.orDividerText}>OR PASTE IMAGE URL</Text>
              <View style={styles.orDividerLine} />
            </View>

            <Text style={styles.inputLabel}>Custom Image URL</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <TextInput
                style={[styles.textInput, { flex: 1, marginBottom: 0 }]}
                value={photoUrlInput}
                onChangeText={setPhotoUrlInput}
                placeholder="https://... photo link"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.saveBtn, { marginTop: 0, paddingHorizontal: 16 }]}
                onPress={handleSaveCustomPhotoUrl}
              >
                <Text style={styles.saveBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>

            {user?.avatar ? (
              <TouchableOpacity style={styles.clearAvatarBtn} onPress={handleClearAvatar}>
                <Ionicons name="trash-outline" size={16} color="#DC2626" />
                <Text style={styles.clearAvatarText}>Remove Photo & Use Initials</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  topHeader: {
    backgroundColor: colors.forestGreen,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  profileHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: colors.sageGreen,
  },
  initialsAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.forestGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.sageGreen,
  },
  initialsText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.emerald,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  changePhotoBtn: {
    marginTop: 4,
  },
  changePhotoText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.emerald,
  },
  presetGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 14,
  },
  presetItem: {
    alignItems: 'center',
  },
  presetImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 4,
  },
  presetLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  clearAvatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginTop: 12,
  },
  clearAvatarText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
    marginLeft: 6,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EBF5EE',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 14,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  profileEmail: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.forestGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statusSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  switchHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.cardBorder,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  formSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAF9',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 14,
  },
  rateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateCurrency: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.forestGreen,
    backgroundColor: '#EBF5EE',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forestGreen,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 6,
    shadowColor: colors.forestGreen,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuIcon: {
    marginRight: 14,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.cardBorder,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 10,
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
});
