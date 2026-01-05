import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight, CheckCircle, HandHeart, ChevronDown, Droplets } from "lucide-react-native";
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
  imageUrl?: string;
};

type WuduStep = {
  id: number;
  title: string;
  arabicTitle: string;
  description: string;
  repetition: string;
  imageUrl: string;
};

type PrayerInfo = {
  id: string;
  name: string;
  arabicName: string;
  rakats: number;
  sunnahBefore?: number;
  sunnahAfter?: number;
  description: string;
};

const prayers: PrayerInfo[] = [
  {
    id: "fajr",
    name: "Fajr",
    arabicName: "الفجر",
    rakats: 2,
    sunnahBefore: 2,
    description: "Dawn prayer - 2 Fard rakats (plus 2 Sunnah before)",
  },
  {
    id: "dhuhr",
    name: "Dhuhr",
    arabicName: "الظهر",
    rakats: 4,
    sunnahBefore: 4,
    sunnahAfter: 2,
    description: "Noon prayer - 4 Fard rakats (plus 4 Sunnah before, 2 after)",
  },
  {
    id: "asr",
    name: "Asr",
    arabicName: "العصر",
    rakats: 4,
    description: "Afternoon prayer - 4 Fard rakats",
  },
  {
    id: "maghrib",
    name: "Maghrib",
    arabicName: "المغرب",
    rakats: 3,
    sunnahAfter: 2,
    description: "Sunset prayer - 3 Fard rakats (plus 2 Sunnah after)",
  },
  {
    id: "isha",
    name: "Isha",
    arabicName: "العشاء",
    rakats: 4,
    sunnahAfter: 2,
    description: "Night prayer - 4 Fard rakats (plus 2 Sunnah after + 3 Witr)",
  },
];

const wuduSteps: WuduStep[] = [
  {
    id: 1,
    title: "Intention (Niyyah)",
    arabicTitle: "النية",
    description: "Make the intention in your heart to perform wudu for the purpose of prayer and purification.",
    repetition: "Once",
    imageUrl: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Say Bismillah",
    arabicTitle: "بسم الله",
    description: "Begin by saying 'Bismillah' (In the name of Allah) before starting.",
    repetition: "Once",
    imageUrl: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Wash Hands",
    arabicTitle: "غسل اليدين",
    description: "Wash both hands up to the wrists thoroughly, ensuring water reaches between the fingers.",
    repetition: "3 times",
    imageUrl: "https://images.unsplash.com/photo-1584852882722-d9f896c6e3cb?w=800&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Rinse Mouth",
    arabicTitle: "المضمضة",
    description: "Take water into your mouth, swirl it around thoroughly, and then spit it out.",
    repetition: "3 times",
    imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Clean Nose",
    arabicTitle: "الاستنشاق",
    description: "Sniff water into your nostrils and then blow it out, using the left hand to clean.",
    repetition: "3 times",
    imageUrl: "https://images.unsplash.com/photo-1610276198568-edd8cb7c8593?w=800&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "Wash Face",
    arabicTitle: "غسل الوجه",
    description: "Wash the entire face from the hairline to the chin, and from ear to ear.",
    repetition: "3 times",
    imageUrl: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&auto=format&fit=crop",
  },
  {
    id: 7,
    title: "Wash Arms",
    arabicTitle: "غسل اليدين إلى المرفقين",
    description: "Wash both arms from fingertips to elbows, starting with the right arm.",
    repetition: "3 times each",
    imageUrl: "https://images.unsplash.com/photo-1584555684040-bad07f5c0d1e?w=800&auto=format&fit=crop",
  },
  {
    id: 8,
    title: "Wipe Head",
    arabicTitle: "مسح الرأس",
    description: "Wet your hands and wipe over your head from front to back and back to front.",
    repetition: "Once",
    imageUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&auto=format&fit=crop",
  },
  {
    id: 9,
    title: "Clean Ears",
    arabicTitle: "مسح الأذنين",
    description: "Use your wet fingers to wipe the inside and outside of both ears.",
    repetition: "Once",
    imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&auto=format&fit=crop",
  },
  {
    id: 10,
    title: "Wash Feet",
    arabicTitle: "غسل القدمين",
    description: "Wash both feet up to the ankles, including between the toes, starting with the right foot.",
    repetition: "3 times each",
    imageUrl: "https://images.unsplash.com/photo-1585932534551-c4c8b0c8c40b?w=800&auto=format&fit=crop",
  },
];

