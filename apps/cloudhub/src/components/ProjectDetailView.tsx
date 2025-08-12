'use client';

import React, { useState } from 'react';
import { Button } from '@cloudreno/ui';

interface Project {
  id: string;
  projectNumber: string;
  title: string;
  customer: string;
  address: string;
  status: 'not-started' | 'in-progress' | 'on-hold' | 'completed';
  percentComplete: number;
  contractAmount: number;
  startDate: string;
  expectedCompletion: string;
  manager: string;
  description?: string;
}

interface ProjectDetailViewProps {
  project: Project;
  onClose: () => void;
  onUpdate: (updatedProject: Project) => void;
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

  const handleStatusUpdate = (newStatus: Project['status']) => {
    const updatedProject = { ...formData, status: newStatus };
    setFormData(updatedProject);
    onUpdate(updatedProject);
  };

  const handleProgressUpdate = (newProgress: number) => {
    const updatedProject = { ...formData, percentComplete: Math.min(100, Math.max(0, newProgress)) };
    setFormData(updatedProject);
    onUpdate(updatedProject);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
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
            <span className="text-sm text-muted-foreground font-mono">{project.projectNumber}</span>
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
              <Button variant="coral" size="sm" onClick={() => {}}>
                Update Status
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

      {/* Status Update Section */}
      <div className="bg-navy/5 border border-navy/20 rounded-lg p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
        <div className="text-sm font-medium text-navy mb-3">Project Status & Progress</div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            {['not-started', 'in-progress', 'on-hold', 'completed'].map(status => (
              <button
                key={status}
                onClick={() => handleStatusUpdate(status as Project['status'])}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  project.status === status 
                    ? getStatusColor(status)
                    : 'bg-muted text-muted-foreground hover:bg-navy/10'
                }`}
              >
                {status.replace('-', ' ').toUpperCase()}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-navy min-w-0">Progress:</span>
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max="100"
                value={project.percentComplete}
                onChange={(e) => handleProgressUpdate(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-coral"
              />
            </div>
            <span className="text-sm font-medium text-coral min-w-0">{project.percentComplete}%</span>
          </div>
        </div>
      </div>

      {/* Project Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-space text-lg font-medium text-navy">Project Information</h3>
          
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
                <div className="text-foreground">{project.customer}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1">Address</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                />
              ) : (
                <div className="text-foreground">{project.address}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1">Contract Amount</label>
              {isEditing ? (
                <input
                  type="number"
                  name="contractAmount"
                  value={formData.contractAmount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                />
              ) : (
                <div className="text-2xl font-space font-semibold text-coral">
                  ${project.contractAmount.toLocaleString()}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1">Project Manager</label>
              {isEditing ? (
                <select
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                >
                  <option value="Sarah Johnson">Sarah Johnson</option>
                  <option value="Mike Thompson">Mike Thompson</option>
                  <option value="Emily Rodriguez">Emily Rodriguez</option>
                  <option value="Tom Rodriguez">Tom Rodriguez</option>
                </select>
              ) : (
                <div className="text-foreground">{project.manager}</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-space text-lg font-medium text-navy">Timeline & Details</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Start Date</label>
              {isEditing ? (
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                />
              ) : (
                <div className="text-foreground">
                  {new Date(project.startDate).toLocaleDateString()}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1">Expected Completion</label>
              {isEditing ? (
                <input
                  type="date"
                  name="expectedCompletion"
                  value={formData.expectedCompletion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                />
              ) : (
                <div className="text-foreground">
                  {new Date(project.expectedCompletion).toLocaleDateString()}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1">Description</label>
              {isEditing ? (
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  placeholder="Add project description..."
                />
              ) : (
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {project.description || 'No description added yet.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-6 border-t border-border">
        {onDelete && (
          <Button 
            variant="outline" 
            onClick={() => setShowDeleteConfirm(true)}
            className="text-coral border-coral hover:bg-coral/10"
          >
            Delete Project
          </Button>
        )}
        
        <div className="flex gap-3 ml-auto">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="coral">
            View Full Project Details
          </Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
            <h3 className="text-lg font-space font-semibold text-navy mb-4">Delete Project</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete "{project.title}"? This action cannot be undone.
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
                Delete Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}