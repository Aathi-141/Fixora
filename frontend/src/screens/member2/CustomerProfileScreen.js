import React, { useState, useContext, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
  RefreshControl,
  Switch,
  Linking,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import {
  validatePhoneNumber,
  validateFullName,
  validateAddress,
  validateImageUrl,
  formatPhoneNumber,
} from '../../utils/validation';

export default function CustomerProfileScreen({ navigation }) {
  const { user, logout, updateUser, refreshProfile } = useContext(AuthContext);

  const [refreshing, setRefreshing] = useState(false);
  const [savingField, setSavingField] = useState(null);

  // --- Name Edit Modal ---
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [nameError, setNameError] = useState('');

  // --- Phone Edit Modal ---
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumberInput, setPhoneNumberInput] = useState(user?.phone || '');
  const [phoneError, setPhoneError] = useState('');

  // --- Address Edit Modal ---
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [streetAddress, setStreetAddress] = useState(
    user?.address ? user.address.split(',')[0].trim() : 'No 42, New Kandy Road'
  );
  const [cityRegion, setCityRegion] = useState(
    user?.address && user.address.includes(',')
      ? user.address.split(',').slice(1).join(',').trim()
      : 'Malabe, Colombo'
  );
  const [addressError, setAddressError] = useState('');

  // --- Photo Picker Modal ---
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [photoUrlError, setPhotoUrlError] = useState('');
  const [isPickingImage, setIsPickingImage] = useState(false);

  // Preset Avatars for 1-tap profile selection
  const PRESET_AVATARS = [
    {
      id: 'p1',
      label: 'Casual',
      uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop',
    },
    {
      id: 'p2',
      label: 'Professional',
      uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop',
    },
    {
      id: 'p3',
      label: 'Modern',
      uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop',
    },
  ];

  // --- Payment Methods Modal ---
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'cash'

  // --- Notification Preferences Modal ---
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifServiceUpdates, setNotifServiceUpdates] = useState(true);
  const [notifChat, setNotifChat] = useState(true);
  const [notifReminders, setNotifReminders] = useState(true);
  const [notifPromos, setNotifPromos] = useState(false);

  // --- Help & Support Modal ---
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  // --- Privacy & Terms Modal ---
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Sync state whenever `user` context changes
  useEffect(() => {
    if (user) {
      if (user.name) setNameInput(user.name);
      if (user.phone) setPhoneNumberInput(user.phone);
      if (user.address) {
        const parts = user.address.split(',');
        setStreetAddress(parts[0].trim());
        setCityRegion(parts.slice(1).join(',').trim() || 'Colombo');
      }
    }
  }, [user]);

  // Load preferences from local storage on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const savedPay = await AsyncStorage.getItem('fixora_customer_pay_pref');
      if (savedPay) setPaymentMethod(savedPay);

      const savedNotifs = await AsyncStorage.getItem('fixora_customer_notif_prefs');
      if (savedNotifs) {
        const parsed = JSON.parse(savedNotifs);
        if (parsed.serviceUpdates !== undefined) setNotifServiceUpdates(parsed.serviceUpdates);
        if (parsed.chat !== undefined) setNotifChat(parsed.chat);
        if (parsed.reminders !== undefined) setNotifReminders(parsed.reminders);
        if (parsed.promos !== undefined) setNotifPromos(parsed.promos);
      }
    } catch (e) {
      console.log('Error loading customer preferences:', e);
    }
  };

  // Re-sync with backend on screen focus
  useFocusEffect(
    useCallback(() => {
      if (refreshProfile) {
        refreshProfile();
      }
    }, [])
  );

  const handlePullToRefresh = async () => {
    setRefreshing(true);
    if (refreshProfile) {
      await refreshProfile();
    }
    setRefreshing(false);
  };

  // Helper for user initials avatar
  const getInitials = (fullName) => {
    if (!fullName) return 'FM';
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  // ==================== EDIT NAME LOGIC ====================
  const handleOpenNameModal = () => {
    setNameInput(user?.name || '');
    setNameError('');
    setShowNameModal(true);
  };

  const handleSaveName = async () => {
    const valResult = validateFullName(nameInput);
    if (!valResult.isValid) {
      setNameError(valResult.error);
      return;
    }

    setNameError('');
    setSavingField('name');

    try {
      if (updateUser) {
        const res = await updateUser({ name: valResult.formatted });
        if (res && res.success === false) {
          Alert.alert('Update Failed', res.message || 'Could not update name.');
          setSavingField(null);
          return;
        }
      }
      setShowNameModal(false);
      Alert.alert('Name Updated', 'Your full name has been updated successfully.');
    } catch (err) {
      Alert.alert('Error', err.message || 'An error occurred while saving.');
    } finally {
      setSavingField(null);
    }
  };

  // ==================== EDIT PHONE LOGIC ====================
  const handleOpenPhoneModal = () => {
    setPhoneNumberInput(user?.phone || '');
    setPhoneError('');
    setShowPhoneModal(true);
  };

  const handlePhoneInputChange = (text) => {
    setPhoneNumberInput(text);
    if (phoneError) {
      const val = validatePhoneNumber(text);
      if (val.isValid) setPhoneError('');
    }
  };

  const handleSavePhone = async () => {
    const valResult = validatePhoneNumber(phoneNumberInput);
    if (!valResult.isValid) {
      setPhoneError(valResult.error);
      return;
    }

    setPhoneError('');
    setSavingField('phone');

    try {
      if (updateUser) {
        const res = await updateUser({ phone: valResult.formatted });
        if (res && res.success === false) {
          Alert.alert('Update Failed', res.message || 'Could not update contact number.');
          setSavingField(null);
          return;
        }
      }
      setShowPhoneModal(false);
      Alert.alert(
        'Phone Number Updated',
        `Your contact phone number has been updated to ${valResult.formatted}.`
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update phone number.');
    } finally {
      setSavingField(null);
    }
  };

  // ==================== EDIT ADDRESS LOGIC ====================
  const handleOpenAddressModal = () => {
    if (user?.address) {
      const parts = user.address.split(',');
      setStreetAddress(parts[0].trim());
      setCityRegion(parts.slice(1).join(',').trim() || 'Malabe, Colombo');
    }
    setAddressError('');
    setShowAddressModal(true);
  };

  const handleSaveAddress = async () => {
    const valResult = validateAddress(streetAddress, cityRegion);
    if (!valResult.isValid) {
      setAddressError(valResult.error);
      return;
    }

    setAddressError('');
    setSavingField('address');

    try {
      if (updateUser) {
        const res = await updateUser({ address: valResult.formatted });
        if (res && res.success === false) {
          Alert.alert('Update Failed', res.message || 'Could not update address.');
          setSavingField(null);
          return;
        }
      }
      setShowAddressModal(false);
      Alert.alert(
        'Service Address Saved',
        `Your primary home service address has been updated to: \n${valResult.formatted}`
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update address.');
    } finally {
      setSavingField(null);
    }
  };

  // ==================== AVATAR / PHOTO LOGIC ====================
  const handleSelectAvatar = async (uri) => {
    setSavingField('avatar');
    try {
      if (updateUser) {
        await updateUser({ avatar: uri });
      }
      setShowPhotoModal(false);
      Alert.alert('Profile Photo Updated', 'Your profile picture has been updated and saved.');
    } catch (e) {
      Alert.alert('Error', 'Could not save profile photo.');
    } finally {
      setSavingField(null);
    }
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
      Alert.alert('Selection Error', 'Could not select photo from device gallery.');
    } finally {
      setIsPickingImage(false);
    }
  };

  const handleSaveCustomPhotoUrl = async () => {
    const valResult = validateImageUrl(photoUrlInput);
    if (!valResult.isValid) {
      setPhotoUrlError(valResult.error);
      return;
    }

    setPhotoUrlError('');
    await handleSelectAvatar(photoUrlInput.trim());
    setPhotoUrlInput('');
  };

  const handleClearAvatar = async () => {
    setSavingField('avatar');
    try {
      if (updateUser) {
        await updateUser({ avatar: null });
      }
      setShowPhotoModal(false);
      Alert.alert('Default Initials Set', 'Your profile will now show your initials badge.');
    } catch (e) {
      Alert.alert('Error', 'Could not clear avatar.');
    } finally {
      setSavingField(null);
    }
  };

  // ==================== PAYMENT METHODS MODAL LOGIC ====================
  const handleSavePaymentMethod = async (method) => {
    setPaymentMethod(method);
    try {
      await AsyncStorage.setItem('fixora_customer_pay_pref', method);
      Alert.alert(
        'Default Payment Method Saved',
        method === 'card'
          ? 'Primary payment set to Visa Debit / Credit (•••• 4892).'
          : 'Primary payment set to Cash on Service Completion (LKR).'
      );
    } catch (e) {
      console.log('Error saving payment pref:', e);
    }
  };

  // ==================== NOTIFICATIONS LOGIC ====================
  const handleSaveNotifications = async () => {
    const prefs = {
      serviceUpdates: notifServiceUpdates,
      chat: notifChat,
      reminders: notifReminders,
      promos: notifPromos,
    };
    try {
      await AsyncStorage.setItem('fixora_customer_notif_prefs', JSON.stringify(prefs));
      setShowNotifModal(false);
      Alert.alert('Preferences Saved', 'Your notification settings have been updated.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save notification preferences.');
    }
  };

  // ==================== LOGOUT LOGIC ====================
  const handleLogout = () => {
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

  const isAdmin = user?.role === 'admin';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAF9" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handlePullToRefresh}
            colors={[colors.forestGreen]}
            tintColor={colors.forestGreen}
          />
        }
      >
        {/* Header Title */}
        <View style={styles.screenHeader}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <Text style={styles.headerSub}>Manage your account details and service preferences</Text>
        </View>

        {/* Profile Card */}
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.name || (isAdmin ? 'Admin' : 'Fixora Member')}
              </Text>
              <TouchableOpacity
                onPress={handleOpenNameModal}
                style={styles.nameEditPencil}
                activeOpacity={0.7}
              >
                <Ionicons name="pencil" size={14} color={colors.forestGreen} />
              </TouchableOpacity>
            </View>

            <View style={styles.emailRow}>
              <Ionicons name="mail-outline" size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={styles.userEmail} numberOfLines={1}>
                {user?.email || 'member@fixora.lk'}
              </Text>
            </View>

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
                name={isAdmin ? 'shield-checkmark' : 'shield-checkmark'}
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

        {/* Quick Action: Jump to Bookings Tab */}
        {!isAdmin && (
          <TouchableOpacity
            style={styles.quickBookingsBanner}
            onPress={() => navigation.navigate('BookingsTab')}
            activeOpacity={0.85}
          >
            <View style={styles.quickBookingsIconBox}>
              <Ionicons name="calendar" size={20} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.quickBookingsTitle}>My Service Bookings</Text>
              <Text style={styles.quickBookingsSub}>
                View active appointments, track technician ETA, and see history
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.forestGreen} />
          </TouchableOpacity>
        )}

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
          /* Contact & Service Details Section */
          <View style={styles.sectionCard}>
            <View style={styles.addressSectionHeader}>
              <Text style={styles.sectionTitle}>Contact & Service Details</Text>
              <Text style={styles.sectionNote}>Tap any item to edit</Text>
            </View>

            {/* Full Name Row */}
            <TouchableOpacity
              style={styles.addressRow}
              onPress={handleOpenNameModal}
              activeOpacity={0.8}
            >
              <View style={styles.addressIconBox}>
                <Ionicons name="person" size={18} color={colors.forestGreen} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressTitle}>Full Name</Text>
                <Text style={styles.addressText}>{user?.name || 'Kasun Perera'}</Text>
              </View>
              <View style={styles.editPencilBtn}>
                <Ionicons name="pencil" size={15} color={colors.forestGreen} />
              </View>
            </TouchableOpacity>

            <View style={styles.fieldDivider} />

            {/* Contact Phone Row with Validation & Format */}
            <TouchableOpacity
              style={styles.addressRow}
              onPress={handleOpenPhoneModal}
              activeOpacity={0.8}
            >
              <View style={styles.addressIconBox}>
                <Ionicons name="call" size={18} color={colors.forestGreen} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressTitle}>Contact Phone Number</Text>
                <Text style={styles.addressText}>
                  {user?.phone ? formatPhoneNumber(user.phone) : '+94 77 123 4567'}
                </Text>
                <Text style={styles.phoneVerifiedHint}>✓ Used for arrival calls & SMS OTPs</Text>
              </View>
              <View style={styles.editPencilBtn}>
                <Ionicons name="pencil" size={15} color={colors.forestGreen} />
              </View>
            </TouchableOpacity>

            <View style={styles.fieldDivider} />

            {/* Service Address Row */}
            <TouchableOpacity
              style={styles.addressRow}
              onPress={handleOpenAddressModal}
              activeOpacity={0.8}
            >
              <View style={styles.addressIconBox}>
                <Ionicons name="location" size={18} color={colors.forestGreen} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressTitle}>Home / Service Address</Text>
                <Text style={styles.addressText}>
                  {user?.address || 'No 42, New Kandy Road, Malabe, Colombo'}
                </Text>
                <Text style={styles.phoneVerifiedHint}>Default arrival location for home repairs</Text>
              </View>
              <View style={styles.editPencilBtn}>
                <Ionicons name="pencil" size={15} color={colors.forestGreen} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Account Settings & Support Menu */}
        <View style={styles.menuCard}>
          {!isAdmin && (
            <>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setShowPaymentModal(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="card-outline" size={20} color={colors.forestGreen} style={styles.menuIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuLabel}>Payment Methods</Text>
                  <Text style={styles.menuSubLabel}>
                    {paymentMethod === 'card'
                      ? 'Visa Debit •••• 4892 (Default)'
                      : 'Cash on Delivery (Default)'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>

              <View style={styles.menuDivider} />
            </>
          )}

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowNotifModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.forestGreen} style={styles.menuIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Push Notifications & Alerts</Text>
              <Text style={styles.menuSubLabel}>Manage arrival reminders & SMS updates</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowHelpModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="help-buoy-outline" size={20} color={colors.forestGreen} style={styles.menuIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Fixora Help Center & Support</Text>
              <Text style={styles.menuSubLabel}>24/7 Hotline, WhatsApp & Sri Lanka FAQs</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowTermsModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="shield-outline" size={20} color={colors.forestGreen} style={styles.menuIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Privacy & Terms of Service</Text>
              <Text style={styles.menuSubLabel}>Data protection & Fixora service guarantees</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>
          Fixora v1.0.0 • Licensed by Fixora Lanka (Pvt) Ltd • Colombo, Sri Lanka
        </Text>
      </ScrollView>

      {/* ========================================================= */}
      {/* 1. EDIT FULL NAME MODAL                                  */}
      {/* ========================================================= */}
      <Modal visible={showNameModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Full Name</Text>
              <TouchableOpacity onPress={() => setShowNameModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Please enter your official name. This will appear on your service tickets and technician job sheets.
            </Text>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={[styles.textInput, nameError ? styles.textInputError : null]}
              value={nameInput}
              onChangeText={(text) => {
                setNameInput(text);
                if (nameError) setNameError('');
              }}
              placeholder="e.g. Kasun Perera"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
            />
            {nameError ? <Text style={styles.errorText}>⚠ {nameError}</Text> : null}

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowNameModal(false)}
                disabled={savingField === 'name'}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveName}
                disabled={savingField === 'name'}
                activeOpacity={0.85}
              >
                {savingField === 'name' ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.modalSaveText}>Save Name</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* 2. EDIT PHONE NUMBER MODAL (WITH LIVE VALIDATION)        */}
      {/* ========================================================= */}
      <Modal visible={showPhoneModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Contact Number</Text>
              <TouchableOpacity onPress={() => setShowPhoneModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Enter your mobile or contact phone number for home service coordination and OTP verification.
            </Text>

            {/* Format Instructions Box */}
            <View style={styles.formatHintBox}>
              <Ionicons name="information-circle-outline" size={18} color={colors.forestGreen} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.formatHintTitle}>Accepted Sri Lankan & International Formats:</Text>
                <Text style={styles.formatHintText}>• Local: 077 123 4567 or 011 234 5678 (10 digits)</Text>
                <Text style={styles.formatHintText}>• International: +94 77 123 4567 or +1 415 555 2671</Text>
              </View>
            </View>

            <Text style={styles.inputLabel}>Mobile / Contact Phone</Text>
            <TextInput
              style={[styles.textInput, phoneError ? styles.textInputError : null]}
              value={phoneNumberInput}
              onChangeText={handlePhoneInputChange}
              placeholder="e.g. 077 123 4567 or +94 77 123 4567"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />
            {phoneError ? <Text style={styles.errorText}>⚠ {phoneError}</Text> : null}

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowPhoneModal(false)}
                disabled={savingField === 'phone'}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSavePhone}
                disabled={savingField === 'phone'}
                activeOpacity={0.85}
              >
                {savingField === 'phone' ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.modalSaveText}>Save Number</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* 3. EDIT ADDRESS MODAL                                    */}
      {/* ========================================================= */}
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
              style={[styles.textInput, addressError ? styles.textInputError : null]}
              value={streetAddress}
              onChangeText={(text) => {
                setStreetAddress(text);
                if (addressError) setAddressError('');
              }}
              placeholder="e.g. No 42, New Kandy Road"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>City & District</Text>
            <TextInput
              style={[styles.textInput, addressError ? styles.textInputError : null]}
              value={cityRegion}
              onChangeText={(text) => {
                setCityRegion(text);
                if (addressError) setAddressError('');
              }}
              placeholder="e.g. Malabe, Colombo"
              placeholderTextColor={colors.textMuted}
            />

            {addressError ? <Text style={styles.errorText}>⚠ {addressError}</Text> : null}

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowAddressModal(false)}
                disabled={savingField === 'address'}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveAddress}
                disabled={savingField === 'address'}
                activeOpacity={0.85}
              >
                {savingField === 'address' ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.modalSaveText}>Save Address</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* 4. PHOTO PICKER MODAL                                    */}
      {/* ========================================================= */}
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
              Select a photo from your gallery, pick a preset avatar, or paste an image link.
            </Text>

            {/* Gallery Upload Option */}
            <TouchableOpacity
              style={styles.galleryUploadBtn}
              onPress={handlePickFromGallery}
              disabled={isPickingImage || savingField === 'avatar'}
              activeOpacity={0.85}
            >
              {isPickingImage || savingField === 'avatar' ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Ionicons name="images-outline" size={20} color={colors.white} style={{ marginRight: 8 }} />
                  <Text style={styles.galleryUploadBtnText}>Choose from Device Gallery</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Preset Avatars */}
            <Text style={[styles.inputLabel, { marginTop: 4 }]}>Or Choose a Preset Avatar</Text>
            <View style={styles.presetGrid}>
              {PRESET_AVATARS.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={styles.presetItem}
                  onPress={() => handleSelectAvatar(preset.uri)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: preset.uri }} style={styles.presetImg} />
                  <Text style={styles.presetLabel}>{preset.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.orDividerContainer}>
              <View style={styles.orDividerLine} />
              <Text style={styles.orDividerText}>OR PASTE IMAGE URL</Text>
              <View style={styles.orDividerLine} />
            </View>

            <Text style={styles.inputLabel}>Profile Photo Image URL</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <TextInput
                style={[styles.textInput, { flex: 1 }, photoUrlError ? styles.textInputError : null]}
                value={photoUrlInput}
                onChangeText={(text) => {
                  setPhotoUrlInput(text);
                  if (photoUrlError) setPhotoUrlError('');
                }}
                placeholder="https://... photo link"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.modalSaveBtn, { justifyContent: 'center' }]}
                onPress={handleSaveCustomPhotoUrl}
                disabled={savingField === 'avatar'}
                activeOpacity={0.85}
              >
                {savingField === 'avatar' ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.modalSaveText}>Apply</Text>
                )}
              </TouchableOpacity>
            </View>
            {photoUrlError ? <Text style={styles.errorText}>⚠ {photoUrlError}</Text> : null}

            {user?.avatar ? (
              <TouchableOpacity
                style={styles.clearAvatarBtn}
                onPress={handleClearAvatar}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={16} color="#DC2626" />
                <Text style={styles.clearAvatarText}>Remove Custom Photo & Use Initials</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* 5. PAYMENT METHODS MODAL                                 */}
      {/* ========================================================= */}
      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment Methods</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Select your default payment method for home service bookings in Sri Lanka.
            </Text>

            {/* Option 1: Credit / Debit Card */}
            <TouchableOpacity
              style={[
                styles.paymentOptionCard,
                paymentMethod === 'card' && styles.paymentOptionCardActive,
              ]}
              onPress={() => handleSavePaymentMethod('card')}
              activeOpacity={0.85}
            >
              <View style={styles.paymentOptionIconBox}>
                <Ionicons name="card" size={22} color={colors.forestGreen} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentOptionTitle}>Visa Debit / Credit Card</Text>
                <Text style={styles.paymentOptionSub}>•••• •••• •••• 4892 • Exp 08/28</Text>
                <View style={styles.verifiedRowSmall}>
                  <Ionicons name="shield-checkmark" size={12} color={colors.forestGreen} style={{ marginRight: 3 }} />
                  <Text style={styles.verifiedTextSmall}>CBSL Regulated Gateway</Text>
                </View>
              </View>
              <Ionicons
                name={paymentMethod === 'card' ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={paymentMethod === 'card' ? colors.forestGreen : colors.textMuted}
              />
            </TouchableOpacity>

            {/* Option 2: Cash on Delivery */}
            <TouchableOpacity
              style={[
                styles.paymentOptionCard,
                paymentMethod === 'cash' && styles.paymentOptionCardActive,
                { marginTop: 12 },
              ]}
              onPress={() => handleSavePaymentMethod('cash')}
              activeOpacity={0.85}
            >
              <View style={[styles.paymentOptionIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="cash" size={22} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentOptionTitle}>Cash on Service Completion</Text>
                <Text style={styles.paymentOptionSub}>Pay physical cash in LKR directly to provider</Text>
              </View>
              <Ionicons
                name={paymentMethod === 'cash' ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={paymentMethod === 'cash' ? colors.forestGreen : colors.textMuted}
              />
            </TouchableOpacity>

            {/* Security Guarantee Box */}
            <View style={styles.securityBox}>
              <Ionicons name="lock-closed" size={15} color={colors.forestGreen} style={{ marginRight: 6 }} />
              <Text style={styles.securityBoxText}>
                Encrypted with 256-bit SSL. Fixora never stores sensitive CVV or card PINs.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.modalSaveBtn, { marginTop: 18, alignItems: 'center' }]}
              onPress={() => setShowPaymentModal(false)}
            >
              <Text style={styles.modalSaveText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* 6. NOTIFICATION PREFERENCES MODAL                        */}
      {/* ========================================================= */}
      <Modal visible={showNotifModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notification Preferences</Text>
              <TouchableOpacity onPress={() => setShowNotifModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Customize which notifications you wish to receive for service appointments.
            </Text>

            <View style={styles.notifRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>Service Status Updates</Text>
                <Text style={styles.notifDesc}>Alerts when provider is "On The Way" or completed</Text>
              </View>
              <Switch
                value={notifServiceUpdates}
                onValueChange={setNotifServiceUpdates}
                trackColor={{ false: '#D1D5DB', true: colors.sageGreen }}
                thumbColor={notifServiceUpdates ? colors.forestGreen : '#F3F4F6'}
              />
            </View>

            <View style={styles.menuDivider} />

            <View style={styles.notifRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>In-App Chat Alerts</Text>
                <Text style={styles.notifDesc}>Notifications when your technician sends a message</Text>
              </View>
              <Switch
                value={notifChat}
                onValueChange={setNotifChat}
                trackColor={{ false: '#D1D5DB', true: colors.sageGreen }}
                thumbColor={notifChat ? colors.forestGreen : '#F3F4F6'}
              />
            </View>

            <View style={styles.menuDivider} />

            <View style={styles.notifRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>Booking Reminders</Text>
                <Text style={styles.notifDesc}>Reminder alert 1 hour prior to scheduled window</Text>
              </View>
              <Switch
                value={notifReminders}
                onValueChange={setNotifReminders}
                trackColor={{ false: '#D1D5DB', true: colors.sageGreen }}
                thumbColor={notifReminders ? colors.forestGreen : '#F3F4F6'}
              />
            </View>

            <View style={styles.menuDivider} />

            <View style={styles.notifRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>Promotions & Discounts</Text>
                <Text style={styles.notifDesc}>Exclusive Fixora seasonal coupons and vouchers</Text>
              </View>
              <Switch
                value={notifPromos}
                onValueChange={setNotifPromos}
                trackColor={{ false: '#D1D5DB', true: colors.sageGreen }}
                thumbColor={notifPromos ? colors.forestGreen : '#F3F4F6'}
              />
            </View>

            <TouchableOpacity
              style={[styles.modalSaveBtn, { marginTop: 22, alignItems: 'center' }]}
              onPress={handleSaveNotifications}
            >
              <Text style={styles.modalSaveText}>Save Notification Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* 7. HELP CENTER & SUPPORT MODAL                            */}
      {/* ========================================================= */}
      <Modal visible={showHelpModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Help Center & Support</Text>
              <TouchableOpacity onPress={() => setShowHelpModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSub}>
                Need assistance with a booking or technician? Our Colombo-based support team is available 24/7.
              </Text>

              {/* Direct Support Buttons */}
              <View style={styles.supportButtonGrid}>
                <TouchableOpacity
                  style={styles.supportBtn}
                  onPress={() => Linking.openURL('tel:+94112345678')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={22} color={colors.forestGreen} />
                  <Text style={styles.supportBtnTitle}>Call Hotline</Text>
                  <Text style={styles.supportBtnSub}>+94 11 234 5678</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.supportBtn}
                  onPress={() => Linking.openURL('https://wa.me/94771234567')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-whatsapp" size={22} color="#16A34A" />
                  <Text style={styles.supportBtnTitle}>WhatsApp</Text>
                  <Text style={styles.supportBtnSub}>Live Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.supportBtn}
                  onPress={() => Linking.openURL('mailto:support@fixora.lk')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="mail" size={22} color="#2563EB" />
                  <Text style={styles.supportBtnTitle}>Email Support</Text>
                  <Text style={styles.supportBtnSub}>support@fixora.lk</Text>
                </TouchableOpacity>
              </View>

              {/* Expandable FAQs */}
              <Text style={[styles.inputLabel, { marginTop: 16, marginBottom: 8 }]}>
                Frequently Asked Questions:
              </Text>

              {/* FAQ 1 */}
              <TouchableOpacity
                style={styles.faqCard}
                onPress={() => setExpandedFaq(expandedFaq === 'faq1' ? null : 'faq1')}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>How do I cancel or reschedule a booking?</Text>
                  <Ionicons
                    name={expandedFaq === 'faq1' ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </View>
                {expandedFaq === 'faq1' && (
                  <Text style={styles.faqAnswer}>
                    Go to the Bookings tab, select your ongoing service request, and tap "Reschedule / Cancel". Free cancellation applies up to 2 hours before the scheduled time slot.
                  </Text>
                )}
              </TouchableOpacity>

              {/* FAQ 2 */}
              <TouchableOpacity
                style={styles.faqCard}
                onPress={() => setExpandedFaq(expandedFaq === 'faq2' ? null : 'faq2')}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>How are Fixora service providers verified?</Text>
                  <Ionicons
                    name={expandedFaq === 'faq2' ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </View>
                {expandedFaq === 'faq2' && (
                  <Text style={styles.faqAnswer}>
                    All technicians undergo comprehensive background screening, National Identity Card (NIC) verification, and trade license audits before being authorized on Fixora.
                  </Text>
                )}
              </TouchableOpacity>

              {/* FAQ 3 */}
              <TouchableOpacity
                style={styles.faqCard}
                onPress={() => setExpandedFaq(expandedFaq === 'faq3' ? null : 'faq3')}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>What payment methods are supported in Sri Lanka?</Text>
                  <Ionicons
                    name={expandedFaq === 'faq3' ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </View>
                {expandedFaq === 'faq3' && (
                  <Text style={styles.faqAnswer}>
                    Fixora accepts all local Sri Lankan Visa and Mastercard credit/debit cards, as well as physical Cash on Delivery directly to the technician once work is inspected and completed.
                  </Text>
                )}
              </TouchableOpacity>

              {/* FAQ 4 */}
              <TouchableOpacity
                style={styles.faqCard}
                onPress={() => setExpandedFaq(expandedFaq === 'faq4' ? null : 'faq4')}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>What is the Fixora 7-Day Guarantee?</Text>
                  <Ionicons
                    name={expandedFaq === 'faq4' ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </View>
                {expandedFaq === 'faq4' && (
                  <Text style={styles.faqAnswer}>
                    If an issue recurs within 7 days of service completion, the provider will return to fix it at zero additional labor fee or Fixora will issue a full refund.
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSaveBtn, { marginTop: 18, alignItems: 'center' }]}
                onPress={() => setShowHelpModal(false)}
              >
                <Text style={styles.modalSaveText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* 8. PRIVACY & TERMS OF SERVICE MODAL                       */}
      {/* ========================================================= */}
      <Modal visible={showTermsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Privacy & Terms of Service</Text>
              <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSub}>
                Fixora Lanka (Pvt) Ltd • Terms effective October 2026
              </Text>

              <Text style={styles.termsHeading}>1. User Privacy & Data Protection</Text>
              <Text style={styles.termsParagraph}>
                Fixora respects your privacy in compliance with Sri Lanka's Personal Data Protection Act No. 9 of 2022. Your home address and contact phone number are only disclosed to the specific service provider assigned to your confirmed booking.
              </Text>

              <Text style={styles.termsHeading}>2. Service Provider Code of Conduct</Text>
              <Text style={styles.termsParagraph}>
                All Fixora service providers are certified independent professionals. They adhere to strict professional guidelines, punctuality standards, and respect customer property at all times.
              </Text>

              <Text style={styles.termsHeading}>3. Transparent Invoicing & LKR Currency</Text>
              <Text style={styles.termsParagraph}>
                All prices and service add-ons quoted on Fixora are denominated in Sri Lankan Rupees (LKR) with zero hidden fees. Customers receive itemized digital tax invoices upon payment.
              </Text>

              <Text style={styles.termsHeading}>4. Dispute Resolution & Refunds</Text>
              <Text style={styles.termsParagraph}>
                In the rare event of an unresolved dispute between a customer and provider, Fixora support mediation ensures fair resolution and automated refunds to the original payment method within 3 business days.
              </Text>

              <TouchableOpacity
                style={[styles.modalSaveBtn, { marginTop: 20, alignItems: 'center' }]}
                onPress={() => setShowTermsModal(false)}
              >
                <Text style={styles.modalSaveText}>I Understand</Text>
              </TouchableOpacity>
            </ScrollView>
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
  screenHeader: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 18,
    borderRadius: 20,
    marginBottom: 14,
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: colors.sageGreen,
  },
  initialsAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.forestGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.sageGreen,
  },
  initialsText: {
    fontSize: 24,
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
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    maxWidth: '85%',
  },
  nameEditPencil: {
    marginLeft: 8,
    padding: 4,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textSecondary,
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
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EBF5EE',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 16,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.forestGreen,
    letterSpacing: 0.4,
  },
  quickBookingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5EE',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.sageGreen,
  },
  quickBookingsIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.forestGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickBookingsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  quickBookingsSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
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
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  sectionNote: {
    fontSize: 11,
    color: colors.emerald,
    fontWeight: '600',
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
  fieldDivider: {
    height: 1,
    backgroundColor: '#EDF2EE',
    marginVertical: 10,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
    padding: 13,
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
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 1,
  },
  addressText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  phoneVerifiedHint: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  editPencilBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 18,
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  menuIcon: {
    marginRight: 14,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  menuSubLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F2',
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
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 10,
  },
  // Modal Common Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 14,
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
  textInputError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  formatHintBox: {
    flexDirection: 'row',
    backgroundColor: '#EBF5EE',
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.sageGreen,
  },
  formatHintTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.forestGreen,
    marginBottom: 2,
  },
  formatHintText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
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
  galleryUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forestGreen,
    paddingVertical: 13,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: colors.forestGreen,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 3,
  },
  galleryUploadBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  presetGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  presetItem: {
    alignItems: 'center',
  },
  presetImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.sageGreen,
    marginBottom: 4,
  },
  presetLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  orDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
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
  clearAvatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    marginTop: 14,
  },
  clearAvatarText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
    marginLeft: 6,
  },
  paymentOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  paymentOptionCardActive: {
    borderColor: colors.forestGreen,
    backgroundColor: '#EBF5EE',
  },
  paymentOptionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  paymentOptionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  verifiedRowSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  verifiedTextSmall: {
    fontSize: 10,
    color: colors.forestGreen,
    fontWeight: '600',
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 10,
    marginTop: 14,
  },
  securityBoxText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  notifDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  supportButtonGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  supportBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 3,
  },
  supportBtnTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
  },
  supportBtnSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  faqCard: {
    backgroundColor: '#F8FAF9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    paddingRight: 8,
  },
  faqAnswer: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    lineHeight: 17,
  },
  termsHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.forestGreen,
    marginTop: 12,
    marginBottom: 4,
  },
  termsParagraph: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
});
