'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Button } from '@cloudreno/ui';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notificationData: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 15);
    const notification: Notification = {
      id,
      duration: 5000,
      ...notificationData,
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove notification after duration (unless persistent)
    if (!notification.persistent && notification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map(notification => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

interface NotificationCardProps {
  notification: Notification;
  onClose: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300); // Wait for exit animation
  };

  const getNotificationStyles = () => {
    const baseStyles = "border-l-4 bg-white border border-border shadow-lg rounded-lg p-4 transition-all duration-300 transform";
    const visibleStyles = isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0";
    const exitStyles = isExiting ? "translate-x-full opacity-0" : "";
    
    const typeStyles = {
      success: "border-l-green-500",
      error: "border-l-red-500", 
      warning: "border-l-yellow-500",
      info: "border-l-blue-500"
    };

    return `${baseStyles} ${visibleStyles} ${exitStyles} ${typeStyles[notification.type]}`;
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className={getNotificationStyles()}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-lg">{getIcon()}</span>
          <div className="flex-1">
            <h4 className="font-medium text-navy">{notification.title}</h4>
            {notification.message && (
              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
            )}
            {notification.action && (
              <Button
                variant="outline"
                size="sm"
                onClick={notification.action.onClick}
                className="mt-2"
              >
                {notification.action.label}
              </Button>
            )}
          </div>
        </div>
        <button
          onClick={handleClose}
          className="text-muted-foreground hover:text-foreground transition-colors ml-2"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Utility hook for common notification patterns
export const useNotificationHelpers = () => {
  const { addNotification } = useNotifications();

  const notifySuccess = useCallback((title: string, message?: string) => {
    addNotification({ type: 'success', title, message });
  }, [addNotification]);

  const notifyError = useCallback((title: string, message?: string) => {
    addNotification({ type: 'error', title, message, duration: 8000 });
  }, [addNotification]);

  const notifyWarning = useCallback((title: string, message?: string) => {
    addNotification({ type: 'warning', title, message, duration: 6000 });
  }, [addNotification]);

  const notifyInfo = useCallback((title: string, message?: string) => {
    addNotification({ type: 'info', title, message });
  }, [addNotification]);

  const notifyWithAction = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
    actionLabel: string,
    actionCallback: () => void
  ) => {
    addNotification({
      type,
      title,
      message,
      action: { label: actionLabel, onClick: actionCallback },
      persistent: true
    });
  }, [addNotification]);

  return {
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyWithAction
  };
};