const prayerSteps: PrayerStep[] = [
  {
    id: 1,
    title: "Intention (Niyyah)",
    arabicTitle: "النية",
    description: "Begin by making the intention in your heart to pray the specific prayer.",
    arabicText: "نَوَيْتُ أَنْ أُصَلِّيَ",
    repetition: "Once",
    imageUrl: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Takbir (Allahu Akbar)",
    arabicTitle: "تَكْبِيرَةُ الإِحْرَام",
    description: "Raise your hands to your ears and say 'Allahu Akbar' (Allah is the Greatest).",
    arabicText: "اللَّهُ أَكْبَر",
    repetition: "Once",
    imageUrl: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Opening Supplication",
    arabicTitle: "دُعَاءُ الاسْتِفْتَاح",
    description: "Place your right hand over your left on your chest and recite the opening supplication.",
    arabicText: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ",
    repetition: "Once",
    imageUrl: "https://images.unsplash.com/photo-1585932534551-c4c8b0c8c40b?w=800&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Surah Al-Fatihah",
    arabicTitle: "سُورَةُ الفَاتِحَة",
    description: "Recite Surah Al-Fatihah, the opening chapter of the Quran.",
    arabicText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    repetition: "Once",
    imageUrl: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Recite Quran",
    arabicTitle: "قِرَاءَةُ القُرْآن",
    description: "Recite any chapter or verses from the Quran that you have memorized.",
    arabicText: "قُلْ هُوَ اللَّهُ أَحَدٌ\nاللَّهُ الصَّمَدُ",
    repetition: "Once or more",
    imageUrl: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "Ruku (Bowing)",
    arabicTitle: "الرُّكُوع",
    description: "Bow down, placing your hands on your knees, and say the glorification.",
    arabicText: "سُبْحَانَ رَبِّيَ الْعَظِيم",
    repetition: "3 times minimum",
    imageUrl: "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=800&auto=format&fit=crop",
  },
  {
    id: 7,
    title: "Rising from Ruku",
    arabicTitle: "الاعْتِدَال",
    description: "Stand up straight and say the words of praise.",
    arabicText: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ\nرَبَّنَا وَلَكَ الْحَمْد",
    repetition: "Once",
    imageUrl: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&auto=format&fit=crop",
  },
  {
    id: 8,
    title: "Sujud (Prostration)",
    arabicTitle: "السُّجُود",
    description: "Prostrate with your forehead, nose, palms, knees, and toes touching the ground.",
    arabicText: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
    repetition: "3 times minimum (2 prostrations)",
    imageUrl: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop",
  },
  {
    id: 9,
    title: "Sitting Between Prostrations",
    arabicTitle: "الجَلْسَة بَيْنَ السَّجْدَتَيْن",
    description: "Sit up between the two prostrations and make a brief supplication.",
    arabicText: "رَبِّ اغْفِرْ لِي",
    repetition: "Once",
    imageUrl: "https://images.unsplash.com/photo-1583468323330-9032ad490fed?w=800&auto=format&fit=crop",
  },
  {
    id: 10,
    title: "Tashahhud",
    arabicTitle: "التَّشَهُّد",
    description: "After two rakats, sit and recite the Tashahhud.",
    arabicText: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ\nالسَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ",
    repetition: "Once per sitting",
    imageUrl: "https://images.unsplash.com/photo-1583468323330-9032ad490fed?w=800&auto=format&fit=crop",
  },
  {
    id: 11,
    title: "Taslim (Salutation)",
    arabicTitle: "التَّسْلِيم",
    description: "Turn your head to the right and then to the left, saying the salutation.",
    arabicText: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّه",
    repetition: "Twice (right and left)",
    imageUrl: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&auto=format&fit=crop",
  },
];

