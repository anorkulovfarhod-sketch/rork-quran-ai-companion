import { Tabs } from "expo-router";
import { MessageCircle, Sparkles, Clock, Book, Settings } from "lucide-react-native";
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

import Colors from "@/constants/colors";

export default function TabLayout() {
  const { translate } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.light.primary,
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
