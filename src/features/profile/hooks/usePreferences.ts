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

  // Carrega os dados do SQLite assim que o hook é chamado
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

  // Função para a interface atualizar o SQLite
  const toggleOfflineMode = async (value: boolean) => {
    if (!userId) return;
    
    // Atualização Otimista na UI (Fica rápido para o usuário)
    setIsOffline(value); 
    
    // Salva no banco local em background
    const success = await PreferencesRepository.upsert(db, userId, { 
      isOfflineModeEnabled: value 
    });

    // Reverte se o banco falhar
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