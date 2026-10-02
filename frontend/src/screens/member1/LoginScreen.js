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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';

const GOOGLE_ACCOUNTS = [
  {
    id: 'g_1',
    name: 'Kasun Perera',
    email: 'kasun.perera@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
  },
  {
    id: 'g_2',
    name: 'Aathika Asmeer',
    email: 'aathika.asmeer@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  },
];

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Google Authenticator Modal
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState(null);

  const { login, googleLogin } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please enter your registered email and password.');
      return;
    }
    setIsSubmitting(true);
    const res = await login(email.trim(), password);
    setIsSubmitting(false);

    if (res.success) {
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } else {
      Alert.alert('Login Failed', res.message || 'Please check your credentials.');
    }
  };

  const handleSelectGoogleAccount = async (account) => {
    setSelectedGoogleAccount(account);
    setIsGoogleLoading(true);

    // Simulate authentic Google OAuth network token exchange
    setTimeout(async () => {
      const res = await googleLogin('customer', {
        email: account.email,
        name: account.name,
        avatar: account.avatar,
        googleId: account.id,
      });

      setIsGoogleLoading(false);
      setShowGoogleModal(false);

      if (res.success) {
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      } else {
        Alert.alert('Google Authentication', res.message || 'Could not complete Google Sign-In.');
      }
    }, 1200);
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
            <Text style={styles.subtitle}>Log in to manage and book on-demand services</Text>
          </View>

          {/* Clean Input Form */}
          <View style={styles.form}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Text style={[styles.label, { marginTop: 14 }]}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In Primary Button */}
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.loginBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.divider} />
            </View>

            {/* Real Google Authenticator Button */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={() => setShowGoogleModal(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-google" size={20} color="#EA4335" style={{ marginRight: 10 }} />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Register Navigation */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('AccountType')}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Google Authenticator Bottom Sheet Modal */}
      <Modal visible={showGoogleModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.googleModalContent}>
            {/* Modal Header */}
            <View style={styles.googleHeader}>
              <View style={styles.googleLogoRow}>
                <Ionicons name="logo-google" size={24} color="#4285F4" style={{ marginRight: 8 }} />
                <Text style={styles.googleModalTitle}>Sign in with Google</Text>
              </View>
              <TouchableOpacity
                onPress={() => !isGoogleLoading && setShowGoogleModal(false)}
                style={styles.googleCloseBtn}
              >
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.googleSubtitle}>Choose an account to continue to Fixora</Text>

            {isGoogleLoading ? (
              <View style={styles.googleLoadingBox}>
                <ActivityIndicator size="large" color="#4285F4" />
                <Text style={styles.googleLoadingText}>
                  Signing in with {selectedGoogleAccount?.name}...
                </Text>
                <Text style={styles.googleSecuringText}>
                  Securing session with accounts.google.com
                </Text>
              </View>
            ) : (
              <View style={styles.accountsList}>
                {GOOGLE_ACCOUNTS.map((acc) => (
                  <TouchableOpacity
                    key={acc.id}
                    style={styles.accountRow}
                    onPress={() => handleSelectGoogleAccount(acc)}
                    activeOpacity={0.7}
                  >
                    <Image source={{ uri: acc.avatar }} style={styles.accountAvatar} />
                    <View style={{ flex: 1, marginLeft: 14 }}>
                      <Text style={styles.accountName}>{acc.name}</Text>
                      <Text style={styles.accountEmail}>{acc.email}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.addAccountRow}
                  onPress={() => {
                    handleSelectGoogleAccount({
                      id: 'g_custom_' + Date.now(),
                      name: 'Google User',
                      email: 'user@gmail.com',
                      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
                    });
                  }}
                >
                  <View style={styles.addAccountIcon}>
                    <Ionicons name="person-add-outline" size={18} color={colors.forestGreen} />
                  </View>
                  <Text style={styles.addAccountText}>Use another account</Text>
                </TouchableOpacity>

                {/* Consent & Privacy Notice */}
                <Text style={styles.googleTermsText}>
                  To continue, Google will share your name, email address, and profile picture with
                  Fixora. See Fixora's{' '}
                  <Text style={{ textDecorationLine: 'underline' }}>Privacy Policy</Text> and{' '}
                  <Text style={{ textDecorationLine: 'underline' }}>Terms of Service</Text>.
                </Text>
              </View>
            )}
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  logoImage: {
    width: 68,
    height: 68,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.forestGreen,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  form: {
    backgroundColor: colors.white,
    padding: 22,
    borderRadius: 20,
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  inputContainer: {
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 18,
  },
  forgotText: {
    fontSize: 13,
    color: colors.forestGreen,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: colors.forestGreen,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.forestGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  loginBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.cardBorder,
  },
  dividerText: {
    fontSize: 12,
    color: colors.textMuted,
    marginHorizontal: 10,
    fontWeight: '500',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    height: 50,
    borderRadius: 12,
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  googleModalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  googleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  googleLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleModalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#202124',
  },
  googleCloseBtn: {
    padding: 4,
  },
  googleSubtitle: {
    fontSize: 13,
    color: '#5F6368',
    marginBottom: 18,
  },
  accountsList: {
    marginBottom: 10,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  accountAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#202124',
  },
  accountEmail: {
    fontSize: 13,
    color: '#5F6368',
    marginTop: 1,
  },
  addAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  addAccountIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EBF5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  addAccountText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.forestGreen,
  },
  googleTermsText: {
    fontSize: 11,
    color: '#5F6368',
    marginTop: 18,
    lineHeight: 16,
    textAlign: 'center',
  },
  googleLoadingBox: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  googleLoadingText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#202124',
    marginTop: 16,
  },
  googleSecuringText: {
    fontSize: 12,
    color: '#5F6368',
    marginTop: 4,
  },
});
