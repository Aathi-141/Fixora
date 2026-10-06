import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  Modal,
  TextInput,
  Image,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import {
  getAdminOverview,
  getAdminUsers,
  getAdminProviders,
  verifyProvider,
  getAdminBookings,
  getAdminDisputes,
  resolveDispute,
} from '../../services/api';

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function AdminDashboardScreen({ navigation }) {
  // Main Dashboard State
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeProviders: 0,
    totalBookings: 0,
    pendingDisputes: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState('providers');
  const [pendingProviders, setPendingProviders] = useState([]);
  const [disputes, setDisputes] = useState([]);

  // Modal 1: Registered Users State
  const [usersModalVisible, setUsersModalVisible] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL'); // ALL | CUSTOMER | PROVIDER | ADMIN

  // Modal 2: Active Service Providers State
  const [providersModalVisible, setProvidersModalVisible] = useState(false);
  const [providersList, setProvidersList] = useState([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState(null);
  const [providerFilter, setProviderFilter] = useState('ALL'); // ALL | ACTIVE | VERIFIED | PENDING

  // Modal 3: Platform Bookings Lifecycle State
  const [bookingsModalVisible, setBookingsModalVisible] = useState(false);
  const [bookingsList, setBookingsList] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL'); // ALL | PENDING | ACCEPTED | COMPLETED | CANCELLED

  // Modal 4: Customer Complaints & Disputes State
  const [disputesModalVisible, setDisputesModalVisible] = useState(false);
  const [disputesList, setDisputesList] = useState([]);
  const [disputesLoading, setDisputesLoading] = useState(false);
  const [disputesError, setDisputesError] = useState(null);
  const [disputeFilter, setDisputeFilter] = useState('ALL'); // ALL | PENDING | RESOLVED
  const [resolvingDisputeId, setResolvingDisputeId] = useState(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async (isPullRefresh = false) => {
    if (isPullRefresh) setRefreshing(true);
    try {
      const [overviewRes, provsRes, dispsRes] = await Promise.all([
        getAdminOverview(),
        getAdminProviders(),
        getAdminDisputes(),
      ]);

      if (overviewRes.success && overviewRes.data?.stats) {
        setStats(overviewRes.data.stats);
      }

      if (provsRes.success && Array.isArray(provsRes.data)) {
        const pending = provsRes.data.filter(
          (p) => p.verificationStatus === 'pending'
        );
        setPendingProviders(pending);
      }

      if (dispsRes.success && Array.isArray(dispsRes.data)) {
        const pending = dispsRes.data.filter((d) => d.status !== 'resolved');
        setDisputes(pending);
      }
    } catch (e) {
      console.warn('loadAdminData error:', e.message);
    } finally {
      if (isPullRefresh) setRefreshing(false);
    }
  };

  // 1. Fetch Users Modal Data
  const openUsersModal = async () => {
    setUsersModalVisible(true);
    fetchUsers();
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const res = await getAdminUsers();
      if (res.success && Array.isArray(res.data)) {
        setUsersList(res.data);
      } else {
        setUsersError(res.message || 'Failed to fetch registered users from database.');
      }
    } catch (err) {
      setUsersError(err.message || 'Database error occurred while fetching users.');
    } finally {
      setUsersLoading(false);
    }
  };

  // 2. Fetch Providers Modal Data
  const openProvidersModal = async () => {
    setProvidersModalVisible(true);
    fetchProviders();
  };

  const fetchProviders = async () => {
    setProvidersLoading(true);
    setProvidersError(null);
    try {
      const res = await getAdminProviders();
      if (res.success && Array.isArray(res.data)) {
        setProvidersList(res.data);
      } else {
        setProvidersError(res.message || 'Failed to fetch providers from database.');
      }
    } catch (err) {
      setProvidersError(err.message || 'Database error occurred while fetching providers.');
    } finally {
      setProvidersLoading(false);
    }
  };

  // 3. Fetch Bookings Modal Data
  const openBookingsModal = async () => {
    setBookingsModalVisible(true);
    fetchBookings();
  };

  const fetchBookings = async () => {
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      const res = await getAdminBookings();
      if (res.success && Array.isArray(res.data)) {
        setBookingsList(res.data);
      } else {
        setBookingsError(res.message || 'Failed to fetch bookings lifecycle from database.');
      }
    } catch (err) {
      setBookingsError(err.message || 'Database error occurred while fetching bookings.');
    } finally {
      setBookingsLoading(false);
    }
  };

  // 4. Fetch Disputes Modal Data
  const openDisputesModal = async () => {
    setDisputesModalVisible(true);
    fetchDisputes();
  };

  const fetchDisputes = async () => {
    setDisputesLoading(true);
    setDisputesError(null);
    try {
      const res = await getAdminDisputes();
      if (res.success && Array.isArray(res.data)) {
        setDisputesList(res.data);
      } else {
        setDisputesError(res.message || 'Failed to fetch complaints & disputes from database.');
      }
    } catch (err) {
      setDisputesError(err.message || 'Database error occurred while fetching disputes.');
    } finally {
      setDisputesLoading(false);
    }
  };

  // Resolve Dispute Action (from Modal or Queue)
  const handleResolveDisputeAction = async (id) => {
    setResolvingDisputeId(id);
    const res = await resolveDispute(id, 'Admin approved customer credit adjustment and marked dispute resolved.');
    setResolvingDisputeId(null);

    if (res.success) {
      Alert.alert(
        'Dispute Resolved',
        'Complaint marked resolved and customer credit/refund has been applied to the account.'
      );
      // Refresh modal list, queue, and dashboard statistics
      fetchDisputes();
      loadAdminData();
    } else {
      Alert.alert('Action Failed', res.message || 'Could not resolve dispute. Please try again.');
    }
  };

  const handleVerify = async (id, status) => {
    const res = await verifyProvider(id, status);
    if (res.success) {
      Alert.alert('Status Updated', `Provider verification status has been marked as ${status}.`);
      loadAdminData();
      if (providersModalVisible) fetchProviders();
    } else {
      Alert.alert('Action Failed', res.message || 'Could not update verification status.');
    }
  };

  const handleCallUser = (phone, name) => {
    if (!phone) {
      Alert.alert('No Phone Number', 'No contact phone number is registered for this user.');
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Call', `Directing call to ${name} (${phone})`);
    });
  };

  // Filtered Users List
  const filteredUsers = usersList.filter((u) => {
    const roleMatch =
      userRoleFilter === 'ALL' ||
      u.role?.toLowerCase() === userRoleFilter.toLowerCase();
    const query = userSearch.trim().toLowerCase();
    const searchMatch =
      !query ||
      (u.name && u.name.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query)) ||
      (u.phone && u.phone.includes(query));
    return roleMatch && searchMatch;
  });

  // Filtered Providers List
  const filteredProviders = providersList.filter((p) => {
    if (providerFilter === 'ALL') return true;
    if (providerFilter === 'ACTIVE') return p.isAvailable === true;
    if (providerFilter === 'VERIFIED') return p.verificationStatus === 'verified';
    if (providerFilter === 'PENDING') return p.verificationStatus === 'pending';
    return true;
  });

  // Filtered Bookings List
  const filteredBookings = bookingsList.filter((b) => {
    if (bookingStatusFilter === 'ALL') return true;
    if (bookingStatusFilter === 'PENDING') return b.status === 'pending';
    if (bookingStatusFilter === 'ACCEPTED')
      return b.status === 'accepted' || b.status === 'on_the_way';
    if (bookingStatusFilter === 'COMPLETED') return b.status === 'completed';
    if (bookingStatusFilter === 'CANCELLED')
      return b.status === 'cancelled' || b.status === 'rejected';
    return true;
  });

  // Filtered Disputes List
  const filteredDisputes = disputesList.filter((d) => {
    if (disputeFilter === 'ALL') return true;
    if (disputeFilter === 'PENDING') return d.status !== 'resolved';
    if (disputeFilter === 'RESOLVED') return d.status === 'resolved';
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home'))}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => loadAdminData(true)}>
          <Ionicons name="refresh" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadAdminData(true)}
            colors={[colors.forestGreen]}
            tintColor={colors.forestGreen}
          />
        }
      >
        {/* System Health Badge */}
        <View style={styles.healthCard}>
          <View style={styles.healthDot} />
          <Text style={styles.healthText}>All Systems Operational • MongoDB Online</Text>
        </View>

        {/* Executive Summary 2x2 Interactive Grid */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Executive Summary</Text>
          <Text style={styles.sectionHint}>Tap any card to inspect</Text>
        </View>

        <View style={styles.statsGrid}>
          {/* 1. Total Users Card */}
          <TouchableOpacity
            style={styles.statCard}
            onPress={openUsersModal}
            activeOpacity={0.8}
          >
            <View style={styles.statCardHeader}>
              <Text style={styles.statNumber}>{stats.totalUsers.toLocaleString()}</Text>
              <View style={styles.statCardBadge}>
                <Ionicons name="chevron-forward" size={13} color={colors.forestGreen} />
              </View>
            </View>
            <View style={styles.statLabelRow}>
              <Ionicons name="people-outline" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <Text style={styles.statTapText}>View all registered users</Text>
          </TouchableOpacity>

          {/* 2. Active Providers Card */}
          <TouchableOpacity
            style={styles.statCard}
            onPress={openProvidersModal}
            activeOpacity={0.8}
          >
            <View style={styles.statCardHeader}>
              <Text style={styles.statNumber}>{stats.activeProviders.toLocaleString()}</Text>
              <View style={styles.statCardBadge}>
                <Ionicons name="chevron-forward" size={13} color={colors.forestGreen} />
              </View>
            </View>
            <View style={styles.statLabelRow}>
              <Ionicons name="construct-outline" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={styles.statLabel}>Active Providers</Text>
            </View>
            <Text style={styles.statTapText}>View provider fleet</Text>
          </TouchableOpacity>

          {/* 3. Total Bookings Card */}
          <TouchableOpacity
            style={styles.statCard}
            onPress={openBookingsModal}
            activeOpacity={0.8}
          >
            <View style={styles.statCardHeader}>
              <Text style={styles.statNumber}>{stats.totalBookings}</Text>
              <View style={styles.statCardBadge}>
                <Ionicons name="chevron-forward" size={13} color={colors.forestGreen} />
              </View>
            </View>
            <View style={styles.statLabelRow}>
              <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={styles.statLabel}>Total Bookings</Text>
            </View>
            <Text style={styles.statTapText}>View booking lifecycle</Text>
          </TouchableOpacity>

          {/* 4. Pending Disputes Card */}
          <TouchableOpacity
            style={styles.statCard}
            onPress={openDisputesModal}
            activeOpacity={0.8}
          >
            <View style={styles.statCardHeader}>
              <Text style={[styles.statNumber, { color: colors.danger }]}>{stats.pendingDisputes}</Text>
              <View style={[styles.statCardBadge, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="chevron-forward" size={13} color={colors.danger} />
              </View>
            </View>
            <View style={styles.statLabelRow}>
              <Ionicons name="alert-circle-outline" size={14} color={colors.danger} style={{ marginRight: 4 }} />
              <Text style={styles.statLabel}>Pending Disputes</Text>
            </View>
            <Text style={[styles.statTapText, { color: colors.danger }]}>Inspect & resolve disputes</Text>
          </TouchableOpacity>
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
            pendingProviders.map((p) => {
              const name = p.user?.name || p.name || 'Provider Specialist';
              const cat = p.category || 'Service';
              const city = p.city || p.user?.address || 'Colombo';
              const license = p.licenseNumber || p.license || 'LK-VER-PEND';

              return (
                <View key={p._id} style={styles.itemCard}>
                  <View style={styles.itemTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{name}</Text>
                      <Text style={styles.itemSub}>{cat} • {city}</Text>
                      <Text style={styles.itemLicense}>Lic: {license}</Text>
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
              );
            })
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="checkmark-done-circle" size={40} color={colors.forestGreen} />
              <Text style={styles.emptyText}>All provider applications have been verified!</Text>
            </View>
          )
        ) : disputes.length > 0 ? (
          disputes.map((d) => (
            <View key={d._id} style={styles.itemCard}>
              <View style={styles.itemTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{d.serviceTitle}</Text>
                  <Text style={styles.itemSub}>User: {d.customerName} vs. {d.providerName}</Text>
                  <Text style={styles.itemClaim}>Disputed Amount: LKR {d.amount?.toLocaleString()}</Text>
                </View>
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>Pending</Text>
                </View>
              </View>
              <Text style={styles.disputeReason}>"{d.reason}"</Text>

              <TouchableOpacity
                style={styles.resolveBtn}
                onPress={() => handleResolveDisputeAction(d._id)}
                disabled={resolvingDisputeId === d._id}
              >
                {resolvingDisputeId === d._id ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Ionicons name="shield-checkmark" size={16} color={colors.white} style={{ marginRight: 4 }} />
                    <Text style={styles.resolveBtnText}>Resolve & Issue Credit</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-done-circle" size={40} color={colors.forestGreen} />
            <Text style={styles.emptyText}>No pending customer complaints or disputes.</Text>
          </View>
        )}
      </ScrollView>

      {/* ========================================================================= */}
      {/* MODAL 1: All Registered Users Modal                                       */}
      {/* ========================================================================= */}
      <Modal visible={usersModalVisible} animationType="slide" onRequestClose={() => setUsersModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="light-content" />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalHeaderTitle}>All Registered Users</Text>
              <Text style={styles.modalHeaderSub}>
                Live database records • {usersList.length} total users
              </Text>
            </View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setUsersModalVisible(false)}>
              <Ionicons name="close" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBarBox}>
            <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, email, or phone..."
              placeholderTextColor={colors.textMuted}
              value={userSearch}
              onChangeText={setUserSearch}
              clearButtonMode="while-editing"
            />
            {userSearch ? (
              <TouchableOpacity onPress={() => setUserSearch('')}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Role Filter Chips */}
          <View style={styles.chipsRow}>
            {['ALL', 'CUSTOMER', 'PROVIDER', 'ADMIN'].map((role) => (
              <TouchableOpacity
                key={role}
                style={[styles.chipBtn, userRoleFilter === role && styles.chipBtnActive]}
                onPress={() => setUserRoleFilter(role)}
              >
                <Text style={[styles.chipText, userRoleFilter === role && styles.chipTextActive]}>
                  {role}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content Body */}
          {usersLoading ? (
            <View style={styles.modalCenterBox}>
              <ActivityIndicator size="large" color={colors.forestGreen} />
              <Text style={styles.loadingModalText}>Querying registered users from MongoDB...</Text>
            </View>
          ) : usersError ? (
            <View style={styles.modalCenterBox}>
              <Ionicons name="cloud-offline-outline" size={48} color={colors.danger} />
              <Text style={styles.errorModalTitle}>Failed to Load Users</Text>
              <Text style={styles.errorModalText}>{usersError}</Text>
              <TouchableOpacity style={styles.modalRetryBtn} onPress={fetchUsers}>
                <Text style={styles.modalRetryText}>Retry Query</Text>
              </TouchableOpacity>
            </View>
          ) : filteredUsers.length === 0 ? (
            <View style={styles.modalCenterBox}>
              <Ionicons name="people-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyModalTitle}>No Users Found</Text>
              <Text style={styles.emptyModalText}>
                {userSearch ? `No registered user matches "${userSearch}".` : 'No users under this role.'}
              </Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.modalListBody} showsVerticalScrollIndicator={false}>
              {filteredUsers.map((u) => {
                const roleUpper = (u.role || 'customer').toUpperCase();
                const isCustomer = roleUpper === 'CUSTOMER';
                const isProvider = roleUpper === 'PROVIDER';
                const isAdmin = roleUpper === 'ADMIN';

                return (
                  <View key={u._id} style={styles.userCard}>
                    <View style={styles.userCardTop}>
                      {u.avatar ? (
                        <Image source={{ uri: u.avatar }} style={styles.userAvatar} />
                      ) : (
                        <View style={styles.userInitialsAvatar}>
                          <Text style={styles.userInitialsText}>{getInitials(u.name)}</Text>
                        </View>
                      )}

                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={styles.userNameRow}>
                          <Text style={styles.userFullName} numberOfLines={1}>
                            {u.name || 'Unnamed User'}
                          </Text>
                          <View
                            style={[
                              styles.userRoleBadge,
                              isCustomer
                                ? styles.roleBadgeCustomer
                                : isProvider
                                ? styles.roleBadgeProvider
                                : styles.roleBadgeAdmin,
                            ]}
                          >
                            <Text
                              style={[
                                styles.userRoleBadgeText,
                                isCustomer
                                  ? styles.roleTextCustomer
                                  : isProvider
                                  ? styles.roleTextProvider
                                  : styles.roleTextAdmin,
                              ]}
                            >
                              {roleUpper}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.userEmail} numberOfLines={1}>
                          {u.email}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.userDivider} />

                    {/* Details Row: Phone, Address */}
                    <View style={styles.userDetailsGrid}>
                      <View style={styles.userDetailItem}>
                        <Ionicons name="call-outline" size={14} color={colors.forestGreen} style={{ marginRight: 6 }} />
                        <Text style={styles.userDetailText}>{u.phone || 'No phone set'}</Text>
                      </View>

                      <View style={[styles.userDetailItem, { marginTop: 4 }]}>
                        <Ionicons name="location-outline" size={14} color={colors.forestGreen} style={{ marginRight: 6 }} />
                        <Text style={styles.userDetailText} numberOfLines={1}>
                          {u.address || 'Address not registered'}
                        </Text>
                      </View>
                    </View>

                    {/* Call Button for users with phone */}
                    {u.phone ? (
                      <TouchableOpacity
                        style={styles.callUserBtn}
                        onPress={() => handleCallUser(u.phone, u.name)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="call" size={15} color={colors.forestGreen} style={{ marginRight: 6 }} />
                        <Text style={styles.callUserBtnText}>Call User ({u.phone})</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                );
              })}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: Active Service Providers Modal                                   */}
      {/* ========================================================================= */}
      <Modal visible={providersModalVisible} animationType="slide" onRequestClose={() => setProvidersModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="light-content" />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalHeaderTitle}>Active Service Providers</Text>
              <Text style={styles.modalHeaderSub}>
                Live fleet directory • {providersList.length} total providers
              </Text>
            </View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setProvidersModalVisible(false)}>
              <Ionicons name="close" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Filter Chips */}
          <View style={styles.chipsRow}>
            {['ALL', 'ACTIVE', 'VERIFIED', 'PENDING'].map((fil) => (
              <TouchableOpacity
                key={fil}
                style={[styles.chipBtn, providerFilter === fil && styles.chipBtnActive]}
                onPress={() => setProviderFilter(fil)}
              >
                <Text style={[styles.chipText, providerFilter === fil && styles.chipTextActive]}>
                  {fil}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content Body */}
          {providersLoading ? (
            <View style={styles.modalCenterBox}>
              <ActivityIndicator size="large" color={colors.forestGreen} />
              <Text style={styles.loadingModalText}>Loading provider fleet from MongoDB...</Text>
            </View>
          ) : providersError ? (
            <View style={styles.modalCenterBox}>
              <Ionicons name="cloud-offline-outline" size={48} color={colors.danger} />
              <Text style={styles.errorModalTitle}>Failed to Load Providers</Text>
              <Text style={styles.errorModalText}>{providersError}</Text>
              <TouchableOpacity style={styles.modalRetryBtn} onPress={fetchProviders}>
                <Text style={styles.modalRetryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredProviders.length === 0 ? (
            <View style={styles.modalCenterBox}>
              <Ionicons name="construct-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyModalTitle}>No Providers Found</Text>
              <Text style={styles.emptyModalText}>No service specialists match this filter.</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.modalListBody} showsVerticalScrollIndicator={false}>
              {filteredProviders.map((p) => {
                const name = p.user?.name || 'Verified Provider';
                const avatar = p.user?.avatar || p.avatar;
                const isOnline = p.isAvailable === true;
                const isVerified = p.verificationStatus === 'verified';
                const isPending = p.verificationStatus === 'pending';

                return (
                  <View key={p._id} style={styles.providerCard}>
                    <View style={styles.providerCardTop}>
                      {avatar ? (
                        <Image source={{ uri: avatar }} style={styles.userAvatar} />
                      ) : (
                        <View style={styles.userInitialsAvatar}>
                          <Text style={styles.userInitialsText}>{getInitials(name)}</Text>
                        </View>
                      )}

                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={styles.userNameRow}>
                          <Text style={styles.userFullName} numberOfLines={1}>
                            {name}
                          </Text>
                          {/* Availability Badge */}
                          <View
                            style={[
                              styles.availabilityBadge,
                              isOnline ? styles.availBadgeOnline : styles.availBadgeOffline,
                            ]}
                          >
                            <View
                              style={[
                                styles.availDot,
                                { backgroundColor: isOnline ? '#10B981' : '#94A3B8' },
                              ]}
                            />
                            <Text
                              style={[
                                styles.availText,
                                { color: isOnline ? '#065F46' : '#475569' },
                              ]}
                            >
                              {isOnline ? 'AVAILABLE' : 'OFFLINE'}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.providerCategoryText}>
                          {p.category} • {p.specialization || 'General Specialist'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.userDivider} />

                    {/* Stats Metric Strip */}
                    <View style={styles.providerMetricsStrip}>
                      <View style={styles.metricItem}>
                        <Text style={styles.metricVal}>LKR {p.hourlyRate?.toLocaleString() || '700'}/hr</Text>
                        <Text style={styles.metricLbl}>Hourly Rate</Text>
                      </View>

                      <View style={styles.metricItem}>
                        <Text style={styles.metricVal}>
                          ⭐ {p.rating ? p.rating.toFixed(1) : '4.8'}
                        </Text>
                        <Text style={styles.metricLbl}>{p.reviewCount || 0} reviews</Text>
                      </View>

                      <View style={styles.metricItem}>
                        <Text style={styles.metricVal}>{p.jobsCompleted || 0}</Text>
                        <Text style={styles.metricLbl}>Jobs Done</Text>
                      </View>

                      <View style={styles.metricItem}>
                        <View
                          style={[
                            styles.verifBadgeSmall,
                            isVerified
                              ? styles.badgeVerifiedSmall
                              : isPending
                              ? styles.badgePendingSmall
                              : styles.badgeRejectedSmall,
                          ]}
                        >
                          <Text
                            style={[
                              styles.verifTextSmall,
                              isVerified
                                ? styles.textVerifiedSmall
                                : isPending
                                ? styles.textPendingSmall
                                : styles.textRejectedSmall,
                            ]}
                          >
                            {(p.verificationStatus || 'VERIFIED').toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.metricLbl}>Status</Text>
                      </View>
                    </View>

                    {/* Location & License row */}
                    <View style={styles.providerInfoFoot}>
                      <Text style={styles.providerCityText}>
                        📍 {p.city || p.user?.address || 'Colombo, Sri Lanka'}
                      </Text>
                      {p.licenseNumber ? (
                        <Text style={styles.providerLicText}>Lic: {p.licenseNumber}</Text>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: Platform Bookings Lifecycle Modal                                */}
      {/* ========================================================================= */}
      <Modal visible={bookingsModalVisible} animationType="slide" onRequestClose={() => setBookingsModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="light-content" />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalHeaderTitle}>Platform Bookings Lifecycle</Text>
              <Text style={styles.modalHeaderSub}>
                Live transactions • {bookingsList.length} total bookings
              </Text>
            </View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setBookingsModalVisible(false)}>
              <Ionicons name="close" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Status Filter Chips */}
          <View style={styles.chipsRow}>
            {['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'].map((st) => (
              <TouchableOpacity
                key={st}
                style={[styles.chipBtn, bookingStatusFilter === st && styles.chipBtnActive]}
                onPress={() => setBookingStatusFilter(st)}
              >
                <Text style={[styles.chipText, bookingStatusFilter === st && styles.chipTextActive]}>
                  {st}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content Body */}
          {bookingsLoading ? (
            <View style={styles.modalCenterBox}>
              <ActivityIndicator size="large" color={colors.forestGreen} />
              <Text style={styles.loadingModalText}>Fetching bookings lifecycle from MongoDB...</Text>
            </View>
          ) : bookingsError ? (
            <View style={styles.modalCenterBox}>
              <Ionicons name="cloud-offline-outline" size={48} color={colors.danger} />
              <Text style={styles.errorModalTitle}>Failed to Load Bookings</Text>
              <Text style={styles.errorModalText}>{bookingsError}</Text>
              <TouchableOpacity style={styles.modalRetryBtn} onPress={fetchBookings}>
                <Text style={styles.modalRetryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredBookings.length === 0 ? (
            <View style={styles.modalCenterBox}>
              <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyModalTitle}>No Bookings Found</Text>
              <Text style={styles.emptyModalText}>No platform bookings match this lifecycle stage.</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.modalListBody} showsVerticalScrollIndicator={false}>
              {filteredBookings.map((b) => {
                const ticketRef = b.bookingRef || `#BK-${b._id.slice(-6).toUpperCase()}`;
                const custName = b.customer?.name || b.customerName || 'Customer';
                const provName = b.provider?.user?.name || b.provider?.category || 'Assigned Specialist';
                const serviceTitle = b.serviceTitle || `${b.serviceCategory || 'Home'} Service`;
                const totalAmount = b.pricing?.totalAmount || 0;
                const statusUpper = (b.status || 'pending').toUpperCase();

                const isPending = b.status === 'pending';
                const isAccepted = b.status === 'accepted';
                const isOnTheWay = b.status === 'on_the_way';
                const isCompleted = b.status === 'completed';
                const isCancelled = b.status === 'cancelled' || b.status === 'rejected';

                return (
                  <View key={b._id} style={styles.bookingCard}>
                    {/* Top Reference & Status */}
                    <View style={styles.bookingCardTop}>
                      <Text style={styles.bookingRefText}>{ticketRef}</Text>
                      <View
                        style={[
                          styles.bookingStatusBadge,
                          isPending
                            ? styles.badgePendingSmall
                            : isAccepted
                            ? styles.badgeAcceptedSmall
                            : isOnTheWay
                            ? styles.badgeOnTheWaySmall
                            : isCompleted
                            ? styles.badgeCompletedSmall
                            : styles.badgeCancelledSmall,
                        ]}
                      >
                        <Text
                          style={[
                            styles.bookingStatusText,
                            isPending
                              ? styles.textPendingSmall
                              : isAccepted
                              ? styles.textAcceptedSmall
                              : isOnTheWay
                              ? styles.textOnTheWaySmall
                              : isCompleted
                              ? styles.textCompletedSmall
                              : styles.textCancelledSmall,
                          ]}
                        >
                          {statusUpper}
                        </Text>
                      </View>
                    </View>

                    {/* Service & Users */}
                    <Text style={styles.bookingServiceTitle}>{serviceTitle}</Text>
                    <View style={styles.bookingParticipantsRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.partyRoleLabel}>Customer</Text>
                        <Text style={styles.partyNameText} numberOfLines={1}>
                          {custName}
                        </Text>
                      </View>
                      <Ionicons name="arrow-forward" size={14} color={colors.textMuted} style={{ marginHorizontal: 8 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.partyRoleLabel}>Provider</Text>
                        <Text style={styles.partyNameText} numberOfLines={1}>
                          {provName}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.userDivider} />

                    {/* Date, Time & Location */}
                    <View style={styles.bookingScheduleRow}>
                      <Ionicons name="time-outline" size={14} color={colors.forestGreen} style={{ marginRight: 6 }} />
                      <Text style={styles.bookingScheduleText}>
                        {b.scheduledDate || 'Scheduled'} • {b.timeSlot || 'Window'}
                      </Text>
                    </View>

                    <View style={[styles.bookingScheduleRow, { marginTop: 4 }]}>
                      <Ionicons name="location-outline" size={14} color={colors.forestGreen} style={{ marginRight: 6 }} />
                      <Text style={styles.bookingScheduleText} numberOfLines={1}>
                        {b.serviceAddress || 'No Address Provided'}
                      </Text>
                    </View>

                    {/* Payout & Payment Status */}
                    <View style={styles.bookingFooterRow}>
                      <View>
                        <Text style={styles.bookingPayoutLabel}>Total Amount</Text>
                        <Text style={styles.bookingPayoutAmount}>
                          LKR {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.paidPill,
                          b.isPaid ? styles.paidPillTrue : styles.paidPillFalse,
                        ]}
                      >
                        <Text
                          style={[
                            styles.paidPillText,
                            b.isPaid ? styles.paidPillTextTrue : styles.paidPillTextFalse,
                          ]}
                        >
                          {b.isPaid ? 'PAID' : 'PENDING PAYMENT'}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 4: Customer Complaints & Disputes Modal                             */}
      {/* ========================================================================= */}
      <Modal visible={disputesModalVisible} animationType="slide" onRequestClose={() => setDisputesModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="light-content" />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalHeaderTitle}>Customer Complaints & Disputes</Text>
              <Text style={styles.modalHeaderSub}>
                Escalation queue • {disputesList.length} total disputes
              </Text>
            </View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setDisputesModalVisible(false)}>
              <Ionicons name="close" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Status Filter Chips */}
          <View style={styles.chipsRow}>
            {['ALL', 'PENDING', 'RESOLVED'].map((st) => (
              <TouchableOpacity
                key={st}
                style={[styles.chipBtn, disputeFilter === st && styles.chipBtnActive]}
                onPress={() => setDisputeFilter(st)}
              >
                <Text style={[styles.chipText, disputeFilter === st && styles.chipTextActive]}>
                  {st}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content Body */}
          {disputesLoading ? (
            <View style={styles.modalCenterBox}>
              <ActivityIndicator size="large" color={colors.forestGreen} />
              <Text style={styles.loadingModalText}>Fetching disputes & claims from MongoDB...</Text>
            </View>
          ) : disputesError ? (
            <View style={styles.modalCenterBox}>
              <Ionicons name="cloud-offline-outline" size={48} color={colors.danger} />
              <Text style={styles.errorModalTitle}>Failed to Load Disputes</Text>
              <Text style={styles.errorModalText}>{disputesError}</Text>
              <TouchableOpacity style={styles.modalRetryBtn} onPress={fetchDisputes}>
                <Text style={styles.modalRetryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredDisputes.length === 0 ? (
            <View style={styles.modalCenterBox}>
              <Ionicons name="shield-checkmark-outline" size={48} color={colors.forestGreen} />
              <Text style={styles.emptyModalTitle}>No Complaints Found</Text>
              <Text style={styles.emptyModalText}>No active dispute claims match this view.</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.modalListBody} showsVerticalScrollIndicator={false}>
              {filteredDisputes.map((d) => {
                const disputeId = `#DISP-${d._id.slice(-6).toUpperCase()}`;
                const bookRef = d.booking?.bookingRef || (d.booking?._id ? `#FX-${d.booking._id.slice(-5)}` : 'N/A');
                const isResolved = d.status === 'resolved';

                return (
                  <View key={d._id} style={styles.disputeCard}>
                    {/* Header */}
                    <View style={styles.disputeCardTop}>
                      <View>
                        <Text style={styles.disputeIdText}>{disputeId}</Text>
                        <Text style={styles.disputeBookingRef}>Booking {bookRef}</Text>
                      </View>
                      <View
                        style={[
                          styles.disputeStatusBadge,
                          isResolved ? styles.badgeResolvedSmall : styles.badgePendingSmall,
                        ]}
                      >
                        <Text
                          style={[
                            styles.disputeStatusText,
                            isResolved ? styles.textResolvedSmall : styles.textPendingSmall,
                          ]}
                        >
                          {(d.status || 'pending').toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {/* Parties */}
                    <View style={styles.disputePartiesRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.partyRoleLabel}>Customer</Text>
                        <Text style={styles.partyNameText}>{d.customerName}</Text>
                      </View>
                      <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text style={styles.partyRoleLabel}>Provider</Text>
                        <Text style={styles.partyNameText}>{d.providerName}</Text>
                      </View>
                    </View>

                    {/* Reason */}
                    <View style={styles.disputeReasonBox}>
                      <Text style={styles.disputeReasonHeading}>Complaint Reason & Description:</Text>
                      <Text style={styles.disputeReasonBody}>"{d.reason}"</Text>
                      {d.resolutionNotes ? (
                        <View style={styles.resolutionNotesBox}>
                          <Text style={styles.resolutionNotesHeading}>Resolution Notes:</Text>
                          <Text style={styles.resolutionNotesText}>{d.resolutionNotes}</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Footer Row */}
                    <View style={styles.disputeFooterRow}>
                      <View>
                        <Text style={styles.partyRoleLabel}>Disputed Amount</Text>
                        <Text style={styles.disputeAmountText}>
                          LKR {d.amount?.toLocaleString() || 0}
                        </Text>
                      </View>
                      <Text style={styles.disputeDateText}>
                        Filed {new Date(d.createdAt).toLocaleDateString()}
                      </Text>
                    </View>

                    {/* Action Button: Resolve & Issue Customer Credit */}
                    {!isResolved ? (
                      <TouchableOpacity
                        style={styles.modalResolveBtn}
                        onPress={() => handleResolveDisputeAction(d._id)}
                        disabled={resolvingDisputeId === d._id}
                        activeOpacity={0.85}
                      >
                        {resolvingDisputeId === d._id ? (
                          <ActivityIndicator color={colors.white} />
                        ) : (
                          <>
                            <Ionicons
                              name="shield-checkmark"
                              size={18}
                              color={colors.white}
                              style={{ marginRight: 6 }}
                            />
                            <Text style={styles.modalResolveBtnText}>
                              Resolve & Issue Customer Credit
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.resolvedBanner}>
                        <Ionicons name="checkmark-done" size={16} color="#065F46" style={{ marginRight: 6 }} />
                        <Text style={styles.resolvedBannerText}>Credit Issued & Dispute Resolved</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  sectionHint: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
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
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  statCardBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EBF5EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statTapText: {
    fontSize: 10,
    color: colors.forestGreen,
    fontWeight: '600',
    marginTop: 6,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 14,
    marginTop: 10,
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

  // Modal Shared Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.forestGreen,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
  },
  modalHeaderSub: {
    fontSize: 11,
    color: '#D1FAE5',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  chipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chipBtnActive: {
    backgroundColor: colors.forestGreen,
    borderColor: colors.forestGreen,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.white,
  },
  modalCenterBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingModalText: {
    marginTop: 12,
    fontSize: 13,
    color: colors.textSecondary,
  },
  errorModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.danger,
    marginTop: 12,
  },
  errorModalText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  modalRetryBtn: {
    backgroundColor: colors.forestGreen,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalRetryText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  emptyModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 12,
  },
  emptyModalText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  modalListBody: {
    padding: 16,
    paddingBottom: 40,
  },

  // Modal 1: User Card
  userCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  userCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
  },
  userInitialsAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EBF5EE',
    borderWidth: 1.5,
    borderColor: colors.forestGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitialsText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  userNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userFullName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 6,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userRoleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeCustomer: {
    backgroundColor: '#E0F2FE',
  },
  roleBadgeProvider: {
    backgroundColor: '#EBF5EE',
  },
  roleBadgeAdmin: {
    backgroundColor: '#F3E8FF',
  },
  userRoleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  roleTextCustomer: {
    color: '#0369A1',
  },
  roleTextProvider: {
    color: colors.forestGreen,
  },
  roleTextAdmin: {
    color: '#7E22CE',
  },
  userDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  userDetailsGrid: {
    gap: 4,
  },
  userDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetailText: {
    fontSize: 12,
    color: colors.textPrimary,
    flex: 1,
  },
  callUserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF5EE',
    borderWidth: 1,
    borderColor: colors.forestGreen,
    height: 36,
    borderRadius: 8,
    marginTop: 10,
  },
  callUserBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.forestGreen,
  },

  // Modal 2: Provider Card
  providerCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  providerCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  availBadgeOnline: {
    backgroundColor: '#ECFDF5',
  },
  availBadgeOffline: {
    backgroundColor: '#F1F5F9',
  },
  availDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  availText: {
    fontSize: 10,
    fontWeight: '800',
  },
  providerCategoryText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  providerMetricsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  metricLbl: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  verifBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeVerifiedSmall: {
    backgroundColor: '#ECFDF5',
  },
  badgePendingSmall: {
    backgroundColor: '#FEF3C7',
  },
  badgeRejectedSmall: {
    backgroundColor: '#FEE2E2',
  },
  verifTextSmall: {
    fontSize: 9,
    fontWeight: '800',
  },
  textVerifiedSmall: {
    color: '#065F46',
  },
  textPendingSmall: {
    color: '#92400E',
  },
  textRejectedSmall: {
    color: '#991B1B',
  },
  providerInfoFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  providerCityText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  providerLicText: {
    fontSize: 11,
    color: colors.forestGreen,
    fontWeight: '600',
  },

  // Modal 3: Booking Card
  bookingCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  bookingCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bookingRefText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  bookingStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeAcceptedSmall: {
    backgroundColor: '#DBEAFE',
  },
  badgeOnTheWaySmall: {
    backgroundColor: '#E0F2FE',
  },
  badgeCompletedSmall: {
    backgroundColor: '#ECFDF5',
  },
  badgeCancelledSmall: {
    backgroundColor: '#FEE2E2',
  },
  textAcceptedSmall: {
    color: '#1E40AF',
  },
  textOnTheWaySmall: {
    color: '#0369A1',
  },
  textCompletedSmall: {
    color: '#065F46',
  },
  textCancelledSmall: {
    color: '#991B1B',
  },
  bookingStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  bookingServiceTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  bookingParticipantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
  },
  partyRoleLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  partyNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 1,
  },
  bookingScheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingScheduleText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  bookingFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  bookingPayoutLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  bookingPayoutAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  paidPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  paidPillTrue: {
    backgroundColor: '#ECFDF5',
  },
  paidPillFalse: {
    backgroundColor: '#FEF3C7',
  },
  paidPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  paidPillTextTrue: {
    color: '#065F46',
  },
  paidPillTextFalse: {
    color: '#92400E',
  },

  // Modal 4: Dispute Card
  disputeCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  disputeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  disputeIdText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.danger,
  },
  disputeBookingRef: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  disputeStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeResolvedSmall: {
    backgroundColor: '#ECFDF5',
  },
  textResolvedSmall: {
    color: '#065F46',
  },
  disputeStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  disputePartiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  disputeReasonBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  disputeReasonHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 2,
  },
  disputeReasonBody: {
    fontSize: 12,
    color: '#7F1D1D',
    fontStyle: 'italic',
  },
  resolutionNotesBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FCA5A5',
  },
  resolutionNotesHeading: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  resolutionNotesText: {
    fontSize: 11,
    color: '#047857',
    marginTop: 1,
  },
  disputeFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  disputeAmountText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.danger,
  },
  disputeDateText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  modalResolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forestGreen,
    height: 42,
    borderRadius: 8,
  },
  modalResolveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  resolvedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    height: 38,
    borderRadius: 8,
  },
  resolvedBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
});
