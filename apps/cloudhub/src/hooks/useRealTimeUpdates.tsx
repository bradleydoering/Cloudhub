'use client';

import { useEffect, useCallback, useState } from 'react';
import { useNotificationHelpers } from '../components/NotificationSystem';

interface StatusUpdate {
  id: string;
  type: 'project' | 'deal' | 'customer' | 'document' | 'change_order' | 'invoice';
  entityId: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  userId?: string;
  metadata?: Record<string, any>;
}

interface RealTimeUpdateHookProps {
  enabled?: boolean;
  userId?: string;
  pollInterval?: number; // in milliseconds
}

export const useRealTimeUpdates = ({
  enabled = true,
  userId,
  pollInterval = 30000 // 30 seconds
}: RealTimeUpdateHookProps = {}) => {
  const [lastUpdateTime, setLastUpdateTime] = useState<string>(new Date().toISOString());
  const [isConnected, setIsConnected] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<StatusUpdate[]>([]);
  const { notifySuccess, notifyWarning, notifyInfo, notifyWithAction } = useNotificationHelpers();

  // Simulate checking for updates (in real implementation, this would use WebSockets or Server-Sent Events)
  const checkForUpdates = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsConnected(true);
      
      // Simulate API call to check for updates since lastUpdateTime
      console.log('Checking for real-time updates since:', lastUpdateTime);
      
      // Mock some sample updates for demonstration
      const mockUpdates: StatusUpdate[] = [];
      const now = new Date();
      
      // Randomly generate some updates for demo purposes
      if (Math.random() < 0.3) { // 30% chance of having updates
        const updateTypes: StatusUpdate['type'][] = ['project', 'deal', 'customer', 'document', 'change_order', 'invoice'];
        const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
        
        const sampleUpdates: Record<StatusUpdate['type'], StatusUpdate> = {
          project: {
            id: `update-${Date.now()}`,
            type: 'project',
            entityId: 'proj-123',
            title: 'Project Status Updated',
            message: 'Kitchen Renovation project moved to In Progress',
            priority: 'medium',
            timestamp: now.toISOString(),
            userId: 'user-123',
            metadata: { previousStatus: 'not-started', newStatus: 'in-progress' }
          },
          deal: {
            id: `update-${Date.now()}`,
            type: 'deal',
            entityId: 'deal-456',
            title: 'New Deal Created',
            message: 'Bathroom Renovation deal created by John Smith',
            priority: 'high',
            timestamp: now.toISOString(),
            userId: 'user-456',
            metadata: { dealValue: 15000 }
          },
          customer: {
            id: `update-${Date.now()}`,
            type: 'customer',
            entityId: 'cust-789',
            title: 'Customer Updated',
            message: 'Sarah Johnson updated her contact information',
            priority: 'low',
            timestamp: now.toISOString(),
            userId: 'user-789'
          },
          document: {
            id: `update-${Date.now()}`,
            type: 'document',
            entityId: 'doc-321',
            title: 'Document Uploaded',
            message: 'Building permit uploaded to Kitchen Renovation',
            priority: 'medium',
            timestamp: now.toISOString(),
            userId: 'user-321',
            metadata: { documentName: 'building-permit.pdf', projectId: 'proj-123' }
          },
          change_order: {
            id: `update-${Date.now()}`,
            type: 'change_order',
            entityId: 'co-654',
            title: 'Change Order Approved',
            message: 'Quartz countertop upgrade approved for $3,500',
            priority: 'high',
            timestamp: now.toISOString(),
            userId: 'user-654',
            metadata: { amount: 3500, projectId: 'proj-123' }
          },
          invoice: {
            id: `update-${Date.now()}`,
            type: 'invoice',
            entityId: 'inv-789',
            title: 'Invoice Sent',
            message: 'Progress payment invoice sent to client',
            priority: 'medium',
            timestamp: now.toISOString(),
            userId: 'user-789',
            metadata: { amount: 15000, projectId: 'proj-123' }
          }
        };

        if (randomType && sampleUpdates[randomType]) {
          mockUpdates.push(sampleUpdates[randomType]);
        }
      }

      if (mockUpdates.length > 0) {
        setPendingUpdates(prev => [...prev, ...mockUpdates]);
        processUpdates(mockUpdates);
      }

      setLastUpdateTime(now.toISOString());
    } catch (error) {
      console.error('Error checking for updates:', error);
      setIsConnected(false);
    }
  }, [enabled, lastUpdateTime, notifySuccess, notifyWarning, notifyInfo, notifyWithAction]);

  const processUpdates = useCallback((updates: StatusUpdate[]) => {
    updates.forEach(update => {
      const shouldNotify = update.priority === 'high' || update.priority === 'urgent';
      
      if (shouldNotify) {
        const notificationType = update.priority === 'urgent' ? 'warning' : 'info';
        
        if (update.type === 'change_order' && update.metadata?.amount) {
          notifyWithAction(
            notificationType,
            update.title,
            update.message,
            'View Details',
            () => {
              // Navigate to change order details
              console.log('Navigate to change order:', update.entityId);
            }
          );
        } else if (update.type === 'deal') {
          notifyWithAction(
            notificationType,
            update.title,
            update.message,
            'View Deal',
            () => {
              // Navigate to deal details
              console.log('Navigate to deal:', update.entityId);
            }
          );
        } else {
          if (notificationType === 'warning') {
            notifyWarning(update.title, update.message);
          } else {
            notifyInfo(update.title, update.message);
          }
        }
      }

      // Log all updates for debugging
      console.log('Status Update:', update);
    });
  }, [notifyWarning, notifyInfo, notifyWithAction]);

  const markUpdateAsRead = useCallback((updateId: string) => {
    setPendingUpdates(prev => prev.filter(update => update.id !== updateId));
  }, []);

  const markAllAsRead = useCallback(() => {
    setPendingUpdates([]);
  }, []);

  // Set up polling for updates
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(checkForUpdates, pollInterval);
    
    // Initial check
    checkForUpdates();

    return () => clearInterval(interval);
  }, [enabled, checkForUpdates, pollInterval]);

  // Simulate WebSocket connection status
  useEffect(() => {
    if (enabled) {
      setIsConnected(true);
      notifySuccess('Real-time Updates', 'Connected to live updates');
    } else {
      setIsConnected(false);
    }
  }, [enabled, notifySuccess]);

  return {
    isConnected,
    pendingUpdates,
    markUpdateAsRead,
    markAllAsRead,
    checkForUpdates
  };
};

