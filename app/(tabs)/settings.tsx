import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Settings as SettingsIcon, Globe, MapPin, Check, Moon, Sun, Volume2 } from "lucide-react-native";
import * as Location from "expo-location";
import Colors from "@/constants/colors";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useReciter } from "@/contexts/ReciterContext";

const languages = [
  { code: "en" as Language, name: "English", nameArabic: "الإنجليزية" },
  { code: "ar" as Language, name: "العربية", nameArabic: "Arabic" },
  { code: "ur" as Language, name: "اردو", nameArabic: "Urdu" },
  { code: "tr" as Language, name: "Türkçe", nameArabic: "Turkish" },
  { code: "fr" as Language, name: "Français", nameArabic: "French" },
  { code: "uz" as Language, name: "O'zbek", nameArabic: "Uzbek" },
];

export default function SettingsScreen() {
  const { language, setLanguage, translate } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { selectedReciter, setReciter, reciters } = useReciter();
  const [locationStatus, setLocationStatus] = useState<string>("Not granted");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

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

    checkLocationPermission();
  }, [fadeAnim, scaleAnim]);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationStatus(status === "granted" ? "Granted" : "Not granted");
    } catch (error) {
      console.error("Error checking location permission:", error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationStatus(status === "granted" ? "Granted" : "Not granted");
      
      if (status === "granted") {
        Alert.alert(
          "Location Access Granted",
          "Your prayer times will now be calculated based on your location."
        );
      } else {
        Alert.alert(
          "Location Access Denied",
          "Please enable location access in your device settings for accurate prayer times."
        );
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
      Alert.alert("Error", "Failed to request location permission");
    }
  };

  const colors = theme === 'light' ? Colors.light : Colors.dark;

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
          <SettingsIcon color={colors.secondary} size={44} strokeWidth={1.5} />
          <Text style={styles.headerTitle}>{translate('settings')}</Text>
          <Text style={styles.headerSubtext}>{translate('customize_experience')}</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.contentInner}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Moon color={colors.primary} size={24} strokeWidth={2} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{translate('appearance')}</Text>
            </View>

            <View style={styles.themeContainer}>
              <TouchableOpacity
                style={[
                  styles.themeCard,
                  { backgroundColor: colors.card, borderColor: theme === 'light' ? colors.primary : 'transparent' },
                  theme === 'light' && styles.themeCardSelected,
                ]}
                onPress={() => theme === 'dark' && toggleTheme()}
                activeOpacity={0.7}
              >
                <Sun color={colors.text} size={24} strokeWidth={2} />
                <Text style={[styles.themeName, { color: colors.text }]}>{translate('light_mode')}</Text>
                {theme === 'light' && (
                  <View style={[styles.themeCheckbox, { backgroundColor: colors.parchment }]}>
                    <Check color={colors.primary} size={20} strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.themeCard,
                  { backgroundColor: colors.card, borderColor: theme === 'dark' ? colors.primary : 'transparent' },
                  theme === 'dark' && styles.themeCardSelected,
                ]}
                onPress={() => theme === 'light' && toggleTheme()}
                activeOpacity={0.7}
              >
                <Moon color={colors.text} size={24} strokeWidth={2} />
                <Text style={[styles.themeName, { color: colors.text }]}>{translate('dark_mode')}</Text>
                {theme === 'dark' && (
                  <View style={[styles.themeCheckbox, { backgroundColor: colors.parchment }]}>
                    <Check color={colors.primary} size={20} strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Volume2 color={colors.primary} size={24} strokeWidth={2} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Reciter</Text>
            </View>

            <View style={styles.recitersContainer}>
              {reciters.map((reciter) => (
                <TouchableOpacity
                  key={reciter.id}
                  style={[
                    styles.reciterCard,
                    { backgroundColor: colors.card, borderColor: selectedReciter.id === reciter.id ? colors.primary : 'transparent' },
                    selectedReciter.id === reciter.id && styles.reciterCardSelected,
                  ]}
                  onPress={() => setReciter(reciter)}
                  activeOpacity={0.7}
                >
                  <View style={styles.reciterTextContainer}>
                    <Text style={[styles.reciterName, { color: colors.text }]}>{reciter.name}</Text>
                    <Text style={[styles.reciterNameArabic, { color: colors.muted }]}>
                      {reciter.arabicName}
                    </Text>
                  </View>
                  {selectedReciter.id === reciter.id && (
                    <View style={[styles.reciterCheckbox, { backgroundColor: colors.parchment }]}>
                      <Check
                        color={colors.primary}
                        size={20}
                        strokeWidth={3}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Globe color={colors.primary} size={24} strokeWidth={2} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{translate('language')}</Text>
            </View>

            <View style={styles.languagesContainer}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageCard,
                    { backgroundColor: colors.card, borderColor: language === lang.code ? colors.primary : 'transparent' },
                    language === lang.code && styles.languageCardSelected,
                  ]}
                  onPress={() => setLanguage(lang.code)}
                  activeOpacity={0.7}
                >
                  <View style={styles.languageTextContainer}>
                    <Text style={[styles.languageName, { color: colors.text }]}>{lang.name}</Text>
                    <Text style={[styles.languageNameSecondary, { color: colors.muted }]}>
                      {lang.nameArabic}
                    </Text>
                  </View>
                  {language === lang.code && (
                    <View style={[styles.languageCheckbox, { backgroundColor: colors.parchment }]}>
                      <Check
                        color={colors.primary}
                        size={20}
                        strokeWidth={3}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin color={colors.primary} size={24} strokeWidth={2} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{translate('location')}</Text>
            </View>

            <View style={[styles.locationCard, { backgroundColor: colors.card }]}>
              <View style={styles.locationInfo}>
                <Text style={[styles.locationLabel, { color: colors.text }]}>{translate('permission_status_label')}</Text>
                <Text
                  style={[
                    styles.locationStatus,
                    { color: locationStatus === "Granted" ? colors.primary : colors.muted },
                  ]}
                >
                  {locationStatus === "Granted" ? translate('location_granted') : translate('location_not_granted')}
                </Text>
              </View>

              {locationStatus !== "Granted" && (
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={requestLocationPermission}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.locationButtonGradient}
                  >
                    <MapPin color="#ffffff" size={20} strokeWidth={2} />
                    <Text style={styles.locationButtonText}>
                      {translate('grant_location_button')}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              <View style={[styles.locationDescription, { backgroundColor: colors.parchment }]}>
                <Text style={[styles.locationDescriptionText, { color: colors.text }]}>
                  {translate('location_description')}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.parchment, borderLeftColor: colors.accent }]}>
            <Text style={[styles.infoText, { color: colors.text }]}>
              {translate('quran_quote_patience')}
            </Text>
            <Text style={[styles.infoArabic, { color: colors.primary }]}>
              {translate('quran_quote_patience_arabic')}
            </Text>
            <Text style={[styles.infoReference, { color: colors.muted }]}>{translate('quran_quote_reference')}</Text>
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
  contentContainer: {
    flex: 1,
  },
  contentInner: {
    padding: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600" as const,
    letterSpacing: 0.4,
  },
  sectionSubtext: {
    fontSize: 16,
    marginBottom: 16,
  },
  themeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  themeCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 18,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
  },
  themeCardSelected: {
    shadowOpacity: 0.15,
  },
  themeName: {
    fontSize: 15,
    fontWeight: "600" as const,
    letterSpacing: 0.2,
  },
  themeCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 8,
    right: 8,
  },
  languagesContainer: {
    gap: 12,
  },
  languageCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
  },
  languageCardSelected: {
    shadowOpacity: 0.15,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: "600" as const,
    letterSpacing: 0.2,
  },
  languageNameSecondary: {
    fontSize: 14,
    marginTop: 2,
  },
  languageCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  recitersContainer: {
    gap: 12,
  },
  reciterCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
  },
  reciterCardSelected: {
    shadowOpacity: 0.15,
  },
  reciterTextContainer: {
    flex: 1,
  },
  reciterName: {
    fontSize: 16,
    fontWeight: "600" as const,
    letterSpacing: 0.2,
  },
  reciterNameArabic: {
    fontSize: 14,
    marginTop: 2,
  },
  reciterCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  locationCard: {
    padding: 20,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  locationInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: "500" as const,
    letterSpacing: 0.2,
  },
  locationStatus: {
    fontSize: 15,
    fontWeight: "600" as const,
    letterSpacing: 0.2,
  },
  locationButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 16,
  },
  locationButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  locationDescription: {
    padding: 16,
    borderRadius: 12,
  },
  locationDescriptionText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    letterSpacing: 0.2,
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
    fontStyle: "italic" as const,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  infoArabic: {
    fontSize: 17,
    lineHeight: 32,
    marginTop: 16,
    textAlign: "center",
    fontWeight: "600" as const,
  },
  infoReference: {
    fontSize: 13,
    marginTop: 12,
    textAlign: "center",
    letterSpacing: 0.3,
  },
});
