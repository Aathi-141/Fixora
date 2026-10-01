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

export default function CustomerSignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useContext(AuthContext);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert('Incomplete Form', 'Please provide your full name, email, and password.');
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
      phone: phone || '+94 77 123 4567',
      password,
      role: 'customer',
      city: 'Colombo',
    });
    setIsSubmitting(false);

    if (res.success) {
      Alert.alert('Account Created', 'Welcome to Fixora! Your account has been registered.', [
        {
          text: 'Continue',
          onPress: () => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] }),
        },
      ]);
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
        {/* Top App Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customer Sign Up</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Avatar Placeholder */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={40} color={colors.forestGreen} />
              <TouchableOpacity style={styles.addPhotoBadge}>
                <Ionicons name="camera" size={16} color={colors.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarHint}>Add Profile Photo</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputBox}>
              <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
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
                placeholder="Enter your email"
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

            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Create a password"
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
                placeholder="Re-enter your password"
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

            {/* Account Protection Card */}
            <View style={styles.protectionCard}>
              <Ionicons name="shield-checkmark" size={20} color={colors.forestGreen} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.protectionTitle}>Account Protection</Text>
                <Text style={styles.protectionText}>
                  Verified ratings, transparent pricing, and 100% satisfaction guarantee on all service calls.
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
                <Text style={styles.createBtnText}>Create Account +</Text>
              )}
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 6,
  },
  addPhotoBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.emerald,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarHint: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
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
    alignItems: 'center',
    backgroundColor: '#EBF4EE',
    padding: 12,
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 20,
  },
  protectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  protectionText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  createBtn: {
    backgroundColor: colors.emerald,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
});
