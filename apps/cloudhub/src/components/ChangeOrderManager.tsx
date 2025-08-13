'use client';

import React, { useState } from 'react';
import { Button } from '@cloudreno/ui';

interface ChangeOrder {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submitted_by: string;
  submitted_date: string;
  approved_by?: string;
  approval_date?: string;
  reason?: string;
  implementation_date?: string;
}

interface ChangeOrderManagerProps {
  changeOrders: ChangeOrder[];
  onCreate: (changeOrder: Partial<ChangeOrder>) => void;
  onStatusUpdate: (id: string, status: string, reason?: string) => void;
  onDelete?: (id: string) => void;
}

export default function ChangeOrderManager({
  changeOrders,
  onCreate,
  onStatusUpdate,
  onDelete
}: ChangeOrderManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedChangeOrder, setSelectedChangeOrder] = useState<ChangeOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [approvalData, setApprovalData] = useState({
    status: 'approved' as ChangeOrder['status'],
    reason: ''
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: 0,
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    submitted_by: 'Current User'
  });

  const filteredChangeOrders = changeOrders.filter(co => 
    !statusFilter || co.status === statusFilter
  );

  const getStatusColor = (status: ChangeOrder['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      implemented: 'bg-navy/10 text-navy'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-coral/20 text-coral',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority];
  };

  const handleCreate = () => {
    onCreate({
      ...formData,
      submitted_date: new Date().toISOString()
    });
    setShowCreateModal(false);
    setFormData({
      title: '',
      description: '',
      amount: 0,
      priority: 'medium',
      submitted_by: 'Current User'
    });
  };

  const handleStatusUpdate = () => {
    if (!selectedChangeOrder) return;
    
    onStatusUpdate(
      selectedChangeOrder.id, 
      approvalData.status, 
      approvalData.reason || undefined
    );
    setShowApprovalModal(false);
    setSelectedChangeOrder(null);
    setApprovalData({ status: 'approved', reason: '' });
  };

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    
    const confirmed = confirm('Are you sure you want to delete this change order? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await onDelete(id);
    } catch (error) {
      console.error('Error deleting change order:', error);
      alert('Failed to delete change order. Please try again.');
    }
  };

  const calculateTotalValue = () => {
    return filteredChangeOrders
      .filter(co => co.status === 'approved' || co.status === 'implemented')
      .reduce((sum, co) => sum + co.amount, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-space font-semibold text-lg text-navy">Change Orders</h3>
          <p className="text-sm text-muted-foreground">Manage project modifications and scope changes</p>
        </div>
        <Button 
          variant="coral" 
          onClick={() => setShowCreateModal(true)}
          size="sm"
        >
          + New Change Order
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 [clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)]">
          <div className="text-xl font-space font-semibold text-navy">{changeOrders.length}</div>
          <div className="text-sm text-muted-foreground">Total Change Orders</div>
        </div>
        <div className="bg-card border border-border p-4 [clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)]">
          <div className="text-xl font-space font-semibold text-yellow-600">
            {changeOrders.filter(co => co.status === 'pending').length}
          </div>
          <div className="text-sm text-muted-foreground">Pending Approval</div>
        </div>
        <div className="bg-card border border-border p-4 [clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)]">
          <div className="text-xl font-space font-semibold text-green-600">
            {changeOrders.filter(co => co.status === 'approved').length}
          </div>
          <div className="text-sm text-muted-foreground">Approved</div>
        </div>
        <div className="bg-card border border-border p-4 [clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)]">
          <div className="text-xl font-space font-semibold text-coral">
            ${calculateTotalValue().toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Value</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-muted/50 p-4 rounded-lg [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="implemented">Implemented</option>
          </select>
        </div>
      </div>

      {/* Change Orders List */}
      {filteredChangeOrders.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-muted-foreground">
            {changeOrders.length === 0 ? 'No change orders yet' : 'No change orders match your filter'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredChangeOrders.map(co => (
            <div 
              key={co.id} 
              className="bg-card border border-border p-6 rounded-lg [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)] hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-space font-semibold text-navy">{co.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(co.status)}`}>
                      {co.status.toUpperCase()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(co.priority)}`}>
                      {co.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{co.description}</p>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span><strong>Amount:</strong> ${co.amount.toLocaleString()}</span>
                    <span><strong>Submitted:</strong> {new Date(co.submitted_date).toLocaleDateString()}</span>
                    <span><strong>By:</strong> {co.submitted_by}</span>
                  </div>
                  {co.approved_by && (
                    <div className="flex items-center gap-6 text-sm text-muted-foreground mt-1">
                      <span><strong>Approved by:</strong> {co.approved_by}</span>
                      {co.approval_date && (
                        <span><strong>Date:</strong> {new Date(co.approval_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  )}
                  {co.reason && (
                    <div className="mt-2 p-2 bg-muted rounded text-sm">
                      <strong>Reason:</strong> {co.reason}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {co.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedChangeOrder(co);
                        setShowApprovalModal(true);
                      }}
                    >
                      Review
                    </Button>
                  )}
                  {co.status === 'approved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStatusUpdate(co.id, 'implemented')}
                    >
                      Mark Implemented
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(co.id)}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Change Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
            <h3 className="font-space font-semibold text-lg text-navy mb-4">New Change Order</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  placeholder="Brief title for the change order"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  placeholder="Detailed description of the changes required"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">Amount ($)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' }))}
                    className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    title: '',
                    description: '',
                    amount: 0,
                    priority: 'medium',
                    submitted_by: 'Current User'
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                variant="coral"
                onClick={handleCreate}
                disabled={!formData.title || !formData.description}
              >
                Create Change Order
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedChangeOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
            <h3 className="font-space font-semibold text-lg text-navy mb-4">
              Review Change Order: {selectedChangeOrder.title}
            </h3>
            
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">{selectedChangeOrder.description}</p>
              <p className="font-medium">Amount: ${selectedChangeOrder.amount.toLocaleString()}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-2">Decision</label>
                <select
                  value={approvalData.status}
                  onChange={(e) => setApprovalData(prev => ({ ...prev, status: e.target.value as ChangeOrder['status'] }))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                >
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  {approvalData.status === 'approved' ? 'Approval Notes' : 'Rejection Reason'}
                </label>
                <textarea
                  value={approvalData.reason}
                  onChange={(e) => setApprovalData(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  placeholder={approvalData.status === 'approved' 
                    ? 'Optional notes about the approval...' 
                    : 'Please provide a reason for rejection...'}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedChangeOrder(null);
                  setApprovalData({ status: 'approved', reason: '' });
                }}
              >
                Cancel
              </Button>
              <Button
                variant={approvalData.status === 'approved' ? 'default' : 'default'}
                onClick={handleStatusUpdate}
                className={approvalData.status === 'approved' 
                  ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                  : 'bg-red-600 hover:bg-red-700 text-white border-red-600'}
              >
                {approvalData.status === 'approved' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}