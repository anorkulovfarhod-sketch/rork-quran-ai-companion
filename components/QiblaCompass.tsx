import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import { Compass as CompassIcon } from "lucide-react-native";
import * as Location from "expo-location";
import { calculateQiblaDirection } from "@/utils/prayerTimes";
import Colors from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";

type QiblaCompassProps = {
  latitude: number;
  longitude: number;
};

export default function QiblaCompass({ latitude, longitude }: QiblaCompassProps) {
  const { translate } = useLanguage();
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
  }, []);

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
    inputRange: [-720, 720],
    outputRange: ["-720deg", "720deg"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.compassContainer}>
        <View style={styles.compassOuter}>
          <View style={styles.compassInner}>
            <Animated.View
              style={[
                styles.needle,
                {
                  transform: [{ rotate: interpolatedRotation }],
                },
              ]}
            >
              <View style={styles.needlePoint} />
              <View style={styles.needleBase} />
            </Animated.View>
            <CompassIcon
              color={Colors.light.muted}
              size={32}
              strokeWidth={1.5}
              style={styles.compassIcon}
            />
          </View>
        </View>
        <Text style={styles.directionText}>
          {Math.round(qiblaDirection)}° {getDirectionLabel(qiblaDirection)}
        </Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>{translate('mecca_direction')}</Text>
        <Text style={styles.infoLabelArabic}>اتجاه مكة المكرمة</Text>
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
    backgroundColor: Colors.light.parchment,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 4,
    borderColor: Colors.light.accent,
  },
  compassInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.light.border,
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
    borderBottomColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  needleBase: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.accent,
    marginTop: 8,
    shadowColor: Colors.light.accent,
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
    color: Colors.light.text,
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
    color: Colors.light.text,
    letterSpacing: 0.3,
  },
  infoLabelArabic: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.primary,
    marginTop: 4,
  },
});
