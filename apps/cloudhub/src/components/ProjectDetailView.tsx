'use client';

import React, { useState } from 'react';
import { Button } from '@cloudreno/ui';
import { ProjectWithCustomer } from '../types/database';

interface ProjectDetailViewProps {
  project: ProjectWithCustomer;
  onClose: () => void;
  onUpdate: (updatedProject: ProjectWithCustomer) => void;
  onDelete?: (projectId: string) => void;
}

export default function ProjectDetailView({ 
  project, 
  onClose, 
  onUpdate, 
  onDelete 
}: ProjectDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(project);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(project.id);
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started': return 'bg-navy/10 text-navy';
      case 'in-progress': return 'bg-coral/10 text-coral';
      case 'on-hold': return 'bg-coral/20 text-coral';
      case 'completed': return 'bg-navy/20 text-navy';
      default: return 'bg-navy/10 text-navy';
    }
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
            <h2 className="text-2xl font-space font-semibold text-navy">{project.title}</h2>
          )}
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm text-muted-foreground font-mono">{project.project_number}</span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(project.status)}`}>
              {project.status.replace('-', ' ').toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit Project
              </Button>
              {onDelete && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  Delete
                </Button>
              )}
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
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Project Progress */}
      <div className="bg-card border border-border p-6 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-space font-medium text-navy">Project Progress</h3>
          <div className="text-lg font-semibold text-coral">{project.percent_complete}%</div>
        </div>
        <div className="w-full bg-secondary rounded-full h-3">
          <div 
            className="bg-coral-gradient-horizontal h-3 rounded-full transition-all duration-500" 
            style={{ width: `${project.percent_complete}%` }}
          ></div>
        </div>
      </div>

      {/* Project Details */}
      <div className="space-y-6">
        <div className="bg-card border border-border p-6 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          <h4 className="font-space font-medium text-navy mb-4">Project Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-navy mb-2">Status</label>
              {isEditing ? (
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                >
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              ) : (
                <p className="text-foreground">{project.status.replace('-', ' ')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-2">Customer</label>
              <p className="text-foreground">{project.customer.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-2">Contract Amount</label>
              {isEditing ? (
                <input
                  type="number"
                  name="contract_amount"
                  value={formData.contract_amount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  step="0.01"
                />
              ) : (
                <p className="text-foreground">${project.contract_amount.toLocaleString()}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-2">Project Manager</label>
              {isEditing ? (
                <input
                  type="text"
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                />
              ) : (
                <p className="text-foreground">{project.manager}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-2">Start Date</label>
              {isEditing ? (
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date?.split('T')[0] || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                />
              ) : (
                <p className="text-foreground">{new Date(project.start_date).toLocaleDateString()}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-2">Expected Completion</label>
              {isEditing ? (
                <input
                  type="date"
                  name="expected_completion"
                  value={formData.expected_completion?.split('T')[0] || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                />
              ) : (
                <p className="text-foreground">{new Date(project.expected_completion).toLocaleDateString()}</p>
              )}
            </div>
          </div>

          {project.description && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-navy mb-2">Description</label>
              {isEditing ? (
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                />
              ) : (
                <p className="text-foreground">{project.description}</p>
              )}
            </div>
          )}
        </div>

        {/* Address Information */}
        <div className="bg-card border border-border p-6 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          <h4 className="font-space font-medium text-navy mb-4">Project Address</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-2">Address</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address_line1"
                  value={formData.address_line1 || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                />
              ) : (
                <p className="text-foreground">
                  {[project.address_line1, project.city, project.province].filter(Boolean).join(', ') || 'No address provided'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
            <h3 className="font-space font-semibold text-lg text-navy mb-4">Delete Project</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete "{project.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button 
                variant="default" 
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white border-red-600"
              >
                Delete Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}