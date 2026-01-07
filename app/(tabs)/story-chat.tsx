import { useRorkAgent } from "@rork-ai/toolkit-sdk";
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Send, BookHeart, ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useChatLimit } from "@/contexts/ChatLimitContext";

export default function StoryChatScreen() {
  const { translate } = useLanguage();
  const { theme } = useTheme();
  const router = useRouter();
  const { canSendMessage, remainingChats, hasUnlimitedChat, incrementChatCount } = useChatLimit();
  const [input, setInput] = useState("");
  
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { messages, error, sendMessage, setMessages } = useRorkAgent({
    tools: {},
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant" as const,
          parts: [
            {
              type: "text" as const,
              text: translate('story_chat_welcome'),
            },
          ],
        },
        {
          id: "system-prompt",
          role: "system" as const,
          parts: [
            {
              type: "text" as const,
              text: translate('story_chat_system_prompt'),
            },
          ],
        },
      ]);
    }
  }, [messages.length, setMessages, fadeAnim, translate]);

  const isLoading = useMemo(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") return false;
    return lastMessage.parts.some(
      (part) => part.type === "tool" && part.state === "input-streaming"
    );
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
    return () => clearTimeout(timer);
  }, [messages]);

  const handleSend = async () => {
    if (input.trim()) {
      if (!canSendMessage) {
        router.push('/paywall');
        return;
      }
      
      sendMessage(input.trim());
      setInput("");
      
      if (!hasUnlimitedChat) {
        await incrementChatCount();
      }
    }
  };

  const colors = theme === 'light' ? Colors.light : Colors.dark;

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <LinearGradient
        colors={theme === 'dark' ? ['#1a1a1a', '#2a2a2a'] : [colors.primary, colors.primaryDark]}
        style={[styles.headerGradient, theme === 'dark' && { shadowColor: '#b8a06e', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 8 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft color={theme === 'dark' ? colors.headingGold : '#ffffff'} size={24} strokeWidth={2} />
          </TouchableOpacity>
          <BookHeart color={theme === 'dark' ? colors.headingGold : '#ffffff'} size={36} strokeWidth={1.5} />
          <Text style={[styles.headerText, { color: theme === 'dark' ? colors.headingGold : '#ffffff' }]}>{translate('story_chat')}</Text>
          <Text style={[styles.headerSubtext, { color: 'rgba(255,255,255,0.8)' }]}>
            {translate('personalized_stories')}
          </Text>
        </View>
      </LinearGradient>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }}
        >
          {messages.length === 1 && (
          <View style={styles.emptyState}>
            <BookHeart color={colors.accent} size={56} strokeWidth={1.5} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{translate('share_your_challenge')}</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              {translate('story_chat_description')}
            </Text>
            <View style={styles.examplesContainer}>
              <TouchableOpacity
                style={[styles.exampleChip, { backgroundColor: colors.card, shadowColor: colors.primary }]}
                onPress={() =>
                  setInput("I'm feeling anxious about my future")
                }
              >
                <Text style={[styles.exampleText, { color: colors.primary }]}>
                  Feeling anxious
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.exampleChip, { backgroundColor: colors.card, shadowColor: colors.primary }]}
                onPress={() =>
                  setInput("I'm struggling with patience")
                }
              >
                <Text style={[styles.exampleText, { color: colors.primary }]}>
                  Struggling with patience
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.exampleChip, { backgroundColor: colors.card, shadowColor: colors.primary }]}
                onPress={() =>
                  setInput("I want to be more grateful")
                }
              >
                <Text style={[styles.exampleText, { color: colors.primary }]}>
                  Want to be grateful
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {messages.filter(m => m.role !== "system").map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.role === "user" ? [styles.userBubble, { backgroundColor: theme === 'dark' ? colors.headingGold : colors.primary, shadowColor: theme === 'dark' ? colors.headingGold : colors.primary }] : [styles.aiBubble, { backgroundColor: colors.card }],
            ]}
          >
            {message.parts.map((part, idx) => {
              if (part.type === "text") {
                return (
                  <Text
                    key={`${message.id}-${idx}`}
                    style={[
                      styles.messageText,
                      message.role === "user"
                        ? styles.userText
                        : { color: colors.text },
                    ]}
                  >
                    {part.text}
                  </Text>
                );
              }
              return null;
            })}
          </View>
        ))}

        {isLoading && (
          <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: colors.card }]}>
            <ActivityIndicator color={theme === 'dark' ? colors.headingGold : colors.primary} />
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Failed to send message. Please try again.
            </Text>
          </View>
        )}
        </ScrollView>
      </Animated.View>

      <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
        {!hasUnlimitedChat && (
          <View style={[styles.limitBanner, { backgroundColor: colors.parchment }]}>
            <Text style={[styles.limitText, { color: colors.text }]}>
              {canSendMessage ? (
                `${remainingChats} free message${remainingChats !== 1 ? 's' : ''} remaining`
              ) : (
                'Free messages used'
              )}
            </Text>
            {!canSendMessage && (
              <TouchableOpacity onPress={() => router.push('/paywall')}>
                <Text style={[styles.unlockText, { color: theme === 'dark' ? colors.headingGold : colors.primary }]}>Unlock Chat</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.parchment, color: colors.text }]}
            value={input}
            onChangeText={setInput}
            placeholder={canSendMessage ? translate('share_your_situation') : 'Upgrade to unlock chat'}
            placeholderTextColor={colors.muted}
            multiline
            maxLength={500}
            editable={canSendMessage}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!input.trim() || !canSendMessage) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!input.trim() || isLoading || !canSendMessage}
          >
            <LinearGradient
              colors={
                input.trim() && canSendMessage
                  ? (theme === 'dark' ? [colors.headingGold, colors.headingGold] : [colors.primary, colors.primaryDark])
                  : [colors.muted, colors.muted]
              }
              style={styles.sendButtonGradient}
            >
              <Send color="#ffffff" size={20} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    alignItems: "center",
  },
  backButton: {
    position: "absolute" as const,
    left: 0,
    top: 0,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  headerText: {
    fontSize: 26,
    fontWeight: "600" as const,
    marginTop: 16,
    letterSpacing: 0.5,
    fontFamily: "Georgia",
  },
  headerSubtext: {
    fontSize: 15,
    marginTop: 6,
    textAlign: "center",
    letterSpacing: 0.3,
    fontFamily: "Georgia",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    paddingHorizontal: 28,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: "600" as const,
    marginTop: 24,
    letterSpacing: 0.4,
    fontFamily: "Georgia",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 24,
    letterSpacing: 0.2,
    fontFamily: "Georgia",
  },
  examplesContainer: {
    marginTop: 36,
    gap: 14,
    width: "100%",
  },
  exampleChip: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  exampleText: {
    fontSize: 15,
    fontWeight: "500" as const,
    textAlign: "center",
    letterSpacing: 0.2,
    fontFamily: "Georgia",
  },
  messageBubble: {
    maxWidth: "82%",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
    marginVertical: 6,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  aiBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
    fontFamily: "Georgia",
  },
  userText: {
    color: "#ffffff",
    fontFamily: "Georgia",
  },
  errorContainer: {
    backgroundColor: "#fee",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  errorText: {
    color: "#c33",
    fontSize: 14,
    fontFamily: "Georgia",
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  limitBanner: {
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  limitText: {
    fontSize: 13,
    fontWeight: "500" as const,
    letterSpacing: 0.2,
    fontFamily: "Georgia",
  },
  unlockText: {
    fontSize: 13,
    fontWeight: "600" as const,
    letterSpacing: 0.3,
    fontFamily: "Georgia",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    maxHeight: 100,
    letterSpacing: 0.2,
    fontFamily: "Georgia",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
