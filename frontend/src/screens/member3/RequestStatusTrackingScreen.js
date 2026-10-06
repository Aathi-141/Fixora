import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function RequestStatusTrackingScreen({ navigation, route }) {
  const { booking } = route.params || {};
  const [currentBooking, setCurrentBooking] = useState(booking || null);

  useEffect(() => {
    loadLatestStatus();
  }, [booking]);

  const loadLatestStatus = async () => {
    try {
      const stored = await AsyncStorage.getItem('fixora_latest_booking');
      if (stored) {
        const b = JSON.parse(stored);
        if (!booking || b._id === booking?._id || b.bookingRef === booking?.bookingRef) {
          setCurrentBooking(b);
        }
      }
    } catch (e) {
      console.log('Error reading latest booking in tracking:', e);
    }
  };

  const effectiveBooking = currentBooking || booking;
  const status = effectiveBooking?.status || 'on_the_way';
  const isPaid = effectiveBooking?.isPaid || false;

  const serviceTitle = effectiveBooking?.serviceTitle || 'Plumbing Repair - Leaking Pipe';
  const providerName =
    effectiveBooking?.provider?.user?.name || effectiveBooking?.provider?.name || 'Sunil Perera';
  const providerSpecialization =
    effectiveBooking?.provider?.specialization || 'Master Plumber • 12 Yrs Exp';
  const etaTime = effectiveBooking?.etaTime || '10:00 AM';
  const etaMinutes = effectiveBooking?.etaMinutes || 15;

  const getTimelineSteps = () => {
    const isCompleted = status === 'completed' || isPaid;
    const isOnTheWay = status === 'on_the_way';

    return [
      {
        id: 1,
        title: 'Request Confirmed',
        time: effectiveBooking?.scheduledDate ? `${effectiveBooking.scheduledDate} • Confirmed` : '09:30 AM',
        desc: 'Order validated and scheduled with priority specialist.',
        status: 'completed',
      },
      {
        id: 2,
        title: 'On the Way',
        time: isOnTheWay || isCompleted ? (effectiveBooking?.etaTime || 'En Route') : 'Pending',
        desc: `Specialist is en route to service location (~${etaMinutes} mins ETA).`,
        status: isCompleted ? 'completed' : isOnTheWay ? 'active' : 'upcoming',
      },
      {
        id: 3,
        title: 'Work in Progress',
        time: isCompleted ? 'Completed' : 'Pending',
        desc: 'Diagnostics, precision repairs, and pressure leak testing.',
        status: isCompleted ? 'completed' : 'upcoming',
      },
      {
        id: 4,
        title: isPaid ? 'Service Completed & Paid' : 'Service Completed & Invoiced',
        time: isCompleted ? (isPaid ? 'Settled' : 'Ready for Payment') : 'Pending',
        desc: isPaid
          ? 'Payment confirmed and verified. Protection guarantee active.'
          : 'Digital sign-off completed. Final itemized bill ready for payment.',
        status: isPaid ? 'completed' : isCompleted ? 'active' : 'upcoming',
      },
    ];
  };

  const timelineSteps = getTimelineSteps();
  const bannerMessage =
    status === 'completed' || isPaid
      ? 'Service Completed • Final Bill Ready'
      : status === 'on_the_way'
      ? `Specialist is En Route • Arriving in ~${etaMinutes} mins`
      : 'Specialist Assigned & Accepted';

  const handleCallSpecialist = () => {
    Alert.alert(
      `Call ${providerName}`,
      'Choose communication method:',
      [
        {
          text: 'Direct Phone (+94 77 990 1122)',
          onPress: () => {
            Linking.openURL('tel:+94779901122').catch(() => {
              Alert.alert('Calling', `Dialing ${providerName} at +94 77 990 1122`);
            });
          },
        },
        {
          text: 'In-App Internet Call',
          onPress: () => navigation.navigate('Call', { booking, providerName }),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Status Tracking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Service Category & ETA Banner */}
        <View style={styles.etaCard}>
          <Text style={styles.serviceCategoryText}>{serviceTitle}</Text>
          <View style={styles.enRouteRow}>
            <View style={styles.pulsingDot} />
            <Text style={styles.enRouteText}>
              {bannerMessage}
            </Text>
          </View>
          <Text style={styles.etaTimeText}>Expected Arrival: {etaTime}</Text>
        </View>

        {/* Assigned Specialist Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>ASSIGNED SPECIALIST</Text>
          <View style={styles.providerRow}>
            <Image
              source={{
                uri:
                  effectiveBooking?.provider?.avatar ||
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
              }}
              style={styles.providerAvatar}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.providerName}>{providerName}</Text>
              <Text style={styles.providerSpec}>{providerSpecialization}</Text>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={styles.ratingScore}>4.9 (168 reviews)</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons: Message & Direct Call */}
          <View style={styles.actionBtnRow}>
            <TouchableOpacity
              style={styles.messageBtn}
              onPress={() => navigation.navigate('Chat', { booking: effectiveBooking })}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.forestGreen} style={{ marginRight: 6 }} />
              <Text style={styles.messageBtnText}>Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.callBtn}
              onPress={handleCallSpecialist}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={18} color={colors.white} style={{ marginRight: 6 }} />
              <Text style={styles.callBtnText}>Direct Call</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Progress Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>LIVE PROGRESS TIMELINE</Text>

          <View style={styles.timelineList}>
            {timelineSteps.map((step, index) => {
              const isLast = index === timelineSteps.length - 1;
              const isCompleted = step.status === 'completed';
              const isActive = step.status === 'active';

              return (
                <View key={step.id} style={styles.timelineRow}>
                  {/* Left Column: Icon & Line */}
                  <View style={styles.timelineColLeft}>
                    <View
                      style={[
                        styles.stepDot,
                        isCompleted && styles.stepDotCompleted,
                        isActive && styles.stepDotActive,
                      ]}
                    >
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={14} color={colors.white} />
                      ) : isActive ? (
                        <Ionicons name="navigate" size={14} color={colors.white} />
                      ) : (
                        <View style={styles.stepDotInner} />
                      )}
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.timelineLine,
                          (isCompleted || isActive) && styles.timelineLineActive,
                        ]}
                      />
                    )}
                  </View>

                  {/* Right Column: Step Info */}
                  <View style={styles.timelineColRight}>
                    <View style={styles.stepHeaderRow}>
                      <Text
                        style={[
                          styles.stepTitle,
                          (isCompleted || isActive) && styles.stepTitleActive,
                        ]}
                      >
                        {step.title}
                      </Text>
                      <Text style={styles.stepTime}>{step.time}</Text>
                    </View>
                    <Text style={styles.stepDesc}>{step.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Prominent Green Button: View Final Bill & Pay */}
        <TouchableOpacity
          style={styles.payBillBtn}
          onPress={() => navigation.navigate('FinalBillPayment', { booking: effectiveBooking })}
          activeOpacity={0.85}
        >
          <Ionicons name="card" size={20} color={colors.white} style={{ marginRight: 8 }} />
          <Text style={styles.payBillBtnText}>View Final Bill & Pay</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        {/* Complete & Review Shortcut */}
        <TouchableOpacity
          style={styles.reviewShortcutBtn}
          onPress={() => navigation.navigate('RateReview', { booking: effectiveBooking })}
          activeOpacity={0.85}
        >
          <Ionicons name="star-outline" size={18} color={colors.forestGreen} style={{ marginRight: 8 }} />
          <Text style={styles.reviewShortcutText}>Complete Job & Rate Specialist</Text>
        </TouchableOpacity>
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
  scrollBody: {
    padding: 16,
    paddingBottom: 32,
  },
  etaCard: {
    backgroundColor: colors.forestGreen,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  serviceCategoryText: {
    fontSize: 14,
    color: '#D1E7DD',
    fontWeight: '600',
    marginBottom: 6,
  },
  enRouteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#34D399',
    marginRight: 8,
  },
  enRouteText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
  },
  etaTimeText: {
    fontSize: 13,
    color: '#A7F3D0',
    marginTop: 2,
    fontWeight: '500',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.sageGreen,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  providerSpec: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  ratingScore: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  messageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.forestGreen,
    borderRadius: 10,
    height: 44,
    backgroundColor: '#EBF4EE',
  },
  messageBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.emerald,
    borderRadius: 10,
    height: 44,
  },
  callBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  timelineList: {
    marginTop: 6,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineColLeft: {
    alignItems: 'center',
    width: 32,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotCompleted: {
    backgroundColor: colors.forestGreen,
  },
  stepDotActive: {
    backgroundColor: colors.emerald,
  },
  stepDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  timelineLineActive: {
    backgroundColor: colors.forestGreen,
  },
  timelineColRight: {
    flex: 1,
    marginLeft: 10,
    paddingBottom: 22,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  stepTitleActive: {
    fontWeight: '800',
    color: colors.forestGreen,
  },
  stepTime: {
    fontSize: 12,
    color: colors.textMuted,
  },
  stepDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 16,
  },
  payBillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forestGreen,
    borderRadius: 14,
    height: 52,
    marginBottom: 12,
    shadowColor: colors.forestGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  payBillBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.3,
  },
  reviewShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.forestGreen,
    borderRadius: 12,
    height: 48,
  },
  reviewShortcutText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.forestGreen,
  },
});
