import { Tabs } from "expo-router";
import { MessageCircle, Sparkles, Clock, Book, Settings } from "lucide-react-native";
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

import Colors from "@/constants/colors";

export default function TabLayout() {
  const { translate } = useLanguage();
  const { theme } = useTheme();
  const colors = theme === 'light' ? Colors.light : Colors.dark;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: '600' as const,
        },
      }}
    >
      <Tabs.Screen
        name="quran"
        options={{
          title: translate('quran'),
          tabBarIcon: ({ color }) => <Book color={color} size={24} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="prayers"
        options={{
          title: translate('prayers'),
          tabBarIcon: ({ color }) => <Clock color={color} size={24} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="quote"
        options={{
          title: translate('quote'),
          tabBarIcon: ({ color }) => <Sparkles color={color} size={24} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: translate('chat'),
          tabBarIcon: ({ color }) => <MessageCircle color={color} size={24} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: translate('settings'),
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
