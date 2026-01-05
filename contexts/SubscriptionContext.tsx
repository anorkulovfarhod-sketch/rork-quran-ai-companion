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
        console.log('Using API key:', apiKey?.substring(0, 15) + '...');
        console.log('Platform:', Platform.OS);
        console.log('Is Dev:', __DEV__);
        
        const offerings = await Purchases.getOfferings();
        
        console.log('Offerings fetched:', {
          current: offerings.current?.identifier,
          packagesCount: offerings.current?.availablePackages.length || 0,
          allOfferings: Object.keys(offerings.all || {}),
          packages: offerings.current?.availablePackages.map(p => ({
            identifier: p.identifier,
            productId: p.product.identifier,
            price: p.product.priceString
          })) || []
        });
        
        if (!offerings.current || offerings.current.availablePackages.length === 0) {
          console.warn('⚠️ No offerings available. This usually means:');
          console.warn('  1. No products configured for this platform in RevenueCat');
          console.warn('  2. Testing on web/dev requires Test Store app setup');
          console.warn('  3. For real device testing, use iOS/Android build');
        }
        
        return offerings;
      } catch (error) {
        console.error('Failed to get offerings:', error);
        throw error;
      }
    },
    enabled: isConfigured,
    retry: 2,
    staleTime: 300000,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (packageToPurchase: any) => {
      if (!isConfigured) {
        throw new Error('RevenueCat is not configured. Please check your API keys.');
      }
      
      if (!packageToPurchase) {
        throw new Error('No package selected for purchase.');
      }
      
      try {
        console.log('Attempting purchase:', {
          packageId: packageToPurchase.identifier,
          productId: packageToPurchase.product.identifier,
          platform: Platform.OS,
        });
        
        const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
        console.log('Purchase successful!');
        return customerInfo;
      } catch (error: any) {
        console.error('Purchase error details:', {
          message: error.message,
          code: error.code,
          userCancelled: error.userCancelled,
          error: error,
        });
        
        if (error.userCancelled) {
          throw new Error('Purchase cancelled');
        }
        
        if (error.message?.includes('Unable to find') || error.message?.includes('No product')) {
          throw new Error('Product not available. Testing requires a device with App Store/Play Store access.');
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
