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
  const { user, logout } = useContext(AuthContext);

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

  const isAdmin = user?.role === 'admin';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri:
                user?.avatar ||
                (isAdmin
                  ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
                  : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop'),
            }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || (isAdmin ? 'M. Shibly' : 'Kasun Perera')}</Text>
            <Text style={styles.userEmail}>{user?.email || (isAdmin ? 'admin@fixora.lk' : 'kasun@gmail.com')}</Text>
            <View style={styles.roleBadge}>
              <Ionicons
                name={isAdmin ? 'shield-checkmark' : 'person'}
                size={13}
                color={colors.forestGreen}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.roleBadgeText}>
                {isAdmin ? 'ADMINISTRATOR' : 'VERIFIED CUSTOMER'}
              </Text>
            </View>
          </View>
        </View>

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
          /* Saved Addresses for Customers */
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
              <TouchableOpacity>
                <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Support & Legal */}
        <View style={styles.menuCard}>
          {!isAdmin && (
            <>
              <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="card-outline" size={20} color={colors.textPrimary} style={styles.menuIcon} />
                <Text style={styles.menuLabel}>Payment Methods (Visa •••• 4892)</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
              <View style={styles.menuDivider} />
            </>
          )}

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} style={styles.menuIcon} />
            <Text style={styles.menuLabel}>Push Notifications & Alerts</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-buoy-outline" size={20} color={colors.textPrimary} style={styles.menuIcon} />
            <Text style={styles.menuLabel}>Fixora Help Center & Support</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textPrimary} style={styles.menuIcon} />
            <Text style={styles.menuLabel}>Privacy & Terms of Service</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Fixora v1.0.0 • Licensed by Fixora Lanka (Pvt) Ltd</Text>
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
    paddingBottom: 90,
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
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
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
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
    padding: 14,
    borderRadius: 12,
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
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 20,
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
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
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 10,
  },
});
