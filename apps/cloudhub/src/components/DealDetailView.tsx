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
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    uploadDate: string;
    url: string;
  }>;
}

interface DealDetailViewProps {
  deal: Deal;
  onClose: () => void;
  onUpdate: (updatedDeal: Deal) => void;
  onDelete: (dealId: string) => void;
  onConvertToProject: (deal: Deal) => void;
  onDocumentUpload?: (file: File) => void;
  onDocumentDelete?: (documentId: string) => void;
}

export default function DealDetailView({ 
  deal, 
  onClose, 
  onUpdate, 
  onDelete, 
  onConvertToProject,
  onDocumentUpload,
  onDocumentDelete
}: DealDetailViewProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [formData, setFormData] = useState(deal);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const stages = [
    { id: 'new', name: 'New' },
    { id: 'qualified', name: 'Qualified' },
    { id: 'estimating', name: 'Estimating' },
    { id: 'proposal-sent', name: 'Proposal Sent' },
    { id: 'negotiation', name: 'Negotiation' },
    { id: 'closed-won', name: 'Closed Won' },
    { id: 'closed-lost', name: 'Closed Lost' }
  ];

  const handleSave = (field?: string) => {
    onUpdate(formData);
    if (field) {
      setEditingField(null);
    }
  };

  const handleFieldClick = (field: string) => {
    setEditingField(field);
  };

  const handleFieldBlur = (field: string) => {
    handleSave(field);
  };

  const handleKeyPress = (e: React.KeyboardEvent, field: string) => {
    if (e.key === 'Enter') {
      handleSave(field);
    }
    if (e.key === 'Escape') {
      setFormData(deal); // Reset to original
      setEditingField(null);
    }
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onDocumentUpload) {
      onDocumentUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && onDocumentUpload) {
      onDocumentUpload(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          {editingField === 'title' ? (
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              onBlur={() => handleFieldBlur('title')}
              onKeyDown={(e) => handleKeyPress(e, 'title')}
              className="text-2xl font-space font-semibold text-navy bg-transparent border-b-2 border-coral focus:outline-none w-full"
              autoFocus
            />
          ) : (
            <h2 
              className="text-2xl font-space font-semibold text-navy cursor-pointer hover:text-coral transition-colors"
              onClick={() => handleFieldClick('title')}
              title="Click to edit"
            >
              {formData.title}
            </h2>
          )}
          <div className="flex items-center gap-4 mt-2">
            <span className={`text-sm font-medium capitalize ${getPriorityColor(formData.priority)}`}>
              {formData.priority} Priority
            </span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">ID: {deal.id}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="coral" size="sm" onClick={handleConvert}>
            Convert to Project
          </Button>
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
              {editingField === 'customer' ? (
                <input
                  type="text"
                  name="customer"
                  value={formData.customer}
                  onChange={handleChange}
                  onBlur={() => handleFieldBlur('customer')}
                  onKeyDown={(e) => handleKeyPress(e, 'customer')}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  autoFocus
                />
              ) : (
                <div 
                  className="text-foreground cursor-pointer hover:text-coral transition-colors p-2 hover:bg-coral/5 rounded"
                  onClick={() => handleFieldClick('customer')}
                  title="Click to edit"
                >
                  {formData.customer}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1">Deal Value</label>
              {editingField === 'value' ? (
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  onBlur={() => handleFieldBlur('value')}
                  onKeyDown={(e) => handleKeyPress(e, 'value')}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  autoFocus
                />
              ) : (
                <div 
                  className="text-2xl font-space font-semibold text-coral cursor-pointer hover:opacity-80 transition-opacity p-2 hover:bg-coral/5 rounded"
                  onClick={() => handleFieldClick('value')}
                  title="Click to edit"
                >
                  ${formData.value.toLocaleString()}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1">Expected Close</label>
              {editingField === 'expectedClose' ? (
                <input
                  type="date"
                  name="expectedClose"
                  value={formData.expectedClose}
                  onChange={handleChange}
                  onBlur={() => handleFieldBlur('expectedClose')}
                  onKeyDown={(e) => handleKeyPress(e, 'expectedClose')}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  autoFocus
                />
              ) : (
                <div 
                  className="text-foreground cursor-pointer hover:text-coral transition-colors p-2 hover:bg-coral/5 rounded"
                  onClick={() => handleFieldClick('expectedClose')}
                  title="Click to edit"
                >
                  {new Date(formData.expectedClose).toLocaleDateString()}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1">Source</label>
              {editingField === 'source' ? (
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  onBlur={() => handleFieldBlur('source')}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  autoFocus
                >
                  <option value="website">Website</option>
                  <option value="design-library">Design Library</option>
                  <option value="referral">Referral</option>
                  <option value="google">Google</option>
                  <option value="facebook">Facebook</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <div 
                  className="text-foreground capitalize cursor-pointer hover:text-coral transition-colors p-2 hover:bg-coral/5 rounded"
                  onClick={() => handleFieldClick('source')}
                  title="Click to edit"
                >
                  {formData.source.replace('-', ' ')}
                </div>
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
              {editingField === 'priority' ? (
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  onBlur={() => handleFieldBlur('priority')}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  autoFocus
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              ) : (
                <div 
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full cursor-pointer hover:opacity-80 transition-opacity ${getPriorityColor(formData.priority)}`}
                  onClick={() => handleFieldClick('priority')}
                  title="Click to edit"
                >
                  {formData.priority.toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1">Notes</label>
              {editingField === 'notes' ? (
                <textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  onBlur={() => handleFieldBlur('notes')}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setFormData(deal);
                      setEditingField(null);
                    }
                  }}
                  rows={4}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  placeholder="Add notes about this deal..."
                  autoFocus
                />
              ) : (
                <div 
                  className="text-sm text-muted-foreground bg-muted p-3 rounded-lg cursor-pointer hover:bg-coral/5 transition-colors"
                  onClick={() => handleFieldClick('notes')}
                  title="Click to edit"
                >
                  {formData.notes || 'No notes added yet. Click to add notes...'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="space-y-4">
        <h3 className="font-space text-lg font-medium text-navy">Documents & Attachments</h3>
        
        {/* File Upload Area */}
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver 
              ? 'border-coral bg-coral/5' 
              : 'border-muted-foreground/30 hover:border-coral/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-2">
            <svg className="w-12 h-12 mx-auto text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <div className="text-sm text-muted-foreground">
              Drag and drop files here, or{' '}
              <label className="text-coral cursor-pointer hover:text-coral/80">
                browse files
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
                />
              </label>
            </div>
            <div className="text-xs text-muted-foreground">
              Supports: PDF, Word, Excel, Images (Max 10MB)
            </div>
          </div>
        </div>

        {/* Document List */}
        {deal.documents && deal.documents.length > 0 ? (
          <div className="space-y-2">
            {deal.documents.map((doc) => (
              <div 
                key={doc.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    {doc.type.includes('pdf') ? (
                      <svg className="w-6 h-6 text-coral" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    ) : doc.type.includes('image') ? (
                      <svg className="w-6 h-6 text-coral" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    ) : doc.type.includes('word') ? (
                      <svg className="w-6 h-6 text-coral" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    ) : doc.type.includes('excel') ? (
                      <svg className="w-6 h-6 text-coral" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{doc.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(doc.size)} • {new Date(doc.uploadDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => window.open(doc.url, '_blank')}
                  >
                    View
                  </Button>
                  {onDocumentDelete && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onDocumentDelete(doc.id)}
                      className="text-coral hover:text-coral/80"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <svg className="w-16 h-16 mx-auto mb-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p>No documents attached yet</p>
            <p className="text-sm">Upload documents to keep everything organized</p>
          </div>
        )}
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