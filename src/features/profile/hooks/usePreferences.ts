import { useState, useEffect, useCallback } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { useDatabase } from '@/shared/providers';
import { PreferenceService } from '@/features/profile/services/preferenceService';

interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  isOfflineModeEnabled?: boolean;
  isBiometricsEnabled?: boolean;
}

export const usePreferences = (userId: string | undefined) => {
  const { db } = useDatabase();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPreferences = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    const prefs = await PreferenceService.getUserPreferences(db, userId);
    setPreferences(prefs);
    
    setLoading(false);
  }, [db, userId]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!userId) return false;
    
    const previousPreferences = { ...preferences };
    setPreferences((prev) => ({ ...prev, ...updates }));
    
    const success = await PreferenceService.updateUserPreferences(db, userId, updates);

    if (!success) {
      setPreferences(previousPreferences as UserPreferences);
      return false;
    }

    if (updates.theme) {
      DeviceEventEmitter.emit('onThemeChange', updates.theme);
    }

    return true;
  };

  const toggleOfflineMode = async (value: boolean) => {
    await updatePreferences({ isOfflineModeEnabled: value });
  };

  return {
    preferences,
    updatePreferences,
    toggleOfflineMode,
    loading
  };
};