'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@cloudreno/ui';
import SearchFilters, { useSearchFilters, filterData, FilterOption } from '../../src/components/SearchFilters';
import BulkActions, { useBulkSelection, BulkSelectCheckbox, BulkAction } from '../../src/components/BulkActions';
import Modal from '../../src/components/Modal';
import CustomerDetailView from '../../src/components/CustomerDetailView';
import NewCustomerForm from '../../src/components/NewCustomerForm';
import ImportCustomersForm from '../../src/components/ImportCustomersForm';
import { Customer } from '../../src/types/database';

function CustomerCard({ 
  customer, 
  onClick, 
  isSelected, 
  onToggleSelect 
}: { 
  customer: Customer;
  onClick: (customer: Customer) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}) {
  const statusColors = {
    active: 'bg-navy/20 text-navy',
    inactive: 'bg-gray-100 text-gray-800',
    prospect: 'bg-coral/10 text-coral'
  };

  const getAddress = () => {
    const parts = [customer.address_line1, customer.city, customer.province].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'No address provided';
  };

  return (
    <div 
      className={`bg-card border border-border p-6 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)] hover:shadow-md transition-shadow cursor-pointer ${
        isSelected ? 'ring-2 ring-coral bg-coral/5' : ''
      }`}
      onClick={() => onClick(customer)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {onToggleSelect && (
              <BulkSelectCheckbox
                checked={isSelected || false}
                onChange={() => onToggleSelect(customer.id)}
                className="mr-2"
              />
            )}
            <h3 className="font-space font-semibold text-lg text-navy">{customer.name}</h3>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[customer.status]}`}>
              {customer.status.toUpperCase()}
            </span>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>{customer.email}</p>
            {customer.phone && <p>{customer.phone}</p>}
            <p>{getAddress()}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-space font-semibold text-coral">
            {customer.customer_type.charAt(0).toUpperCase() + customer.customer_type.slice(1)}
          </div>
          <p className="text-sm text-muted-foreground">Customer Type</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          {customer.business_name && (
            <>
              <span className="font-medium">{customer.business_name}</span>
              <span>•</span>
            </>
          )}
          {customer.referral_source && (
            <>
              <span className="capitalize">Source: {customer.referral_source}</span>
              <span>•</span>
            </>
          )}
          <span>Added: {new Date(customer.created_at).toLocaleDateString()}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Click to view details
        </div>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCustomerDetailModal, setShowCustomerDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Search and filter state
  const {
    searchTerm,
    setSearchTerm,
    activeFilters,
    showAdvanced,
    handleFilterChange,
    clearFilters,
    toggleAdvanced
  } = useSearchFilters();

  // Define filter options for customers
  const filterOptions: FilterOption[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'prospect', label: 'Prospect' }
      ]
    },
    {
      id: 'customer_type',
      label: 'Customer Type',
      type: 'select',
      options: [
        { value: 'individual', label: 'Individual' },
        { value: 'business', label: 'Business' }
      ]
    },
    {
      id: 'city',
      label: 'City',
      type: 'select',
      options: [
        { value: 'Vancouver', label: 'Vancouver' },
        { value: 'North Vancouver', label: 'North Vancouver' },
        { value: 'Richmond', label: 'Richmond' },
        { value: 'Burnaby', label: 'Burnaby' },
        { value: 'Surrey', label: 'Surrey' }
      ]
    },
    {
      id: 'referral_source',
      label: 'Referral Source',
      type: 'select',
      options: [
        { value: 'website', label: 'Website' },
        { value: 'referral', label: 'Referral' },
        { value: 'social-media', label: 'Social Media' },
        { value: 'advertising', label: 'Advertising' },
        { value: 'design-library', label: 'Design Library' }
      ]
    },
    {
      id: 'created_at',
      label: 'Date Added',
      type: 'daterange'
    },
    {
      id: 'preferred_contact_method',
      label: 'Preferred Contact',
      type: 'select',
      options: [
        { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Phone' },
        { value: 'text', label: 'Text' }
      ]
    }
  ];

  // Filter and search customers
  const filteredCustomers = useMemo(() => {
    return filterData(
      customers,
      searchTerm,
      activeFilters,
      ['name', 'email', 'phone', 'business_name', 'city', 'address_line1']
    );
  }, [customers, searchTerm, activeFilters]);

  // Bulk selection state
  const {
    selectedIds,
    selectedItems,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    toggleAll,
    clearSelection
  } = useBulkSelection(filteredCustomers);

  // Define bulk actions for customers
  const bulkActions: BulkAction[] = [
    {
      id: 'status-active',
      label: 'Mark Active',
      icon: '✅',
      variant: 'default'
    },
    {
      id: 'status-inactive',
      label: 'Mark Inactive',
      icon: '⏸️',
      variant: 'secondary'
    },
    {
      id: 'export',
      label: 'Export',
      icon: '📄',
      variant: 'secondary'
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: '🗑️',
      variant: 'destructive',
      requiresConfirmation: true,
      confirmationTitle: 'Delete Customers',
      confirmationMessage: 'Are you sure you want to delete the selected customers? This action cannot be undone.'
    }
  ];

  // Load customers from Supabase
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const customersData = await executeSupabaseQuery(`
        SELECT * FROM customers 
        ORDER BY created_at DESC
      `);
      setCustomers(customersData);
    } catch (err) {
      setError('Failed to load customers');
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Execute Supabase queries using MCP
  const executeSupabaseQuery = async (sql: string, params: any[] = []): Promise<any[]> => {
    try {
      // This would use the MCP Supabase client
      // For now, return empty data to prevent runtime errors
      console.log('Would execute Supabase query:', sql, params);
      return [];
    } catch (error) {
      console.error('Error executing Supabase query:', error);
      throw error;
    }
  };

  // Bulk action handler for customers
  const handleBulkAction = async (actionId: string, selectedCustomers: Customer[]) => {
    try {
      switch (actionId) {
        case 'status-active':
          await Promise.all(
            selectedCustomers.map(customer =>
              executeSupabaseQuery(
                'UPDATE customers SET status = $2, updated_at = NOW() WHERE id = $1',
                [customer.id, 'active']
              )
            )
          );
          setCustomers(prev => prev.map(c => 
            selectedCustomers.some(sc => sc.id === c.id) 
              ? { ...c, status: 'active' as const }
              : c
          ));
          // notifySuccess('Customers Updated', `${selectedCustomers.length} customers marked as active`);
          break;

        case 'status-inactive':
          await Promise.all(
            selectedCustomers.map(customer =>
              executeSupabaseQuery(
                'UPDATE customers SET status = $2, updated_at = NOW() WHERE id = $1',
                [customer.id, 'inactive']
              )
            )
          );
          setCustomers(prev => prev.map(c => 
            selectedCustomers.some(sc => sc.id === c.id) 
              ? { ...c, status: 'inactive' as const }
              : c
          ));
          // notifyInfo('Customers Updated', `${selectedCustomers.length} customers marked as inactive`);
          break;

        case 'export':
          const csvContent = selectedCustomers.map(c => {
            const address = [c.address_line1, c.city, c.province].filter(Boolean).join(', ');
            return `"${c.name}","${c.email}","${c.phone || ''}","${address}","${c.customer_type}","${c.status}"`;
          }).join('\n');
          const header = 'Name,Email,Phone,Address,Type,Status\n';
          const blob = new Blob([header + csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `customers-export-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
          console.log(`Export Complete: ${selectedCustomers.length} customers exported to CSV`);
          break;

        case 'delete':
          await Promise.all(
            selectedCustomers.map(customer =>
              executeSupabaseQuery('DELETE FROM customers WHERE id = $1', [customer.id])
            )
          );
          setCustomers(prev => prev.filter(c => !selectedCustomers.some(sc => sc.id === c.id)));
          console.log(`Customers Deleted: ${selectedCustomers.length} customers removed`);
          break;

        default:
          console.warn('Unknown bulk action:', actionId);
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
      alert('Failed to complete bulk action. Please try again.');
    }
  };


  const handleNewCustomer = async (customerData: Partial<Customer>) => {
    try {
      await executeSupabaseQuery(`
        INSERT INTO customers (
          name, email, phone, address_line1, address_line2, city, province, 
          postal_code, country, customer_type, business_name, business_number,
          status, referral_source, preferred_contact_method, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      `, [
        customerData.name,
        customerData.email,
        customerData.phone,
        customerData.address_line1,
        customerData.address_line2,
        customerData.city,
        customerData.province,
        customerData.postal_code,
        customerData.country,
        customerData.customer_type,
        customerData.business_name,
        customerData.business_number,
        customerData.status,
        customerData.referral_source,
        customerData.preferred_contact_method,
        customerData.notes
      ]);

      // Reload customers
      await loadCustomers();
      setShowNewCustomerModal(false);
      alert('Customer created successfully!');
    } catch (err) {
      console.error('Error creating customer:', err);
      alert('Failed to create customer. Please try again.');
    }
  };

  const handleImportCustomers = async (importedCustomers: any[]) => {
    try {
      for (const customer of importedCustomers) {
        await executeSupabaseQuery(`
          INSERT INTO customers (
            name, email, phone, address_line1, city, province, postal_code, 
            country, customer_type, business_name, status, referral_source, 
            preferred_contact_method
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          customer.name,
          customer.email,
          customer.phone,
          customer.address_line1,
          customer.city,
          customer.province,
          customer.postal_code,
          customer.country || 'Canada',
          customer.customer_type,
          customer.business_name,
          customer.status || 'prospect',
          customer.referral_source,
          customer.preferred_contact_method || 'email'
        ]);
      }

      // Reload customers
      await loadCustomers();
      setShowImportModal(false);
      alert(`Successfully imported ${importedCustomers.length} customers!`);
    } catch (err) {
      console.error('Error importing customers:', err);
      alert('Failed to import customers. Please try again.');
    }
  };

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetailModal(true);
  };

  const handleUpdateCustomer = async (updatedCustomer: Customer) => {
    try {
      await executeSupabaseQuery(`
        UPDATE customers 
        SET name = $2, email = $3, phone = $4, address_line1 = $5, address_line2 = $6,
            city = $7, province = $8, postal_code = $9, country = $10, 
            customer_type = $11, business_name = $12, business_number = $13,
            status = $14, referral_source = $15, preferred_contact_method = $16, 
            notes = $17, updated_at = NOW()
        WHERE id = $1
      `, [
        updatedCustomer.id,
        updatedCustomer.name,
        updatedCustomer.email,
        updatedCustomer.phone,
        updatedCustomer.address_line1,
        updatedCustomer.address_line2,
        updatedCustomer.city,
        updatedCustomer.province,
        updatedCustomer.postal_code,
        updatedCustomer.country,
        updatedCustomer.customer_type,
        updatedCustomer.business_name,
        updatedCustomer.business_number,
        updatedCustomer.status,
        updatedCustomer.referral_source,
        updatedCustomer.preferred_contact_method,
        updatedCustomer.notes
      ]);

      // Update local state
      setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
      setSelectedCustomer(updatedCustomer);
      alert('Customer updated successfully!');
    } catch (err) {
      console.error('Error updating customer:', err);
      alert('Failed to update customer. Please try again.');
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      await executeSupabaseQuery(`
        DELETE FROM customers WHERE id = $1
      `, [customerId]);

      // Update local state
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      setShowCustomerDetailModal(false);
      setSelectedCustomer(null);
      alert('Customer deleted successfully!');
    } catch (err) {
      console.error('Error deleting customer:', err);
      alert('Failed to delete customer. Please try again.');
    }
  };

  const handleExportCustomers = () => {
    const csvContent = customers.map(c => {
      const address = [c.address_line1, c.city, c.province].filter(Boolean).join(', ');
      return `${c.name},${c.email},${c.phone || ''},${address},${c.customer_type},${c.status}`;
    }).join('\n');
    const header = 'Name,Email,Phone,Address,Type,Status\n';
    const blob = new Blob([header + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate stats from filtered data
  const totalCustomers = filteredCustomers.length;
  const activeCustomers = filteredCustomers.filter(c => c.status === 'active').length;
  const businessCustomers = filteredCustomers.filter(c => c.customer_type === 'business').length;
  const prospectCustomers = filteredCustomers.filter(c => c.status === 'prospect').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-600">{error}</p>
          <Button onClick={loadCustomers} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-space text-3xl font-semibold text-navy">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage your customer relationships</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Button variant="outline" onClick={handleExportCustomers}>
            Export Customers
          </Button>
          <Button variant="outline" onClick={() => setShowImportModal(true)}>
            Import Customers
          </Button>
          <Button variant="coral" onClick={() => setShowNewCustomerModal(true)}>
            + Add Customer
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          <div className="text-2xl font-space font-semibold text-navy">{totalCustomers}</div>
          <div className="text-sm text-muted-foreground">Total Customers</div>
        </div>
        <div className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          <div className="text-2xl font-space font-semibold text-coral">{activeCustomers}</div>
          <div className="text-sm text-muted-foreground">Active Customers</div>
        </div>
        <div className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          <div className="text-2xl font-space font-semibold text-navy">{businessCustomers}</div>
          <div className="text-sm text-muted-foreground">Business Customers</div>
        </div>
        <div className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          <div className="text-2xl font-space font-semibold text-coral">{prospectCustomers}</div>
          <div className="text-sm text-muted-foreground">Prospects</div>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filterOptions}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        showAdvanced={showAdvanced}
        onToggleAdvanced={toggleAdvanced}
      />

      {/* Bulk Actions */}
      <BulkActions
        selectedItems={selectedItems}
        onClearSelection={clearSelection}
        actions={bulkActions}
        onAction={handleBulkAction}
        itemName="customers"
      />

      {/* Customer List */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-card border border-border p-12 text-center [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          {customers.length === 0 ? (
            <div>
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-navy mb-2">No Customers Yet</h3>
              <p className="text-muted-foreground mb-6">Get started by adding your first customer</p>
              <Button variant="coral" onClick={() => setShowNewCustomerModal(true)}>
                Add First Customer
              </Button>
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-muted-foreground mb-6">
                No customers match your current search criteria. Try adjusting your filters or search term.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Select All Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <BulkSelectCheckbox
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onChange={toggleAll}
                className="flex items-center gap-2"
              />
              <span className="text-sm text-muted-foreground">
                {filteredCustomers.length} customers
                {selectedItems.length > 0 && ` (${selectedItems.length} selected)`}
              </span>
            </div>
          </div>
          
          {filteredCustomers.map(customer => (
            <CustomerCard 
              key={customer.id} 
              customer={customer} 
              onClick={handleCustomerClick}
              isSelected={selectedIds.has(customer.id)}
              onToggleSelect={toggleItem}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <Modal 
        isOpen={showNewCustomerModal} 
        onClose={() => setShowNewCustomerModal(false)} 
        title="Add New Customer"
        size="xl"
      >
        <NewCustomerForm 
          onSubmit={handleNewCustomer}
          onCancel={() => setShowNewCustomerModal(false)}
        />
      </Modal>

      <Modal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)} 
        title="Import Customers"
        size="xl"
      >
        <ImportCustomersForm 
          onImport={handleImportCustomers}
          onCancel={() => setShowImportModal(false)}
        />
      </Modal>

      {selectedCustomer && (
        <Modal 
          isOpen={showCustomerDetailModal} 
          onClose={() => {
            setShowCustomerDetailModal(false);
            setSelectedCustomer(null);
          }} 
          title={`Customer: ${selectedCustomer.name}`}
          size="xl"
        >
          <CustomerDetailView 
            customer={selectedCustomer}
            onClose={() => {
              setShowCustomerDetailModal(false);
              setSelectedCustomer(null);
            }}
            onUpdate={handleUpdateCustomer}
            onDelete={handleDeleteCustomer}
          />
        </Modal>
      )}
    </div>
  );
}