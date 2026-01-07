import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen, Sparkles } from "lucide-react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from "@/constants/colors";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

type QuranVerse = {
  arabic: string;
  translations: Record<Language, string>;
  reference: string;
};

const verses: QuranVerse[] = [
  {
    arabic: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ",
    translations: {
      en: "And seek help through patience and prayer.",
      ar: "واستعينوا بالصبر والصلاة",
      ur: "اور صبر اور نماز کے ذریعے مدد طلب کرو۔",
      tr: "Sabır ve namaz ile yardım isteyin.",
      fr: "Et cherchez de l'aide par la patience et la prière."
    },
    reference: "Surah Al-Baqarah (2:45)",
  },
  {
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translations: {
      en: "Indeed, with hardship comes ease.",
      ar: "إن مع العسر يسرا",
      ur: "بے شک مشکل کے ساتھ آسانی ہے۔",
      tr: "Şüphesiz ki zorlukla beraber kolaylık vardır.",
      fr: "En vérité, avec la difficulté vient la facilité."
    },
    reference: "Surah Ash-Sharh (94:6)",
  },
  {
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ",
    translations: {
      en: "Remember Me; I will remember you.",
      ar: "فاذكروني أذكركم",
      ur: "مجھے یاد کرو میں تمہیں یاد کروں گا۔",
      tr: "Beni anın, ben de sizi anayım.",
      fr: "Souvenez-vous de Moi; Je Me souviendrai de vous."
    },
    reference: "Surah Al-Baqarah (2:152)",
  },
  {
    arabic: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ",
    translations: {
      en: "And He is with you wherever you are.",
      ar: "وهو معكم أينما كنتم",
      ur: "اور وہ تمہارے ساتھ ہے جہاں کہیں بھی تم ہو۔",
      tr: "Ve O, nerede olursanız olun sizinle beraberdir.",
      fr: "Et Il est avec vous où que vous soyez."
    },
    reference: "Surah Al-Hadid (57:4)",
  },
  {
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translations: {
      en: "For indeed, with hardship will be ease.",
      ar: "فإن مع العسر يسرا",
      ur: "بے شک مشکل کے ساتھ آسانی ہے۔",
      tr: "Muhakkak ki zorlukla beraber kolaylık vardır.",
      fr: "Car en vérité, avec la difficulté sera la facilité."
    },
    reference: "Surah Ash-Sharh (94:5)",
  },
  {
    arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    translations: {
      en: "And whoever relies upon Allah - then He is sufficient for him.",
      ar: "ومن يتوكل على الله فهو حسبه",
      ur: "اور جو اللہ پر بھروسہ کرے تو وہ اس کے لیے کافی ہے۔",
      tr: "Kim Allah'a güvenirse, O ona yeter.",
      fr: "Et quiconque place sa confiance en Allah, alors Il lui suffit."
    },
    reference: "Surah At-Talaq (65:3)",
  },
  {
    arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    translations: {
      en: "Indeed, Allah is with the patient.",
      ar: "إن الله مع الصابرين",
      ur: "بے شک اللہ صبر کرنے والوں کے ساتھ ہے۔",
      tr: "Şüphesiz Allah sabredenlerle beraberdir.",
      fr: "En vérité, Allah est avec les patients."
    },
    reference: "Surah Al-Baqarah (2:153)",
  },
  {
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً",
    translations: {
      en: "Our Lord, give us in this world good and in the Hereafter good.",
      ar: "ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة",
      ur: "اے ہمارے رب ہمیں دنیا میں بھلائی عطا فرما اور آخرت میں بھی بھلائی۔",
      tr: "Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver.",
      fr: "Notre Seigneur, donne-nous le bien dans ce monde et le bien dans l'au-delà."
    },
    reference: "Surah Al-Baqarah (2:201)",
  },
  {
    arabic: "لَا إِكْرَاهَ فِي الدِّينِ",
    translations: {
      en: "There shall be no compulsion in religion.",
      ar: "لا إكراه في الدين",
      ur: "دین میں کوئی جبر نہیں۔",
      tr: "Dinde zorlama yoktur.",
      fr: "Nulle contrainte en religion."
    },
    reference: "Surah Al-Baqarah (2:256)",
  },
  {
    arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
    translations: {
      en: "And say, 'My Lord, increase me in knowledge.'",
      ar: "وقل رب زدني علما",
      ur: "اور کہو: اے میرے رب! میرے علم میں اضافہ فرما۔",
      tr: "Ve de ki: 'Rabbim! İlmimi artır.'",
      fr: "Et dis: 'Mon Seigneur, augmente mes connaissances.'"
    },
    reference: "Surah Ta-Ha (20:114)",
  },
];