// Hook for project-specific real-time updates
export const useProjectUpdates = (projectId: string) => {
  const [projectStatus, setProjectStatus] = useState<'not-started' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled'>('not-started');
  const [progress, setProgress] = useState(0);
  const { notifySuccess, notifyInfo } = useNotificationHelpers();

  const updateProjectStatus = useCallback(async (newStatus: typeof projectStatus, newProgress?: number) => {
    const previousStatus = projectStatus;
    setProjectStatus(newStatus);
    
    if (newProgress !== undefined) {
      setProgress(newProgress);
    }

    // Notify about status change
    if (newStatus !== previousStatus) {
      const statusMessages = {
        'not-started': 'Project has been reset to not started',
        'in-progress': 'Project is now in progress',
        'on-hold': 'Project has been put on hold',
        'completed': 'Project has been completed! 🎉',
        'cancelled': 'Project has been cancelled'
      };

      const notifyType = newStatus === 'completed' ? notifySuccess : notifyInfo;
      notifyType('Project Status Updated', statusMessages[newStatus]);
    }

    // Notify about significant progress milestones
    if (newProgress !== undefined) {
      const milestones = [25, 50, 75, 100];
      const previousMilestone = milestones.find(m => progress < m && newProgress >= m);
      
      if (previousMilestone) {
        notifySuccess(
          'Milestone Reached!',
          `Project is now ${previousMilestone}% complete`
        );
      }
    }

    // In real implementation, this would sync with the backend
    console.log('Project status updated:', { projectId, newStatus, newProgress });
  }, [projectStatus, progress, notifySuccess, notifyInfo, projectId]);

  return {
    projectStatus,
    progress,
    updateProjectStatus
  };
};

// Hook for deal pipeline updates
export const useDealUpdates = () => {
  const { notifySuccess, notifyInfo } = useNotificationHelpers();

  const notifyDealStageChange = useCallback((dealId: string, dealTitle: string, fromStage: string, toStage: string) => {
    const stageMessages: Record<string, string> = {
      'lead': 'New lead generated',
      'qualified': 'Lead has been qualified',
      'proposal': 'Proposal sent to client',
      'negotiation': 'Entered negotiation phase',
      'won': 'Deal won! 🎉',
      'lost': 'Deal marked as lost'
    };

    const message = stageMessages[toStage] || `Deal moved to ${toStage}`;
    const notifyType = toStage === 'won' ? notifySuccess : notifyInfo;
    
    notifyType('Deal Update', `${dealTitle}: ${message}`);
    console.log('Deal stage changed:', { dealId, fromStage, toStage });
  }, [notifySuccess, notifyInfo]);

  const notifyNewDeal = useCallback((dealTitle: string, value: number) => {
    notifyInfo(
      'New Deal Created',
      `${dealTitle} - $${value.toLocaleString()}`
    );
  }, [notifyInfo]);

  return {
    notifyDealStageChange,
    notifyNewDeal
  };
};