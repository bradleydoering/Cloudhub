'use client';

import { useState } from 'react';
import { Button } from '@cloudreno/ui';

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  totalValue: number;
  projectsCount: number;
  status: 'active' | 'inactive' | 'prospect';
  lastActivity: string;
  source: string;
};

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John & Jane Doe',
    email: 'john.doe@email.com',
    phone: '(604) 555-0123',
    address: '123 Maple Street',
    city: 'North Vancouver, BC',
    totalValue: 35000,
    projectsCount: 1,
    status: 'active',
    lastActivity: '2 days ago',
    source: 'website'
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob.smith@email.com',
    phone: '(604) 555-0456',
    address: '456 Oak Avenue',
    city: 'Vancouver, BC',
    totalValue: 18000,
    projectsCount: 1,
    status: 'active',
    lastActivity: '1 week ago',
    source: 'referral'
  },
  {
    id: '3',
    name: 'Alice Wong',
    email: 'alice.wong@email.com',
    phone: '(604) 555-0789',
    address: '789 Pine Road',
    city: 'Burnaby, BC',
    totalValue: 75000,
    projectsCount: 2,
    status: 'active',
    lastActivity: '3 days ago',
    source: 'design-library'
  },
  {
    id: '4',
    name: 'Mike & Sarah Chen',
    email: 'mike.chen@email.com',
    phone: '(604) 555-0321',
    address: '321 Cedar Street',
    city: 'Richmond, BC',
    totalValue: 12000,
    projectsCount: 1,
    status: 'prospect',
    lastActivity: '1 day ago',
    source: 'website'
  },
];

function CustomerCard({ customer }: { customer: Customer }) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    prospect: 'bg-blue-100 text-blue-800'
  };

  return (
    <div className="bg-card border border-border p-6 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)] hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-space font-semibold text-lg text-navy">{customer.name}</h3>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[customer.status]}`}>
              {customer.status.toUpperCase()}
            </span>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>{customer.email}</p>
            <p>{customer.phone}</p>
            <p>{customer.address}, {customer.city}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-space font-semibold text-coral">
            ${customer.totalValue.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Total Value</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>{customer.projectsCount} project{customer.projectsCount !== 1 ? 's' : ''}</span>
          <span>•</span>
          <span className="capitalize">Source: {customer.source}</span>
          <span>•</span>
          <span>Last activity: {customer.lastActivity}</span>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            View Details
          </Button>
          <Button variant="coral" size="sm">
            Contact
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const [customers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'prospect'>('all');

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalValue, 0);
  const averageValue = totalRevenue / totalCustomers;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-space text-3xl font-semibold text-navy">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage your customer relationships</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Button variant="outline">
            Import Customers
          </Button>
          <Button variant="coral">
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
          <div className="text-2xl font-space font-semibold text-green-600">{activeCustomers}</div>
          <div className="text-sm text-muted-foreground">Active Customers</div>
        </div>
        <div className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          <div className="text-2xl font-space font-semibold text-coral">${totalRevenue.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Total Revenue</div>
        </div>
        <div className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          <div className="text-2xl font-space font-semibold text-navy">${averageValue.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Average Value</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border p-6 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-input bg-background text-foreground rounded-lg font-medium [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="prospect">Prospect</option>
          </select>
        </div>
      </div>

      {/* Customer List */}
      <div className="space-y-4">
        {filteredCustomers.map(customer => (
          <CustomerCard key={customer.id} customer={customer} />
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="bg-card border border-border p-12 text-center [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          <p className="text-muted-foreground">No customers found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}