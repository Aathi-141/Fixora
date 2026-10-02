import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import {
  getAdminOverview,
  getAdminProviders,
  verifyProvider,
  getAdminDisputes,
  resolveDispute,
} from '../../services/api';

export default function AdminDashboardScreen({ navigation }) {
  const [stats, setStats] = useState({
    totalUsers: 18420,
    activeProviders: 1248,
    totalBookings: 94,
    pendingDisputes: 12,
  });

  const [activeSection, setActiveSection] = useState('providers');
  const [pendingProviders, setPendingProviders] = useState([
    {
      _id: 'p_pend_1',
      name: 'Marcus Sterling',
      category: 'HVAC & AC',
      license: 'LK-HVAC-3301',
      city: 'Malabe',
      status: 'pending',
    },
    {
      _id: 'p_pend_2',
      name: 'Nuwan Bandara',
      category: 'Carpentry',
      license: 'LK-CARP-5520',
      city: 'Colombo 07',
      status: 'pending',
    },
  ]);

  const [disputes, setDisputes] = useState([
    {
      _id: 'disp_1',
      customerName: 'Ajith Kumara',
      providerName: 'Sunil Perera',
      serviceTitle: 'Plumbing - Overcharge Claim',
      amount: 450,
      reason: 'Additional valve charge was unclear before work started.',
      status: 'pending',
    },
  ]);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    const res = await getAdminOverview();
    if (res.success && res.data?.stats) {
      setStats(res.data.stats);
    }
  };

  const handleVerify = async (id, status) => {
    await verifyProvider(id, status);
    setPendingProviders((prev) => prev.filter((p) => p._id !== id));
    Alert.alert('Status Updated', `Provider verification status has been marked as ${status}.`);
  };

  const handleResolveDispute = async (id) => {
    await resolveDispute(id, 'Admin approved customer credit adjustment.');
    setDisputes((prev) => prev.filter((d) => d._id !== id));
    Alert.alert('Dispute Resolved', 'Complaint marked resolved and customer notification sent.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.headerIconBtn}>
          <Ionicons name="notifications-outline" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* System Health Badge */}
        <View style={styles.healthCard}>
          <View style={styles.healthDot} />
          <Text style={styles.healthText}>All Systems Operational • MongoDB Online</Text>
        </View>

        {/* Executive Summary 2x2 Grid */}
        <Text style={styles.sectionHeading}>Executive Summary</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalUsers.toLocaleString()}</Text>
            <View style={styles.statLabelRow}>
              <Ionicons name="people-outline" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.activeProviders.toLocaleString()}</Text>
            <View style={styles.statLabelRow}>
              <Ionicons name="construct-outline" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={styles.statLabel}>Active Providers</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalBookings}</Text>
            <View style={styles.statLabelRow}>
              <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={styles.statLabel}>Total Bookings</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.danger }]}>{stats.pendingDisputes}</Text>
            <View style={styles.statLabelRow}>
              <Ionicons name="alert-circle-outline" size={14} color={colors.danger} style={{ marginRight: 4 }} />
              <Text style={styles.statLabel}>Pending Disputes</Text>
            </View>
          </View>
        </View>

        {/* Management Segmented Tabs */}
        <Text style={[styles.sectionHeading, { marginTop: 22 }]}>Management Queue</Text>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, activeSection === 'providers' && styles.tabBtnActive]}
            onPress={() => setActiveSection('providers')}
          >
            <Text style={[styles.tabBtnText, activeSection === 'providers' && styles.tabBtnTextActive]}>
              Pending Providers ({pendingProviders.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeSection === 'disputes' && styles.tabBtnActive]}
            onPress={() => setActiveSection('disputes')}
          >
            <Text style={[styles.tabBtnText, activeSection === 'disputes' && styles.tabBtnTextActive]}>
              Disputes ({disputes.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active Section Content */}
        {activeSection === 'providers' ? (
          pendingProviders.length > 0 ? (
            pendingProviders.map((p) => (
              <View key={p._id} style={styles.itemCard}>
                <View style={styles.itemTopRow}>
                  <View>
                    <Text style={styles.itemName}>{p.name}</Text>
                    <Text style={styles.itemSub}>{p.category} • {p.city}</Text>
                    <Text style={styles.itemLicense}>Lic: {p.license}</Text>
                  </View>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>Needs Verification</Text>
                  </View>
                </View>

                <View style={styles.actionBtnRow}>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleVerify(p._id, 'rejected')}
                  >
                    <Text style={styles.rejectBtnText}>Decline</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => handleVerify(p._id, 'verified')}
                  >
                    <Ionicons name="checkmark" size={16} color={colors.white} style={{ marginRight: 4 }} />
                    <Text style={styles.approveBtnText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="checkmark-done-circle" size={40} color={colors.forestGreen} />
              <Text style={styles.emptyText}>All provider applications have been verified!</Text>
            </View>
          )
        ) : (
          disputes.length > 0 ? (
            disputes.map((d) => (
              <View key={d._id} style={styles.itemCard}>
                <View style={styles.itemTopRow}>
                  <View>
                    <Text style={styles.itemName}>{d.serviceTitle}</Text>
                    <Text style={styles.itemSub}>User: {d.customerName} vs. {d.providerName}</Text>
                    <Text style={styles.itemClaim}>Disputed Amount: LKR {d.amount}</Text>
                  </View>
                </View>
                <Text style={styles.disputeReason}>"{d.reason}"</Text>

                <TouchableOpacity
                  style={styles.resolveBtn}
                  onPress={() => handleResolveDispute(d._id)}
                >
                  <Ionicons name="shield-checkmark" size={16} color={colors.white} style={{ marginRight: 4 }} />
                  <Text style={styles.resolveBtnText}>Resolve & Issue Credit</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="checkmark-done-circle" size={40} color={colors.forestGreen} />
              <Text style={styles.emptyText}>No pending customer complaints or disputes.</Text>
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.forestGreen,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 32,
  },
  healthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4EE',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  healthDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  healthText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.forestGreen,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.forestGreen,
    marginBottom: 4,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: colors.forestGreen,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  itemSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemLicense: {
    fontSize: 11,
    color: colors.forestGreen,
    fontWeight: '600',
    marginTop: 2,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  rejectBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
  },
  approveBtn: {
    flex: 1.5,
    flexDirection: 'row',
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.emerald,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  itemClaim: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
    marginTop: 2,
  },
  disputeReason: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forestGreen,
    height: 40,
    borderRadius: 8,
  },
  resolveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 10,
    textAlign: 'center',
  },
});
