import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen, CheckCircle2, Clock } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useLocation } from "@/contexts/LocationContext";
import { calculatePrayerTimes, type Prayer } from "@/utils/prayerTimes";
import QiblaCompass from "@/components/QiblaCompass";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function PrayersScreen() {
  const { location, hasPermission } = useLocation();
  const { translate } = useLanguage();
  const { theme } = useTheme();
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    if (location) {
      const times = calculatePrayerTimes(location.latitude, location.longitude);
      setPrayers(times);
    }

    const interval = setInterval(() => {
      if (location) {
        const times = calculatePrayerTimes(location.latitude, location.longitude);
        setPrayers(times);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [location]);

  const completedPrayers = prayers.filter((p) => p.completed).length;
  const percentage = Math.round((completedPrayers / prayers.length) * 100);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: percentage,
      duration: 1200,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [percentage, progressAnim]);

  const togglePrayer = (index: number) => {
    setPrayers((prev) =>
      prev.map((prayer, i) =>
        i === index ? { ...prayer, completed: !prayer.completed } : prayer
      )
    );
  };

  const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
  const colors = theme === 'light' ? Colors.light : Colors.dark;

  const progressInterpolate = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0deg', '360deg'],
  });

  const scaleInterpolate = progressAnim.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0.95, 1.02, 1],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
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
          <BookOpen color={colors.secondary} size={44} strokeWidth={1.5} />
          <Text style={styles.headerTitle}>{translate('daily_prayers')}</Text>
          <Text style={styles.headerArabic}>الصلوات الخمس</Text>
          <Text style={styles.headerSubtext}>
            {translate('track_prayers')}
          </Text>
          {location?.city && (
            <Text style={styles.headerLocation}>{location.city}</Text>
          )}
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.contentContainer} contentContainerStyle={styles.contentInner}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {!hasPermission && (
            <View style={[styles.permissionCard, { backgroundColor: colors.accent }]}>
              <Text style={styles.permissionText}>
                Enable location access in Settings for accurate prayer times
              </Text>
            </View>
          )}

          <View style={[styles.progressCard, { backgroundColor: colors.card, shadowColor: colors.primary }]}>
            <View style={styles.progressCircleContainer}>
              <Animated.View
                style={[
                  styles.progressCircle,
                  {
                    transform: [
                      { rotate: progressInterpolate },
                      { scale: scaleInterpolate },
                    ],
                  },
                ]}
              >
                <AnimatedLinearGradient
                  colors={[colors.primary, colors.accent, colors.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.progressGradientBorder}
                >
                  <View style={[styles.progressCircleInner, { backgroundColor: colors.parchment, shadowColor: colors.primary }]}>
                    <Animated.Text
                      style={[
                        styles.progressPercentage,
                        { color: colors.primary, transform: [{ scale: scaleInterpolate }] },
                      ]}
                    >
                      {percentage}%
                    </Animated.Text>
                    <Text style={[styles.progressLabel, { color: colors.muted }]}>Complete</Text>
                  </View>
                </AnimatedLinearGradient>
              </Animated.View>
            </View>
            <Text style={[styles.progressText, { color: colors.text }]}>
              {completedPrayers} of 5 prayers completed
            </Text>
          </View>

          {location && hasPermission && (
            <View style={[styles.qiblaCard, { backgroundColor: colors.card, shadowColor: colors.primary }]}>
              <QiblaCompass latitude={location.latitude} longitude={location.longitude} />
            </View>
          )}

          <View style={styles.prayersContainer}>
            {prayers.map((prayer, index) => {
              const isNext = !prayer.completed && prayers.slice(0, index).every(p => p.completed);
              
              return (
                <TouchableOpacity
                  key={prayer.name}
                  style={[
                    styles.prayerCard,
                    { backgroundColor: colors.card, borderColor: isNext ? colors.accent : 'transparent' },
                    isNext && styles.prayerCardNext,
                    prayer.completed && styles.prayerCardCompleted,
                  ]}
                  onPress={() => togglePrayer(index)}
                  activeOpacity={0.7}
                >
                  <View style={styles.prayerLeft}>
                    <View
                      style={[
                        styles.prayerCheckbox,
                        { backgroundColor: colors.background, borderColor: prayer.completed ? colors.primary : isNext ? colors.accent : colors.border },
                        prayer.completed && { backgroundColor: '#ffffff', borderColor: colors.primary },
                      ]}
                    >
                      {prayer.completed && (
                        <CheckCircle2
                          color={colors.primary}
                          size={22}
                          strokeWidth={3}
                        />
                      )}
                    </View>
                    <View style={styles.prayerTextContainer}>
                      <Text style={[styles.prayerNameArabic, { color: colors.text }]}>
                        {prayer.nameArabic}
                      </Text>
                      <Text style={[styles.prayerName, { color: colors.muted }]}>{prayer.name}</Text>
                    </View>
                  </View>
                  <View style={styles.prayerRight}>
                    <Clock color={colors.muted} size={16} strokeWidth={2} />
                    <Text style={[styles.prayerTime, { color: colors.muted }]}>{prayer.time}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.reminderCard, { backgroundColor: colors.parchment, borderLeftColor: colors.accent }]}>
            <Text style={[styles.reminderText, { color: colors.text }]}>
              &ldquo;{translate('prayer_verse_decreed')}&rdquo;
            </Text>
            <Text style={[styles.reminderArabic, { color: colors.primary }]}>
              إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا
            </Text>
            <Text style={[styles.reminderReference, { color: colors.muted }]}>Surah An-Nisa (4:103)</Text>
          </View>
        </Animated.View>
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
    fontSize: 30,
    fontWeight: "600" as const,
    color: "#ffffff",
    marginTop: 20,
    letterSpacing: 0.8,
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
  headerLocation: {
    fontSize: 13,
    color: Colors.light.accent,
    opacity: 0.95,
    marginTop: 6,
    fontWeight: "600" as const,
    letterSpacing: 0.5,
  },
  contentContainer: {
    flex: 1,
  },
  contentInner: {
    padding: 24,
    paddingBottom: 40,
  },
  permissionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  permissionText: {
    fontSize: 14,
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "500" as const,
    letterSpacing: 0.2,
  },
  progressCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  progressCircleContainer: {
    marginBottom: 20,
  },
  progressCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  progressGradientBorder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  progressCircleInner: {
    width: 148,
    height: 148,
    borderRadius: 74,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  progressPercentage: {
    fontSize: 48,
    fontWeight: "700" as const,
    letterSpacing: -2,
  },
  progressLabel: {
    fontSize: 14,
    marginTop: 4,
    letterSpacing: 0.5,
    fontWeight: "500" as const,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "500" as const,
    letterSpacing: 0.2,
  },
  qiblaCard: {
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  prayersContainer: {
    gap: 12,
    marginBottom: 24,
  },
  prayerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 2,
    borderColor: "transparent",
  },
  prayerCardNext: {
    shadowOpacity: 0.15,
  },
  prayerCardCompleted: {
    opacity: 0.7,
  },
  prayerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  prayerCheckbox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  prayerTextContainer: {
    gap: 4,
  },
  prayerNameArabic: {
    fontSize: 20,
    fontWeight: "600" as const,
    letterSpacing: 0.3,
  },
  prayerName: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  prayerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  prayerTime: {
    fontSize: 15,
    fontWeight: "600" as const,
    letterSpacing: 0.2,
  },
  reminderCard: {
    padding: 24,
    borderRadius: 18,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  reminderText: {
    fontSize: 15,
    lineHeight: 24,
    fontStyle: "italic" as const,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  reminderArabic: {
    fontSize: 17,
    lineHeight: 32,
    marginTop: 16,
    textAlign: "center",
    fontWeight: "600" as const,
  },
  reminderReference: {
    fontSize: 13,
    marginTop: 12,
    textAlign: "center",
    letterSpacing: 0.3,
  },
});
