import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Toast, type ToastType } from '../ui/Toast';
import { AlertModal } from '../ui/AlertModal';

interface NotificationContextData {
  showToast: (title: string, message: string, type?: ToastType) => void;
  showModal: (title: string, message: string, type?: ToastType, onConfirm?: () => void) => void;
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as ToastType,
  });

  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as ToastType,
    onConfirm: () => {},
  });

  const showToast = (title: string, message: string, type: ToastType = 'info') => {
    setToastConfig({ visible: true, title, message, type });
  };

  const hideToast = () => {
    setToastConfig((prev) => ({ ...prev, visible: false }));
  };

  const showModal = (title: string, message: string, type: ToastType = 'info', onConfirm?: () => void) => {
    setModalConfig({
      visible: true,
      title,
      message,
      type,
      onConfirm: () => {
        setModalConfig((prev) => ({ ...prev, visible: false }));
        if (onConfirm) onConfirm();
      },
    });
  };

  return (
    <NotificationContext.Provider value={{ showToast, showModal }}>
      {children}
      
      <Toast 
        visible={toastConfig.visible} 
        title={toastConfig.title} 
        message={toastConfig.message} 
        type={toastConfig.type} 
        onHide={hideToast} 
      />
      
      <AlertModal 
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);