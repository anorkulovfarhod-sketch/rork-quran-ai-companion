import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Crown, Check, X, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PaywallScreen() {
  const router = useRouter();
  const { offerings, purchase, restore, isPurchasing, isRestoring, isPremium } = useSubscription();
  const { translate } = useLanguage();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    if (isPremium) {
      router.replace('/(tabs)/chat' as any);
    }
  }, [isPremium, router]);

  const handlePurchase = async () => {
    try {
      console.log('Purchase button pressed');
      console.log('Offerings available:', offerings);
      console.log('Current offering:', offerings?.current);
      console.log('Available packages:', offerings?.current?.availablePackages);
      
      const currentOffering = offerings?.current;
      if (!currentOffering) {
        Alert.alert(translate('purchase_failed'), translate('no_offerings_error'));
        console.error('No current offering available');
        return;
      }
      
      if (!currentOffering.availablePackages || currentOffering.availablePackages.length === 0) {
        Alert.alert(translate('purchase_failed'), translate('no_packages_error'));
        console.error('No packages in offering:', currentOffering);
        return;
      }

      const packageToPurchase = currentOffering.availablePackages[0];
      console.log('Purchasing package:', packageToPurchase.identifier);
      
      await purchase(packageToPurchase);
      Alert.alert(translate('purchase_success'), translate('welcome_premium_chat'));
      router.replace('/(tabs)/chat' as any);
    } catch (error: any) {
      console.error('Purchase error:', error);
      if (error?.message !== 'Purchase cancelled') {
        Alert.alert(translate('purchase_failed'), error?.message || translate('internet_check_message'));
      }
    }
  };

  const handleRestore = async () => {
    try {
      await restore();
      Alert.alert(translate('purchase_success'), translate('restore_success'));
    } catch {
      Alert.alert(translate('purchase_failed'), translate('restore_failed'));
    }
  };

  const monthlyPackage = offerings?.current?.availablePackages[0];
  const price = monthlyPackage?.product?.priceString || '$5.99';

  const features = [
    translate('unlimited_chat_messages'),
    translate('ask_quran_questions'),
    translate('scholarly_interpretations'),
    translate('explore_islamic_teachings'),
    translate('personal_spiritual_guidance'),
    translate('support_development'),
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <X color={Colors.light.text} size={28} strokeWidth={2} />
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[Colors.light.primary, Colors.light.primaryDark]}
            style={styles.iconContainer}
          >
            <Crown color={Colors.light.secondary} size={64} strokeWidth={1.5} />
          </LinearGradient>

          <Text style={styles.title}>{translate('unlock_premium')}</Text>
          <Text style={styles.subtitle}>
            {translate('enhance_spiritual_journey')}
          </Text>

          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.featureRow,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateX: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.checkContainer}>
                  <Check color={Colors.light.primary} size={20} strokeWidth={3} />
                </View>
                <Text style={styles.featureText}>{feature}</Text>
              </Animated.View>
            ))}
          </View>

          <View style={styles.priceCard}>
            <LinearGradient
              colors={[Colors.light.parchment, '#ffffff']}
              style={styles.priceCardGradient}
            >
              <Sparkles color={Colors.light.accent} size={32} strokeWidth={2} />
              <Text style={styles.priceTitle}>{translate('premium_access')}</Text>
              <Text style={styles.priceAmount}>{price}{translate('per_month')}</Text>
              <Text style={styles.priceDescription}>
                {translate('unlimited_chat_cancel_anytime')}
              </Text>
            </LinearGradient>
          </View>

          <TouchableOpacity
            style={[styles.subscribeButton, (isPurchasing || isRestoring) && styles.buttonDisabled]}
            onPress={handlePurchase}
            disabled={isPurchasing || isRestoring}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.light.primary, Colors.light.primaryDark]}
              style={styles.subscribeButtonGradient}
            >
              {isPurchasing ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Crown color="#ffffff" size={24} strokeWidth={2} />
                  <Text style={styles.subscribeButtonText}>{translate('subscribe_now')}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={isPurchasing || isRestoring}
          >
            {isRestoring ? (
              <ActivityIndicator color={Colors.light.primary} size="small" />
            ) : (
              <Text style={styles.restoreButtonText}>{translate('restore_purchases')}</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            {translate('subscription_auto_renew_disclaimer')}
          </Text>
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
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 80,
  },
  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 17,
    color: Colors.light.muted,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 36,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  checkContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.parchment,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  priceCard: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 28,
    shadowColor: Colors.light.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  priceCardGradient: {
    padding: 28,
    alignItems: 'center',
  },
  priceTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  priceAmount: {
    fontSize: 44,
    fontWeight: '700' as const,
    color: Colors.light.primary,
    marginBottom: 8,
    letterSpacing: -1,
  },
  priceDescription: {
    fontSize: 14,
    color: Colors.light.muted,
    letterSpacing: 0.2,
  },
  subscribeButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  restoreButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  restoreButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.primary,
    letterSpacing: 0.3,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.light.muted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
