import React, { useState, useEffect, useRef } from "react";
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
      fr: "Et cherchez de l'aide par la patience et la prière.",
      uz: "Sabr va namoz orqali yordam so'rang."
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
      fr: "En vérité, avec la difficulté vient la facilité.",
      uz: "Albatta, qiyinchilik bilan birga osonlik ham bor."
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
      fr: "Souvenez-vous de Moi; Je Me souviendrai de vous.",
      uz: "Meni eslab turing, Men ham sizni eslayman."
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
      fr: "Et Il est avec vous où que vous soyez.",
      uz: "Va U siz qaerda bo'lsangiz ham siz bilan birga."
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
      fr: "Car en vérité, avec la difficulté sera la facilité.",
      uz: "Albatta, qiyinchilik bilan birga osonlik ham bor."
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
      fr: "Et quiconque place sa confiance en Allah, alors Il lui suffit.",
      uz: "Kim Allohga tayanib ishlasa, U unga yetarli."
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
      fr: "En vérité, Allah est avec les patients.",
      uz: "Albatta, Alloh sabrli odamlar bilan birga."
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
      fr: "Notre Seigneur, donne-nous le bien dans ce monde et le bien dans l'au-delà.",
      uz: "Rabbimiz! Bizga dunyoda ham yaxshilik ber, oxiratda ham yaxshilik ber."
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
      fr: "Nulle contrainte en religion.",
      uz: "Dinda majburiyat yo'q."
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
      fr: "Et dis: 'Mon Seigneur, augmente mes connaissances.'",
      uz: "Va ayting: 'Rabbim! Ilmimni oshir.'"
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

  useEffect(() => {
    loadDailyVerse();
  }, []);

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

  const loadDailyVerse = () => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const verseIndex = dayOfYear % verses.length;
    setCurrentVerse(verses[verseIndex]);
  };

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
        colors={[colors.primary, colors.primaryDark]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Sparkles color={colors.secondary} size={44} strokeWidth={1.5} />
          <Text style={styles.headerTitle}>{translate('daily_quran_quote')}</Text>
          <Text style={styles.headerArabic}>اقتباس قرآني يومي</Text>
          <Text style={styles.headerSubtext}>
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
            <BookOpen color={colors.accent} size={32} strokeWidth={1.5} />
          </View>

          <Text style={[styles.verseArabic, { color: colors.primary }]}>{currentVerse.arabic}</Text>
          
          <View style={[styles.divider, { backgroundColor: colors.accent }]} />
          
          <Text style={[styles.verseTranslation, { color: colors.text }]}>{currentVerse.translations[language || 'en']}</Text>
          
          <View style={[styles.referenceContainer, { borderTopColor: colors.border }]}>
            <Text style={[styles.verseReference, { color: colors.muted }]}>{currentVerse.reference}</Text>
          </View>

          <View style={styles.decorativeBottom}>
            <View style={[styles.decorativeLine, { backgroundColor: colors.accent }]} />
          </View>
        </Animated.View>



        <View style={[styles.infoCard, { backgroundColor: colors.parchment, borderLeftColor: colors.accent }]}>
          <Text style={[styles.infoText, { color: colors.text }]}>
            {translate('verse_guide_day')}
          </Text>
          <Text style={[styles.infoArabic, { color: colors.primary }]}>
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
    color: "#ffffff",
    marginTop: 20,
    letterSpacing: 0.8,
    textAlign: "center",
  },
  headerArabic: {
    fontSize: 22,
    fontWeight: "600" as const,
    color: "#ffffff",
    opacity: 0.95,
    marginTop: 8,
  },
  headerSubtext: {
    fontSize: 15,
    color: "#ffffff",
    opacity: 0.88,
    marginTop: 10,
    textAlign: "center",
    letterSpacing: 0.3,
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
  },
  infoReferenceArabic: {
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
    letterSpacing: 0.3,
  },
});
