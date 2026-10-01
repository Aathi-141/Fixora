import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function AccountTypeScreen({ navigation }) {
  const [selectedType, setSelectedType] = useState('customer');

  const handleContinue = () => {
    if (selectedType === 'customer') {
      navigation.navigate('CustomerSignUp');
    } else {
      navigation.navigate('ProviderSignUp');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign Up</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        <Text style={styles.heading}>Choose Account Type</Text>
        <Text style={styles.subheading}>
          Select how you plan to use Fixora to get a personalized experience.
        </Text>

        {/* Option 1: Customer Card */}
        <TouchableOpacity
          style={[
            styles.roleCard,
            selectedType === 'customer' && styles.roleCardActive,
          ]}
          onPress={() => setSelectedType('customer')}
          activeOpacity={0.8}
        >
          <View style={styles.cardIconBox}>
            <Ionicons
              name="person"
              size={28}
              color={selectedType === 'customer' ? colors.forestGreen : colors.textSecondary}
            />
          </View>
          <View style={styles.cardTextBox}>
            <Text style={styles.cardTitle}>I am a Customer</Text>
            <Text style={styles.cardDesc}>
              Search, compare, and instantly book trusted home service professionals.
            </Text>
          </View>
          <View
            style={[
              styles.radioCircle,
              selectedType === 'customer' && styles.radioCircleActive,
            ]}
          >
            {selectedType === 'customer' && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>

        {/* Option 2: Provider Card */}
        <TouchableOpacity
          style={[
            styles.roleCard,
            selectedType === 'provider' && styles.roleCardActive,
          ]}
          onPress={() => setSelectedType('provider')}
          activeOpacity={0.8}
        >
          <View style={styles.cardIconBox}>
            <Ionicons
              name="construct"
              size={28}
              color={selectedType === 'provider' ? colors.forestGreen : colors.textSecondary}
            />
          </View>
          <View style={styles.cardTextBox}>
            <Text style={styles.cardTitle}>I am a Service Provider</Text>
            <Text style={styles.cardDesc}>
              Offer electrical, plumbing, or cleaning services and receive jobs.
            </Text>
          </View>
          <View
            style={[
              styles.radioCircle,
              selectedType === 'provider' && styles.radioCircleActive,
            ]}
          >
            {selectedType === 'provider' && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>
      </View>

      {/* Bottom Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.8}>
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginLinkText}>
            Already have an account? <Text style={styles.loginHighlight}>Log In</Text>
          </Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
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
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.forestGreen,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 28,
    lineHeight: 20,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  roleCardActive: {
    borderColor: colors.sageGreen,
    backgroundColor: '#F3F9F5',
  },
  cardIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardTextBox: {
    flex: 1,
    paddingRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: colors.emerald,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.emerald,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  continueBtn: {
    backgroundColor: colors.emerald,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  continueBtnText: {
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
