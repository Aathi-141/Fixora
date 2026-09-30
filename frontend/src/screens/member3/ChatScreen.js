import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { getChatMessages, sendChatMessage } from '../../services/api';

const QUICK_REPLIES = ["Exact Location", "I'm Outside", 'Call on Arrival'];

export default function ChatScreen({ navigation, route }) {
  const { booking } = route.params || {};
  const { user } = useContext(AuthContext);

  const bookingId = booking?._id || '66fa_default_bk';
  const bookingRef = booking?.bookingRef || 'BK-8402';
  const serviceTitle = booking?.serviceTitle || 'Leaking Kitchen Pipe';
  const providerName =
    booking?.provider?.user?.name || booking?.provider?.name || 'Sunil Perera';

  const [messages, setMessages] = useState([
    {
      _id: '1',
      senderRole: 'provider',
      senderName: providerName,
      text: 'Hello! I have picked up the replacement valves and am on my way to your location.',
      time: '09:42 AM',
    },
    {
      _id: '2',
      senderRole: 'customer',
      senderName: user?.name || 'Kasun Perera',
      text: 'Thanks Sunil! Please ring the bell at Gate 2 when you arrive.',
      time: '09:44 AM',
    },
    {
      _id: '3',
      senderRole: 'provider',
      senderName: providerName,
      text: 'Understood. I will be there in about 15 minutes.',
      time: '09:45 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const res = await getChatMessages(bookingId);
    if (res.success && res.data && res.data.length > 0) {
      setMessages(
        res.data.map((m) => ({
          _id: m._id,
          senderRole: m.senderRole,
          senderName: m.senderName,
          text: m.text,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }))
      );
    }
  };

  const handleSend = async (customText = null, isQuick = false) => {
    const messageToSend = customText || inputText;
    if (!messageToSend.trim()) return;

    const newMsg = {
      _id: Date.now().toString(),
      senderRole: 'customer',
      senderName: user?.name || 'Kasun Perera',
      text: messageToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    await sendChatMessage(bookingId, {
      text: messageToSend,
      isQuickReply: isQuick,
      senderRole: 'customer',
      senderName: user?.name || 'Kasun Perera',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.headerTitle}>{providerName}</Text>
            <Ionicons name="checkmark-circle" size={16} color={colors.sageGreen} style={{ marginLeft: 4 }} />
          </View>
          <Text style={styles.headerSub}>Active Service Provider • Online</Text>
        </View>
        <TouchableOpacity
          style={styles.callIconBtn}
          onPress={() => navigation.navigate('Call', { booking, providerName })}
        >
          <Ionicons name="call" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Pinned Booking Context Banner */}
      <View style={styles.pinnedBanner}>
        <Ionicons name="construct-outline" size={16} color={colors.forestGreen} style={{ marginRight: 6 }} />
        <Text style={styles.pinnedText} numberOfLines={1}>
          Booking #{bookingRef} • {serviceTitle}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Messages Stream */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }) => {
            const isMe = item.senderRole === 'customer';
            return (
              <View
                style={[
                  styles.messageBubbleContainer,
                  isMe ? styles.alignRight : styles.alignLeft,
                ]}
              >
                {!isMe && <Text style={styles.senderLabel}>{item.senderName}</Text>}
                <View
                  style={[
                    styles.messageBubble,
                    isMe ? styles.bubbleCustomer : styles.bubbleProvider,
                  ]}
                >
                  <Text style={[styles.messageText, isMe && styles.textWhite]}>
                    {item.text}
                  </Text>
                  <Text style={[styles.messageTime, isMe && styles.timeWhite]}>
                    {item.time}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {/* 1-Tap Quick Reply Chips */}
        <View style={styles.quickReplyContainer}>
          <Text style={styles.quickReplyPrompt}>Quick replies:</Text>
          <View style={styles.chipsRow}>
            {QUICK_REPLIES.map((chip, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.quickChip}
                onPress={() => handleSend(chip, true)}
              >
                <Text style={styles.quickChipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  headerSub: {
    fontSize: 12,
    color: '#D1E7DD',
  },
  callIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinnedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4EE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D2E7D8',
  },
  pinnedText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 10,
  },
  messageBubbleContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  alignRight: {
    alignSelf: 'flex-end',
  },
  alignLeft: {
    alignSelf: 'flex-start',
  },
  senderLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 2,
    marginLeft: 4,
    fontWeight: '600',
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleCustomer: {
    backgroundColor: colors.emerald,
    borderBottomRightRadius: 4,
  },
  bubbleProvider: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 19,
  },
  messageTime: {
    fontSize: 10,
    color: colors.textMuted,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  textWhite: {
    color: colors.white,
  },
  timeWhite: {
    color: '#D1E7DD',
  },
  quickReplyContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  quickReplyPrompt: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickChip: {
    backgroundColor: '#EBF4EE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.sageGreen,
  },
  quickChipText: {
    fontSize: 12,
    color: colors.forestGreen,
    fontWeight: '700',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 44,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginRight: 10,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.emerald,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
