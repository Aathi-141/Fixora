import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';

export default function CustomerProfileScreen({ navigation }) {
  const { user, logout, updateUser } = useContext(AuthContext);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [streetAddress, setStreetAddress] = useState(
    user?.address ? user.address.split(',')[0] : 'No 42, New Kandy Road'
  );
  const [cityRegion, setCityRegion] = useState(
    user?.address && user.address.includes(',')
      ? user.address.split(',').slice(1).join(',').trim()
      : 'Malabe, Colombo'
  );

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of Fixora?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  const handleSaveAddress = () => {
    if (!streetAddress.trim()) {
      Alert.alert('Required', 'Please enter your street address.');
      return;
    }

    const fullAddress = `${streetAddress.trim()}, ${cityRegion.trim()}`;
    if (updateUser) {
      updateUser({ address: fullAddress });
    }

    setShowAddressModal(false);
    Alert.alert('Address Updated', 'Your default service address has been updated successfully.');
  };

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');

  const getInitials = (fullName) => {
    if (!fullName) return 'FM';
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  const PRESET_AVATARS = [
    { id: '1', label: 'Classic Pro', uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop' },
    { id: '2', label: 'Executive', uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop' },
    { id: '3', label: 'Modern', uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop' },
  ];

  const handleSelectAvatar = (uri) => {
    if (updateUser) {
      updateUser({ avatar: uri });
    }
    setShowPhotoModal(false);
    Alert.alert('Profile Photo Updated', 'Your profile photo has been refreshed.');
  };

  const handleClearAvatar = () => {
    if (updateUser) {
      updateUser({ avatar: null });
    }
    setShowPhotoModal(false);
    Alert.alert('Default Initials Set', 'Your profile will now show your custom initials badge.');
  };

  const handleSaveCustomPhotoUrl = () => {
    if (!photoUrlInput.trim()) {
      Alert.alert('Please enter a valid image URL');
      return;
    }
    handleSelectAvatar(photoUrlInput.trim());
    setPhotoUrlInput('');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={() => setShowPhotoModal(true)}
            activeOpacity={0.85}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.initialsAvatar}>
                <Text style={styles.initialsText}>{getInitials(user?.name)}</Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={13} color={colors.white} />
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || (isAdmin ? 'Admin' : 'Fixora Member')}</Text>
            <Text style={styles.userEmail}>{user?.email || 'member@fixora.lk'}</Text>
            <TouchableOpacity
              onPress={() => setShowPhotoModal(true)}
              style={styles.changePhotoBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.changePhotoText}>
                {user?.avatar ? 'Change Photo' : 'Add Profile Photo +'}
              </Text>
            </TouchableOpacity>

            <View style={styles.roleBadge}>
              <Ionicons
                name={isAdmin ? 'shield-checkmark' : 'person'}
                size={12}
                color={colors.forestGreen}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.roleBadgeText}>
                {isAdmin ? 'ADMINISTRATOR' : 'VERIFIED CUSTOMER'}
              </Text>
            </View>
          </View>
        </View>

        {/* Admin Special Quick Access Card */}
        {isAdmin ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Administrator Controls</Text>
            <Text style={styles.sectionSubtitle}>
              Logged in as System Admin. You have full access to provider verifications, disputes, and analytics.
            </Text>
            <TouchableOpacity
              style={styles.adminActionBtn}
              onPress={() => navigation.navigate('AdminDashboardTab')}
              activeOpacity={0.85}
            >
              <Ionicons name="speedometer" size={18} color={colors.white} style={{ marginRight: 8 }} />
              <Text style={styles.adminActionBtnText}>Go to Admin Dashboard</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Saved Addresses for Customers with Click to Edit */
          <View style={styles.sectionCard}>
            <View style={styles.addressSectionHeader}>
              <Text style={styles.sectionTitle}>Saved Service Address</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(true)}>
                <Text style={styles.editLinkText}>Change</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.addressRow}
              onPress={() => setShowAddressModal(true)}
              activeOpacity={0.8}
            >
              <View style={styles.addressIconBox}>
                <Ionicons name="location" size={20} color={colors.forestGreen} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressTitle}>Home / Residence</Text>
                <Text style={styles.addressText}>
                  {user?.address || 'No 42, New Kandy Road, Malabe, Colombo'}
                </Text>
              </View>
              <View style={styles.editPencilBtn}>
                <Ionicons name="pencil" size={16} color={colors.forestGreen} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Support & Legal */}
        <View style={styles.menuCard}>
          {!isAdmin && (
            <>
              <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="card-outline" size={20} color={colors.textPrimary} style={styles.menuIcon} />
                <Text style={styles.menuLabel}>Payment Methods (Visa •••• 4892)</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
              <View style={styles.menuDivider} />
            </>
          )}

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} style={styles.menuIcon} />
            <Text style={styles.menuLabel}>Push Notifications & Alerts</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-buoy-outline" size={20} color={colors.textPrimary} style={styles.menuIcon} />
            <Text style={styles.menuLabel}>Fixora Help Center & Support</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textPrimary} style={styles.menuIcon} />
            <Text style={styles.menuLabel}>Privacy & Terms of Service</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Fixora v1.0.0 • Licensed by Fixora Lanka (Pvt) Ltd</Text>
      </ScrollView>

      {/* Address Edit Bottom Modal */}
      <Modal visible={showAddressModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Service Address</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Update your primary address for on-demand home service arrivals in Sri Lanka.
            </Text>

            <Text style={styles.inputLabel}>Street Address & House No</Text>
            <TextInput
              style={styles.textInput}
              value={streetAddress}
              onChangeText={setStreetAddress}
              placeholder="e.g. No 42, New Kandy Road"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>City & District</Text>
            <TextInput
              style={styles.textInput}
              value={cityRegion}
              onChangeText={setCityRegion}
              placeholder="e.g. Malabe, Colombo"
              placeholderTextColor={colors.textMuted}
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowAddressModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveAddress}>
                <Text style={styles.modalSaveText}>Save Address</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Photo Picker Modal */}
      <Modal visible={showPhotoModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Profile Photo</Text>
              <TouchableOpacity onPress={() => setShowPhotoModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>
              Choose a curated profile style or paste an image URL to customize your account.
            </Text>

            <Text style={styles.inputLabel}>Choose Professional Style</Text>
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

            <Text style={[styles.inputLabel, { marginTop: 10 }]}>Or Enter Custom Image URL</Text>
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

            {user?.avatar ? (
              <TouchableOpacity style={styles.clearAvatarBtn} onPress={handleClearAvatar}>
                <Ionicons name="trash-outline" size={16} color="#DC2626" />
                <Text style={[styles.clearAvatarText, { color: '#DC2626' }]}>Remove Custom Photo & Use Initials</Text>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 110,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 18,
    marginBottom: 16,
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
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
    marginTop: 2,
    marginBottom: 6,
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
    color: colors.textSecondary,
    fontWeight: '600',
    marginLeft: 6,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EBF5EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  addressSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  editLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.emerald,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 14,
    lineHeight: 18,
  },
  adminActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forestGreen,
    paddingVertical: 12,
    borderRadius: 12,
  },
  adminActionBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addressIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EBF5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  editPencilBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 20,
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuIcon: {
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
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
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 10,
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
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
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
