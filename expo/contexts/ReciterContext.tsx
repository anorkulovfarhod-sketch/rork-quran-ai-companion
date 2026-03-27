import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

export type Reciter = {
  id: string;
  name: string;
  arabicName: string;
  audioQuality: string;
  license: string;
  attribution: string;
  folderName: string;
};

export const reciters: Reciter[] = [
  {
    id: 'alafasy',
    name: 'Mishary Rashid Alafasy',
    arabicName: 'مشاري بن راشد العفاسي',
    audioQuality: '128kbps',
    license: 'Public Domain',
    attribution: 'Recitation by Mishary Rashid Alafasy. Audio provided by EveryAyah.com',
    folderName: 'Alafasy_128kbps',
  },
  {
    id: 'abdul_basit',
    name: 'Abdul Basit Abdul Samad',
    arabicName: 'عبد الباسط عبد الصمد',
    audioQuality: '192kbps',
    license: 'Public Domain',
    attribution: 'Recitation by Abdul Basit Abdul Samad. Audio provided by EveryAyah.com',
    folderName: 'Abdul_Basit_Murattal_192kbps',
  },
  {
    id: 'minshawi',
    name: 'Mohamed Siddiq Al-Minshawi',
    arabicName: 'محمد صديق المنشاوي',
    audioQuality: '128kbps',
    license: 'Public Domain',
    attribution: 'Recitation by Mohamed Siddiq Al-Minshawi. Audio provided by EveryAyah.com',
    folderName: 'Minshawy_Murattal_128kbps',
  },
  {
    id: 'hussary',
    name: 'Mahmoud Khalil Al-Hussary',
    arabicName: 'محمود خليل الحصري',
    audioQuality: '128kbps',
    license: 'Public Domain',
    attribution: 'Recitation by Mahmoud Khalil Al-Hussary. Audio provided by EveryAyah.com',
    folderName: 'Husary_128kbps',
  },
  {
    id: 'ghamadi',
    name: "Saad Al-Ghamadi",
    arabicName: 'سعد الغامدي',
    audioQuality: '40kbps',
    license: 'Public Domain',
    attribution: 'Recitation by Saad Al-Ghamadi. Audio provided by EveryAyah.com',
    folderName: 'Ghamadi_40kbps',
  },
];

export const [ReciterProvider, useReciter] = createContextHook(() => {
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(reciters[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReciter();
  }, []);

  const loadReciter = async () => {
    try {
      const stored = await AsyncStorage.getItem('selected_reciter');
      if (stored) {
        const reciter = reciters.find(r => r.id === stored);
        if (reciter) {
          setSelectedReciter(reciter);
        }
      }
    } catch (error) {
      console.error('Failed to load reciter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeReciter = async (reciter: Reciter) => {
    try {
      await AsyncStorage.setItem('selected_reciter', reciter.id);
      setSelectedReciter(reciter);
    } catch (error) {
      console.error('Failed to save reciter:', error);
    }
  };

  return {
    selectedReciter,
    setReciter: changeReciter,
    reciters,
    isLoading,
  };
});
