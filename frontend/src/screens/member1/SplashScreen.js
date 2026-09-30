import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function SplashScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        {/* Brand Icon & Logo */}
        <View style={styles.logoBadge}>
          <Ionicons name="home" size={48} color={colors.forestGreen} />
          <View style={styles.wrenchCircle}>
            <Ionicons name="construct" size={18} color={colors.white} />
          </View>
        </View>

        <Text style={styles.appName}>FIXORA</Text>
        <Text style={styles.tagline}>Home-Service Booking App</Text>
        <Text style={styles.subtext}>
          Reliable plumbers, electricians, cleaners & technicians across Sri Lanka.
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('AccountType')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>GET STARTED &gt;</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnText}>Already have an account? <Text style={styles.loginHighlight}>Log In</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBadge: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  wrenchCircle: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.sageGreen,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.forestGreen,
    letterSpacing: 2,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.emerald,
    marginBottom: 12,
  },
  subtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  footer: {
    width: '100%',
    paddingBottom: 16,
  },
  primaryBtn: {
    backgroundColor: colors.emerald,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: colors.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  secondaryBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginHighlight: {
    color: colors.forestGreen,
    fontWeight: '700',
  },
});
