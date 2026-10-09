import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';

export default function CustomerSignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarUri, setAvatarUri] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useContext(AuthContext);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Fixora needs photo library access to upload your profile photo.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const permanentUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setAvatarUri(permanentUri);
      }
    } catch (err) {
      console.warn('Image picker error:', err);
      Alert.alert('Image Selection Error', 'Could not open photo library.');
    }
  };

  const handleSignUp = async () => {
    // 1. Name validation
    if (!name.trim()) {
      Alert.alert('Full Name Required', 'Please enter your full name.');
      return;
    }

    // 2. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    // 3. Sri Lankan Phone validation
    const cleanedPhone = phone.trim().replace(/[\s\-]/g, '');
    const phoneRegex = /^(\+94|0)?7[0-9]{8}$/;
    if (!cleanedPhone || !phoneRegex.test(cleanedPhone)) {
      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid Sri Lankan mobile number starting with 07X or +947X (e.g. 0771234567).'
      );
      return;
    }

    // 4. Password validation
    if (!password || password.length < 6) {
      Alert.alert('Password Too Short', 'Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'The passwords entered do not match. Please verify both passwords.');
      return;
    }

    setIsSubmitting(true);
    const res = await register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanedPhone,
      password,
      role: 'customer',
      city: 'Colombo',
      avatar: avatarUri,
    });
    setIsSubmitting(false);

    if (res.success) {
      Alert.alert(
        'Account Created!',
        `Welcome to Fixora, ${res.user?.name || name.trim()}! Your account has been successfully created. Please log in.`,
        [
          {
            text: 'Go to Login',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } else {
      Alert.alert('Registration Failed', res.message || 'Could not complete registration.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Sign Up</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <TouchableOpacity
                style={styles.avatarCircle}
                onPress={handlePickImage}
                activeOpacity={0.8}
              >
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="person" size={40} color={colors.forestGreen} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addPhotoBadge, avatarUri && styles.photoSelectedBadge]}
                onPress={handlePickImage}
                activeOpacity={0.8}
              >
                <Ionicons name={avatarUri ? 'checkmark' : 'camera'} size={15} color={colors.white} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handlePickImage} activeOpacity={0.7}>
              <Text style={styles.avatarHint}>
                {avatarUri ? 'Change Profile Photo' : 'Add Profile Photo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputBox}>
              <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Kasun Perera"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
                returnKeyType="next"
              />
            </View>

            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. kasun@example.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>

            <Text style={styles.inputLabel}>Phone Number (Sri Lanka)</Text>
            <View style={styles.inputBox}>
              <Ionicons name="call-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="077 123 4567 or +94 77..."
                placeholderTextColor={colors.textMuted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                returnKeyType="next"
              />
            </View>

            <Text style={styles.inputLabel}>Password (min 6 characters)</Text>
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Create a strong password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="next"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.inputBox}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Re-enter your password"
                placeholderTextColor={colors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Account Protection Card */}
            <View style={styles.protectionCard}>
              <Ionicons name="shield-checkmark" size={20} color={colors.forestGreen} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.protectionTitle}>Fixora Guarantee</Text>
                <Text style={styles.protectionText}>
                  Verified ratings, transparent pricing, and 100% satisfaction guarantee on all bookings.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.createBtn}
              onPress={handleSignUp}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.createBtnText}>Create Customer Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.bottomSpacer} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 160,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    width: 86,
    height: 86,
    marginBottom: 8,
    position: 'relative',
  },
  avatarCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C7E2D0',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  addPhotoBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.emerald,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    elevation: 3,
  },
  photoSelectedBadge: {
    backgroundColor: colors.forestGreen,
  },
  avatarHint: {
    fontSize: 13,
    color: colors.forestGreen,
    fontWeight: '600',
  },
  form: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
    marginTop: 10,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  eyeBtn: {
    padding: 6,
  },
  protectionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EBF4EE',
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  protectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.forestGreen,
    marginBottom: 2,
  },
  protectionText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  createBtn: {
    backgroundColor: colors.forestGreen,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.forestGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  createBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 40,
  },
});
