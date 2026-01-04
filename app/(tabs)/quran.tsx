import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen, ChevronRight, Trophy, X, Play, Pause, Volume2, SkipForward, SkipBack, ChevronDown } from "lucide-react-native";
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from "expo-audio";
import Colors from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useReciter } from "@/contexts/ReciterContext";
import { useRouter } from "expo-router";

type Surah = {
  number: number;
  name: string;
  nameArabic: string;
  englishTranslation: string;
  verses: number;
  revelation: string;
};

type VerseData = {
  arabic: string;
  translation: string;
  transliteration: string;
  audioUrl: string;
  ayahNumber: number;
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const VERSE_CARD_HEIGHT = 280;

const surahs: Surah[] = [
  { number: 1, name: "Al-Fatihah", nameArabic: "الفاتحة", englishTranslation: "The Opening", verses: 7, revelation: "Meccan" },
  { number: 2, name: "Al-Baqarah", nameArabic: "البقرة", englishTranslation: "The Cow", verses: 286, revelation: "Medinan" },
  { number: 3, name: "Ali 'Imran", nameArabic: "آل عمران", englishTranslation: "The Family of Imran", verses: 200, revelation: "Medinan" },
  { number: 4, name: "An-Nisa", nameArabic: "النساء", englishTranslation: "The Women", verses: 176, revelation: "Medinan" },
  { number: 5, name: "Al-Ma'idah", nameArabic: "المائدة", englishTranslation: "The Table Spread", verses: 120, revelation: "Medinan" },
  { number: 6, name: "Al-An'am", nameArabic: "الأنعام", englishTranslation: "The Cattle", verses: 165, revelation: "Meccan" },
  { number: 7, name: "Al-A'raf", nameArabic: "الأعراف", englishTranslation: "The Heights", verses: 206, revelation: "Meccan" },
  { number: 8, name: "Al-Anfal", nameArabic: "الأنفال", englishTranslation: "The Spoils of War", verses: 75, revelation: "Medinan" },
  { number: 9, name: "At-Tawbah", nameArabic: "التوبة", englishTranslation: "The Repentance", verses: 129, revelation: "Medinan" },
  { number: 10, name: "Yunus", nameArabic: "يونس", englishTranslation: "Jonah", verses: 109, revelation: "Meccan" },
  { number: 11, name: "Hud", nameArabic: "هود", englishTranslation: "Hud", verses: 123, revelation: "Meccan" },
  { number: 12, name: "Yusuf", nameArabic: "يوسف", englishTranslation: "Joseph", verses: 111, revelation: "Meccan" },
  { number: 13, name: "Ar-Ra'd", nameArabic: "الرعد", englishTranslation: "The Thunder", verses: 43, revelation: "Medinan" },
  { number: 14, name: "Ibrahim", nameArabic: "ابراهيم", englishTranslation: "Abraham", verses: 52, revelation: "Meccan" },
  { number: 15, name: "Al-Hijr", nameArabic: "الحجر", englishTranslation: "The Rocky Tract", verses: 99, revelation: "Meccan" },
  { number: 16, name: "An-Nahl", nameArabic: "النحل", englishTranslation: "The Bee", verses: 128, revelation: "Meccan" },
  { number: 17, name: "Al-Isra", nameArabic: "الإسراء", englishTranslation: "The Night Journey", verses: 111, revelation: "Meccan" },
  { number: 18, name: "Al-Kahf", nameArabic: "الكهف", englishTranslation: "The Cave", verses: 110, revelation: "Meccan" },
  { number: 19, name: "Maryam", nameArabic: "مريم", englishTranslation: "Mary", verses: 98, revelation: "Meccan" },
  { number: 20, name: "Taha", nameArabic: "طه", englishTranslation: "Ta-Ha", verses: 135, revelation: "Meccan" },
  { number: 21, name: "Al-Anbya", nameArabic: "الأنبياء", englishTranslation: "The Prophets", verses: 112, revelation: "Meccan" },
  { number: 22, name: "Al-Hajj", nameArabic: "الحج", englishTranslation: "The Pilgrimage", verses: 78, revelation: "Medinan" },
  { number: 23, name: "Al-Mu'minun", nameArabic: "المؤمنون", englishTranslation: "The Believers", verses: 118, revelation: "Meccan" },
  { number: 24, name: "An-Nur", nameArabic: "النور", englishTranslation: "The Light", verses: 64, revelation: "Medinan" },
  { number: 25, name: "Al-Furqan", nameArabic: "الفرقان", englishTranslation: "The Criterion", verses: 77, revelation: "Meccan" },
  { number: 26, name: "Ash-Shu'ara", nameArabic: "الشعراء", englishTranslation: "The Poets", verses: 227, revelation: "Meccan" },
  { number: 27, name: "An-Naml", nameArabic: "النمل", englishTranslation: "The Ant", verses: 93, revelation: "Meccan" },
  { number: 28, name: "Al-Qasas", nameArabic: "القصص", englishTranslation: "The Stories", verses: 88, revelation: "Meccan" },
  { number: 29, name: "Al-'Ankabut", nameArabic: "العنكبوت", englishTranslation: "The Spider", verses: 69, revelation: "Meccan" },
  { number: 30, name: "Ar-Rum", nameArabic: "الروم", englishTranslation: "The Romans", verses: 60, revelation: "Meccan" },
  { number: 31, name: "Luqman", nameArabic: "لقمان", englishTranslation: "Luqman", verses: 34, revelation: "Meccan" },
  { number: 32, name: "As-Sajdah", nameArabic: "السجدة", englishTranslation: "The Prostration", verses: 30, revelation: "Meccan" },
  { number: 33, name: "Al-Ahzab", nameArabic: "الأحزاب", englishTranslation: "The Combined Forces", verses: 73, revelation: "Medinan" },
  { number: 34, name: "Saba", nameArabic: "سبإ", englishTranslation: "Sheba", verses: 54, revelation: "Meccan" },
  { number: 35, name: "Fatir", nameArabic: "فاطر", englishTranslation: "The Originator", verses: 45, revelation: "Meccan" },
  { number: 36, name: "Ya-Sin", nameArabic: "يس", englishTranslation: "Ya-Sin", verses: 83, revelation: "Meccan" },
  { number: 37, name: "As-Saffat", nameArabic: "الصافات", englishTranslation: "Those Ranged in Ranks", verses: 182, revelation: "Meccan" },
  { number: 38, name: "Sad", nameArabic: "ص", englishTranslation: "Sad", verses: 88, revelation: "Meccan" },
  { number: 39, name: "Az-Zumar", nameArabic: "الزمر", englishTranslation: "The Groups", verses: 75, revelation: "Meccan" },
  { number: 40, name: "Ghafir", nameArabic: "غافر", englishTranslation: "The Forgiver", verses: 85, revelation: "Meccan" },
  { number: 41, name: "Fussilat", nameArabic: "فصلت", englishTranslation: "Explained in Detail", verses: 54, revelation: "Meccan" },
  { number: 42, name: "Ash-Shuraa", nameArabic: "الشورى", englishTranslation: "The Consultation", verses: 53, revelation: "Meccan" },
  { number: 43, name: "Az-Zukhruf", nameArabic: "الزخرف", englishTranslation: "The Gold Adornments", verses: 89, revelation: "Meccan" },
  { number: 44, name: "Ad-Dukhan", nameArabic: "الدخان", englishTranslation: "The Smoke", verses: 59, revelation: "Meccan" },
  { number: 45, name: "Al-Jathiyah", nameArabic: "الجاثية", englishTranslation: "The Crouching", verses: 37, revelation: "Meccan" },
  { number: 46, name: "Al-Ahqaf", nameArabic: "الأحقاف", englishTranslation: "The Wind-Curved Sandhills", verses: 35, revelation: "Meccan" },
  { number: 47, name: "Muhammad", nameArabic: "محمد", englishTranslation: "Muhammad", verses: 38, revelation: "Medinan" },
  { number: 48, name: "Al-Fath", nameArabic: "الفتح", englishTranslation: "The Victory", verses: 29, revelation: "Medinan" },
  { number: 49, name: "Al-Hujurat", nameArabic: "الحجرات", englishTranslation: "The Rooms", verses: 18, revelation: "Medinan" },
  { number: 50, name: "Qaf", nameArabic: "ق", englishTranslation: "Qaf", verses: 45, revelation: "Meccan" },
  { number: 51, name: "Adh-Dhariyat", nameArabic: "الذاريات", englishTranslation: "The Winnowing Winds", verses: 60, revelation: "Meccan" },
  { number: 52, name: "At-Tur", nameArabic: "الطور", englishTranslation: "The Mount", verses: 49, revelation: "Meccan" },
  { number: 53, name: "An-Najm", nameArabic: "النجم", englishTranslation: "The Star", verses: 62, revelation: "Meccan" },
  { number: 54, name: "Al-Qamar", nameArabic: "القمر", englishTranslation: "The Moon", verses: 55, revelation: "Meccan" },
  { number: 55, name: "Ar-Rahman", nameArabic: "الرحمن", englishTranslation: "The Most Merciful", verses: 78, revelation: "Medinan" },
  { number: 56, name: "Al-Waqi'ah", nameArabic: "الواقعة", englishTranslation: "The Inevitable", verses: 96, revelation: "Meccan" },
  { number: 57, name: "Al-Hadid", nameArabic: "الحديد", englishTranslation: "The Iron", verses: 29, revelation: "Medinan" },
  { number: 58, name: "Al-Mujadila", nameArabic: "المجادلة", englishTranslation: "The Pleading Woman", verses: 22, revelation: "Medinan" },
  { number: 59, name: "Al-Hashr", nameArabic: "الحشر", englishTranslation: "The Exile", verses: 24, revelation: "Medinan" },
  { number: 60, name: "Al-Mumtahanah", nameArabic: "الممتحنة", englishTranslation: "She That is to be Examined", verses: 13, revelation: "Medinan" },
  { number: 61, name: "As-Saf", nameArabic: "الصف", englishTranslation: "The Ranks", verses: 14, revelation: "Medinan" },
  { number: 62, name: "Al-Jumu'ah", nameArabic: "الجمعة", englishTranslation: "The Friday", verses: 11, revelation: "Medinan" },
  { number: 63, name: "Al-Munafiqun", nameArabic: "المنافقون", englishTranslation: "The Hypocrites", verses: 11, revelation: "Medinan" },
  { number: 64, name: "At-Taghabun", nameArabic: "التغابن", englishTranslation: "The Mutual Disillusion", verses: 18, revelation: "Medinan" },
  { number: 65, name: "At-Talaq", nameArabic: "الطلاق", englishTranslation: "The Divorce", verses: 12, revelation: "Medinan" },
  { number: 66, name: "At-Tahrim", nameArabic: "التحريم", englishTranslation: "The Prohibition", verses: 12, revelation: "Medinan" },
  { number: 67, name: "Al-Mulk", nameArabic: "الملك", englishTranslation: "The Sovereignty", verses: 30, revelation: "Meccan" },
  { number: 68, name: "Al-Qalam", nameArabic: "القلم", englishTranslation: "The Pen", verses: 52, revelation: "Meccan" },
  { number: 69, name: "Al-Haqqah", nameArabic: "الحاقة", englishTranslation: "The Reality", verses: 52, revelation: "Meccan" },
  { number: 70, name: "Al-Ma'arij", nameArabic: "المعارج", englishTranslation: "The Ascending Stairways", verses: 44, revelation: "Meccan" },
  { number: 71, name: "Nuh", nameArabic: "نوح", englishTranslation: "Noah", verses: 28, revelation: "Meccan" },
  { number: 72, name: "Al-Jinn", nameArabic: "الجن", englishTranslation: "The Jinn", verses: 28, revelation: "Meccan" },
  { number: 73, name: "Al-Muzzammil", nameArabic: "المزمل", englishTranslation: "The Enshrouded One", verses: 20, revelation: "Meccan" },
  { number: 74, name: "Al-Muddaththir", nameArabic: "المدثر", englishTranslation: "The Cloaked One", verses: 56, revelation: "Meccan" },
  { number: 75, name: "Al-Qiyamah", nameArabic: "القيامة", englishTranslation: "The Resurrection", verses: 40, revelation: "Meccan" },
  { number: 76, name: "Al-Insan", nameArabic: "الانسان", englishTranslation: "The Man", verses: 31, revelation: "Medinan" },
  { number: 77, name: "Al-Mursalat", nameArabic: "المرسلات", englishTranslation: "The Emissaries", verses: 50, revelation: "Meccan" },
  { number: 78, name: "An-Naba", nameArabic: "النبإ", englishTranslation: "The Tidings", verses: 40, revelation: "Meccan" },
  { number: 79, name: "An-Nazi'at", nameArabic: "النازعات", englishTranslation: "Those Who Drag Forth", verses: 46, revelation: "Meccan" },
  { number: 80, name: "Abasa", nameArabic: "عبس", englishTranslation: "He Frowned", verses: 42, revelation: "Meccan" },
  { number: 81, name: "At-Takwir", nameArabic: "التكوير", englishTranslation: "The Overthrowing", verses: 29, revelation: "Meccan" },
  { number: 82, name: "Al-Infitar", nameArabic: "الإنفطار", englishTranslation: "The Cleaving", verses: 19, revelation: "Meccan" },
  { number: 83, name: "Al-Mutaffifin", nameArabic: "المطففين", englishTranslation: "The Defrauding", verses: 36, revelation: "Meccan" },
  { number: 84, name: "Al-Inshiqaq", nameArabic: "الإنشقاق", englishTranslation: "The Splitting Open", verses: 25, revelation: "Meccan" },
  { number: 85, name: "Al-Buruj", nameArabic: "البروج", englishTranslation: "The Mansions of the Stars", verses: 22, revelation: "Meccan" },
  { number: 86, name: "At-Tariq", nameArabic: "الطارق", englishTranslation: "The Night-Comer", verses: 17, revelation: "Meccan" },
  { number: 87, name: "Al-A'la", nameArabic: "الأعلى", englishTranslation: "The Most High", verses: 19, revelation: "Meccan" },
  { number: 88, name: "Al-Ghashiyah", nameArabic: "الغاشية", englishTranslation: "The Overwhelming", verses: 26, revelation: "Meccan" },
  { number: 89, name: "Al-Fajr", nameArabic: "الفجر", englishTranslation: "The Dawn", verses: 30, revelation: "Meccan" },
  { number: 90, name: "Al-Balad", nameArabic: "البلد", englishTranslation: "The City", verses: 20, revelation: "Meccan" },
  { number: 91, name: "Ash-Shams", nameArabic: "الشمس", englishTranslation: "The Sun", verses: 15, revelation: "Meccan" },
  { number: 92, name: "Al-Layl", nameArabic: "الليل", englishTranslation: "The Night", verses: 21, revelation: "Meccan" },
  { number: 93, name: "Ad-Duhaa", nameArabic: "الضحى", englishTranslation: "The Morning Hours", verses: 11, revelation: "Meccan" },
  { number: 94, name: "Ash-Sharh", nameArabic: "الشرح", englishTranslation: "The Relief", verses: 8, revelation: "Meccan" },
  { number: 95, name: "At-Tin", nameArabic: "التين", englishTranslation: "The Fig", verses: 8, revelation: "Meccan" },
  { number: 96, name: "Al-Alaq", nameArabic: "العلق", englishTranslation: "The Clot", verses: 19, revelation: "Meccan" },
  { number: 97, name: "Al-Qadr", nameArabic: "القدر", englishTranslation: "The Power", verses: 5, revelation: "Meccan" },
  { number: 98, name: "Al-Bayyinah", nameArabic: "البينة", englishTranslation: "The Clear Proof", verses: 8, revelation: "Medinan" },
  { number: 99, name: "Az-Zalzalah", nameArabic: "الزلزلة", englishTranslation: "The Earthquake", verses: 8, revelation: "Medinan" },
  { number: 100, name: "Al-'Adiyat", nameArabic: "العاديات", englishTranslation: "The Courser", verses: 11, revelation: "Meccan" },
  { number: 101, name: "Al-Qari'ah", nameArabic: "القارعة", englishTranslation: "The Calamity", verses: 11, revelation: "Meccan" },
  { number: 102, name: "At-Takathur", nameArabic: "التكاثر", englishTranslation: "The Rivalry in World Increase", verses: 8, revelation: "Meccan" },
  { number: 103, name: "Al-'Asr", nameArabic: "العصر", englishTranslation: "The Declining Day", verses: 3, revelation: "Meccan" },
  { number: 104, name: "Al-Humazah", nameArabic: "الهمزة", englishTranslation: "The Traducer", verses: 9, revelation: "Meccan" },
  { number: 105, name: "Al-Fil", nameArabic: "الفيل", englishTranslation: "The Elephant", verses: 5, revelation: "Meccan" },
  { number: 106, name: "Quraysh", nameArabic: "قريش", englishTranslation: "Quraysh", verses: 4, revelation: "Meccan" },
  { number: 107, name: "Al-Ma'un", nameArabic: "الماعون", englishTranslation: "The Small Kindnesses", verses: 7, revelation: "Meccan" },
  { number: 108, name: "Al-Kawthar", nameArabic: "الكوثر", englishTranslation: "The Abundance", verses: 3, revelation: "Meccan" },
  { number: 109, name: "Al-Kafirun", nameArabic: "الكافرون", englishTranslation: "The Disbelievers", verses: 6, revelation: "Meccan" },
  { number: 110, name: "An-Nasr", nameArabic: "النصر", englishTranslation: "The Divine Support", verses: 3, revelation: "Medinan" },
  { number: 111, name: "Al-Masad", nameArabic: "المسد", englishTranslation: "The Palm Fiber", verses: 5, revelation: "Meccan" },
  { number: 112, name: "Al-Ikhlas", nameArabic: "الإخلاص", englishTranslation: "The Sincerity", verses: 4, revelation: "Meccan" },
  { number: 113, name: "Al-Falaq", nameArabic: "الفلق", englishTranslation: "The Daybreak", verses: 5, revelation: "Meccan" },
  { number: 114, name: "An-Nas", nameArabic: "الناس", englishTranslation: "Mankind", verses: 6, revelation: "Meccan" },
];

export default function QuranScreen() {
  const { language, translate } = useLanguage();
  const { theme } = useTheme();
  const { selectedReciter, reciters, setReciter } = useReciter();
  const router = useRouter();
  const colors = theme === 'light' ? Colors.light : Colors.dark;
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [surahData, setSurahData] = useState<VerseData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  
  const [currentPlayingVerse, setCurrentPlayingVerse] = useState<number | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const verseRefs = useRef<{ [key: number]: number }>({});
  const [showReciterPicker, setShowReciterPicker] = useState(false);
  const [localReciter, setLocalReciter] = useState(selectedReciter);
  const playerRef = useRef<any>(null);
  const isTransitioningRef = useRef(false);
  
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

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
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
    });
  }, []);

  const playVerse = useCallback(async (verseIndex: number) => {
    if (!surahData || verseIndex >= surahData.length || isTransitioningRef.current) {
      console.log('Invalid verse index or transitioning:', verseIndex);
      return;
    }
    
    isTransitioningRef.current = true;
    const verse = surahData[verseIndex];
    console.log('Playing verse:', verseIndex, 'Audio URL:', verse.audioUrl);
    
    setIsLoadingAudio(true);
    setCurrentPlayingVerse(verseIndex);
    
    try {
      if (playerRef.current) {
        console.log('Replacing audio source and playing:', verse.audioUrl);
        playerRef.current.replace({ uri: verse.audioUrl });
        playerRef.current.play();
        console.log('Audio playing started');
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsLoadingAudio(false);
      isTransitioningRef.current = false;
    }
  }, [surahData]);

  useEffect(() => {
    if (status.didJustFinish && isPlayingAll && surahData && currentPlayingVerse !== null && !isTransitioningRef.current) {
      const nextVerseIndex = currentPlayingVerse + 1;
      if (nextVerseIndex < surahData.length) {
        console.log('Verse finished, waiting before playing next verse:', nextVerseIndex);
        setTimeout(() => {
          console.log('Now playing next verse:', nextVerseIndex);
          playVerse(nextVerseIndex);
        }, 500);
      } else {
        console.log('Finished playing all verses');
        setIsPlayingAll(false);
        setCurrentPlayingVerse(null);
      }
    }
  }, [status.didJustFinish, isPlayingAll, surahData, currentPlayingVerse, playVerse]);



  useEffect(() => {
    if (currentPlayingVerse !== null && scrollViewRef.current) {
      const yOffset = verseRefs.current[currentPlayingVerse] || (currentPlayingVerse * VERSE_CARD_HEIGHT);
      scrollViewRef.current.scrollTo({
        y: Math.max(0, yOffset - 100),
        animated: true,
      });
    }
  }, [currentPlayingVerse]);

  const togglePlayVerse = useCallback((verseIndex: number) => {
    if (currentPlayingVerse === verseIndex && status.playing) {
      console.log('Pausing current verse');
      player.pause();
    } else if (currentPlayingVerse === verseIndex && !status.playing) {
      console.log('Resuming current verse');
      player.play();
    } else {
      console.log('Playing new verse:', verseIndex);
      setIsPlayingAll(false);
      playVerse(verseIndex);
    }
  }, [currentPlayingVerse, status.playing, player, playVerse]);

  const playAllVerses = useCallback(() => {
    if (!surahData || surahData.length === 0) return;
    
    if (isPlayingAll && status.playing) {
      if (playerRef.current) playerRef.current.pause();
      return;
    }
    
    if (isPlayingAll && !status.playing && currentPlayingVerse !== null) {
      if (playerRef.current) playerRef.current.play();
      return;
    }
    
    console.log('Starting to play all verses');
    setIsPlayingAll(true);
    playVerse(0);
  }, [surahData, isPlayingAll, status.playing, currentPlayingVerse, playVerse]);

  const skipToNextVerse = useCallback(() => {
    if (!surahData || currentPlayingVerse === null) return;
    const nextIndex = currentPlayingVerse + 1;
    if (nextIndex < surahData.length) {
      playVerse(nextIndex);
    }
  }, [surahData, currentPlayingVerse, playVerse]);

  const skipToPreviousVerse = useCallback(() => {
    if (!surahData || currentPlayingVerse === null) return;
    const prevIndex = currentPlayingVerse - 1;
    if (prevIndex >= 0) {
      playVerse(prevIndex);
    }
  }, [surahData, currentPlayingVerse, playVerse]);

  useEffect(() => {
    setLocalReciter(selectedReciter);
  }, [selectedReciter]);

  const handleSurahPress = async (surahNumber: number) => {
    setSelectedSurah(surahNumber);
    setIsLoading(true);
    setCurrentPlayingVerse(null);
    setIsPlayingAll(false);
    
    try {
      const arabicResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
      const arabicData = await arabicResponse.json();
      
      const languageMap: Record<string, string> = {
        en: 'en.sahih',
        ar: 'ar.alafasy',
        ur: 'ur.jalandhry',
        tr: 'tr.diyanet',
        fr: 'fr.hamidullah',
        uz: 'uz.sodik',
      };
      
      const edition = languageMap[language || 'en'] || 'en.sahih';
      const [translationResponse, transliterationResponse] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${edition}`),
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.transliteration`)
      ]);
      const translationData = await translationResponse.json();
      const transliterationData = await transliterationResponse.json();
      
      const verses: VerseData[] = arabicData.data.ayahs.map((ayah: any, index: number) => ({
        arabic: ayah.text,
        translation: translationData.data.ayahs[index]?.text || '',
        transliteration: transliterationData.data?.ayahs?.[index]?.text || '',
        audioUrl: `https://everyayah.com/data/${localReciter.folderName}/${surahNumber.toString().padStart(3, '0')}${(index + 1).toString().padStart(3, '0')}.mp3`,
        ayahNumber: ayah.number,
      }));
      
      console.log('Loaded surah with', verses.length, 'verses');
      console.log('Using reciter:', localReciter.name, 'Folder:', localReciter.folderName);
      console.log('First verse audio URL:', verses[0]?.audioUrl);
      
      setSurahData(verses);
    } catch (error) {
      console.error('Failed to fetch Surah data:', error);
      setSurahData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (playerRef.current) {
      playerRef.current.pause();
    }
    setSelectedSurah(null);
    setSurahData(null);
    setHasScrolledToEnd(false);
    setShowQuizModal(false);
    setCurrentPlayingVerse(null);
    setIsPlayingAll(false);
    setIsLoadingAudio(false);
  };

  const measureVerse = (index: number, y: number) => {
    verseRefs.current[index] = y;
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    
    if (isCloseToBottom && !hasScrolledToEnd) {
      setHasScrolledToEnd(true);
      setTimeout(() => {
        setShowQuizModal(true);
      }, 1000);
    }
  };

  const handleTakeQuiz = () => {
    setShowQuizModal(false);
    router.push('/(tabs)/quiz' as any);
  };

  if (selectedSurah !== null && surahData) {
    const surah = surahs.find(s => s.number === selectedSurah);
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.surahHeader}
        >
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backText}>← {translate('back')}</Text>
          </TouchableOpacity>
          <Text style={styles.surahHeaderArabic}>{surah?.nameArabic}</Text>
          <Text style={styles.surahHeaderTitle}>{surah?.name}</Text>
          <Text style={styles.surahHeaderSubtext}>
            {surah?.verses} {translate('verses')} • {translate(surah?.revelation.toLowerCase() as any)}
          </Text>
          
          <View style={styles.audioControlsContainer}>
            <TouchableOpacity 
              style={styles.reciterSelector}
              onPress={() => setShowReciterPicker(true)}
              activeOpacity={0.7}
            >
              <Volume2 color="#ffffff" size={16} strokeWidth={2} />
              <Text style={styles.reciterText}>{localReciter.name}</Text>
              <ChevronDown color="#ffffff" size={16} strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.audioControls}>
              <TouchableOpacity
                style={styles.audioControlButton}
                onPress={skipToPreviousVerse}
                disabled={currentPlayingVerse === null || currentPlayingVerse === 0}
              >
                <SkipBack 
                  color={currentPlayingVerse === null || currentPlayingVerse === 0 ? "rgba(255,255,255,0.4)" : "#ffffff"} 
                  size={20} 
                  strokeWidth={2} 
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.playAllButton}
                onPress={playAllVerses}
                activeOpacity={0.8}
              >
                {isPlayingAll && status.playing ? (
                  <Pause color="#ffffff" size={24} strokeWidth={2} />
                ) : (
                  <Play color="#ffffff" size={24} strokeWidth={2} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.audioControlButton}
                onPress={skipToNextVerse}
                disabled={currentPlayingVerse === null || (surahData && currentPlayingVerse >= surahData.length - 1)}
              >
                <SkipForward 
                  color={currentPlayingVerse === null || (surahData && currentPlayingVerse >= surahData.length - 1) ? "rgba(255,255,255,0.4)" : "#ffffff"} 
                  size={20} 
                  strokeWidth={2} 
                />
              </TouchableOpacity>
            </View>
            {currentPlayingVerse !== null && (
              <Text style={styles.nowPlayingText}>
                {translate('verse')} {currentPlayingVerse + 1} / {surahData?.length}
              </Text>
            )}
          </View>
        </LinearGradient>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.versesContainer} 
          contentContainerStyle={styles.versesContent}
          onScroll={handleScroll}
          scrollEventThrottle={400}
        >
          {surahData.map((verse, index) => (
            <View 
              key={index} 
              style={[
                styles.verseCard,
                { backgroundColor: colors.card },
                currentPlayingVerse === index && [styles.verseCardPlaying, { borderColor: colors.primary, backgroundColor: colors.parchment }]
              ]}
              onLayout={(event) => {
                const { y } = event.nativeEvent.layout;
                measureVerse(index, y);
              }}
            >
              <View style={styles.verseHeader}>
                <View style={[styles.verseNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.verseNumberText}>{index + 1}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.versePlayButton,
                    { backgroundColor: colors.parchment, borderColor: colors.primary },
                    currentPlayingVerse === index && status.playing && styles.versePlayButtonActive
                  ]}
                  onPress={() => togglePlayVerse(index)}
                  activeOpacity={0.7}
                  disabled={isLoadingAudio}
                >
                  {currentPlayingVerse === index && isLoadingAudio ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : currentPlayingVerse === index && status.playing ? (
                    <Pause color={colors.primary} size={18} strokeWidth={2} />
                  ) : (
                    <Play color={colors.primary} size={18} strokeWidth={2} />
                  )}
                </TouchableOpacity>
              </View>
              <Text style={[styles.verseArabic, { color: colors.text }]}>{verse.arabic}</Text>
              {verse.transliteration && (
                <Text style={[styles.verseTransliteration, { color: theme === 'dark' ? '#ffffff' : colors.primary }]}>{verse.transliteration}</Text>
              )}
              {currentPlayingVerse === index && status.duration > 0 && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${(status.currentTime / status.duration) * 100}%`, backgroundColor: colors.primary }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.progressText, { color: colors.muted }]}>
                    {formatTime(status.currentTime)} / {formatTime(status.duration)}
                  </Text>
                </View>
              )}
              <Text style={[styles.verseTranslation, { color: colors.text }]}>{verse.translation}</Text>
            </View>
          ))}
          
          {surahData.length > 0 && (
            <View style={[styles.completionCard, { backgroundColor: colors.card }]}>
              <Trophy color={colors.accent} size={32} strokeWidth={1.5} />
              <Text style={[styles.completionTitle, { color: colors.text }]}>{translate('surah_completed')}</Text>
              <Text style={[styles.completionText, { color: colors.muted }]}>{translate('test_understanding')}</Text>
              <TouchableOpacity
                style={styles.quizButton}
                onPress={() => setShowQuizModal(true)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.quizButtonGradient}
                >
                  <Trophy color="#ffffff" size={20} strokeWidth={2} />
                  <Text style={styles.quizButtonText}>{translate('take_quiz')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <Modal
          visible={showQuizModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowQuizModal(false)}
        >
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setShowQuizModal(false)}
              >
                <X color={colors.muted} size={24} strokeWidth={2} />
              </TouchableOpacity>
              
              <Trophy color={colors.accent} size={56} strokeWidth={1.5} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>{translate('ready_for_quiz')}</Text>
              <Text style={[styles.modalText, { color: colors.muted }]}>
                {translate('test_knowledge')} {surah?.name} with a quiz generated specifically for this Surah.
              </Text>
              
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleTakeQuiz}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.modalButtonGradient}
                >
                  <Text style={styles.modalButtonText}>{translate('start_quiz')}</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalSkipButton}
                onPress={() => setShowQuizModal(false)}
              >
                <Text style={[styles.modalSkipText, { color: colors.muted }]}>{translate('maybe_later')}</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>

        <Modal
          visible={showReciterPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowReciterPicker(false)}
        >
          <View style={styles.reciterModalOverlay}>
            <View style={[styles.reciterModalContent, { backgroundColor: colors.card }]}>
              <View style={styles.reciterModalHeader}>
                <Text style={[styles.reciterModalTitle, { color: colors.text }]}>Select Reciter</Text>
                <TouchableOpacity onPress={() => setShowReciterPicker(false)}>
                  <X color={colors.muted} size={24} strokeWidth={2} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.recitersList}>
                {reciters.map((reciter) => (
                  <TouchableOpacity
                    key={reciter.id}
                    style={[
                      styles.reciterOption,
                      { backgroundColor: colors.background, borderColor: localReciter.id === reciter.id ? colors.primary : colors.border }
                    ]}
                    onPress={async () => {
                      if (playerRef.current) {
                        playerRef.current.pause();
                      }
                      setLocalReciter(reciter);
                      await setReciter(reciter);
                      setCurrentPlayingVerse(null);
                      setIsPlayingAll(false);
                      
                      if (surahData && selectedSurah) {
                        const updatedVerses = surahData.map((verse, index) => ({
                          ...verse,
                          audioUrl: `https://everyayah.com/data/${reciter.folderName}/${selectedSurah.toString().padStart(3, '0')}${(index + 1).toString().padStart(3, '0')}.mp3`,
                        }));
                        setSurahData(updatedVerses);
                        
                        if (scrollViewRef.current) {
                          scrollViewRef.current.scrollTo({ y: 0, animated: true });
                        }
                      }
                      
                      setShowReciterPicker(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.reciterOptionContent}>
                      <Text style={[styles.reciterOptionName, { color: colors.text }]}>{reciter.name}</Text>
                      <Text style={[styles.reciterOptionArabic, { color: colors.muted }]}>{reciter.arabicName}</Text>
                    </View>
                    {localReciter.id === reciter.id && (
                      <View style={[styles.reciterCheckmark, { backgroundColor: colors.parchment }]}>
                        <ChevronRight color={colors.primary} size={20} strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  if (selectedSurah !== null && isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.muted }]}>{translate('loading_surah')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.headerGradient}
      >
        <View style={styles.headerPattern} />
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <BookOpen color={colors.secondary} size={44} strokeWidth={1.5} />
          <Text style={styles.headerTitle}>القرآن الكريم</Text>
          <Text style={styles.headerEnglish}>{translate('noble_quran')}</Text>
          <Text style={styles.headerSubtext}>
            {translate('surahs_with_translations')}
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.contentContainer} contentContainerStyle={styles.contentInner}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.surahsContainer}>
            {surahs.map((surah) => (
              <TouchableOpacity
                key={surah.number}
                style={[styles.surahCard, { backgroundColor: colors.card }]}
                onPress={() => handleSurahPress(surah.number)}
                activeOpacity={0.7}
              >
                <View style={styles.surahLeft}>
                  <View style={[styles.surahNumberBadge, { backgroundColor: colors.parchment, borderColor: colors.primary }]}>
                    <Text style={[styles.surahNumberBadgeText, { color: colors.primary }]}>{surah.number}</Text>
                  </View>
                  <View style={styles.surahTextContainer}>
                    <Text style={[styles.surahNameArabic, { color: colors.text }]}>{surah.nameArabic}</Text>
                    <Text style={[styles.surahName, { color: colors.text }]}>{surah.name}</Text>
                    <Text style={[styles.surahMeta, { color: colors.muted }]}>
                      {surah.verses} verses • {surah.englishTranslation}
                    </Text>
                  </View>
                </View>
                <ChevronRight color={colors.muted} size={20} strokeWidth={2} />
              </TouchableOpacity>
            ))}
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
    paddingTop: 60,
    paddingBottom: 36,
    paddingHorizontal: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    overflow: "hidden" as const,
    position: "relative" as const,
  },
  headerPattern: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
    backgroundColor: "transparent",
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "600" as const,
    color: "#ffffff",
    marginTop: 20,
    letterSpacing: 1,
    fontFamily: "Georgia",
  },
  headerEnglish: {
    fontSize: 19,
    fontWeight: "400" as const,
    color: "#ffffff",
    opacity: 0.95,
    marginTop: 8,
    letterSpacing: 1.5,
    fontFamily: "Georgia",
  },
  headerSubtext: {
    fontSize: 15,
    color: "#ffffff",
    opacity: 0.88,
    marginTop: 10,
    textAlign: "center",
    letterSpacing: 0.3,
    fontFamily: "Georgia",
  },
  contentContainer: {
    flex: 1,
  },
  contentInner: {
    padding: 20,
    paddingBottom: 40,
  },
  surahsContainer: {
    gap: 10,
  },
  surahCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  surahLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  surahNumberBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  surahNumberBadgeText: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  surahTextContainer: {
    flex: 1,
    gap: 4,
  },
  surahNameArabic: {
    fontSize: 18,
    fontWeight: "600" as const,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  surahName: {
    fontSize: 14,
    fontWeight: "500" as const,
    letterSpacing: 0.2,
    fontFamily: "Georgia",
  },
  surahMeta: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: "Georgia",
  },
  surahHeader: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "500" as const,
    fontFamily: "Georgia",
  },
  surahHeaderArabic: {
    fontSize: 32,
    fontWeight: "600" as const,
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: 1,
  },
  surahHeaderTitle: {
    fontSize: 22,
    fontWeight: "500" as const,
    color: "#ffffff",
    opacity: 0.95,
    marginTop: 8,
    textAlign: "center",
    letterSpacing: 0.4,
    fontFamily: "Georgia",
  },
  surahHeaderSubtext: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.88,
    marginTop: 8,
    textAlign: "center",
    fontFamily: "Georgia",
  },
  versesContainer: {
    flex: 1,
  },
  versesContent: {
    padding: 20,
    paddingBottom: 40,
  },
  verseCard: {
    padding: 20,
    borderRadius: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  verseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  verseNumberText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#ffffff",
  },
  verseArabic: {
    fontSize: 22,
    lineHeight: 40,
    fontWeight: "600" as const,
    textAlign: "right",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  verseTransliteration: {
    fontSize: 15,
    lineHeight: 24,
    fontStyle: "italic" as const,
    marginBottom: 12,
    letterSpacing: 0.3,
    opacity: 0.9,
    fontFamily: "Georgia",
  },
  verseTranslation: {
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0.2,
    fontFamily: "Georgia",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Georgia",
  },
  completionCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: "600" as const,
    marginTop: 16,
    letterSpacing: 0.5,
    fontFamily: "Georgia",
  },
  completionText: {
    fontSize: 15,
    marginTop: 8,
    textAlign: "center",
    letterSpacing: 0.2,
    fontFamily: "Georgia",
  },
  quizButton: {
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  quizButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  quizButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#ffffff",
    letterSpacing: 0.4,
    fontFamily: "Georgia",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    borderRadius: 24,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  modalClose: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: "600" as const,
    marginTop: 20,
    letterSpacing: 0.5,
    fontFamily: "Georgia",
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 24,
    letterSpacing: 0.2,
    fontFamily: "Georgia",
  },
  modalButton: {
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  modalButtonGradient: {
    paddingVertical: 18,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#ffffff",
    letterSpacing: 0.5,
    fontFamily: "Georgia",
  },
  modalSkipButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  modalSkipText: {
    fontSize: 15,
    letterSpacing: 0.3,
    fontFamily: "Georgia",
  },
  audioControlsContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  reciterSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  reciterText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.95)",
    fontWeight: "600" as const,
    fontFamily: "Georgia",
  },
  audioControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  audioControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  playAllButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  nowPlayingText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 10,
    fontWeight: "500" as const,
    fontFamily: "Georgia",
  },
  verseCardPlaying: {
    borderWidth: 2,
  },
  verseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  versePlayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  versePlayButtonActive: {
    backgroundColor: "rgba(42, 87, 75, 0.1)",
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(42, 87, 75, 0.15)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    marginTop: 4,
    textAlign: "right" as const,
    fontFamily: "Georgia",
  },
  reciterModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  reciterModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  reciterModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  reciterModalTitle: {
    fontSize: 22,
    fontWeight: "600" as const,
    letterSpacing: 0.3,
    fontFamily: "Georgia",
  },
  recitersList: {
    padding: 20,
  },
  reciterOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  reciterOptionContent: {
    flex: 1,
  },
  reciterOptionName: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 4,
    letterSpacing: 0.2,
    fontFamily: "Georgia",
  },
  reciterOptionArabic: {
    fontSize: 14,
    letterSpacing: 0.2,
    fontFamily: "Georgia",
  },
  reciterCheckmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
