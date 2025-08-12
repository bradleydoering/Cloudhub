'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@cloudreno/ui';

interface ImportDealsFormProps {
  onImport: (deals: any[]) => void;
  onCancel: () => void;
}

export default function ImportDealsForm({ onImport, onCancel }: ImportDealsFormProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importMethod, setImportMethod] = useState<'csv' | 'manual'>('csv');
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Manual entry form data
  const [manualDeals, setManualDeals] = useState([
    {
      title: '',
      customer: '',
      value: '',
      stage: 'new',
      priority: 'medium',
      expectedClose: '',
      source: 'manual-import'
    }
  ]);

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
      const lines = text.split('\\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('CSV file must have at least a header row and one data row');
        setIsProcessing(false);
        return;
      }

      const headers = lines[0]?.split(',').map(h => h.trim().toLowerCase()) || [];
      const deals = [];

      for (let i = 1; i < Math.min(lines.length, 6); i++) { // Preview first 5 rows
        const values = lines[i]?.split(',').map(v => v.trim()) || [];
        const deal = {
          title: values[headers.indexOf('title')] || values[headers.indexOf('deal title')] || values[headers.indexOf('project')] || '',
          customer: values[headers.indexOf('customer')] || values[headers.indexOf('client')] || values[headers.indexOf('name')] || '',
          value: parseFloat(values[headers.indexOf('value')] || values[headers.indexOf('amount')] || values[headers.indexOf('budget')] || '0') || 0,
          stage: 'new',
          priority: 'medium',
          expectedClose: values[headers.indexOf('close date')] || values[headers.indexOf('expected close')] || '',
          source: 'csv-import',
          id: `import-${Date.now()}-${i}`,
          lastActivity: 'just imported'
        };
        
        if (deal.title && deal.customer) {
          deals.push(deal);
        }
      }

      setPreview(deals);
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  const handleManualDealChange = (index: number, field: string, value: string) => {
    setManualDeals(prev => prev.map((deal, i) => 
      i === index ? { ...deal, [field]: value } : deal
    ));
  };

  const addManualDeal = () => {
    setManualDeals(prev => [...prev, {
      title: '',
      customer: '',
      value: '',
      stage: 'new',
      priority: 'medium',
      expectedClose: '',
      source: 'manual-import'
    }]);
  };

  const removeManualDeal = (index: number) => {
    setManualDeals(prev => prev.filter((_, i) => i !== index));
  };

  const handleImport = () => {
    let dealsToImport = [];

    if (importMethod === 'csv' && preview.length > 0) {
      // Import all deals from CSV (not just preview)
      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          const lines = text.split('\\n').filter(line => line.trim());
          const headers = lines[0]?.split(',').map(h => h.trim().toLowerCase()) || [];
          const allDeals = [];

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i]?.split(',').map(v => v.trim()) || [];
            const deal = {
              title: values[headers.indexOf('title')] || values[headers.indexOf('deal title')] || values[headers.indexOf('project')] || '',
              customer: values[headers.indexOf('customer')] || values[headers.indexOf('client')] || values[headers.indexOf('name')] || '',
              value: parseFloat(values[headers.indexOf('value')] || values[headers.indexOf('amount')] || values[headers.indexOf('budget')] || '0') || 0,
              stage: 'new',
              priority: 'medium',
              expectedClose: values[headers.indexOf('close date')] || values[headers.indexOf('expected close')] || '',
              source: 'csv-import',
              id: `import-${Date.now()}-${i}`,
              lastActivity: 'just imported'
            };
            
            if (deal.title && deal.customer) {
              allDeals.push(deal);
            }
          }
          
          onImport(allDeals);
        };
        reader.readAsText(selectedFile);
      }
    } else if (importMethod === 'manual') {
      dealsToImport = manualDeals
        .filter(deal => deal.title && deal.customer)
        .map(deal => ({
          ...deal,
          value: parseFloat(deal.value) || 0,
          id: `manual-${Date.now()}-${Math.random()}`,
          lastActivity: 'just imported'
        }));
      onImport(dealsToImport);
    }
  };

  return (
    <div className="space-y-6">
      {/* Import Method Selection */}
      <div className="flex gap-4">
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            importMethod === 'csv' 
              ? 'bg-coral text-white' 
              : 'bg-muted text-muted-foreground hover:bg-coral/10'
          }`}
          onClick={() => setImportMethod('csv')}
        >
          Import from CSV
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            importMethod === 'manual' 
              ? 'bg-coral text-white' 
              : 'bg-muted text-muted-foreground hover:bg-coral/10'
          }`}
          onClick={() => setImportMethod('manual')}
        >
          Manual Entry
        </button>
      </div>

      {importMethod === 'csv' ? (
        <div className="space-y-4">
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
            <div className="text-4xl mb-4">📄</div>
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
              <div><strong>Required columns:</strong> title, customer</div>
              <div><strong>Optional columns:</strong> value, amount, budget, close date, expected close</div>
              <div><strong>Example:</strong> Title,Customer,Value,Expected Close</div>
              <div className="font-mono text-xs bg-muted p-2 rounded mt-2">
                Kitchen Renovation,John Smith,25000,2024-12-31
              </div>
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-navy">Preview (first 5 rows):</h4>
              <div className="bg-background border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-4 gap-4 p-3 bg-muted text-sm font-medium text-navy">
                  <div>Title</div>
                  <div>Customer</div>
                  <div>Value</div>
                  <div>Source</div>
                </div>
                {preview.map((deal, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 p-3 border-t border-border text-sm">
                    <div className="font-medium">{deal.title}</div>
                    <div>{deal.customer}</div>
                    <div>${deal.value?.toLocaleString() || '0'}</div>
                    <div className="text-muted-foreground">{deal.source}</div>
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                Ready to import {preview.length} deals
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <h4 className="font-medium text-navy">Enter Deals Manually:</h4>
          
          {manualDeals.map((deal, index) => (
            <div key={index} className="bg-muted/50 p-4 rounded-lg [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={deal.title}
                    onChange={(e) => handleManualDealChange(index, 'title', e.target.value)}
                    placeholder="Kitchen Renovation"
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">
                    Customer *
                  </label>
                  <input
                    type="text"
                    value={deal.customer}
                    onChange={(e) => handleManualDealChange(index, 'customer', e.target.value)}
                    placeholder="John & Jane Smith"
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">
                    Value ($)
                  </label>
                  <input
                    type="number"
                    value={deal.value}
                    onChange={(e) => handleManualDealChange(index, 'value', e.target.value)}
                    placeholder="25000"
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-4">
                  <select
                    value={deal.priority}
                    onChange={(e) => handleManualDealChange(index, 'priority', e.target.value)}
                    className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <input
                    type="date"
                    value={deal.expectedClose}
                    onChange={(e) => handleManualDealChange(index, 'expectedClose', e.target.value)}
                    className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  />
                </div>
                
                {manualDeals.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeManualDeal(index)}
                    className="text-coral border-coral hover:bg-coral/10"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          <Button variant="outline" onClick={addManualDeal}>
            + Add Another Deal
          </Button>
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
          disabled={(
            importMethod === 'csv' && preview.length === 0
          ) || (
            importMethod === 'manual' && !manualDeals.some(deal => deal.title && deal.customer)
          )}
        >
          Import {importMethod === 'csv' ? preview.length : manualDeals.filter(d => d.title && d.customer).length} Deals
        </Button>
      </div>
    </div>
  );
}