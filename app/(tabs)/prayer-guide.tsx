import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
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
};

type WuduStep = {
  id: number;
  title: string;
  arabicTitle: string;
  description: string;
  repetition: string;
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

const getPrayers = (translate: (key: string) => string): PrayerInfo[] => [
  {
    id: "fajr",
    name: translate('fajr_prayer'),
    arabicName: "الفجر",
    rakats: 2,
    sunnahBefore: 2,
    description: translate('fajr_desc'),
  },
  {
    id: "dhuhr",
    name: translate('dhuhr_prayer'),
    arabicName: "الظهر",
    rakats: 4,
    sunnahBefore: 4,
    sunnahAfter: 2,
    description: translate('dhuhr_desc'),
  },
  {
    id: "asr",
    name: translate('asr_prayer'),
    arabicName: "العصر",
    rakats: 4,
    description: translate('asr_desc'),
  },
  {
    id: "maghrib",
    name: translate('maghrib_prayer'),
    arabicName: "المغرب",
    rakats: 3,
    sunnahAfter: 2,
    description: translate('maghrib_desc'),
  },
  {
    id: "isha",
    name: translate('isha_prayer'),
    arabicName: "العشاء",
    rakats: 4,
    sunnahAfter: 2,
    description: translate('isha_desc'),
  },
];

const getWuduSteps = (translate: (key: string) => string): WuduStep[] => [
  {
    id: 1,
    title: translate('intention_niyyah'),
    arabicTitle: "النية",
    description: translate('intention_niyyah_desc'),
    repetition: translate('once_text'),
  },
  {
    id: 2,
    title: translate('say_bismillah'),
    arabicTitle: "بسم الله",
    description: translate('say_bismillah_desc'),
    repetition: translate('once_text'),
  },
  {
    id: 3,
    title: translate('wash_hands'),
    arabicTitle: "غسل اليدين",
    description: translate('wash_hands_desc'),
    repetition: translate('three_times'),
  },
  {
    id: 4,
    title: translate('rinse_mouth'),
    arabicTitle: "المضمضة",
    description: translate('rinse_mouth_desc'),
    repetition: translate('three_times'),
  },
  {
    id: 5,
    title: translate('clean_nose'),
    arabicTitle: "الاستنشاق",
    description: translate('clean_nose_desc'),
    repetition: translate('three_times'),
  },
  {
    id: 6,
    title: translate('wash_face'),
    arabicTitle: "غسل الوجه",
    description: translate('wash_face_desc'),
    repetition: translate('three_times'),
  },
  {
    id: 7,
    title: translate('wash_arms'),
    arabicTitle: "غسل اليدين إلى المرفقين",
    description: translate('wash_arms_desc'),
    repetition: translate('three_times_each'),
  },
  {
    id: 8,
    title: translate('wipe_head'),
    arabicTitle: "مسح الرأس",
    description: translate('wipe_head_desc'),
    repetition: translate('once_text'),
  },
  {
    id: 9,
    title: translate('clean_ears'),
    arabicTitle: "مسح الأذنين",
    description: translate('clean_ears_desc'),
    repetition: translate('once_text'),
  },
  {
    id: 10,
    title: translate('wash_feet'),
    arabicTitle: "غسل القدمين",
    description: translate('wash_feet_desc'),
    repetition: translate('three_times_each'),
  },
];

const getPrayerSteps = (translate: (key: string) => string): PrayerStep[] => [
  {
    id: 1,
    title: translate('prayer_intention'),
    arabicTitle: "النية",
    description: translate('prayer_intention_desc'),
    arabicText: "نَوَيْتُ أَنْ أُصَلِّيَ",
    repetition: translate('once_text'),
  },
  {
    id: 2,
    title: translate('takbir_allahu_akbar'),
    arabicTitle: "تَكْبِيرَةُ الإِحْرَام",
    description: translate('takbir_desc'),
    arabicText: "اللَّهُ أَكْبَر",
    repetition: translate('once_text'),
  },
  {
    id: 3,
    title: translate('opening_supplication'),
    arabicTitle: "دُعَاءُ الاسْتِفْتَاح",
    description: translate('opening_supplication_desc'),
    arabicText: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ",
    repetition: translate('once_text'),
  },
  {
    id: 4,
    title: translate('surah_al_fatihah'),
    arabicTitle: "سُورَةُ الفَاتِحَة",
    description: translate('surah_al_fatihah_desc'),
    arabicText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    repetition: translate('once_text'),
  },
  {
    id: 5,
    title: translate('recite_quran'),
    arabicTitle: "قِرَاءَةُ القُرْآن",
    description: translate('recite_quran_desc'),
    arabicText: "قُلْ هُوَ اللَّهُ أَحَدٌ\nاللَّهُ الصَّمَدُ",
    repetition: translate('once_or_more'),
  },
  {
    id: 6,
    title: translate('ruku_bowing'),
    arabicTitle: "الرُّكُوع",
    description: translate('ruku_desc'),
    arabicText: "سُبْحَانَ رَبِّيَ الْعَظِيم",
    repetition: translate('three_times_minimum'),
  },
  {
    id: 7,
    title: translate('rising_from_ruku'),
    arabicTitle: "الاعْتِدَال",
    description: translate('rising_from_ruku_desc'),
    arabicText: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ\nرَبَّنَا وَلَكَ الْحَمْد",
    repetition: translate('once_text'),
  },
  {
    id: 8,
    title: translate('sujud_prostration'),
    arabicTitle: "السُّجُود",
    description: translate('sujud_desc'),
    arabicText: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
    repetition: translate('three_times_min_two_prostrations'),
  },
  {
    id: 9,
    title: translate('sitting_between_prostrations'),
    arabicTitle: "الجَلْسَة بَيْنَ السَّجْدَتَيْن",
    description: translate('sitting_between_prostrations_desc'),
    arabicText: "رَبِّ اغْفِرْ لِي",
    repetition: translate('once_text'),
  },
  {
    id: 10,
    title: translate('tashahhud'),
    arabicTitle: "التَّشَهُّد",
    description: translate('tashahhud_desc'),
    arabicText: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ\nالسَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ",
    repetition: translate('once_per_sitting'),
  },
  {
    id: 11,
    title: translate('taslim_salutation'),
    arabicTitle: "التَّسْلِيم",
    description: translate('taslim_desc'),
    arabicText: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّه",
    repetition: translate('twice_right_and_left'),
  },
];

export default function PrayerGuideScreen() {
  const { theme } = useTheme();
  const { translate } = useLanguage();
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [expandedWuduStep, setExpandedWuduStep] = useState<number | null>(null);
  const prayers = getPrayers(translate);
  const wuduSteps = getWuduSteps(translate);
  const prayerSteps = getPrayerSteps(translate);
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerInfo>(prayers[0]);
  const [showPrayerPicker, setShowPrayerPicker] = useState(false);
  const [activeSection, setActiveSection] = useState<'wudu' | 'prayer'>('wudu');

  const colors = theme === 'light' ? Colors.light : Colors.dark;

  const getRakatInstructions = (prayer: PrayerInfo) => {
    const { rakats } = prayer;
    
    if (rakats === 2) {
      return translate('rakat_instructions_2');
    } else if (rakats === 3) {
      return translate('rakat_instructions_3');
    } else if (rakats === 4) {
      return translate('rakat_instructions_4');
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
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#ffffff",
    marginTop: 16,
    letterSpacing: 0.5,
    textAlign: "center",
    fontFamily: "Georgia",
  },
  headerArabic: {
    fontSize: 24,
    fontWeight: "600" as const,
    color: "#ffffff",
    opacity: 0.9,
    marginTop: 8,
  },
  headerSubtext: {
    fontSize: 15,
    color: "#ffffff",
    opacity: 0.88,
    marginTop: 8,
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
    fontFamily: "Georgia",
  },
  prayerSelectorName: {
    fontSize: 20,
    fontWeight: "600" as const,
    fontFamily: "Georgia",
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
    fontFamily: "Georgia",
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
    fontFamily: "Georgia",
  },
  rakatDescription: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    fontFamily: "Georgia",
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
    fontFamily: "Georgia",
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
    fontFamily: "Georgia",
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
    fontFamily: "Georgia",
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
    fontFamily: "Georgia",
  },
  duaTranslation: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    fontStyle: "italic",
    fontFamily: "Georgia",
  },
  duaSectionTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    marginTop: 16,
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "Georgia",
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
    marginBottom: 4,
    fontFamily: "Georgia",
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
    fontFamily: "Georgia",
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Georgia",
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
    fontFamily: "Georgia",
  },
  prayerOptionDesc: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Georgia",
  },
  prayerOptionArabic: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
});
