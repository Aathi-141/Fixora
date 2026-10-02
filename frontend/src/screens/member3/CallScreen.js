import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function CallScreen({ navigation, route }) {
  const { providerName = 'Sunil Perera' } = route.params || {};
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Top Banner */}
      <View style={styles.topBanner}>
        <Ionicons name="lock-closed" size={14} color="#A7F3D0" style={{ marginRight: 6 }} />
        <Text style={styles.encryptionText}>ENCRYPTED VOIP CALL • 128-bit</Text>
      </View>

      {/* Specialist Details */}
      <View style={styles.centerSection}>
        <View style={styles.avatarBorder}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
            }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.callerName}>{providerName}</Text>
        <Text style={styles.callerRole}>Master Plumber • Fixora Verified</Text>
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
      </View>

      {/* Call Actions */}
      <View style={styles.controlsSection}>
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={24}
              color={isMuted ? colors.forestGreen : colors.white}
            />
            <Text style={styles.controlLabel}>{isMuted ? 'Muted' : 'Mute'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn}>
            <Ionicons name="keypad" size={24} color={colors.white} />
            <Text style={styles.controlLabel}>Keypad</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, isSpeaker && styles.controlBtnActive]}
            onPress={() => setIsSpeaker(!isSpeaker)}
          >
            <Ionicons
              name={isSpeaker ? 'volume-high' : 'volume-medium'}
              size={24}
              color={isSpeaker ? colors.forestGreen : colors.white}
            />
            <Text style={styles.controlLabel}>Speaker</Text>
          </TouchableOpacity>
        </View>

        {/* End Call Button */}
        <TouchableOpacity
          style={styles.endCallBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Ionicons name="call" size={28} color={colors.white} style={{ transform: [{ rotate: '135deg' }] }} />
          <Text style={styles.endCallText}>End Call</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F2918', // Deep forest background for call
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  topBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },
  encryptionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A7F3D0',
    letterSpacing: 0.5,
  },
  centerSection: {
    alignItems: 'center',
  },
  avatarBorder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.sageGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 108,
    height: 108,
    borderRadius: 54,
  },
  callerName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 4,
  },
  callerRole: {
    fontSize: 14,
    color: '#A7F3D0',
    fontWeight: '500',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
  },
  controlsSection: {
    width: '100%',
    alignItems: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 36,
  },
  controlBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnActive: {
    backgroundColor: colors.white,
  },
  controlLabel: {
    fontSize: 11,
    color: colors.white,
    marginTop: 4,
    fontWeight: '500',
  },
  endCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    width: '80%',
    height: 54,
    borderRadius: 27,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  endCallText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});
