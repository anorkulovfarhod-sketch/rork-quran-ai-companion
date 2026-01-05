import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight, CheckCircle, HandHeart } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

type PrayerStep = {
  id: number;
  title: string;
  arabicTitle: string;
  description: string;
  arabicText: string;
  repetition?: string;
};

const prayerSteps: PrayerStep[] = [
  {
    id: 1,
    title: "Intention (Niyyah)",
    arabicTitle: "النية",
    description: "Begin by making the intention in your heart to pray the specific prayer.",
    arabicText: "نَوَيْتُ أَنْ أُصَلِّيَ",
    repetition: "Once",
  },
  {
    id: 2,
    title: "Takbir (Allahu Akbar)",
    arabicTitle: "تَكْبِيرَةُ الإِحْرَام",
    description: "Raise your hands to your ears and say 'Allahu Akbar' (Allah is the Greatest).",
    arabicText: "اللَّهُ أَكْبَر",
    repetition: "Once",
  },
  {
    id: 3,
    title: "Opening Supplication",
    arabicTitle: "دُعَاءُ الاسْتِفْتَاح",
    description: "Place your right hand over your left on your chest and recite the opening supplication.",
    arabicText: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ",
    repetition: "Once",
  },
  {
    id: 4,
    title: "Surah Al-Fatihah",
    arabicTitle: "سُورَةُ الفَاتِحَة",
    description: "Recite Surah Al-Fatihah, the opening chapter of the Quran.",
    arabicText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    repetition: "Once",
  },
  {
    id: 5,
    title: "Recite Quran",
    arabicTitle: "قِرَاءَةُ القُرْآن",
    description: "Recite any chapter or verses from the Quran that you have memorized.",
    arabicText: "قُلْ هُوَ اللَّهُ أَحَدٌ\nاللَّهُ الصَّمَدُ",
    repetition: "Once or more",
  },
  {
    id: 6,
    title: "Ruku (Bowing)",
    arabicTitle: "الرُّكُوع",
    description: "Bow down, placing your hands on your knees, and say the glorification.",
    arabicText: "سُبْحَانَ رَبِّيَ الْعَظِيم",
    repetition: "3 times minimum",
  },
  {
    id: 7,
    title: "Rising from Ruku",
    arabicTitle: "الاعْتِدَال",
    description: "Stand up straight and say the words of praise.",
    arabicText: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ\nرَبَّنَا وَلَكَ الْحَمْد",
    repetition: "Once",
  },
  {
    id: 8,
    title: "Sujud (Prostration)",
    arabicTitle: "السُّجُود",
    description: "Prostrate with your forehead, nose, palms, knees, and toes touching the ground.",
    arabicText: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
    repetition: "3 times minimum (2 prostrations)",
  },
  {
    id: 9,
    title: "Sitting Between Prostrations",
    arabicTitle: "الجَلْسَة بَيْنَ السَّجْدَتَيْن",
    description: "Sit up between the two prostrations and make a brief supplication.",
    arabicText: "رَبِّ اغْفِرْ لِي",
    repetition: "Once",
  },
  {
    id: 10,
    title: "Tashahhud",
    arabicTitle: "التَّشَهُّد",
    description: "After two rakats, sit and recite the Tashahhud.",
    arabicText: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ\nالسَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ",
    repetition: "Once per sitting",
  },
  {
    id: 11,
    title: "Taslim (Salutation)",
    arabicTitle: "التَّسْلِيم",
    description: "Turn your head to the right and then to the left, saying the salutation.",
    arabicText: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّه",
    repetition: "Twice (right and left)",
  },
];

export default function PrayerGuideScreen() {
  const { theme } = useTheme();
  const { translate } = useLanguage();
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const colors = theme === 'light' ? Colors.light : Colors.dark;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <HandHeart color="#ffffff" size={44} strokeWidth={1.5} />
          <Text style={styles.headerTitle}>{translate('prayer_guide')}</Text>
          <Text style={styles.headerArabic}>دليل الصلاة</Text>
          <Text style={styles.headerSubtext}>
            {translate('step_by_step_prayer')}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.introCard, { backgroundColor: colors.parchment }]}>
          <Text style={[styles.introText, { color: colors.text }]}>
            {translate('prayer_guide_intro')}
          </Text>
        </View>

        {prayerSteps.map((step, index) => {
          const isExpanded = expandedStep === step.id;
          return (
            <TouchableOpacity
              key={step.id}
              style={[
                styles.stepCard,
                { backgroundColor: colors.card, shadowColor: colors.primary },
              ]}
              onPress={() => setExpandedStep(isExpanded ? null : step.id)}
              activeOpacity={0.8}
            >
              <View style={styles.stepHeader}>
                <View style={styles.stepNumber}>
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.stepNumberGradient}
                  >
                    <Text style={styles.stepNumberText}>{step.id}</Text>
                  </LinearGradient>
                </View>
                
                <View style={styles.stepTitleContainer}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>
                    {step.title}
                  </Text>
                  <Text style={[styles.stepArabicTitle, { color: colors.primary }]}>
                    {step.arabicTitle}
                  </Text>
                </View>

                <ChevronRight
                  color={colors.muted}
                  size={24}
                  style={{
                    transform: [{ rotate: isExpanded ? '90deg' : '0deg' }],
                  }}
                />
              </View>

              {isExpanded && (
                <View style={styles.stepContent}>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  
                  <Text style={[styles.stepDescription, { color: colors.text }]}>
                    {step.description}
                  </Text>

                  <View style={[styles.arabicBox, { backgroundColor: colors.parchment }]}>
                    <Text style={[styles.arabicText, { color: colors.primary }]}>
                      {step.arabicText}
                    </Text>
                  </View>

                  {step.repetition && (
                    <View style={styles.repetitionBadge}>
                      <CheckCircle color={colors.accent} size={16} />
                      <Text style={[styles.repetitionText, { color: colors.muted }]}>
                        {step.repetition}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={[styles.footerCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.footerText, { color: colors.text }]}>
            {translate('prayer_guide_footer')}
          </Text>
          <Text style={[styles.footerArabic, { color: colors.primary }]}>
            إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا
          </Text>
          <Text style={[styles.footerReference, { color: colors.muted }]}>
            Surah An-Nisa (4:103)
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontFamily: "Georgia",
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
    fontFamily: "Georgia",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  introCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  introText: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    letterSpacing: 0.2,
    fontFamily: "Georgia",
  },
  stepCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  stepNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
  },
  stepNumberGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#ffffff",
  },
  stepTitleContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    letterSpacing: 0.3,
    fontFamily: "Georgia",
    marginBottom: 4,
  },
  stepArabicTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  stepContent: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
    letterSpacing: 0.2,
    fontFamily: "Georgia",
  },
  arabicBox: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  arabicText: {
    fontSize: 20,
    lineHeight: 36,
    textAlign: "center",
    fontWeight: "600" as const,
  },
  repetitionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  repetitionText: {
    fontSize: 14,
    fontWeight: "500" as const,
    letterSpacing: 0.2,
    fontFamily: "Georgia",
  },
  footerCard: {
    padding: 24,
    borderRadius: 20,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  footerText: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 0.2,
    fontFamily: "Georgia",
  },
  footerArabic: {
    fontSize: 18,
    lineHeight: 32,
    textAlign: "center",
    fontWeight: "600" as const,
    marginBottom: 8,
  },
  footerReference: {
    fontSize: 13,
    textAlign: "center",
    letterSpacing: 0.3,
    fontFamily: "Georgia",
  },
});
