import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen, Check } from "lucide-react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { useLanguage, Language } from "@/contexts/LanguageContext";

const languages = [
  { code: "en" as Language, name: "English", nameArabic: "الإنجليزية" },
  { code: "ar" as Language, name: "العربية", nameArabic: "Arabic" },
  { code: "ur" as Language, name: "اردو", nameArabic: "Urdu" },
  { code: "tr" as Language, name: "Türkçe", nameArabic: "Turkish" },
  { code: "fr" as Language, name: "Français", nameArabic: "French" },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const splashScale = useRef(new Animated.Value(0.3)).current;
  const splashRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (language) {
      router.replace("/(tabs)/quran" as any);
      return;
    }

    if (showSplash) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(splashScale, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(splashRotate, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(800),
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSplash(false);
      });
    } else if (!language) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [language, fadeAnim, scaleAnim, router, showSplash, splashOpacity, splashScale, splashRotate]);

  const handleLanguageSelect = async (langCode: Language) => {
    await setLanguage(langCode);
    router.replace("/(tabs)/quran" as any);
  };

  if (language) {
    return null;
  }

  const rotateInterpolate = splashRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (showSplash) {
    return (
      <Animated.View style={[styles.splashContainer, { opacity: splashOpacity }]}>
        <LinearGradient
          colors={['#0a1628', '#1a2845', '#2a3f5f']}
          style={styles.splashGradient}
        >
          <Animated.View
            style={{
              transform: [
                { scale: splashScale },
                { rotate: rotateInterpolate },
              ],
            }}
          >
            <View style={styles.splashIconContainer}>
              <BookOpen color="#d4af37" size={72} strokeWidth={1.5} />
            </View>
          </Animated.View>
          <Animated.Text
            style={[
              styles.splashArabic,
              {
                opacity: splashScale,
                transform: [{ scale: splashScale }],
              },
            ]}
          >
            القرآن الكريم
          </Animated.Text>
          <Animated.Text
            style={[
              styles.splashSubtext,
              {
                opacity: splashScale,
              },
            ]}
          >
            The Noble Quran
          </Animated.Text>
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primary, Colors.light.primaryDark]}
        style={styles.headerGradient}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <BookOpen color={Colors.light.secondary} size={52} strokeWidth={1.5} />
          <Text style={styles.welcomeArabic}>بسم الله الرحمن الرحيم</Text>
          <Text style={styles.welcomeTitle}>Bismillah ar-Rahman ar-Rahim</Text>
          <Text style={styles.welcomeSubtext}>
            In the name of Allah, the Most Gracious, the Most Merciful
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.contentContainer} contentContainerStyle={styles.contentInner}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.sectionTitle}>Select Your Language</Text>
          <Text style={styles.sectionSubtext}>اختر لغتك</Text>

          <View style={styles.languagesContainer}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={styles.languageCard}
                onPress={() => handleLanguageSelect(lang.code)}
                activeOpacity={0.7}
              >
                <View style={styles.languageTextContainer}>
                  <Text style={styles.languageName}>{lang.name}</Text>
                  <Text style={styles.languageNameSecondary}>{lang.nameArabic}</Text>
                </View>
                <View style={styles.languageCheckbox}>
                  <Check color={Colors.light.accent} size={20} strokeWidth={2.5} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footerCard}>
            <Text style={styles.footerText}>
              Your Quranic learning journey begins here. May Allah guide us all on the
              straight path.
            </Text>
            <Text style={styles.footerTextArabic}>اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerGradient: {
    paddingTop: 64,
    paddingBottom: 40,
    paddingHorizontal: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  headerContent: {
    alignItems: "center",
  },
  welcomeArabic: {
    fontSize: 24,
    fontWeight: "600" as const,
    color: "#ffffff",
    marginTop: 24,
    textAlign: "center",
    letterSpacing: 1,
  },
  welcomeTitle: {
    fontSize: 18,
    color: "#ffffff",
    opacity: 0.95,
    marginTop: 12,
    textAlign: "center",
    letterSpacing: 0.4,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.85,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  contentContainer: {
    flex: 1,
  },
  contentInner: {
    padding: 28,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "600" as const,
    color: Colors.light.text,
    textAlign: "center",
    marginTop: 12,
    letterSpacing: 0.5,
  },
  sectionSubtext: {
    fontSize: 20,
    color: Colors.light.muted,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  languagesContainer: {
    gap: 14,
  },
  languageCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.card,
    padding: 22,
    borderRadius: 18,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.text,
    letterSpacing: 0.3,
  },
  languageNameSecondary: {
    fontSize: 14,
    color: Colors.light.muted,
    marginTop: 4,
  },
  languageCheckbox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.parchment,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.light.accent,
  },
  footerCard: {
    backgroundColor: Colors.light.parchment,
    padding: 24,
    borderRadius: 18,
    marginTop: 40,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.accent,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  footerText: {
    fontSize: 15,
    color: Colors.light.text,
    textAlign: "center",
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  footerTextArabic: {
    fontSize: 18,
    color: Colors.light.primary,
    textAlign: "center",
    marginTop: 12,
    fontWeight: "600" as const,
  },
  splashContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  splashGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  splashIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#d4af37',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  splashArabic: {
    fontSize: 42,
    fontWeight: '700' as const,
    color: '#d4af37',
    marginTop: 48,
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(212, 175, 55, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  splashSubtext: {
    fontSize: 20,
    fontWeight: '500' as const,
    color: '#ffffff',
    marginTop: 16,
    textAlign: 'center',
    letterSpacing: 1.5,
    opacity: 0.9,
  },
});