export default function PrayerGuideScreen() {
  const { theme } = useTheme();
  const { translate } = useLanguage();
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [expandedWuduStep, setExpandedWuduStep] = useState<number | null>(null);
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerInfo>(prayers[0]);
  const [showPrayerPicker, setShowPrayerPicker] = useState(false);
  const [activeSection, setActiveSection] = useState<'wudu' | 'prayer'>('wudu');

  const colors = theme === 'light' ? Colors.light : Colors.dark;

  const getRakatInstructions = (prayer: PrayerInfo) => {
    const { rakats } = prayer;
    
    if (rakats === 2) {
      return "Complete 2 rakats: After the second rakat, recite Tashahhud and end with Taslim.";
    } else if (rakats === 3) {
      return "Complete 3 rakats: After the second rakat, recite Tashahhud, then stand for the third rakat (only Fatihah), sit again for final Tashahhud and end with Taslim.";
    } else if (rakats === 4) {
      return "Complete 4 rakats: After the second rakat, recite Tashahhud, then stand for the third and fourth rakats (only Fatihah in each), sit for final Tashahhud and end with Taslim.";
    }
    return "";
  };

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
        <View style={styles.sectionTabs}>
          <TouchableOpacity
            style={[
              styles.sectionTab,
              activeSection === 'wudu' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setActiveSection('wudu')}
          >
            <Droplets 
              color={activeSection === 'wudu' ? '#ffffff' : colors.muted} 
              size={20} 
            />
            <Text style={[
              styles.sectionTabText,
              { color: activeSection === 'wudu' ? '#ffffff' : colors.muted },
            ]}>
              {translate('wudu')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.sectionTab,
              activeSection === 'prayer' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setActiveSection('prayer')}
          >
            <HandHeart 
              color={activeSection === 'prayer' ? '#ffffff' : colors.muted} 
              size={20} 
            />
            <Text style={[
              styles.sectionTabText,
              { color: activeSection === 'prayer' ? '#ffffff' : colors.muted },
            ]}>
              {translate('salah')}
            </Text>
          </TouchableOpacity>
        </View>

        {activeSection === 'wudu' ? (
          <>
            <View style={[styles.introCard, { backgroundColor: colors.parchment }]}>
              <Droplets color={colors.primary} size={28} style={{ marginBottom: 12 }} />
              <Text style={[styles.introTitle, { color: colors.text }]}>
                {translate('how_to_perform_wudu')}
              </Text>
              <Text style={[styles.introArabic, { color: colors.primary }]}>
                كيفية الوضوء
              </Text>
              <Text style={[styles.introText, { color: colors.text }]}>
                {translate('wudu_description')}
              </Text>
            </View>

            {wuduSteps.map((step) => {
              const isExpanded = expandedWuduStep === step.id;
              return (
                <TouchableOpacity
                  key={step.id}
                  style={[
                    styles.stepCard,
                    { backgroundColor: colors.card, shadowColor: colors.primary },
                  ]}
                  onPress={() => setExpandedWuduStep(isExpanded ? null : step.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.stepHeader}>
                    <View style={styles.stepNumber}>
                      <LinearGradient
                        colors={['#4AA8D8', '#2980B9']}
                        style={styles.stepNumberGradient}
                      >
                        <Text style={styles.stepNumberText}>{step.id}</Text>
                      </LinearGradient>
                    </View>
                    
                    <View style={styles.stepTitleContainer}>
                      <Text style={[styles.stepTitle, { color: colors.text }]}>
                        {step.title}
                      </Text>
                      <Text style={[styles.stepArabicTitle, { color: '#2980B9' }]}>
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
                      
                      {step.imageUrl && (
                        <Image
                          source={{ uri: step.imageUrl }}
                          style={styles.stepImage}
                          resizeMode="cover"
                        />
                      )}
                      
                      <Text style={[styles.stepDescription, { color: colors.text }]}>
                        {step.description}
                      </Text>

                      <View style={styles.repetitionBadge}>
                        <CheckCircle color="#2980B9" size={16} />
                        <Text style={[styles.repetitionText, { color: colors.muted }]}>
                          {step.repetition}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            <View style={[styles.duaCard, { backgroundColor: colors.parchment }]}>
              <Text style={[styles.duaTitle, { color: colors.text }]}>
                {translate('after_completing_wudu')}
              </Text>
              
              <Text style={[styles.duaSectionTitle, { color: colors.text }]}>
                {translate('the_shahada')}
              </Text>
              <Text style={[styles.duaArabic, { color: '#2980B9' }]}>
                أشهد أن لا إله إلا الله وأشهد أن محمدًا عبده ورسوله
              </Text>
              <Text style={[styles.duaTransliteration, { color: colors.primary, fontWeight: '600' }]}>
                Ash-hadu an la ilaha illal lahu wa ash-hadu anna Muhammadan &apos;abduhu wa rasuluh
              </Text>
              <Text style={[styles.duaTranslation, { color: colors.muted }]}>
                I testify that there is no god but Allah, and I also testify that Muhammad is His servant and messenger.
              </Text>

              <View style={[styles.duaDivider, { backgroundColor: colors.border }]} />

              <Text style={[styles.duaSectionTitle, { color: colors.text }]}>
                {translate('dua')}
              </Text>
              <Text style={[styles.duaArabic, { color: '#2980B9' }]}>
                اللهم اجعلني من التوابين واجعلني من المتطهرين
              </Text>
              <Text style={[styles.duaTransliteration, { color: colors.primary, fontWeight: '600' }]}>
                Allahuma j&apos;alnee mina tawabeen waj-&apos;alnee minal mutatahireen
              </Text>
              <Text style={[styles.duaTranslation, { color: colors.muted }]}>
                O Allah, make me among those who seek repentance and make me among those who purify themselves.
              </Text>

              <Text style={[styles.duaNote, { color: colors.muted }]}>
                {translate('wudu_complete_note')}
              </Text>
            </View>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.prayerSelector, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowPrayerPicker(true)}
              activeOpacity={0.8}
            >
              <View style={styles.prayerSelectorContent}>
                <View style={styles.prayerSelectorLeft}>
                  <Text style={[styles.prayerSelectorLabel, { color: colors.muted }]}>
                    {translate('select_prayer')}
                  </Text>
                  <Text style={[styles.prayerSelectorName, { color: colors.text }]}>
                    {selectedPrayer.name}
                  </Text>
                </View>
                <View style={styles.prayerSelectorRight}>
                  <Text style={[styles.prayerSelectorArabic, { color: colors.primary }]}>
                    {selectedPrayer.arabicName}
                  </Text>
                  <ChevronDown color={colors.muted} size={24} />
                </View>
              </View>
            </TouchableOpacity>

            <View style={[styles.rakatCard, { backgroundColor: colors.parchment }]}>
              <View style={styles.rakatHeader}>
                <Text style={[styles.rakatTitle, { color: colors.text }]}>
                  {selectedPrayer.name} {translate('prayer_name_with_prayer')}
                </Text>
                <Text style={[styles.rakatArabic, { color: colors.primary }]}>
                  {selectedPrayer.arabicName}
                </Text>
              </View>
              
              <View style={styles.rakatInfo}>
                <View style={styles.rakatItem}>
                  <Text style={[styles.rakatNumber, { color: colors.primary }]}>
                    {selectedPrayer.rakats}
                  </Text>
                  <Text style={[styles.rakatLabel, { color: colors.muted }]}>
                    {translate('fard_rakats')}
                  </Text>
                </View>
                
                {selectedPrayer.sunnahBefore && (
                  <View style={styles.rakatItem}>
                    <Text style={[styles.rakatNumber, { color: colors.accent }]}>
                      {selectedPrayer.sunnahBefore}
                    </Text>
                    <Text style={[styles.rakatLabel, { color: colors.muted }]}>
                      {translate('sunnah_before')}
                    </Text>
                  </View>
                )}
                
                {selectedPrayer.sunnahAfter && (
                  <View style={styles.rakatItem}>
                    <Text style={[styles.rakatNumber, { color: colors.accent }]}>
                      {selectedPrayer.sunnahAfter}
                    </Text>
                    <Text style={[styles.rakatLabel, { color: colors.muted }]}>
                      {translate('sunnah_after')}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={[styles.rakatDescription, { color: colors.text }]}>
                {getRakatInstructions(selectedPrayer)}
              </Text>
            </View>

            <View style={[styles.introCard, { backgroundColor: colors.parchment }]}>
              <Text style={[styles.introText, { color: colors.text }]}>
                {translate('prayer_guide_intro')}
              </Text>
            </View>

            {prayerSteps.map((step) => {
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
                      
                      {step.imageUrl && (
                        <Image
                          source={{ uri: step.imageUrl }}
                          style={styles.stepImage}
                          resizeMode="cover"
                        />
                      )}
                      
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
          </>
        )}
      </ScrollView>

      <Modal
        visible={showPrayerPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPrayerPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPrayerPicker(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {translate('select_prayer')}
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.muted }]}>
              {translate('choose_which_prayer')}
            </Text>
            
            {prayers.map((prayer) => (
              <TouchableOpacity
                key={prayer.id}
                style={[
                  styles.prayerOption,
                  selectedPrayer.id === prayer.id && { backgroundColor: colors.parchment },
                ]}
                onPress={() => {
                  setSelectedPrayer(prayer);
                  setShowPrayerPicker(false);
                }}
              >
                <View style={styles.prayerOptionLeft}>
                  <Text style={[styles.prayerOptionName, { color: colors.text }]}>
                    {prayer.name}
                  </Text>
                  <Text style={[styles.prayerOptionDesc, { color: colors.muted }]}>
                    {prayer.description}
                  </Text>
                </View>
                <Text style={[styles.prayerOptionArabic, { color: colors.primary }]}>
                  {prayer.arabicName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 48,
    paddingBottom: 28,
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
    marginTop: 16,
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
    marginTop: 8,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTabs: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  sectionTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  sectionTabText: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  prayerSelector: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  prayerSelectorContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  prayerSelectorLeft: {
    flex: 1,
  },
  prayerSelectorLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  prayerSelectorName: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  prayerSelectorRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  prayerSelectorArabic: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  rakatCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  rakatHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  rakatTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  rakatArabic: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  rakatInfo: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginBottom: 16,
  },
  rakatItem: {
    alignItems: "center",
  },
  rakatNumber: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  rakatLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
    marginTop: 4,
  },
  rakatDescription: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  introCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  introArabic: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  introText: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  duaCard: {
    padding: 20,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  duaTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 12,
    textAlign: "center",
  },
  duaArabic: {
    fontSize: 18,
    lineHeight: 32,
    textAlign: "center",
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  duaTransliteration: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 8,
  },
  duaTranslation: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    fontStyle: "italic",
  },
  duaSectionTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    marginTop: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  duaDivider: {
    height: 1,
    marginVertical: 16,
  },
  duaNote: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 16,
    fontStyle: "italic",
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "600" as const,
    textAlign: "center",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  prayerOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  prayerOptionLeft: {
    flex: 1,
    marginRight: 12,
  },
  prayerOptionName: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  prayerOptionDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  prayerOptionArabic: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  stepImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
});
