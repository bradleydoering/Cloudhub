'use client';

import React, { useState } from 'react';
import { Button } from '@cloudreno/ui';

interface NewDealFormProps {
  onSubmit: (deal: any) => void;
  onCancel: () => void;
  initialStage?: string;
}

export default function NewDealForm({ onSubmit, onCancel, initialStage = 'new' }: NewDealFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    customer: '',
    value: '',
    priority: 'medium',
    expectedClose: '',
    source: 'website',
    stage: initialStage,
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dealData = {
        ...formData,
        value: parseInt(formData.value) || 0,
        id: `deal-${Date.now()}`,
        lastActivity: 'just now'
      };
      
      await onSubmit(dealData);
      
      // Reset form
      setFormData({
        title: '',
        customer: '',
        value: '',
        priority: 'medium',
        expectedClose: '',
        source: 'website',
        stage: 'new',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating deal:', error);
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
      {/* Deal Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-navy mb-2">
          Deal Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
          placeholder="e.g., Kitchen Renovation - Smith Home"
        />
      </div>

      {/* Customer Name */}
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
          placeholder="e.g., John & Jane Smith"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deal Value */}
        <div>
          <label htmlFor="value" className="block text-sm font-medium text-navy mb-2">
            Estimated Value ($)
          </label>
          <input
            type="number"
            id="value"
            name="value"
            value={formData.value}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
            placeholder="25000"
          />
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-navy mb-2">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expected Close */}
        <div>
          <label htmlFor="expectedClose" className="block text-sm font-medium text-navy mb-2">
            Expected Close Date
          </label>
          <input
            type="date"
            id="expectedClose"
            name="expectedClose"
            value={formData.expectedClose}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
          />
        </div>

        {/* Source */}
        <div>
          <label htmlFor="source" className="block text-sm font-medium text-navy mb-2">
            Lead Source
          </label>
          <select
            id="source"
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
          >
            <option value="website">Website</option>
            <option value="design-library">Design Library</option>
            <option value="referral">Referral</option>
            <option value="google">Google</option>
            <option value="facebook">Facebook</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-navy mb-2">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
          placeholder="Additional details about this deal..."
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
          {isSubmitting ? 'Creating...' : 'Create Deal'}
        </Button>
      </div>
    </form>
  );
}