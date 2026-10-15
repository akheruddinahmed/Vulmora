import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { StoreSettings, DEFAULT_STORE_SETTINGS } from '@/types/settings';
import { useToast } from './ToastContext';

interface StoreSettingsContextType {
  settings: StoreSettings;
  isLoading: boolean;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
}

const StoreSettingsContext = createContext<StoreSettingsContextType | undefined>(undefined);

export const StoreSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { error, success } = useToast();

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    try {
      const settingsDocRef = doc(db, 'settings', 'general');
      unsubscribe = onSnapshot(
        settingsDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setSettings({
              ...DEFAULT_STORE_SETTINGS,
              ...snapshot.data(),
            } as StoreSettings);
          } else {
            // First time initialization: populate default settings document
            setSettings(DEFAULT_STORE_SETTINGS);
          }
          setIsLoading(false);
        },
        (err) => {
          console.warn('Store settings listener warning:', err.message);
          // Fallback to defaults
          setSettings(DEFAULT_STORE_SETTINGS);
          setIsLoading(false);
        }
      );
    } catch {
      setIsLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    try {
      const settingsDocRef = doc(db, 'settings', 'general');
      await setDoc(
        settingsDocRef,
        {
          ...newSettings,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      success('Settings updated', 'Store preferences have been saved successfully.');
    } catch (err: any) {
      error('Failed to update settings', err.message || 'Please check permissions.');
      throw err;
    }
  };

  return (
    <StoreSettingsContext.Provider value={{ settings, isLoading, updateSettings }}>
      {children}
    </StoreSettingsContext.Provider>
  );
};

export const useStoreSettings = () => {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    throw new Error('useStoreSettings must be used within a StoreSettingsProvider');
  }
  return context;
};
