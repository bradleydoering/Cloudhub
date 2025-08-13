'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@cloudreno/ui';
import Modal from './Modal';

export interface BulkAction {
  id: string;
  label: string;
  icon: string;
  variant?: 'default' | 'destructive' | 'secondary';
  requiresConfirmation?: boolean;
  confirmationTitle?: string;
  confirmationMessage?: string;
}

export interface BulkActionsProps<T = any> {
  selectedItems: T[];
  onClearSelection: () => void;
  actions: BulkAction[];
  onAction: (actionId: string, items: T[]) => Promise<void> | void;
  className?: string;
  itemName?: string; // e.g., "projects", "deals", "customers"
}

export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectedItems = items.filter(item => selectedIds.has(item.id));
  const isAllSelected = items.length > 0 && selectedIds.size === items.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < items.length;

  const toggleItem = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds(prev => {
      if (prev.size === items.length) {
        return new Set();
      } else {
        return new Set(items.map(item => item.id));
      }
    });
  }, [items]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectItems = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  return {
    selectedIds,
    selectedItems,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    toggleAll,
    clearSelection,
    selectItems
  };
}

export default function BulkActions<T = any>({
  selectedItems,
  onClearSelection,
  actions,
  onAction,
  className = '',
  itemName = 'items'
}: BulkActionsProps<T>) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingAction, setPendingAction] = useState<BulkAction | null>(null);

  const handleActionClick = useCallback(async (action: BulkAction) => {
    if (action.requiresConfirmation) {
      setPendingAction(action);
      return;
    }

    setIsProcessing(true);
    try {
      await onAction(action.id, selectedItems);
      onClearSelection();
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedItems, onAction, onClearSelection]);

  const handleConfirmedAction = useCallback(async () => {
    if (!pendingAction) return;

    setIsProcessing(true);
    try {
      await onAction(pendingAction.id, selectedItems);
      onClearSelection();
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsProcessing(false);
      setPendingAction(null);
    }
  }, [pendingAction, selectedItems, onAction, onClearSelection]);

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`bg-card border border-border p-4 rounded-lg [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)] ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-navy">
              {selectedItems.length} {itemName} selected
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              disabled={isProcessing}
            >
              Clear Selection
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {actions.map(action => (
              <Button
                key={action.id}
                variant={action.variant || 'default'}
                size="sm"
                onClick={() => handleActionClick(action)}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <span>{action.icon}</span>
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {pendingAction && (
        <Modal
          isOpen={true}
          onClose={() => setPendingAction(null)}
          title={pendingAction.confirmationTitle || 'Confirm Action'}
          size="md"
        >
          <div className="space-y-4">
            <p className="text-foreground">
              {pendingAction.confirmationMessage || 
                `Are you sure you want to ${pendingAction.label.toLowerCase()} ${selectedItems.length} ${itemName}?`}
            </p>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setPendingAction(null)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant={pendingAction.variant === 'destructive' ? 'destructive' : 'default'}
                onClick={handleConfirmedAction}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

// Checkbox component for bulk selection
export function BulkSelectCheckbox({
  checked,
  indeterminate,
  onChange,
  disabled = false,
  className = ''
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label className={`flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        ref={(input) => {
          if (input) input.indeterminate = indeterminate || false;
        }}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <div className={`
        w-4 h-4 border-2 rounded transition-colors
        ${checked || indeterminate 
          ? 'bg-coral border-coral' 
          : 'border-gray-300 hover:border-gray-400'
        }
        ${disabled ? 'opacity-50' : ''}
        flex items-center justify-center
      `}>
        {checked && !indeterminate && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
        {indeterminate && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </label>
  );
}