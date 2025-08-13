'use client';

import React, { useState } from 'react';
import { Button } from '@cloudreno/ui';
import { useNotifications } from './NotificationSystem';
import { useRealTimeUpdates } from '../hooks/useRealTimeUpdates';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, removeNotification, clearAll } = useNotifications();
  const { pendingUpdates, markAllAsRead, isConnected } = useRealTimeUpdates();

  const unreadCount = notifications.length + pendingUpdates.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-coral text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        
        {/* Connection Status Indicator */}
        <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel */}
          <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
            {/* Header */}
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-navy">Notifications</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className="text-xs text-muted-foreground">
                    {isConnected ? 'Live' : 'Offline'}
                  </span>
                </div>
              </div>
              {unreadCount > 0 && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      clearAll();
                      markAllAsRead();
                    }}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 && pendingUpdates.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <span className="text-2xl mb-2 block">🔕</span>
                  <p className="text-sm">No new notifications</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {/* Current notifications */}
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className="p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
                      onClick={() => removeNotification(notification.id)}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-sm">
                          {notification.type === 'success' && '✅'}
                          {notification.type === 'error' && '❌'}
                          {notification.type === 'warning' && '⚠️'}
                          {notification.type === 'info' && 'ℹ️'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-navy truncate">
                            {notification.title}
                          </p>
                          {notification.message && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Real-time updates */}
                  {pendingUpdates.map(update => (
                    <div
                      key={update.id}
                      className="p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer border-l-2 border-l-blue-400"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-navy">
                            {update.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {update.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(update.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <span className={`inline-block w-2 h-2 rounded-full ${
                          update.priority === 'urgent' ? 'bg-red-400' :
                          update.priority === 'high' ? 'bg-orange-400' :
                          update.priority === 'medium' ? 'bg-yellow-400' :
                          'bg-gray-400'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {(notifications.length > 0 || pendingUpdates.length > 0) && (
              <div className="p-3 border-t border-border bg-muted/30">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    // In a real app, this would navigate to a full notifications page
                    console.log('View all notifications');
                    setIsOpen(false);
                  }}
                >
                  View All Notifications
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};