'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@cloudreno/ui';

interface ImportCustomersFormProps {
  onImport: (customers: any[]) => void;
  onCancel: () => void;
}

export default function ImportCustomersForm({ onImport, onCancel }: ImportCustomersFormProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setSelectedFile(file);
    processCSV(file);
  };

  const processCSV = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('CSV file must have at least a header row and one data row');
        setIsProcessing(false);
        return;
      }

      const headers = lines[0]?.split(',').map(h => h.trim().toLowerCase()) || [];
      const customers = [];

      for (let i = 1; i < Math.min(lines.length, 6); i++) { // Preview first 5 rows
        const values = lines[i]?.split(',').map(v => v.trim()) || [];
        const customer = {
          name: values[headers.indexOf('name')] || values[headers.indexOf('customer name')] || values[headers.indexOf('customer')] || '',
          email: values[headers.indexOf('email')] || values[headers.indexOf('email address')] || '',
          phone: values[headers.indexOf('phone')] || values[headers.indexOf('phone number')] || values[headers.indexOf('telephone')] || '',
          address_line1: values[headers.indexOf('address')] || values[headers.indexOf('address line 1')] || values[headers.indexOf('street')] || '',
          city: values[headers.indexOf('city')] || '',
          province: values[headers.indexOf('province')] || values[headers.indexOf('state')] || values[headers.indexOf('region')] || '',
          postal_code: values[headers.indexOf('postal code')] || values[headers.indexOf('zip code')] || values[headers.indexOf('zip')] || '',
          customer_type: values[headers.indexOf('type')] === 'business' ? 'business' : 'individual',
          business_name: values[headers.indexOf('business name')] || values[headers.indexOf('company')] || '',
          status: 'prospect',
          referral_source: values[headers.indexOf('source')] || values[headers.indexOf('referral source')] || 'import',
          id: `import-${Date.now()}-${i}`
        };
        
        if (customer.name && customer.email) {
          customers.push(customer);
        }
      }

      setPreview(customers);
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!selectedFile || preview.length === 0) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0]?.split(',').map(h => h.trim().toLowerCase()) || [];
      const allCustomers = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i]?.split(',').map(v => v.trim()) || [];
        const customer = {
          name: values[headers.indexOf('name')] || values[headers.indexOf('customer name')] || values[headers.indexOf('customer')] || '',
          email: values[headers.indexOf('email')] || values[headers.indexOf('email address')] || '',
          phone: values[headers.indexOf('phone')] || values[headers.indexOf('phone number')] || values[headers.indexOf('telephone')] || '',
          address_line1: values[headers.indexOf('address')] || values[headers.indexOf('address line 1')] || values[headers.indexOf('street')] || '',
          city: values[headers.indexOf('city')] || '',
          province: values[headers.indexOf('province')] || values[headers.indexOf('state')] || values[headers.indexOf('region')] || '',
          postal_code: values[headers.indexOf('postal code')] || values[headers.indexOf('zip code')] || values[headers.indexOf('zip')] || '',
          country: values[headers.indexOf('country')] || 'Canada',
          customer_type: values[headers.indexOf('type')] === 'business' ? 'business' : 'individual',
          business_name: values[headers.indexOf('business name')] || values[headers.indexOf('company')] || '',
          status: 'prospect',
          referral_source: values[headers.indexOf('source')] || values[headers.indexOf('referral source')] || 'csv-import',
          preferred_contact_method: 'email',
          id: `import-${Date.now()}-${i}`
        };
        
        if (customer.name && customer.email) {
          allCustomers.push(customer);
        }
      }
      
      onImport(allCustomers);
    };
    reader.readAsText(selectedFile);
  };

  return (
    <div className="space-y-6">
      {/* CSV Upload Area */}
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-coral bg-coral/5' 
            : 'border-border bg-muted/50 hover:border-coral/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-4xl mb-4">👥</div>
        <h3 className="text-lg font-medium text-navy mb-2">
          {selectedFile ? selectedFile.name : 'Drop your CSV file here'}
        </h3>
        <p className="text-muted-foreground mb-4">
          {selectedFile 
            ? 'File selected successfully!' 
            : 'or click to browse your files'
          }
        </p>
        <Button 
          variant="outline" 
          onClick={() => fileRef.current?.click()}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Choose File'}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* CSV Format Guide */}
      <div className="bg-navy/5 border border-navy/20 rounded-lg p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
        <h4 className="font-medium text-navy mb-2">CSV Format Requirements:</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <div><strong>Required columns:</strong> name, email</div>
          <div><strong>Optional columns:</strong> phone, address, city, province, postal code, type (individual/business), business name, source</div>
          <div><strong>Example header:</strong> Name,Email,Phone,Address,City,Province,Postal Code,Type,Source</div>
          <div className="font-mono text-xs bg-muted p-2 rounded mt-2">
            John Smith,john@email.com,(604) 555-0123,123 Main St,Vancouver,BC,V6B 1A1,individual,website
          </div>
        </div>
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-navy">Preview (first 5 rows):</h4>
          <div className="bg-background border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-5 gap-4 p-3 bg-muted text-sm font-medium text-navy">
              <div>Name</div>
              <div>Email</div>
              <div>Phone</div>
              <div>Address</div>
              <div>Type</div>
            </div>
            {preview.map((customer, index) => (
              <div key={index} className="grid grid-cols-5 gap-4 p-3 border-t border-border text-sm">
                <div className="font-medium">{customer.name}</div>
                <div>{customer.email}</div>
                <div>{customer.phone}</div>
                <div>{customer.address_line1}, {customer.city}</div>
                <div className="capitalize">{customer.customer_type}</div>
              </div>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            Ready to import {preview.length} customers from file
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-border">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          variant="coral" 
          onClick={handleImport}
          disabled={preview.length === 0}
        >
          Import {preview.length} Customers
        </Button>
      </div>
    </div>
  );
}