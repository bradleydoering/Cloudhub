'use client';

import React, { useState } from 'react';
import { Button } from '@cloudreno/ui';
import { Customer } from '../types/database';

interface NewCustomerFormProps {
  onSubmit: (customerData: Partial<Customer>) => void;
  onCancel: () => void;
}

export default function NewCustomerForm({ onSubmit, onCancel }: NewCustomerFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    customer_type: 'individual' as 'individual' | 'business',
    business_name: '',
    business_number: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'Canada',
    status: 'prospect' as 'active' | 'inactive' | 'prospect',
    referral_source: '',
    preferred_contact_method: 'email' as 'email' | 'phone' | 'text',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      
      // Reset form
      setFormData({
        name: '',
        customer_type: 'individual',
        business_name: '',
        business_number: '',
        email: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        province: '',
        postal_code: '',
        country: 'Canada',
        status: 'prospect',
        referral_source: '',
        preferred_contact_method: 'email',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating customer:', error);
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
      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="font-medium text-navy">Basic Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-navy mb-2">
              Customer Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
              placeholder="e.g., John & Jane Smith"
            />
          </div>

          <div>
            <label htmlFor="customer_type" className="block text-sm font-medium text-navy mb-2">
              Customer Type *
            </label>
            <select
              id="customer_type"
              name="customer_type"
              value={formData.customer_type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
            >
              <option value="individual">Individual</option>
              <option value="business">Business</option>
            </select>
          </div>
        </div>

        {formData.customer_type === 'business' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="business_name" className="block text-sm font-medium text-navy mb-2">
                Business Name
              </label>
              <input
                type="text"
                id="business_name"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
                placeholder="e.g., Smith Construction Ltd."
              />
            </div>

            <div>
              <label htmlFor="business_number" className="block text-sm font-medium text-navy mb-2">
                Business Number
              </label>
              <input
                type="text"
                id="business_number"
                name="business_number"
                value={formData.business_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
                placeholder="e.g., 123456789BC0001"
              />
            </div>
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h4 className="font-medium text-navy">Contact Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-navy mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
              placeholder="customer@email.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-navy mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
              placeholder="(604) 555-0123"
            />
          </div>

          <div>
            <label htmlFor="preferred_contact_method" className="block text-sm font-medium text-navy mb-2">
              Preferred Contact Method
            </label>
            <select
              id="preferred_contact_method"
              name="preferred_contact_method"
              value={formData.preferred_contact_method}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="text">Text</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-navy mb-2">
              Customer Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
            >
              <option value="prospect">Prospect</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h4 className="font-medium text-navy">Address Information</h4>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="address_line1" className="block text-sm font-medium text-navy mb-2">
              Address Line 1
            </label>
            <input
              type="text"
              id="address_line1"
              name="address_line1"
              value={formData.address_line1}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
              placeholder="123 Main Street"
            />
          </div>

          <div>
            <label htmlFor="address_line2" className="block text-sm font-medium text-navy mb-2">
              Address Line 2
            </label>
            <input
              type="text"
              id="address_line2"
              name="address_line2"
              value={formData.address_line2}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
              placeholder="Suite, Unit, etc."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-navy mb-2">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
                placeholder="Vancouver"
              />
            </div>

            <div>
              <label htmlFor="province" className="block text-sm font-medium text-navy mb-2">
                Province
              </label>
              <input
                type="text"
                id="province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
                placeholder="BC"
              />
            </div>

            <div>
              <label htmlFor="postal_code" className="block text-sm font-medium text-navy mb-2">
                Postal Code
              </label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
                placeholder="V6B 1A1"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-navy mb-2">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
                placeholder="Canada"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <h4 className="font-medium text-navy">Additional Information</h4>
        
        <div>
          <label htmlFor="referral_source" className="block text-sm font-medium text-navy mb-2">
            Referral Source
          </label>
          <input
            type="text"
            id="referral_source"
            name="referral_source"
            value={formData.referral_source}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
            placeholder="e.g., Google, Website, Referral, Trade Show"
          />
        </div>

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
            placeholder="Additional notes about this customer..."
          />
        </div>
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
          {isSubmitting ? 'Creating...' : 'Create Customer'}
        </Button>
      </div>
    </form>
  );
}