'use client';

import React, { useState } from 'react';
import { Button } from '@cloudreno/ui';

interface ChangeOrder {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  submitDate: string;
  approvalDate?: string;
  reason?: string;
}

interface ChangeOrderManagerProps {
  changeOrders: ChangeOrder[];
  onCreate: (changeOrder: Omit<ChangeOrder, 'id' | 'submitDate'>) => void;
  onStatusUpdate: (id: string, status: ChangeOrder['status'], reason?: string) => void;
}

export default function ChangeOrderManager({
  changeOrders,
  onCreate,
  onStatusUpdate
}: ChangeOrderManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: 0,
    status: 'pending' as ChangeOrder['status'],
    reason: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      title: formData.title,
      description: formData.description,
      amount: formData.amount,
      status: 'pending'
    });
    setFormData({
      title: '',
      description: '',
      amount: 0,
      status: 'pending',
      reason: ''
    });
    setShowCreateForm(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-navy/20 text-navy';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-coral/20 text-coral';
      default: return 'bg-coral/20 text-coral';
    }
  };

  const totalApprovedAmount = changeOrders
    .filter(co => co.status === 'approved')
    .reduce((sum, co) => sum + co.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-space font-medium text-navy">Change Orders</h4>
          <p className="text-sm text-muted-foreground">
            {changeOrders.length} orders • ${totalApprovedAmount.toLocaleString()} approved
          </p>
        </div>
        <Button 
          variant="coral" 
          size="sm" 
          onClick={() => setShowCreateForm(true)}
        >
          Create Change Order
        </Button>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
            <h3 className="text-lg font-space font-semibold text-navy mb-4">Create New Change Order</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Upgrade to quartz countertops"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Detailed description of the change order..."
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1">Amount ($) *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="coral">
                  Create Change Order
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Orders List */}
      <div className="space-y-4">
        {changeOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">📋</div>
            <p>No change orders yet</p>
            <p className="text-sm">Create your first change order to get started</p>
          </div>
        ) : (
          changeOrders.map((co) => (
            <div key={co.id} className="p-4 border border-border rounded-lg [clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)]">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h5 className="font-medium">{co.title}</h5>
                  <p className="text-sm text-muted-foreground mt-1">{co.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Submitted {new Date(co.submitDate).toLocaleDateString()}
                    {co.approvalDate && ` • ${co.status} ${new Date(co.approvalDate).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-space font-semibold text-coral">
                    {co.amount >= 0 ? '+' : ''}${co.amount.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(co.status)}`}>
                      {co.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {co.status === 'pending' && (
                <div className="flex gap-2 pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusUpdate(co.id, 'approved')}
                    className="text-navy border-navy hover:bg-navy/10"
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusUpdate(co.id, 'rejected', 'Reason for rejection')}
                    className="text-coral border-coral hover:bg-coral/10"
                  >
                    Reject
                  </Button>
                </div>
              )}

              {co.reason && (
                <div className="mt-3 p-2 bg-muted rounded text-sm">
                  <strong>Note:</strong> {co.reason}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}