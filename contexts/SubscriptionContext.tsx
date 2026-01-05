import createContextHook from '@nkzw/create-context-hook';
import Purchases from 'react-native-purchases';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Platform } from 'react-native';

function getRCToken() {
  if (__DEV__ || Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY;
  }
  
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    default: process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY,
  });
}

let purchasesConfigured = false;

const apiKey = getRCToken();
if (apiKey) {
  try {
    Purchases.configure({ apiKey });
    purchasesConfigured = true;
    console.log('RevenueCat configured successfully with key:', apiKey?.substring(0, 10) + '...');
  } catch (error) {
    console.error('Error configuring Purchases:', error);
    purchasesConfigured = false;
  }
} else {
  console.log('No RevenueCat API key found, skipping configuration');
}

export const [SubscriptionProvider, useSubscription] = createContextHook(() => {
  const isConfigured = purchasesConfigured;

  const customerInfoQuery = useQuery({
    queryKey: ['customerInfo', isConfigured],
    queryFn: async () => {
      if (!isConfigured) return null;
      try {
        const info = await Purchases.getCustomerInfo();
        return info;
      } catch (error) {
        console.error('Failed to get customer info:', error);
        return null;
      }
    },
    refetchInterval: 60000,
    enabled: isConfigured,
  });

  const offeringsQuery = useQuery({
    queryKey: ['offerings', isConfigured],
    queryFn: async () => {
      if (!isConfigured) return null;
      try {
        console.log('Fetching RevenueCat offerings...');
        const offerings = await Purchases.getOfferings();
        console.log('Offerings fetched:', {
          current: offerings.current?.identifier,
          packagesCount: offerings.current?.availablePackages.length,
          packages: offerings.current?.availablePackages.map(p => ({
            identifier: p.identifier,
            productId: p.product.identifier,
            price: p.product.priceString
          }))
        });
        return offerings;
      } catch (error) {
        console.error('Failed to get offerings:', error);
        return null;
      }
    },
    enabled: isConfigured,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (packageToPurchase: any) => {
      if (!isConfigured) {
        throw new Error('Purchases are not configured');
      }
      try {
        const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
        return customerInfo;
      } catch (error: any) {
        if (error.userCancelled) {
          throw new Error('Purchase cancelled');
        }
        throw error;
      }
    },
    onSuccess: () => {
      customerInfoQuery.refetch();
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      if (!isConfigured) {
        throw new Error('Restore is not configured');
      }
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo;
    },
    onSuccess: () => {
      customerInfoQuery.refetch();
    },
  });

  const isPremium = isConfigured && customerInfoQuery.data?.entitlements.active['premium'] !== undefined;
  const isLoading = !isConfigured ? false : (customerInfoQuery.isLoading || offeringsQuery.isLoading);

  return {
    isPremium,
    isLoading,
    customerInfo: customerInfoQuery.data,
    offerings: offeringsQuery.data,
    purchase: purchaseMutation.mutateAsync,
    restore: restoreMutation.mutateAsync,
    isPurchasing: purchaseMutation.isPending,
    isRestoring: restoreMutation.isPending,
    refetch: customerInfoQuery.refetch,
  };
});
