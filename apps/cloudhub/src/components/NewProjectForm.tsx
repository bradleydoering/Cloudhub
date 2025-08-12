'use client';

import React, { useState } from 'react';
import { Button } from '@cloudreno/ui';

interface NewProjectFormProps {
  onSubmit: (project: any) => void;
  onCancel: () => void;
}

export default function NewProjectForm({ onSubmit, onCancel }: NewProjectFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    customer: '',
    address: '',
    contractAmount: '',
    startDate: '',
    expectedCompletion: '',
    manager: '',
    status: 'not-started',
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const projectData = {
        ...formData,
        contractAmount: parseInt(formData.contractAmount) || 0,
        percentComplete: 0,
        id: `project-${Date.now()}`,
        projectNumber: `CR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`
      };
      
      await onSubmit(projectData);
      
      // Reset form
      setFormData({
        title: '',
        customer: '',
        address: '',
        contractAmount: '',
        startDate: '',
        expectedCompletion: '',
        manager: '',
        status: 'not-started',
        description: ''
      });
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Project Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-navy mb-2">
          Project Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
          placeholder="e.g., Kitchen Renovation - Smith Residence"
        />
      </div>

      {/* Customer & Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="customer" className="block text-sm font-medium text-navy mb-2">
            Customer Name *
          </label>
          <input
            type="text"
            id="customer"
            name="customer"
            value={formData.customer}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
            placeholder="John & Jane Smith"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-navy mb-2">
            Project Address *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
            placeholder="123 Main St, Vancouver, BC"
          />
        </div>
      </div>

      {/* Contract Amount & Manager */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="contractAmount" className="block text-sm font-medium text-navy mb-2">
            Contract Amount ($) *
          </label>
          <input
            type="number"
            id="contractAmount"
            name="contractAmount"
            value={formData.contractAmount}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
            placeholder="45000"
          />
        </div>

        <div>
          <label htmlFor="manager" className="block text-sm font-medium text-navy mb-2">
            Project Manager *
          </label>
          <select
            id="manager"
            name="manager"
            value={formData.manager}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
          >
            <option value="">Select Manager</option>
            <option value="Sarah Johnson">Sarah Johnson</option>
            <option value="Mike Thompson">Mike Thompson</option>
            <option value="Emily Rodriguez">Emily Rodriguez</option>
            <option value="Tom Rodriguez">Tom Rodriguez</option>
          </select>
        </div>
      </div>

      {/* Dates & Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-navy mb-2">
            Start Date *
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
          />
        </div>

        <div>
          <label htmlFor="expectedCompletion" className="block text-sm font-medium text-navy mb-2">
            Expected Completion *
          </label>
          <input
            type="date"
            id="expectedCompletion"
            name="expectedCompletion"
            value={formData.expectedCompletion}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-navy mb-2">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
          >
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-navy mb-2">
          Project Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
          placeholder="Detailed description of the project scope and requirements..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="coral"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}