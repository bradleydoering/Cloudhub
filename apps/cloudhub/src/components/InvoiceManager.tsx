'use client';

import React, { useState } from 'react';
import { Button } from '@cloudreno/ui';

import { Invoice as DatabaseInvoice, InvoiceItem as DatabaseInvoiceItem } from '../types/database';

interface Invoice extends Omit<DatabaseInvoice, 'items'> {
  items: InvoiceItem[];
}

interface InvoiceItem extends DatabaseInvoiceItem {
  rate?: number; // For backwards compatibility
  amount?: number; // For backwards compatibility
}

interface InvoiceManagerProps {
  invoices: Invoice[];
  onCreate: (invoice: {
    description?: string;
    amount: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    issueDate: string;
    dueDate: string;
    items: InvoiceItem[];
  }) => void;
  onUpdate: (invoice: Invoice) => void;
  onDelete?: (invoiceId: string) => void;
  onSend?: (invoiceId: string) => void;
  onMarkPaid?: (invoiceId: string) => void;
}

export default function InvoiceManager({
  invoices,
  onCreate,
  onUpdate,
  onDelete,
  onSend,
  onMarkPaid
}: InvoiceManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<{
    description: string;
    amount: number;
    status: Invoice['status'];
    issueDate: string;
    dueDate: string;
    items: InvoiceItem[];
  }>({
    description: '',
    amount: 0,
    status: 'draft',
    issueDate: new Date().toISOString().split('T')[0]!,
    dueDate: new Date().toISOString().split('T')[0]!,
    items: [{
      id: '1',
      created_at: new Date().toISOString(),
      invoice_id: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      line_order: 0,
      rate: 0, // For backwards compatibility
      amount: 0 // For backwards compatibility
    }]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = formData.items.reduce((sum, item) => sum + (item.total_price || item.amount || 0), 0);
    
    onCreate({
      description: formData.description,
      amount: totalAmount,
      status: 'draft',
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      items: formData.items
    });
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: 0,
      status: 'draft',
      issueDate: new Date().toISOString().split('T')[0]!,
      dueDate: new Date().toISOString().split('T')[0]!,
      items: [{
        id: '1',
        created_at: new Date().toISOString(),
        invoice_id: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
        line_order: 0,
        rate: 0, // For backwards compatibility
        amount: 0 // For backwards compatibility
      }]
    });
    setShowCreateForm(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      const updatedItem = { ...newItems[index], [field]: value } as InvoiceItem;
      
      // Auto-calculate amount and total_price if quantity or rate/unit_price changes
      if (field === 'quantity' || field === 'rate' || field === 'unit_price') {
        const rate = updatedItem.rate || updatedItem.unit_price || 0;
        updatedItem.total_price = updatedItem.quantity * rate;
        updatedItem.amount = updatedItem.total_price; // For backwards compatibility
        updatedItem.unit_price = rate; // Ensure unit_price is set
        if (field === 'rate') {
          updatedItem.unit_price = value; // Sync rate to unit_price
        }
      }
      
      newItems[index] = updatedItem;
      return { ...prev, items: newItems };
    });
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        id: String(Date.now()),
        created_at: new Date().toISOString(),
        invoice_id: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
        line_order: prev.items.length,
        rate: 0, // For backwards compatibility
        amount: 0 // For backwards compatibility
      }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-coral/20 text-coral';
      case 'paid': return 'bg-navy/20 text-navy';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return '📝';
      case 'sent': return '📧';
      case 'paid': return '✅';
      case 'overdue': return '⚠️';
      case 'cancelled': return '❌';
      default: return '📄';
    }
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + inv.amount, 0);
  const overdueAmount = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-space font-medium text-navy">Invoices & Payments</h4>
          <p className="text-sm text-muted-foreground">
            {invoices.length} invoices • ${paidAmount.toLocaleString()} collected
          </p>
        </div>
        <Button 
          variant="coral" 
          size="sm" 
          onClick={() => setShowCreateForm(true)}
        >
          Create Invoice
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted/50 p-3 rounded-lg [clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)]">
          <div className="text-lg font-space font-semibold text-navy">${totalAmount.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div className="bg-muted/50 p-3 rounded-lg [clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)]">
          <div className="text-lg font-space font-semibold text-navy">${paidAmount.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Paid</div>
        </div>
        <div className="bg-muted/50 p-3 rounded-lg [clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)]">
          <div className="text-lg font-space font-semibold text-coral">${pendingAmount.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Pending</div>
        </div>
        <div className="bg-muted/50 p-3 rounded-lg [clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)]">
          <div className="text-lg font-space font-semibold text-red-600">${overdueAmount.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Overdue</div>
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
            <h3 className="text-lg font-space font-semibold text-navy mb-4">Create New Invoice</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Description *</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Progress Payment (40%)"
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Issue Date *</label>
                  <input
                    type="date"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Due Date *</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  />
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-navy">Invoice Items</h4>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    + Add Item
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border border-border rounded-lg">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-navy mb-1">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Item description"
                          className="w-full px-2 py-1 text-sm border border-input rounded focus:ring-1 focus:ring-coral focus:border-coral"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-navy mb-1">Quantity</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                          min="0"
                          step="0.01"
                          className="w-full px-2 py-1 text-sm border border-input rounded focus:ring-1 focus:ring-coral focus:border-coral"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-navy mb-1">Rate ($)</label>
                        <input
                          type="number"
                          value={item.unit_price || item.rate || 0}
                          onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))}
                          min="0"
                          step="0.01"
                          className="w-full px-2 py-1 text-sm border border-input rounded focus:ring-1 focus:ring-coral focus:border-coral"
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-navy mb-1">Amount</label>
                          <div className="px-2 py-1 text-sm bg-muted rounded font-medium">
                            ${(item.total_price || item.amount || 0).toLocaleString()}
                          </div>
                        </div>
                        {formData.items.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-coral border-coral hover:bg-coral/10 px-2"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-right pt-3 border-t border-border mt-3">
                  <div className="text-lg font-space font-semibold text-coral">
                    Total: ${formData.items.reduce((sum, item) => sum + (item.total_price || item.amount || 0), 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="coral">
                  Create Invoice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoices List */}
      <div className="space-y-4">
        {invoices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">📄</div>
            <p>No invoices created yet</p>
            <p className="text-sm">Create your first invoice to get started</p>
          </div>
        ) : (
          invoices.map((invoice) => (
            <div key={invoice.id} className="p-4 border border-border rounded-lg [clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)]">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h5 className="font-medium">{invoice.number}: {invoice.description}</h5>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(invoice.status)}`}>
                      {getStatusIcon(invoice.status)} {invoice.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Issued {new Date(invoice.issue_date || invoice.issueDate).toLocaleDateString()} • Due {new Date(invoice.due_date || invoice.dueDate).toLocaleDateString()}
                    {invoice.paid_date && ` • Paid ${new Date(invoice.paid_date).toLocaleDateString()}`}
                  </p>
                  
                  {/* Invoice Items Summary */}
                  <div className="mt-2 text-xs text-muted-foreground">
                    {invoice.items.length} item{invoice.items.length !== 1 ? 's' : ''}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xl font-space font-semibold text-coral">
                    ${invoice.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedInvoice(invoice)}
                >
                  View Details
                </Button>
                
                {invoice.status === 'draft' && onSend && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSend(invoice.id)}
                    className="text-coral border-coral hover:bg-coral/10"
                  >
                    Send Invoice
                  </Button>
                )}
                
                {invoice.status === 'sent' && onMarkPaid && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMarkPaid(invoice.id)}
                    className="text-navy border-navy hover:bg-navy/10"
                  >
                    Mark as Paid
                  </Button>
                )}
                
                {onDelete && invoice.status === 'draft' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(invoice.id)}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-space font-semibold text-navy">
                  {selectedInvoice.number}: {selectedInvoice.description}
                </h3>
                <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full mt-2 ${getStatusColor(selectedInvoice.status)}`}>
                  {getStatusIcon(selectedInvoice.status)} {selectedInvoice.status.toUpperCase()}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedInvoice(null)}
              >
                Close
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Invoice Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-navy">Issue Date</div>
                  <div className="text-sm">{new Date(selectedInvoice.issue_date || selectedInvoice.issueDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-navy">Due Date</div>
                  <div className="text-sm">{new Date(selectedInvoice.due_date || selectedInvoice.dueDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-navy">Amount</div>
                  <div className="text-lg font-space font-semibold text-coral">${selectedInvoice.amount.toLocaleString()}</div>
                </div>
              </div>
              
              {/* Invoice Items */}
              <div>
                <h4 className="font-medium text-navy mb-3">Invoice Items</h4>
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-4 gap-4 p-3 bg-muted text-sm font-medium text-navy">
                    <div>Description</div>
                    <div className="text-center">Quantity</div>
                    <div className="text-center">Rate</div>
                    <div className="text-right">Amount</div>
                  </div>
                  {selectedInvoice.items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-4 gap-4 p-3 border-t border-border text-sm">
                      <div className="font-medium">{item.description}</div>
                      <div className="text-center">{item.quantity}</div>
                      <div className="text-center">${(item.unit_price || item.rate || 0).toLocaleString()}</div>
                      <div className="text-right font-medium">${(item.total_price || item.amount || 0).toLocaleString()}</div>
                    </div>
                  ))}
                  <div className="p-3 border-t-2 border-navy/20 bg-muted/30">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-3 text-right font-medium">Total:</div>
                      <div className="text-right text-lg font-space font-semibold text-coral">
                        ${selectedInvoice.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}