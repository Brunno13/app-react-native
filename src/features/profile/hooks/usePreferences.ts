import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from '@/shared/providers/DatabaseProvider';
import { useGlobalAuth } from '@/features/auth';
import { PreferencesRepository } from '@/shared/db/repositories/preferencesRepository';

export const usePreferences = () => {
  const { db } = useDatabase();
  const { session } = useGlobalAuth();
  const userId = session?.user?.id;
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  const loadPreferences = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    const prefs = await PreferencesRepository.get(db, userId);
    
    if (prefs) {
      setIsOffline(prefs.isOfflineModeEnabled ?? false);
    }
    setLoading(false);
  }, [db, userId]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const toggleOfflineMode = async (value: boolean) => {
    if (!userId) return;
    
    setIsOffline(value); 
    
    const success = await PreferencesRepository.upsert(db, userId, { 
      isOfflineModeEnabled: value 
    });

    if (!success) {
      setIsOffline(!value);
    }
  };

  return {
    isOffline,
    toggleOfflineMode,
    loading
  };
};