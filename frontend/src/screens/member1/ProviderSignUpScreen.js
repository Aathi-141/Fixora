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

const CATEGORIES = ['Electrician', 'Plumber', 'Cleaner', 'AC Technician', 'Carpenter', 'Painter'];

export default function ProviderSignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Electrician');
  const [city, setCity] = useState('Colombo');
  const [hourlyRate, setHourlyRate] = useState('700');
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
          'Fixora needs photo library access to upload your business/profile photo.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Image picker error:', err);
      Alert.alert('Image Selection Error', 'Could not open photo library.');
    }
  };

  const handleProviderSignUp = async () => {
    // 1. Name validation
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter your business or full name.');
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
      Alert.alert('Password Mismatch', 'The passwords entered do not match. Please re-check.');
      return;
    }

    setIsSubmitting(true);
    const res = await register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanedPhone,
      password,
      role: 'provider',
      category,
      city: city.trim() || 'Colombo',
      hourlyRate: Number(hourlyRate) || 700,
      avatar: avatarUri,
    });
    setIsSubmitting(false);

    if (res.success) {
      Alert.alert(
        'Provider Account Created!',
        `Welcome to Fixora, ${res.user?.name || name.trim()}! Your account has been successfully created. Please log in.`,
        [{ text: 'Go to Login', onPress: () => navigation.navigate('Login') }]
      );
    } else {
      Alert.alert('Registration Failed', res.message || 'Could not complete registration.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Registration</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled={true}
        >
          {/* Header Banner & Photo Placeholder */}
          <View style={styles.badgeSection}>
            <View style={styles.badgeWrapper}>
              <TouchableOpacity
                style={styles.badgeCircle}
                onPress={handlePickImage}
                activeOpacity={0.8}
              >
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="construct" size={38} color={colors.forestGreen} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addPhotoBadge, avatarUri && styles.photoSelectedBadge]}
                onPress={handlePickImage}
                activeOpacity={0.8}
              >
                <Ionicons name={avatarUri ? 'checkmark' : 'camera'} size={14} color={colors.white} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handlePickImage} activeOpacity={0.7}>
              <Text style={styles.photoHintText}>
                {avatarUri ? 'Change Profile Photo' : 'Add Profile / Business Photo'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.badgeTitle}>Service Provider Registration</Text>
            <Text style={styles.badgeSub}>Get discovered by verified customers in your area</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.inputLabel}>Full Name / Business Name</Text>
            <View style={styles.inputBox}>
              <Ionicons name="business-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Ramesh Electrical Services"
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
                placeholder="e.g. provider@fixora.lk"
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

            {/* Category Select Chips */}
            <Text style={styles.inputLabel}>Primary Trade / Specialty</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.inputLabel}>Operating City</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="location-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Colombo"
                    placeholderTextColor={colors.textMuted}
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.inputLabel}>Hourly Rate (LKR)</Text>
                <View style={styles.inputBox}>
                  <Text style={styles.lkrPrefix}>Rs.</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="700"
                    placeholderTextColor={colors.textMuted}
                    value={hourlyRate}
                    onChangeText={setHourlyRate}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <Text style={styles.inputLabel}>Create Password (min 6 chars)</Text>
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
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
                placeholder="Re-enter password"
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

            <TouchableOpacity
              style={styles.createBtn}
              onPress={handleProviderSignUp}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.createBtnText}>Create Provider Account +</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginHighlight}>Log In</Text>
              </Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
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
    paddingTop: 16,
    paddingBottom: 160,
    flexGrow: 1,
  },
  badgeSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  badgeWrapper: {
    width: 82,
    height: 82,
    marginBottom: 6,
    position: 'relative',
  },
  badgeCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
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
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    elevation: 3,
  },
  photoSelectedBadge: {
    backgroundColor: colors.forestGreen,
  },
  photoHintText: {
    fontSize: 13,
    color: colors.forestGreen,
    fontWeight: '600',
    marginBottom: 8,
  },
  badgeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  badgeSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
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
    fontSize: 14,
    color: colors.textPrimary,
  },
  eyeBtn: {
    padding: 6,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: colors.forestGreen,
    borderColor: colors.forestGreen,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
  },
  lkrPrefix: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.forestGreen,
    marginRight: 6,
  },
  createBtn: {
    backgroundColor: colors.forestGreen,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
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
  loginLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  loginLinkText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginHighlight: {
    color: colors.forestGreen,
    fontWeight: '800',
  },
});
