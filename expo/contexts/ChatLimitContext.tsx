import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSubscription } from './SubscriptionContext';

const CHAT_COUNT_KEY = 'chatMessageCount';
const FREE_CHAT_LIMIT = 3;

export const [ChatLimitProvider, useChatLimit] = createContextHook(() => {
  const { isPremium } = useSubscription();

  const chatCountQuery = useQuery({
    queryKey: ['chatCount'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(CHAT_COUNT_KEY);
        return stored ? parseInt(stored, 10) : 0;
      } catch (error) {
        console.error('Failed to get chat count:', error);
        return 0;
      }
    },
  });

  const incrementMutation = useMutation({
    mutationFn: async () => {
      const newCount = (chatCountQuery.data || 0) + 1;
      await AsyncStorage.setItem(CHAT_COUNT_KEY, newCount.toString());
      return newCount;
    },
    onSuccess: () => {
      chatCountQuery.refetch();
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      await AsyncStorage.setItem(CHAT_COUNT_KEY, '0');
      return 0;
    },
    onSuccess: () => {
      chatCountQuery.refetch();
    },
  });

  const chatCount = chatCountQuery.data || 0;
  const hasUnlimitedChat = isPremium;
  const remainingChats = hasUnlimitedChat ? Infinity : Math.max(0, FREE_CHAT_LIMIT - chatCount);
  const canSendMessage = hasUnlimitedChat || chatCount < FREE_CHAT_LIMIT;

  return {
    chatCount,
    remainingChats,
    canSendMessage,
    hasUnlimitedChat,
    incrementChatCount: incrementMutation.mutateAsync,
    resetChatCount: resetMutation.mutateAsync,
    isLoading: chatCountQuery.isLoading,
  };
});
