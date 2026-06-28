import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { Toast, type ToastType } from '@/shared/ui/Toast';
import { AlertModal } from '@/shared/ui/AlertModal';
import { NetworkBanner } from '@/shared/ui/NetworkBanner';

interface NotificationContextData {
  showToast: (title: string, message: string, type?: ToastType) => void;
  showModal: (title: string, message: string, type?: ToastType) => void;
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastConfig, setToastConfig] = useState({ title: '', message: '', type: 'info' as ToastType });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'info' as ToastType });
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !(state.isConnected && state.isInternetReachable !== false);
      setIsOffline(offline);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (title: string, message: string, type: ToastType = 'info') => {
    setToastConfig({ title, message, type });
    setToastVisible(true);
  };

  const showModal = (title: string, message: string, type: ToastType = 'info') => {
    setModalConfig({ title, message, type });
    setModalVisible(true);
  };

  return (
    <NotificationContext.Provider value={{ showToast, showModal }}>
      {children}
      
      <NetworkBanner isOffline={isOffline} />

      <Toast 
        visible={toastVisible} 
        {...toastConfig} 
        onHide={() => setToastVisible(false)} 
      />
      
      <AlertModal 
        visible={modalVisible} 
        {...modalConfig} 
        onConfirm={() => setModalVisible(false)} 
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);