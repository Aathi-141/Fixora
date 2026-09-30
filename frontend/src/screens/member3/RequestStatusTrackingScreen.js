import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const TIMELINE_STEPS = [
  {
    id: 1,
    title: 'Request Confirmed',
    time: '09:30 AM',
    desc: 'Order validated and scheduled with priority specialist.',
    status: 'completed',
  },
  {
    id: 2,
    title: 'On the Way',
    time: '09:45 AM',
    desc: 'Specialist is en route via Baseline Road (~15 mins ETA).',
    status: 'active',
  },
  {
    id: 3,
    title: 'Work in Progress',
    time: 'Pending',
    desc: 'Diagnostics, pipe repairs, and pressure sealing.',
    status: 'upcoming',
  },
  {
    id: 4,
    title: 'Service Completed & Invoiced',
    time: 'Pending',
    desc: 'Digital sign-off, final inspection, and warranty activation.',
    status: 'upcoming',
  },
];

export default function RequestStatusTrackingScreen({ navigation, route }) {
  const { booking } = route.params || {};

  const serviceTitle = booking?.serviceTitle || 'Plumbing Repair - Leaking Pipe';
  const providerName =
    booking?.provider?.user?.name || booking?.provider?.name || 'Sunil Perera';
  const providerSpecialization =
    booking?.provider?.specialization || 'Master Plumber • 12 Yrs Exp';
  const etaTime = booking?.etaTime || '10:00 AM';
  const etaMinutes = booking?.etaMinutes || 15;

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
              Specialist is En Route • Arriving in ~{etaMinutes} mins
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
                  booking?.provider?.avatar ||
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
              onPress={() => navigation.navigate('Chat', { booking })}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.forestGreen} style={{ marginRight: 6 }} />
              <Text style={styles.messageBtnText}>Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => navigation.navigate('Call', { booking, providerName })}
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
            {TIMELINE_STEPS.map((step, index) => {
              const isLast = index === TIMELINE_STEPS.length - 1;
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

        {/* Complete & Review Shortcut */}
        <TouchableOpacity
          style={styles.reviewShortcutBtn}
          onPress={() => navigation.navigate('RateReview', { booking })}
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