export default function QuoteScreen() {
  const { language, translate } = useLanguage();
  const { theme } = useTheme();
  const [currentVerse, setCurrentVerse] = useState<QuranVerse | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const getCurrentDateEST = useCallback(() => {
    const now = new Date();
    const estOffset = -5 * 60;
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const estDate = new Date(utc + (estOffset * 60000));
    return estDate.toISOString().split('T')[0];
  }, []);

  const loadDailyVerse = useCallback(async () => {
    try {
      const currentDateEST = getCurrentDateEST();
      const dateHash = currentDateEST.split('-').reduce((acc, val) => acc + parseInt(val), 0);
      const verseIndex = dateHash % verses.length;
      setCurrentVerse(verses[verseIndex]);
    } catch (error) {
      console.error('Failed to load daily verse:', error);
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      const verseIndex = dayOfYear % verses.length;
      setCurrentVerse(verses[verseIndex]);
    }
  }, [getCurrentDateEST]);

  const checkAndUpdateVerse = useCallback(async () => {
    try {
      const lastUpdate = await AsyncStorage.getItem('last_quote_update');
      const currentDateEST = getCurrentDateEST();
      
      if (!lastUpdate || lastUpdate !== currentDateEST) {
        await AsyncStorage.setItem('last_quote_update', currentDateEST);
        loadDailyVerse();
      }
    } catch (error) {
      console.error('Failed to check verse update:', error);
    }
  }, [getCurrentDateEST, loadDailyVerse]);

  useEffect(() => {
    loadDailyVerse();
    const interval = setInterval(checkAndUpdateVerse, 60000);
    return () => clearInterval(interval);
  }, [loadDailyVerse, checkAndUpdateVerse]);

  useEffect(() => {
    if (currentVerse) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
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
  }, [currentVerse, fadeAnim, scaleAnim]);

  const colors = theme === 'light' ? Colors.light : Colors.dark;

  if (!currentVerse) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.muted }]}>{translate('loading')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={theme === 'dark' ? ['#1a1a1a', '#2a2a2a'] : [colors.primary, colors.primaryDark]}
        style={[styles.headerGradient, theme === 'dark' && { shadowColor: '#b8a06e', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 8 }]}
      >
        <View style={styles.headerContent}>
          <Sparkles color={theme === 'dark' ? colors.headingGold : '#ffffff'} size={44} strokeWidth={1.5} />
          <Text style={[styles.headerTitle, { color: theme === 'dark' ? colors.headingGold : '#ffffff' }]}>{translate('daily_quran_quote')}</Text>
          <Text style={[styles.headerArabic, { color: theme === 'dark' ? colors.headingGold : '#ffffff' }]}>اقتباس قرآني يومي</Text>
          <Text style={[styles.headerSubtext, { color: 'rgba(255,255,255,0.8)' }]}>
            {translate('daily_inspiration')}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.contentContainer} contentContainerStyle={styles.contentInner}>
        <Animated.View
          style={[
            styles.verseCard,
            { backgroundColor: colors.card, shadowColor: colors.primary },
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.decorativeTop}>
            <BookOpen color={theme === 'dark' ? colors.headingGold : colors.accent} size={32} strokeWidth={1.5} />
          </View>

          <Text style={[styles.verseArabic, { color: theme === 'dark' ? colors.headingGold : colors.primary }]}>{currentVerse.arabic}</Text>
          
          <View style={[styles.divider, { backgroundColor: theme === 'dark' ? colors.headingGold : colors.accent }]} />
          
          <Text style={[styles.verseTranslation, { color: colors.text }]}>{currentVerse.translations[language || 'en']}</Text>
          
          <View style={[styles.referenceContainer, { borderTopColor: colors.border }]}>
            <Text style={[styles.verseReference, { color: colors.muted }]}>{currentVerse.reference}</Text>
          </View>

          <View style={styles.decorativeBottom}>
            <View style={[styles.decorativeLine, { backgroundColor: theme === 'dark' ? colors.headingGold : colors.accent }]} />
          </View>
        </Animated.View>



        <View style={[styles.infoCard, { backgroundColor: colors.parchment, borderLeftColor: theme === 'dark' ? colors.headingGold : colors.accent }]}>
          <Text style={[styles.infoText, { color: colors.text }]}>
            {translate('verse_guide_day')}
          </Text>
          <Text style={[styles.infoArabic, { color: theme === 'dark' ? colors.headingGold : colors.primary }]}>
            وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ
          </Text>
          <Text style={[styles.infoReference, { color: colors.text }]}>
            &ldquo;{translate('reminder_benefits')}&rdquo;
          </Text>
          <Text style={[styles.infoReferenceArabic, { color: colors.muted }]}>Surah Adh-Dhariyat (51:55)</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Georgia",
  },
  headerGradient: {
    paddingTop: 48,
    paddingBottom: 36,
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
  headerTitle: {
    fontSize: 28,
    fontWeight: "600" as const,
    marginTop: 20,
    letterSpacing: 0.8,
    textAlign: "center",
    fontFamily: "Georgia",
  },
  headerArabic: {
    fontSize: 22,
    fontWeight: "600" as const,
    marginTop: 8,
  },
  headerSubtext: {
    fontSize: 15,
    marginTop: 10,
    textAlign: "center",
    letterSpacing: 0.3,
    fontFamily: "Georgia",
  },
  contentContainer: {
    flex: 1,
  },
  contentInner: {
    padding: 24,
    paddingBottom: 40,
  },
  verseCard: {
    padding: 32,
    borderRadius: 24,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  decorativeTop: {
    alignItems: "center",
    marginBottom: 28,
  },
  verseArabic: {
    fontSize: 26,
    lineHeight: 48,
    fontWeight: "700" as const,
    textAlign: "center",
    marginBottom: 24,
    letterSpacing: 0.8,
  },
  divider: {
    height: 2,
    marginVertical: 24,
    opacity: 0.3,
  },
  verseTranslation: {
    fontSize: 18,
    lineHeight: 32,
    textAlign: "center",
    fontStyle: "italic" as const,
    letterSpacing: 0.3,
    marginBottom: 24,
    fontFamily: "Georgia",
  },
  referenceContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    alignItems: "center",
  },
  verseReference: {
    fontSize: 14,
    fontWeight: "600" as const,
    letterSpacing: 0.5,
    fontFamily: "Georgia",
  },
  decorativeBottom: {
    alignItems: "center",
    marginTop: 24,
  },
  decorativeLine: {
    width: 60,
    height: 4,
    borderRadius: 2,
  },
  refreshButton: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  refreshButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  refreshButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#ffffff",
    letterSpacing: 0.5,
    fontFamily: "Georgia",
  },
  infoCard: {
    padding: 24,
    borderRadius: 18,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    letterSpacing: 0.2,
    marginBottom: 16,
    fontFamily: "Georgia",
  },
  infoArabic: {
    fontSize: 18,
    lineHeight: 32,
    marginTop: 8,
    textAlign: "center",
    fontWeight: "600" as const,
  },
  infoReference: {
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
    fontStyle: "italic" as const,
    letterSpacing: 0.2,
    fontFamily: "Georgia",
  },
  infoReferenceArabic: {
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
    letterSpacing: 0.3,
    fontFamily: "Georgia",
  },
});
