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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';

const CATEGORIES = ['Electrician', 'Plumber', 'Cleaner', 'HVAC & AC', 'Carpentry', 'Painting'];

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useContext(AuthContext);

  const handleProviderSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert('Incomplete Form', 'Please enter your business/full name, email, and password.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'The passwords entered do not match.');
      return;
    }

    setIsSubmitting(true);
    const res = await register({
      name,
      email,
      phone: phone || '+94 77 999 8888',
      password,
      role: 'provider',
      category,
      city,
      hourlyRate: Number(hourlyRate) || 700,
    });
    setIsSubmitting(false);

    if (res.success) {
      Alert.alert(
        'Provider Registered',
        'Your profile has been created! You can now manage your availability and receive service requests.',
        [{ text: 'Continue', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] }) }]
      );
    } else {
      Alert.alert('Registration Failed', res.message || 'Could not complete registration.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Provider Registration</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.badgeSection}>
            <View style={styles.badgeCircle}>
              <Ionicons name="construct" size={36} color={colors.forestGreen} />
            </View>
            <Text style={styles.badgeTitle}>Service Provider Sign Up</Text>
            <Text style={styles.badgeSub}>Get discovered by verified customers in your area</Text>
          </View>

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
              />
            </View>

            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter email address"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputBox}>
              <Ionicons name="call-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="+94 7X XXX XXXX"
                placeholderTextColor={colors.textMuted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Category Select Chips */}
            <Text style={styles.inputLabel}>Primary Trade / Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                  onPress={() => setCategory(cat)}
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

            <Text style={styles.inputLabel}>Create Password</Text>
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
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
                <Text style={styles.createBtnText}>Create Account +</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginHighlight}>Log In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  badgeSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  badgeCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.forestGreen,
    marginBottom: 4,
  },
  badgeSub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 14,
    backgroundColor: colors.background,
  },
  inputIcon: {
    marginRight: 10,
  },
  lkrPrefix: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.forestGreen,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  eyeBtn: {
    padding: 6,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  categoryChipActive: {
    backgroundColor: colors.sageGreen,
    borderColor: colors.sageGreen,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  row: {
    flexDirection: 'row',
  },
  createBtn: {
    backgroundColor: colors.emerald,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
    shadowColor: colors.emerald,
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
    paddingVertical: 6,
  },
  loginLinkText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginHighlight: {
    color: colors.forestGreen,
    fontWeight: '700',
  },
});
