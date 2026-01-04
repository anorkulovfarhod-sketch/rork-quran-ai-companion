import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useState, useEffect } from 'react';

export type LocationData = {
  latitude: number;
  longitude: number;
  city?: string;
};

export const [LocationProvider, useLocation] = createContextHook(() => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const loadLocation = async () => {
      try {
        const stored = await AsyncStorage.getItem('user_location');
        if (stored) {
          setLocation(JSON.parse(stored));
        }
        
        const { status } = await Location.getForegroundPermissionsAsync();
        setHasPermission(status === 'granted');
        
        if (status === 'granted') {
          await fetchLocation();
        }
      } catch (error) {
        console.error('Failed to load location:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLocation();
  }, []);

  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      try {
        const geocode = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        if (geocode.length > 0) {
          locationData.city = geocode[0].city || geocode[0].region || undefined;
        }
      } catch (geocodeError) {
        console.error('Geocoding error:', geocodeError);
      }

      setLocation(locationData);
      await AsyncStorage.setItem('user_location', JSON.stringify(locationData));
    } catch (error) {
      console.error('Failed to fetch location:', error);
    }
  };

  const refreshLocation = async () => {
    setIsLoading(true);
    await fetchLocation();
    setIsLoading(false);
  };

  return {
    location,
    isLoading,
    hasPermission,
    refreshLocation,
    requestPermission: fetchLocation,
  };
});
