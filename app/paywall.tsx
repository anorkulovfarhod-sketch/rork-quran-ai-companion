import React, { useRef, useEffect, useState } from 'react';
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
import { Crown, Check, X, Calendar, Clock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';

type PlanType = 'monthly' | 'yearly';

export default function PaywallScreen() {
  const router = useRouter();
  const { offerings, purchase, restore, isPurchasing, isRestoring, isPremium } = useSubscription();
  const { translate } = useLanguage();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');

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

  const hasNoOfferings = !offerings?.current || !offerings.current.availablePackages || offerings.current.availablePackages.length === 0;

  const monthlyPackage = offerings?.current?.availablePackages?.find(
    p => p.identifier === 'monthly' || p.identifier === '$rc_monthly'
  );
  const yearlyPackage = offerings?.current?.availablePackages?.find(
    p => p.identifier === 'yearly' || p.identifier === '$rc_annual'
  );

  const monthlyPrice = monthlyPackage?.product?.priceString || '$5.99';
  const yearlyPrice = yearlyPackage?.product?.priceString || '$59.99';
  
  const monthlyPriceNum = monthlyPackage?.product?.price || 5.99;
  const yearlyPriceNum = yearlyPackage?.product?.price || 59.99;
  const monthlySavings = Math.round((1 - (yearlyPriceNum / 12) / monthlyPriceNum) * 100);

  const handlePurchase = async () => {
    try {
      console.log('Purchase button pressed');
      console.log('Selected plan:', selectedPlan);
      console.log('Offerings available:', offerings);
      
      if (hasNoOfferings) {
        Alert.alert(
          'Testing Not Available',
          'In-app purchases can only be tested on a real iOS or Android device with an active App Store/Play Store connection. Web and simulator testing is not supported by Apple/Google.\n\nPlease test on a physical device.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      const currentOffering = offerings?.current;
      if (!currentOffering) {
        Alert.alert(translate('purchase_failed'), 'Unable to load subscription offerings. Please try again later.');
        console.error('No current offering available');
        return;
      }
      
      const packageToPurchase = selectedPlan === 'yearly' ? yearlyPackage : monthlyPackage;
      
      if (!packageToPurchase) {
        const fallbackPackage = currentOffering.availablePackages[0];
        console.log('Using fallback package:', fallbackPackage.identifier);
        await purchase(fallbackPackage);
      } else {
        console.log('Purchasing package:', packageToPurchase.identifier);
        await purchase(packageToPurchase);
      }
      
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

          {hasNoOfferings && (
            <View style={styles.testingNotice}>
              <Text style={styles.testingNoticeTitle}>Testing on Web/Simulator</Text>
              <Text style={styles.testingNoticeText}>
                In-app purchases require a real device. Please test on an iPhone or Android phone with App Store/Play Store access.
              </Text>
            </View>
          )}

          <View style={styles.plansContainer}>
            <TouchableOpacity
              style={[
                styles.planCard,
                selectedPlan === 'yearly' && styles.planCardSelected,
              ]}
              onPress={() => setSelectedPlan('yearly')}
              activeOpacity={0.8}
            >
              {monthlySavings > 0 && (
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>Save {monthlySavings}%</Text>
                </View>
              )}
              <View style={styles.planHeader}>
                <Calendar color={selectedPlan === 'yearly' ? Colors.light.primary : Colors.light.muted} size={24} />
                <Text style={[styles.planTitle, selectedPlan === 'yearly' && styles.planTitleSelected]}>
                  Yearly
                </Text>
              </View>
              <Text style={[styles.planPrice, selectedPlan === 'yearly' && styles.planPriceSelected]}>
                {yearlyPrice}
              </Text>
              <Text style={styles.planPeriod}>/year</Text>
              <Text style={styles.planSubtext}>
                ${(yearlyPriceNum / 12).toFixed(2)}/month
              </Text>
              {selectedPlan === 'yearly' && (
                <View style={styles.selectedIndicator}>
                  <Check color="#ffffff" size={16} strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.planCard,
                selectedPlan === 'monthly' && styles.planCardSelected,
              ]}
              onPress={() => setSelectedPlan('monthly')}
              activeOpacity={0.8}
            >
              <View style={styles.planHeader}>
                <Clock color={selectedPlan === 'monthly' ? Colors.light.primary : Colors.light.muted} size={24} />
                <Text style={[styles.planTitle, selectedPlan === 'monthly' && styles.planTitleSelected]}>
                  Monthly
                </Text>
              </View>
              <Text style={[styles.planPrice, selectedPlan === 'monthly' && styles.planPriceSelected]}>
                {monthlyPrice}
              </Text>
              <Text style={styles.planPeriod}>/month</Text>
              {selectedPlan === 'monthly' && (
                <View style={styles.selectedIndicator}>
                  <Check color="#ffffff" size={16} strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
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
                  <Text style={styles.subscribeButtonText}>
                    {selectedPlan === 'yearly' ? 'Subscribe Yearly' : 'Subscribe Monthly'}
                  </Text>
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
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
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
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  plansContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 24,
  },
  planCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.border,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.parchment,
  },
  savingsBadge: {
    position: 'absolute',
    top: -10,
    right: -5,
    backgroundColor: Colors.light.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700' as const,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.muted,
  },
  planTitleSelected: {
    color: Colors.light.primary,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  planPriceSelected: {
    color: Colors.light.primary,
  },
  planPeriod: {
    fontSize: 14,
    color: Colors.light.muted,
    marginTop: 2,
  },
  planSubtext: {
    fontSize: 12,
    color: Colors.light.muted,
    marginTop: 6,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
  testingNotice: {
    width: '100%',
    backgroundColor: '#FFF4E6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  testingNoticeTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#D97706',
    marginBottom: 6,
  },
  testingNoticeText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
  },
});
