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
import { colors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('kasun@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, googleLogin } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Required', 'Please fill in both email and password.');
      return;
    }
    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } else {
      Alert.alert('Login Failed', res.message || 'Please check your credentials.');
    }
  };

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    const res = await googleLogin('customer');
    setIsSubmitting(false);
    if (res.success) {
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } else {
      Alert.alert('Google Sign-In', res.message || 'Google authentication failed.');
    }
  };

  const setRoleCredentials = (role) => {
    if (role === 'customer') {
      setEmail('kasun@gmail.com');
      setPassword('password123');
    } else if (role === 'provider') {
      setEmail('ramesh@fixora.lk');
      setPassword('password123');
    } else if (role === 'admin') {
      setEmail('admin@fixora.lk');
      setPassword('password123');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Brand */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Welcome to Fixora</Text>
            <Text style={styles.subtitle}>Log in to manage and book services</Text>
          </View>

          {/* Quick Demo Role Selector */}
          <View style={styles.roleChipsCard}>
            <Text style={styles.roleChipsTitle}>Select Account Role for Quick Login:</Text>
            <View style={styles.roleChipsRow}>
              <TouchableOpacity
                style={[styles.roleChip, email === 'kasun@gmail.com' && styles.roleChipActive]}
                onPress={() => setRoleCredentials('customer')}
              >
                <Ionicons
                  name="person"
                  size={14}
                  color={email === 'kasun@gmail.com' ? colors.white : colors.forestGreen}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.roleChipText, email === 'kasun@gmail.com' && styles.roleChipTextActive]}>
                  Customer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleChip, email === 'ramesh@fixora.lk' && styles.roleChipActive]}
                onPress={() => setRoleCredentials('provider')}
              >
                <Ionicons
                  name="construct"
                  size={14}
                  color={email === 'ramesh@fixora.lk' ? colors.white : colors.forestGreen}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.roleChipText, email === 'ramesh@fixora.lk' && styles.roleChipTextActive]}>
                  Provider
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleChip, email === 'admin@fixora.lk' && styles.roleChipActive]}
                onPress={() => setRoleCredentials('admin')}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={14}
                  color={email === 'admin@fixora.lk' ? colors.white : colors.forestGreen}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.roleChipText, email === 'admin@fixora.lk' && styles.roleChipTextActive]}>
                  Admin
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.inputLabel}>Email Address or Mobile Number</Text>
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter email or phone"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassBtn}>
              <Text style={styles.forgotPassText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.loginBtnText}>
                  LOGIN AS {email.includes('admin') ? 'ADMIN' : email.includes('ramesh') ? 'PROVIDER' : 'CUSTOMER'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Social Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google OAuth Button */}
            <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleAuth} disabled={isSubmitting}>
              <Ionicons name="logo-google" size={20} color="#DB4437" style={{ marginRight: 10 }} />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('AccountType')}>
              <Text style={styles.signUpText}>Sign Up</Text>
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#FAFAF8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 8,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.forestGreen,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  roleChipsCard: {
    backgroundColor: '#F3F9F5',
    padding: 12,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D4EAD9',
  },
  roleChipsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.forestGreen,
    marginBottom: 8,
    textAlign: 'center',
  },
  roleChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 3,
    borderRadius: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#C3DFCA',
  },
  roleChipActive: {
    backgroundColor: colors.forestGreen,
    borderColor: colors.forestGreen,
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  roleChipTextActive: {
    color: colors.white,
  },
  form: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 16,
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
  forgotPassBtn: {
    alignSelf: 'flex-end',
    marginBottom: 18,
  },
  forgotPassText: {
    fontSize: 13,
    color: colors.forestGreen,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: colors.emerald,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  loginBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.cardBorder,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  signUpText: {
    fontSize: 14,
    color: colors.forestGreen,
    fontWeight: '700',
  },
});
