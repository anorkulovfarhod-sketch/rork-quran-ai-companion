import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { translate as translateFn } from '@/constants/translations';

export type Language = 'en' | 'ar' | 'ur' | 'tr' | 'fr';

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [language, setLanguage] = useState<Language | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const stored = await AsyncStorage.getItem('app_language');
      if (stored) {
        setLanguage(stored as Language);
      }
    } catch (error) {
      console.error('Failed to load language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem('app_language', newLanguage);
      setLanguage(newLanguage);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  };

  const translate = (key: string) => translateFn(key as any, language);

  return {
    language,
    setLanguage: changeLanguage,
    isLoading,
    translate,
  };
});
