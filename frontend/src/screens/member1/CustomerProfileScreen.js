import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';

export default function CustomerProfileScreen({ navigation }) {
  const { user, logout, switchRole } = useContext(AuthContext);

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

  const handleSwitchRole = (newRole) => {
    switchRole(newRole);
    Alert.alert(
      'Role Switched',
      `Switched to ${newRole.toUpperCase()} mode. Your dashboard navigation will now update.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri:
                user?.avatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop',
            }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || 'Kasun Perera'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'kasun@gmail.com'}</Text>
            <View style={styles.roleBadge}>
              <Ionicons
                name={
                  user?.role === 'admin'
                    ? 'shield-checkmark'
                    : user?.role === 'provider'
                    ? 'construct'
                    : 'person'
                }
                size={13}
                color={colors.forestGreen}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.roleBadgeText}>{(user?.role || 'customer').toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Switch Account Role Section (Realistic & Viva-Friendly) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account Role Switching</Text>
          <Text style={styles.sectionSubtitle}>
            In Fixora, each account role has a dedicated workspace:
          </Text>

          <View style={styles.roleBtnGroup}>
            <TouchableOpacity
              style={[styles.roleSwitchBtn, user?.role === 'customer' && styles.roleSwitchBtnActive]}
              onPress={() => handleSwitchRole('customer')}
            >
              <Ionicons
                name="home-outline"
                size={16}
                color={user?.role === 'customer' ? colors.white : colors.textPrimary}
              />
              <Text
                style={[
                  styles.roleSwitchText,
                  user?.role === 'customer' && styles.roleSwitchTextActive,
                ]}
              >
                Customer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleSwitchBtn, user?.role === 'provider' && styles.roleSwitchBtnActive]}
              onPress={() => handleSwitchRole('provider')}
            >
              <Ionicons
                name="hammer-outline"
                size={16}
                color={user?.role === 'provider' ? colors.white : colors.textPrimary}
              />
              <Text
                style={[
                  styles.roleSwitchText,
                  user?.role === 'provider' && styles.roleSwitchTextActive,
                ]}
              >
                Provider
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleSwitchBtn, user?.role === 'admin' && styles.roleSwitchBtnActive]}
              onPress={() => handleSwitchRole('admin')}
            >
              <Ionicons
                name="shield-outline"
                size={16}
                color={user?.role === 'admin' ? colors.white : colors.textPrimary}
              />
              <Text
                style={[styles.roleSwitchText, user?.role === 'admin' && styles.roleSwitchTextActive]}
              >
                Admin
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Saved Addresses */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Saved Service Address</Text>
          <View style={styles.addressRow}>
            <View style={styles.addressIconBox}>
              <Ionicons name="location" size={20} color={colors.forestGreen} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.addressTitle}>Home</Text>
              <Text style={styles.addressText}>
                {user?.address || 'No 42, New Kandy Road, Malabe, Colombo'}
              </Text>
            </View>
          </View>
        </View>

        {/* Support & Legal */}
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="card-outline" size={20} color={colors.textPrimary} style={styles.menuIcon} />
            <Text style={styles.menuLabel}>Payment Methods (Visa •••• 4892)</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} style={styles.menuIcon} />
            <Text style={styles.menuLabel}>Push Notifications</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-buoy-outline" size={20} color={colors.textPrimary} style={styles.menuIcon} />
            <Text style={styles.menuLabel}>Customer Support & Help Center</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Fixora Mobile App v1.2 • IT3060 Milestone 03</Text>
      </ScrollView>
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
    paddingBottom: 40,
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
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: colors.sageGreen,
    marginRight: 16,
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
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  roleBtnGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleSwitchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 3,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  roleSwitchBtnActive: {
    backgroundColor: colors.forestGreen,
  },
  roleSwitchText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: 6,
  },
  roleSwitchTextActive: {
    color: colors.white,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  addressIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addressText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingVertical: 6,
    marginBottom: 20,
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
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
    marginHorizontal: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 20,
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
  },
});
