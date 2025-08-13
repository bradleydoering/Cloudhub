'use client';

import React, { useState } from 'react';
import { Button } from '@cloudreno/ui';
import { Customer } from '../types/database';

interface CustomerDetailViewProps {
  customer: Customer;
  onClose: () => void;
  onUpdate: (customer: Customer) => void;
  onDelete?: (customerId: string) => void;
}

export default function CustomerDetailView({ 
  customer, 
  onClose, 
  onUpdate, 
  onDelete 
}: CustomerDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Customer>(customer);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onUpdate(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating customer:', error);
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

  const handleDelete = async () => {
    if (!onDelete) return;
    
    const confirmed = confirm(`Are you sure you want to delete customer "${customer.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await onDelete(customer.id);
      onClose();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer. Please try again.');
    }
  };

  const getFullAddress = () => {
    const parts = [
      customer.address_line1,
      customer.address_line2,
      customer.city,
      customer.province,
      customer.postal_code,
      customer.country
    ].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-space font-semibold text-navy">Customer Details</h3>
          <p className="text-sm text-muted-foreground">
            {customer.customer_type === 'business' ? 'Business Customer' : 'Individual Customer'}
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit Customer
              </Button>
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  Delete
                </Button>
              )}
            </>
          )}
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-muted/50 p-4 rounded-lg [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
            <h4 className="font-medium text-navy mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">
                  Customer Type
                </label>
                <select
                  name="customer_type"
                  value={formData.customer_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                >
                  <option value="individual">Individual</option>
                  <option value="business">Business</option>
                </select>
              </div>
              {formData.customer_type === 'business' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      name="business_name"
                      value={formData.business_name || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">
                      Business Number
                    </label>
                    <input
                      type="text"
                      name="business_number"
                      value={formData.business_number || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-muted/50 p-4 rounded-lg [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
            <h4 className="font-medium text-navy mb-4">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">
                  Preferred Contact Method
                </label>
                <select
                  name="preferred_contact_method"
                  value={formData.preferred_contact_method || 'email'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="text">Text</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="prospect">Prospect</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-muted/50 p-4 rounded-lg [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
            <h4 className="font-medium text-navy mb-4">Address Information</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1">
                  Address Line 1
                </label>
                <input
                  type="text"
                  name="address_line1"
                  value={formData.address_line1 || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="address_line2"
                  value={formData.address_line2 || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">
                    Province
                  </label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-muted/50 p-4 rounded-lg [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
            <h4 className="font-medium text-navy mb-4">Additional Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1">
                  Referral Source
                </label>
                <input
                  type="text"
                  name="referral_source"
                  value={formData.referral_source || ''}
                  onChange={handleChange}
                  placeholder="e.g., Google, Website, Referral"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-navy mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                placeholder="Additional notes about this customer..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setFormData(customer);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="coral"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Customer'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-muted/50 p-4 rounded-lg [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
            <h4 className="font-medium text-navy mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Customer Name:</span>
                <span className="ml-2 font-medium">{customer.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Customer Type:</span>
                <span className="ml-2 font-medium capitalize">{customer.customer_type}</span>
              </div>
              {customer.business_name && (
                <div>
                  <span className="text-muted-foreground">Business Name:</span>
                  <span className="ml-2 font-medium">{customer.business_name}</span>
                </div>
              )}
              {customer.business_number && (
                <div>
                  <span className="text-muted-foreground">Business Number:</span>
                  <span className="ml-2 font-medium">{customer.business_number}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                  customer.status === 'active' ? 'bg-navy/20 text-navy' :
                  customer.status === 'prospect' ? 'bg-coral/20 text-coral' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {customer.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-muted/50 p-4 rounded-lg [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
            <h4 className="font-medium text-navy mb-4">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Email:</span>
                <span className="ml-2 font-medium">{customer.email}</span>
              </div>
              {customer.phone && (
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="ml-2 font-medium">{customer.phone}</span>
                </div>
              )}
              {customer.preferred_contact_method && (
                <div>
                  <span className="text-muted-foreground">Preferred Contact:</span>
                  <span className="ml-2 font-medium capitalize">{customer.preferred_contact_method}</span>
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          {getFullAddress() && (
            <div className="bg-muted/50 p-4 rounded-lg [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
              <h4 className="font-medium text-navy mb-4">Address Information</h4>
              <div className="text-sm">
                <span className="text-muted-foreground">Address:</span>
                <span className="ml-2 font-medium">{getFullAddress()}</span>
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="bg-muted/50 p-4 rounded-lg [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
            <h4 className="font-medium text-navy mb-4">Additional Information</h4>
            <div className="space-y-2 text-sm">
              {customer.referral_source && (
                <div>
                  <span className="text-muted-foreground">Referral Source:</span>
                  <span className="ml-2 font-medium">{customer.referral_source}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Created:</span>
                <span className="ml-2 font-medium">{new Date(customer.created_at).toLocaleDateString()}</span>
              </div>
              {customer.updated_at !== customer.created_at && (
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="ml-2 font-medium">{new Date(customer.updated_at).toLocaleDateString()}</span>
                </div>
              )}
              {customer.notes && (
                <div className="mt-4">
                  <span className="text-muted-foreground">Notes:</span>
                  <div className="ml-2 mt-1 p-3 bg-background rounded border text-sm">
                    {customer.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}