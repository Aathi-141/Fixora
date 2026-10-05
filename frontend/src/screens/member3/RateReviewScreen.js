import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { submitReview } from '../../services/api';

const PRAISE_TAGS = [
  'Punctual & On Time',
  'Clean Work Area',
  'Fair & Transparent',
  'Professional & Polite',
];

const TIP_OPTIONS = [0, 200, 500, 1000];

export default function RateReviewScreen({ navigation, route }) {
  const { booking } = route.params || {};
  const { user } = useContext(AuthContext);

  const providerName =
    booking?.provider?.user?.name || booking?.provider?.name || 'Sunil Perera';
  const providerSpec =
    booking?.provider?.specialization || 'Master Plumber • 12 Yrs Exp';
  const providerId = booking?.provider?._id || '66fa_prov_id';

  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedTip, setSelectedTip] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const getRatingLabel = () => {
    switch (rating) {
      case 5:
        return 'Exceptional (5.0)';
      case 4:
        return 'Very Good (4.0)';
      case 3:
        return 'Good (3.0)';
      case 2:
        return 'Fair (2.0)';
      case 1:
        return 'Poor (1.0)';
      default:
        return 'Tap a star to rate';
    }
  };

  const handleDismiss = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating before submitting.');
      return;
    }

    setIsSubmitting(true);
    await submitReview({
      bookingId: booking?._id,
      providerId,
      rating,
      praiseTags: selectedTags,
      reviewText: comment,
      tipAmount: selectedTip,
      customerName: user?.name || 'Kasun Perera',
    });
    setIsSubmitting(false);

    Alert.alert(
      'Review Added!',
      `Thank you for helping verify quality for the Fixora community. Your feedback and ${
        selectedTip > 0 ? `LKR ${selectedTip} tip` : 'rating'
      } have been recorded.`,
      [
        {
          text: 'Done',
          onPress: handleDismiss,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={handleDismiss}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate & Review</Text>
        <TouchableOpacity onPress={handleDismiss}>
          <Text style={styles.skipBtnText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollBody}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Provider Summary Card */}
          <View style={styles.providerCard}>
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
              <Text style={styles.providerSpec}>{providerSpec}</Text>
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-done" size={14} color={colors.forestGreen} style={{ marginRight: 4 }} />
                <Text style={styles.completedText}>Job Completed Today</Text>
              </View>
            </View>
          </View>

          {/* Star Rating Section */}
          <View style={styles.ratingCard}>
            <Text style={styles.ratingPrompt}>How was your overall service experience?</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => {
                const isSelected = rating > 0 && star <= rating;
                return (
                  <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                    <Ionicons
                      name={isSelected ? 'star' : 'star-outline'}
                      size={36}
                      color={isSelected ? '#F59E0B' : '#CBD5E1'}
                      style={{ marginHorizontal: 6 }}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.ratingLabel}>{getRatingLabel()}</Text>
          </View>

          {/* 1-Tap Praise Tags */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>What did you like most?</Text>
            <Text style={styles.sectionSub}>Tap compliments to highlight provider strengths</Text>
            <View style={styles.tagsGrid}>
              {PRAISE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tagPill, isSelected && styles.tagPillActive]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Ionicons
                      name={isSelected ? 'checkmark' : 'add'}
                      size={16}
                      color={isSelected ? colors.white : colors.forestGreen}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.tagText, isSelected && styles.tagTextActive]}>{tag}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Tip Specialist in LKR */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Add Tip for Specialist</Text>
            <Text style={styles.sectionSub}>100% of tip goes directly to the professional</Text>
            <View style={styles.tipRow}>
              {TIP_OPTIONS.map((tip) => {
                const isSelected = selectedTip === tip;
                return (
                  <TouchableOpacity
                    key={tip}
                    style={[styles.tipChip, isSelected && styles.tipChipActive]}
                    onPress={() => setSelectedTip(tip)}
                  >
                    <Text style={[styles.tipText, isSelected && styles.tipTextActive]}>
                      {tip === 0 ? 'No Tip' : `LKR ${tip}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Comments Input (Scrollable and keyboard safe) */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Write a Review</Text>
            <TextInput
              style={styles.commentInput}
              multiline
              numberOfLines={4}
              placeholder="Share feedback to help other Sri Lankan homeowners..."
              placeholderTextColor={colors.textMuted}
              value={comment}
              onChangeText={setComment}
            />
          </View>

          {/* Submit Review Button */}
          <TouchableOpacity
            style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={rating === 0 ? 0.9 : 0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text
                style={[
                  styles.submitBtnText,
                  rating === 0 && styles.submitBtnTextDisabled,
                ]}
              >
                Submit Review &gt;
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: colors.white,
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  skipBtnText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 160, // Generous padding to prevent keyboard covering input
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
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
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  completedText: {
    fontSize: 11,
    color: colors.forestGreen,
    fontWeight: '600',
  },
  ratingCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ratingPrompt: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 14,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  ratingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  sectionSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  tagPillActive: {
    backgroundColor: colors.forestGreen,
    borderColor: colors.forestGreen,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tagTextActive: {
    color: colors.white,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tipChip: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F8FAF9',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  tipChipActive: {
    backgroundColor: colors.forestGreen,
    borderColor: colors.forestGreen,
  },
  tipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tipTextActive: {
    color: colors.white,
  },
  commentInput: {
    backgroundColor: '#F8FAF9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    fontSize: 14,
    color: colors.textPrimary,
    height: 90,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: colors.forestGreen,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: colors.forestGreen,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 6,
  },
  submitBtnDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  submitBtnTextDisabled: {
    color: '#94A3B8',
  },
});
