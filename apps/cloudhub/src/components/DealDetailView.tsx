'use client';

import React, { useState } from 'react';
import { Button } from '@cloudreno/ui';

interface Deal {
  id: string;
  title: string;
  customer: string;
  value: number;
  stage: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expectedClose: string;
  source: string;
  lastActivity: string;
  notes?: string;
  phone?: string;
  email?: string;
}

interface DealDetailViewProps {
  deal: Deal;
  onClose: () => void;
  onUpdate: (updatedDeal: Deal) => void;
  onDelete: (dealId: string) => void;
  onConvertToProject: (deal: Deal) => void;
}

export default function DealDetailView({ 
  deal, 
  onClose, 
  onUpdate, 
  onDelete, 
  onConvertToProject 
}: DealDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(deal);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const stages = [
    { id: 'new', name: 'New' },
    { id: 'qualified', name: 'Qualified' },
    { id: 'estimating', name: 'Estimating' },
    { id: 'proposal-sent', name: 'Proposal Sent' },
    { id: 'negotiation', name: 'Negotiation' },
    { id: 'closed-won', name: 'Closed Won' },
    { id: 'closed-lost', name: 'Closed Lost' }
  ];

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleStageChange = (newStage: string) => {
    const updatedDeal = { ...formData, stage: newStage };
    setFormData(updatedDeal);
    onUpdate(updatedDeal);
  };

  const handleDelete = () => {
    onDelete(deal.id);
    onClose();
  };

  const handleConvert = () => {
    onConvertToProject(deal);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-coral';
      case 'high': return 'text-coral/80';
      case 'medium': return 'text-navy';
      case 'low': return 'text-navy/60';
      default: return 'text-navy';
    }
  };

  const getStageColor = (stage: string) => {
    if (['closed-won'].includes(stage)) return 'bg-navy/20 text-navy';
    if (['closed-lost'].includes(stage)) return 'bg-coral/20 text-coral';
    if (['proposal-sent', 'negotiation'].includes(stage)) return 'bg-coral/10 text-coral';
    return 'bg-navy/10 text-navy';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="text-2xl font-space font-semibold text-navy bg-transparent border-b-2 border-coral focus:outline-none w-full"
            />
          ) : (
            <h2 className="text-2xl font-space font-semibold text-navy">{deal.title}</h2>
          )}
          <div className="flex items-center gap-4 mt-2">
            <span className={`text-sm font-medium capitalize ${getPriorityColor(deal.priority)}`}>
              {deal.priority} Priority
            </span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">ID: {deal.id}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button variant="coral" size="sm" onClick={handleConvert}>
                Convert to Project
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button variant="coral" size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stage Selector */}
      <div className="bg-navy/5 border border-navy/20 rounded-lg p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
        <div className="text-sm font-medium text-navy mb-3">Deal Stage</div>
        <div className="flex gap-2 overflow-x-auto">
          {stages.map(stage => (
            <button
              key={stage.id}
              onClick={() => handleStageChange(stage.id)}
              className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                deal.stage === stage.id 
                  ? getStageColor(stage.id)
                  : 'bg-muted text-muted-foreground hover:bg-navy/10'
              }`}
            >
              {stage.name}
            </button>
          ))}
        </div>
      </div>

      {/* Deal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-space text-lg font-medium text-navy">Deal Information</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Customer</label>
              {isEditing ? (
                <input
                  type="text"
                  name="customer"
                  value={formData.customer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                />
              ) : (
                <div className="text-foreground">{deal.customer}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1">Deal Value</label>
              {isEditing ? (
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                />
              ) : (
                <div className="text-2xl font-space font-semibold text-coral">
                  ${deal.value.toLocaleString()}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1">Expected Close</label>
              {isEditing ? (
                <input
                  type="date"
                  name="expectedClose"
                  value={formData.expectedClose}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                />
              ) : (
                <div className="text-foreground">
                  {new Date(deal.expectedClose).toLocaleDateString()}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1">Source</label>
              {isEditing ? (
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                >
                  <option value="website">Website</option>
                  <option value="design-library">Design Library</option>
                  <option value="referral">Referral</option>
                  <option value="google">Google</option>
                  <option value="facebook">Facebook</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <div className="text-foreground capitalize">{deal.source.replace('-', ' ')}</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-space text-lg font-medium text-navy">Activity & Notes</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Last Activity</label>
              <div className="text-sm text-muted-foreground">{deal.lastActivity}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1">Priority</label>
              {isEditing ? (
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              ) : (
                <div className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(deal.priority)}`}>
                  {deal.priority.toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1">Notes</label>
              {isEditing ? (
                <textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  placeholder="Add notes about this deal..."
                />
              ) : (
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {deal.notes || 'No notes added yet.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-6 border-t border-border">
        <Button 
          variant="outline" 
          onClick={() => setShowDeleteConfirm(true)}
          className="text-coral border-coral hover:bg-coral/10"
        >
          Delete Deal
        </Button>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {deal.stage === 'closed-won' && (
            <Button variant="coral" onClick={handleConvert}>
              Convert to Project
            </Button>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
            <h3 className="text-lg font-space font-semibold text-navy mb-4">Delete Deal</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete "{deal.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="coral" 
                onClick={handleDelete}
              >
                Delete Deal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}