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
import { Send, BookOpen, ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ChatScreen() {
  const { translate } = useLanguage();
  const router = useRouter();
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
              text: translate('welcome_message'),
            },
          ],
        },
        {
          id: "system-prompt",
          role: "system" as const,
          parts: [
            {
              type: "text" as const,
              text: translate('chat_system_prompt'),
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
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <LinearGradient
        colors={[Colors.light.primary, Colors.light.primaryDark]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft color="#ffffff" size={24} strokeWidth={2} />
          </TouchableOpacity>
          <BookOpen color={Colors.light.secondary} size={36} strokeWidth={1.5} />
          <Text style={styles.headerText}>{translate('quranic_guidance')}</Text>
          <Text style={styles.headerSubtext}>
            {translate('scholarly_insights')}
          </Text>
        </View>
      </LinearGradient>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.length === 1 && (
          <View style={styles.emptyState}>
            <BookOpen color={Colors.light.accent} size={56} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>{translate('your_learning_journey')}</Text>
            <Text style={styles.emptyText}>
              {translate('explore_verses')}
            </Text>
            <View style={styles.examplesContainer}>
              <TouchableOpacity
                style={styles.exampleChip}
                onPress={() =>
                  setInput("What is the meaning of Ayat al-Kursi?")
                }
              >
                <Text style={styles.exampleText}>
                  Ayat al-Kursi meaning
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.exampleChip}
                onPress={() =>
                  setInput("Tell me about Surah Al-Fatiha")
                }
              >
                <Text style={styles.exampleText}>
                  Surah Al-Fatiha
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.exampleChip}
                onPress={() =>
                  setInput("What does the Quran say about patience?")
                }
              >
                <Text style={styles.exampleText}>
                  Patience in Quran
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
              message.role === "user" ? styles.userBubble : styles.aiBubble,
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
                        : styles.aiText,
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
          <View style={[styles.messageBubble, styles.aiBubble]}>
            <ActivityIndicator color={Colors.light.primary} />
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

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={translate('ask_about_verse')}
            placeholderTextColor={Colors.light.muted}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !input.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <LinearGradient
              colors={
                input.trim()
                  ? [Colors.light.primary, Colors.light.primaryDark]
                  : [Colors.light.muted, Colors.light.muted]
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
    backgroundColor: Colors.light.background,
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
    color: "#ffffff",
    marginTop: 16,
    letterSpacing: 0.5,
  },
  headerSubtext: {
    fontSize: 15,
    color: "#ffffff",
    opacity: 0.92,
    marginTop: 6,
    textAlign: "center",
    letterSpacing: 0.3,
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
    color: Colors.light.text,
    marginTop: 24,
    letterSpacing: 0.4,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.muted,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  examplesContainer: {
    marginTop: 36,
    gap: 14,
    width: "100%",
  },
  exampleChip: {
    backgroundColor: Colors.light.card,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  exampleText: {
    fontSize: 15,
    color: Colors.light.primary,
    fontWeight: "500" as const,
    textAlign: "center",
    letterSpacing: 0.2,
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
    backgroundColor: Colors.light.primary,
    borderBottomRightRadius: 6,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: Colors.light.card,
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
  },
  userText: {
    color: "#ffffff",
  },
  aiText: {
    color: Colors.light.text,
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
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: Colors.light.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.light.parchment,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.light.text,
    maxHeight: 100,
    letterSpacing: 0.2,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: Colors.light.primary,
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
