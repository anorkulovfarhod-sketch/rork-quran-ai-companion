import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import { Compass as CompassIcon } from "lucide-react-native";
import * as Location from "expo-location";
import { calculateQiblaDirection } from "@/utils/prayerTimes";
import Colors from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

type QiblaCompassProps = {
  latitude: number;
  longitude: number;
};

export default function QiblaCompass({ latitude, longitude }: QiblaCompassProps) {
  const { translate } = useLanguage();
  const { theme } = useTheme();
  const [heading, setHeading] = useState<number>(0);
  const currentRotationRef = useRef<number>(0);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const qiblaDirection = calculateQiblaDirection(latitude, longitude);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startCompass = async () => {
      if (Platform.OS === 'web') {
        return;
      }

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          return;
        }

        subscription = await Location.watchHeadingAsync((data) => {
          const newHeading = data.trueHeading >= 0 ? data.trueHeading : data.magHeading;
          console.log('Compass heading:', newHeading, 'Qibla direction:', qiblaDirection);
          setHeading(newHeading);
        });
      } catch (error) {
        console.error("Error starting compass:", error);
      }
    };

    startCompass();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [qiblaDirection]);

  useEffect(() => {
    let rotation = qiblaDirection - heading;
    
    while (rotation > 180) rotation -= 360;
    while (rotation < -180) rotation += 360;
    
    const diff = rotation - currentRotationRef.current;
    let normalizedDiff = diff;
    while (normalizedDiff > 180) normalizedDiff -= 360;
    while (normalizedDiff < -180) normalizedDiff += 360;
    
    const newRotation = currentRotationRef.current + normalizedDiff;
    currentRotationRef.current = newRotation;
    
    Animated.spring(rotateAnim, {
      toValue: newRotation,
      tension: 50,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [heading, qiblaDirection, rotateAnim]);

  const interpolatedRotation = rotateAnim.interpolate({
    inputRange: [-360, 360],
    outputRange: ["-360deg", "360deg"],
  });

  const colors = theme === 'light' ? Colors.light : Colors.dark;

  return (
    <View style={styles.container}>
      <View style={styles.compassContainer}>
        <View style={[styles.compassOuter, { backgroundColor: colors.parchment, borderColor: colors.accent, shadowColor: colors.primary }]}>
          <View style={[styles.compassInner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Animated.View
              style={[
                styles.needle,
                {
                  transform: [{ rotate: interpolatedRotation }],
                },
              ]}
            >
              <View style={[styles.needlePoint, { borderBottomColor: colors.primary, shadowColor: colors.primary }]} />
              <View style={[styles.needleBase, { backgroundColor: colors.accent, shadowColor: colors.accent }]} />
            </Animated.View>
            <CompassIcon
              color={colors.muted}
              size={32}
              strokeWidth={1.5}
              style={styles.compassIcon}
            />
          </View>
        </View>
        <Text style={[styles.directionText, { color: colors.text }]}>
          {Math.round(qiblaDirection)}° {getDirectionLabel(qiblaDirection)}
        </Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={[styles.infoLabel, { color: colors.text }]}>{translate('mecca_direction')}</Text>
        <Text style={[styles.infoLabelArabic, { color: colors.primary }]}>اتجاه مكة المكرمة</Text>
      </View>
    </View>
  );
}

const getDirectionLabel = (degrees: number): string => {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 24,
  },
  compassContainer: {
    alignItems: "center",
  },
  compassOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 4,
  },
  compassInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
  needle: {
    position: "absolute",
    width: 4,
    height: 80,
    alignItems: "center",
  },
  needlePoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 40,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  needleBase: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  compassIcon: {
    opacity: 0.2,
  },
  directionText: {
    fontSize: 20,
    fontWeight: "600" as const,
    marginTop: 16,
    letterSpacing: 0.5,
  },
  infoContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    letterSpacing: 0.3,
  },
  infoLabelArabic: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginTop: 4,
  },
});
