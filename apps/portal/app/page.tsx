'use client'

import { Button } from '@cloudreno/ui';
import { useState } from 'react';

// Document types and data
const documentTypes = [
  { id: 'all', name: 'All Documents', count: 24 },
  { id: 'contracts', name: 'Contracts', count: 3 },
  { id: 'permits', name: 'Permits', count: 5 },
  { id: 'plans', name: 'Plans & Drawings', count: 8 },
  { id: 'invoices', name: 'Invoices', count: 6 },
  { id: 'photos', name: 'Progress Photos', count: 2 }
];

const documents = [
  {
    id: 1,
    name: 'Main Contract Agreement',
    type: 'contracts',
    size: '2.4 MB',
    uploadedBy: 'Sarah Chen',
    uploadedAt: '2024-01-15',
    status: 'signed',
    url: '#'
  },
  {
    id: 2,
    name: 'Building Permit #2024-001',
    type: 'permits',
    size: '1.2 MB',
    uploadedBy: 'City Planning Dept',
    uploadedAt: '2024-02-01',
    status: 'approved',
    url: '#'
  },
  {
    id: 3,
    name: 'Bathroom Layout v3.0',
    type: 'plans',
    size: '5.8 MB',
    uploadedBy: 'Design Team',
    uploadedAt: '2024-01-20',
    status: 'current',
    url: '#'
  },
  {
    id: 4,
    name: 'Electrical Schematic',
    type: 'plans',
    size: '3.1 MB',
    uploadedBy: 'Mike Thompson',
    uploadedAt: '2024-02-10',
    status: 'current',
    url: '#'
  },
  {
    id: 5,
    name: 'Invoice #INV-001',
    type: 'invoices',
    size: '892 KB',
    uploadedBy: 'Billing System',
    uploadedAt: '2024-02-15',
    status: 'paid',
    url: '#'
  },
  {
    id: 6,
    name: 'Plumbing Rough-in Photos',
    type: 'photos',
    size: '12.3 MB',
    uploadedBy: 'Tom Rodriguez',
    uploadedAt: '2024-08-06',
    status: 'new',
    url: '#'
  }
];

// Change Order data
const changeOrders = [
  {
    id: 'CO-001',
    title: 'Add Recessed Lighting in Hallway',
    description: 'Customer requested additional recessed lighting fixtures in the hallway leading to the bathroom. Includes 4 LED recessed lights with dimmer switch.',
    amount: 850.00,
    status: 'approved',
    requestedDate: '2024-08-01',
    approvedDate: '2024-08-07',
    requestedBy: 'Sarah Chen - Project Manager'
  },
  {
    id: 'CO-002',
    title: 'Upgrade to Premium Tile',
    description: 'Change from standard ceramic tile to premium porcelain tile with marble look finish. Applies to both floor and shower walls.',
    amount: 1250.00,
    status: 'pending',
    requestedDate: '2024-08-08',
    requestedBy: 'Design Team'
  },
  {
    id: 'CO-003',
    title: 'Additional Electrical Outlet',
    description: 'Add GFCI outlet near vanity for hair dryer/styling tools. Required due to updated electrical code requirements.',
    amount: 175.00,
    status: 'approved',
    requestedDate: '2024-07-28',
    approvedDate: '2024-07-30',
    requestedBy: 'Mike Thompson - Electrician'
  }
];

// Photo Gallery data
const photoCategories = [
  { id: 'all', name: 'All Photos', count: 45 },
  { id: 'before', name: 'Before', count: 8 },
  { id: 'progress', name: 'Progress', count: 28 },
  { id: 'after', name: 'After', count: 0 },
  { id: 'materials', name: 'Materials', count: 9 }
];

const photos = [
  {
    id: 1,
    src: '/api/placeholder/400/300',
    title: 'Original Bathroom - Before Demolition',
    category: 'before',
    date: '2024-02-18',
    uploadedBy: 'Sarah Chen',
    phase: 'Planning'
  },
  {
    id: 2,
    src: '/api/placeholder/400/300',
    title: 'Demolition Complete',
    category: 'progress',
    date: '2024-02-25',
    uploadedBy: 'Demo Team',
    phase: 'Demolition'
  },
  {
    id: 3,
    src: '/api/placeholder/400/300',
    title: 'Plumbing Rough-in Progress',
    category: 'progress',
    date: '2024-03-05',
    uploadedBy: 'Tom Rodriguez',
    phase: 'Rough-in Work'
  },
  {
    id: 4,
    src: '/api/placeholder/400/300',
    title: 'Electrical Wiring Complete',
    category: 'progress',
    date: '2024-08-09',
    uploadedBy: 'Mike Thompson',
    phase: 'Rough-in Work'
  },
  {
    id: 5,
    src: '/api/placeholder/400/300',
    title: 'Premium Tile Samples',
    category: 'materials',
    date: '2024-08-08',
    uploadedBy: 'Design Team',
    phase: 'Materials'
  },
  {
    id: 6,
    src: '/api/placeholder/400/300',
    title: 'Vanity Installation Progress',
    category: 'progress',
    date: '2024-08-10',
    uploadedBy: 'Installation Team',
    phase: 'Finishes'
  }
];

// Invoice data
const invoices = [
  {
    id: 'INV-2024-001',
    title: 'Initial Project Payment',
    description: 'Down payment for bathroom renovation project',
    amount: 12500.00,
    dueDate: '2024-02-01',
    paidDate: '2024-01-28',
    status: 'paid',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'INV-2024-002',
    title: 'Materials & Permits',
    description: 'Cost for materials procurement and building permits',
    amount: 8750.00,
    dueDate: '2024-03-01',
    paidDate: '2024-02-28',
    status: 'paid',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'INV-2024-003',
    title: 'Mid-Project Payment',
    description: 'Payment for completed demolition and rough-in work',
    amount: 9500.00,
    dueDate: '2024-08-15',
    status: 'pending',
    paymentMethod: null
  },
  {
    id: 'INV-2024-004',
    title: 'Final Payment',
    description: 'Final payment upon project completion and inspection',
    amount: 6250.00,
    dueDate: '2024-04-15',
    status: 'upcoming',
    paymentMethod: null
  }
];

// Invoice Manager Component
function InvoiceManager() {
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-300';
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handlePayNow = (invoiceId: string) => {
    console.log('Processing payment for:', invoiceId);
    // Redirect to Stripe payment or show payment modal
  };

  const totalProject = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingPayments = invoices.filter(inv => inv.status === 'pending');

  return (
    <div className="space-y-8">
      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border rounded-lg p-6 [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
          <h3 className="font-space text-lg font-medium text-navy mb-2">Total Project</h3>
          <div className="text-2xl font-bold text-navy">${totalProject.toLocaleString()}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
          <h3 className="font-space text-lg font-medium text-green-800 mb-2">Paid</h3>
          <div className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
          <h3 className="font-space text-lg font-medium text-yellow-800 mb-2">Remaining</h3>
          <div className="text-2xl font-bold text-yellow-600">${(totalProject - totalPaid).toLocaleString()}</div>
        </div>
      </div>

      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <div>
          <h3 className="font-space text-xl font-medium text-navy mb-6">Pending Payments</h3>
          <div className="space-y-4">
            {pendingPayments.map((invoice) => (
              <div key={invoice.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-space text-lg font-medium text-navy mb-2">{invoice.title}</h4>
                    <p className="text-muted-foreground mb-2">{invoice.description}</p>
                    <div className="text-sm text-muted-foreground">
                      Due: {invoice.dueDate}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-coral mb-2">
                      ${invoice.amount.toLocaleString()}
                    </div>
                    <div className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                      Payment Due
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => handlePayNow(invoice.id)}
                    className="bg-coral hover:bg-coral-dark text-white px-6"
                  >
                    💳 Pay Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(`/invoices/${invoice.id}.pdf`, '_blank')}
                  >
                    📄 Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedInvoice(selectedInvoice === invoice.id ? null : invoice.id)}
                  >
                    {selectedInvoice === invoice.id ? 'Hide Details' : 'View Details'}
                  </Button>
                </div>

                {selectedInvoice === invoice.id && (
                  <div className="mt-6 pt-6 border-t border-yellow-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-navy mb-2">Payment Options</h5>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start">
                            💳 Credit/Debit Card
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            🏛️ Bank Transfer
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            📱 Digital Wallet
                          </Button>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-navy mb-2">Invoice Details</h5>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>Invoice ID: {invoice.id}</div>
                          <div>Due Date: {invoice.dueDate}</div>
                          <div>Amount: ${invoice.amount.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div>
        <h3 className="font-space text-xl font-medium text-navy mb-6">Payment History</h3>
        <div className="space-y-4">
          {invoices.filter(inv => inv.status === 'paid').map((invoice) => (
            <div key={invoice.id} className="bg-white border rounded-lg p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-navy mb-1">{invoice.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{invoice.description}</p>
                  <div className="text-sm text-muted-foreground">
                    Paid: {invoice.paidDate} via {invoice.paymentMethod}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-green-600 mb-1">
                    ${invoice.amount.toLocaleString()}
                  </div>
                  <div className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                    Paid
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Payments */}
      {invoices.filter(inv => inv.status === 'upcoming').length > 0 && (
        <div>
          <h3 className="font-space text-xl font-medium text-navy mb-6">Upcoming Payments</h3>
          <div className="space-y-4">
            {invoices.filter(inv => inv.status === 'upcoming').map((invoice) => (
              <div key={invoice.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-navy mb-1">{invoice.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{invoice.description}</p>
                    <div className="text-sm text-muted-foreground">
                      Expected: {invoice.dueDate}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold text-blue-600 mb-1">
                      ${invoice.amount.toLocaleString()}
                    </div>
                    <div className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                      Upcoming
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Photo Gallery Component
function PhotoGallery() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const filteredPhotos = photos.filter(photo => 
    selectedCategory === 'all' || photo.category === selectedCategory
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      // Simulate upload
      setTimeout(() => {
        setIsUploading(false);
        console.log('Files uploaded:', Array.from(files).map(f => f.name));
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-coral/5 border border-coral/20 rounded-lg p-6 [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
        <h3 className="font-space text-lg font-medium text-navy mb-4">Upload Photos</h3>
        <div className="border-2 border-dashed border-coral/30 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">📸</div>
          <h4 className="font-medium text-navy mb-2">Drop photos here or click to browse</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Upload progress photos, materials, or other project images
          </p>
          <input
            type="file"
            id="photo-upload"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button 
            onClick={() => document.getElementById('photo-upload')?.click()}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Choose Files'}
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto">
        {photoCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category.id
                ? 'bg-coral text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPhotos.map((photo) => (
          <div 
            key={photo.id} 
            className="group cursor-pointer"
            onClick={() => setSelectedPhoto(photo.id)}
          >
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
              <img
                src={photo.src}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="mt-2">
              <h4 className="font-medium text-navy text-sm line-clamp-2">{photo.title}</h4>
              <div className="text-xs text-muted-foreground mt-1">
                {photo.phase} • {photo.date}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📷</div>
          <h3 className="font-space text-lg font-medium text-navy mb-2">No Photos Yet</h3>
          <p className="text-muted-foreground">No photos found in this category</p>
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-4xl max-h-full bg-white rounded-lg overflow-hidden [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
            {(() => {
              const photo = photos.find(p => p.id === selectedPhoto);
              if (!photo) return null;
              
              return (
                <div className="relative">
                  <img
                    src={photo.src}
                    alt={photo.title}
                    className="w-full max-h-[70vh] object-contain"
                  />
                  <div className="p-6">
                    <h3 className="font-space text-xl font-medium text-navy mb-2">
                      {photo.title}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>Phase: {photo.phase}</div>
                      <div>Date: {photo.date}</div>
                      <div>Category: {photo.category}</div>
                      <div>By: {photo.uploadedBy}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="absolute top-4 right-4 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70"
                  >
                    ✕
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

// Change Order Manager Component
function ChangeOrderManager() {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleApprove = (orderId: string) => {
    console.log('Approving change order:', orderId);
    // Update change order status to approved
  };

  const handleReject = (orderId: string) => {
    console.log('Rejecting change order:', orderId);
    // Update change order status to rejected
  };

  const pendingOrders = changeOrders.filter(order => order.status === 'pending');
  const completedOrders = changeOrders.filter(order => order.status !== 'pending');

  return (
    <div className="space-y-8">
      {/* Pending Approvals */}
      {pendingOrders.length > 0 && (
        <div>
          <h3 className="font-space text-xl font-medium text-navy mb-6">Pending Your Approval</h3>
          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <div key={order.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-space text-lg font-medium text-navy mb-2">{order.title}</h4>
                    <div className="text-sm text-muted-foreground mb-2">
                      {order.id} • Requested by {order.requestedBy} on {order.requestedDate}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-coral mb-1">
                      +${order.amount.toLocaleString()}
                    </div>
                    <div className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${getStatusColor(order.status)}`}>
                      Pending Approval
                    </div>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-6">{order.description}</p>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApprove(order.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6"
                  >
                    ✓ Approve Change Order
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleReject(order.id)}
                    className="border-red-300 text-red-700 hover:bg-red-50 px-6"
                  >
                    ✗ Reject
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                  >
                    {selectedOrder === order.id ? 'Hide Details' : 'View Details'}
                  </Button>
                </div>

                {selectedOrder === order.id && (
                  <div className="mt-6 pt-6 border-t border-yellow-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-navy mb-2">Cost Breakdown</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Labor</span>
                            <span>$450.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Materials</span>
                            <span>$350.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Permits</span>
                            <span>$50.00</span>
                          </div>
                          <div className="flex justify-between font-medium border-t pt-1">
                            <span>Total</span>
                            <span>${order.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-navy mb-2">Impact</h5>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>Timeline: +2 days</div>
                          <div>Phase: Current (Rough-in Work)</div>
                          <div>Dependencies: None</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Change Order History */}
      <div>
        <h3 className="font-space text-xl font-medium text-navy mb-6">Change Order History</h3>
        <div className="space-y-4">
          {completedOrders.map((order) => (
            <div key={order.id} className="bg-white border rounded-lg p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-navy mb-1">{order.title}</h4>
                  <div className="text-sm text-muted-foreground mb-2">
                    {order.id} • {order.requestedBy}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{order.description}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-coral mb-1">
                    +${order.amount.toLocaleString()}
                  </div>
                  <div className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {order.status === 'approved' ? 'Approved' : order.status}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {order.status === 'approved' && order.approvedDate && `Approved: ${order.approvedDate}`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-6 [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
        <h3 className="font-space text-lg font-medium text-navy mb-4">Change Order Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-2xl font-bold text-coral">
              ${changeOrders.reduce((sum, order) => sum + order.amount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Change Orders</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {changeOrders.filter(order => order.status === 'approved').length}
            </div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {changeOrders.filter(order => order.status === 'pending').length}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Document Viewer Component
function DocumentViewer() {
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocuments = documents.filter(doc => {
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed': case 'approved': case 'paid': return 'bg-green-100 text-green-800';
      case 'current': return 'bg-blue-100 text-blue-800';
      case 'new': return 'bg-coral/10 text-coral';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'contracts': return '📄';
      case 'permits': return '📋';
      case 'plans': return '📐';
      case 'invoices': return '🧾';
      case 'photos': return '📸';
      default: return '📄';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {documentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedType === type.id
                  ? 'bg-coral text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.name} ({type.count})
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="text-2xl">{getFileIcon(doc.type)}</div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(doc.status)}`}>
                {doc.status}
              </div>
            </div>
            <h4 className="font-medium text-navy mb-2 line-clamp-2">{doc.name}</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div>Size: {doc.size}</div>
              <div>By: {doc.uploadedBy}</div>
              <div>Date: {doc.uploadedAt}</div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-xs"
                onClick={() => window.open(doc.url, '_blank')}
              >
                View
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-xs"
                onClick={() => {
                  // Download logic here
                  console.log('Download:', doc.name);
                }}
              >
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="font-space text-lg font-medium text-navy mb-2">No Documents Found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? 'Try adjusting your search terms' : 'No documents match the selected filter'}
          </p>
        </div>
      )}
    </div>
  );
}

const projectPhases = [
  { 
    id: 'planning', 
    name: 'Planning & Design', 
    status: 'completed', 
    progress: 100, 
    startDate: '2024-01-15',
    endDate: '2024-02-01'
  },
  { 
    id: 'permits', 
    name: 'Permits & Approvals', 
    status: 'completed', 
    progress: 100, 
    startDate: '2024-02-01',
    endDate: '2024-02-15'
  },
  { 
    id: 'demolition', 
    name: 'Demolition', 
    status: 'completed', 
    progress: 100, 
    startDate: '2024-02-20',
    endDate: '2024-02-25'
  },
  { 
    id: 'rough-in', 
    name: 'Rough-in Work', 
    status: 'in-progress', 
    progress: 65, 
    startDate: '2024-02-26',
    endDate: '2024-03-15'
  },
  { 
    id: 'finishes', 
    name: 'Finishes & Fixtures', 
    status: 'pending', 
    progress: 0, 
    startDate: '2024-03-16',
    endDate: '2024-04-05'
  },
  { 
    id: 'final', 
    name: 'Final Inspection', 
    status: 'pending', 
    progress: 0, 
    startDate: '2024-04-06',
    endDate: '2024-04-10'
  }
];

const recentActivity = [
  {
    id: 1,
    type: 'milestone',
    title: 'Electrical rough-in completed',
    description: 'All electrical wiring and outlets installed',
    date: '2024-08-09',
    time: '2:30 PM',
    user: 'Mike Thompson - Lead Electrician'
  },
  {
    id: 2,
    type: 'photo',
    title: 'Progress photos uploaded',
    description: '8 new photos showing electrical work',
    date: '2024-08-09',
    time: '11:15 AM',
    user: 'Sarah Chen - Project Manager'
  },
  {
    id: 3,
    type: 'document',
    title: 'Plumbing inspection passed',
    description: 'City inspector approved all plumbing work',
    date: '2024-08-08',
    time: '4:45 PM',
    user: 'City Inspector'
  },
  {
    id: 4,
    type: 'change-order',
    title: 'Change order approved',
    description: 'Added recessed lighting in hallway',
    date: '2024-08-07',
    time: '10:20 AM',
    user: 'You'
  },
  {
    id: 5,
    type: 'update',
    title: 'Drywall installation started',
    description: 'Team began drywall installation in main bathroom',
    date: '2024-08-06',
    time: '8:00 AM',
    user: 'Tom Rodriguez - Drywall Contractor'
  }
];

const tabs = [
  { id: 'timeline', name: 'Timeline', icon: '📅' },
  { id: 'documents', name: 'Documents', icon: '📄' },
  { id: 'change-orders', name: 'Change Orders', icon: '📝' },
  { id: 'photos', name: 'Photos', icon: '📸' },
  { id: 'invoices', name: 'Invoices', icon: '💰' }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('timeline');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'in-progress': return 'bg-coral text-white border-coral';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'milestone': return '🎯';
      case 'photo': return '📸';
      case 'document': return '📄';
      case 'change-order': return '📝';
      case 'update': return '🔄';
      default: return '📌';
    }
  };

  return (
    <div className="container-custom section-padding">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-space text-3xl font-semibold text-navy mb-2">
          Bathroom Renovation Project
        </h1>
        <p className="text-lg text-muted-foreground">
          Track your project progress, view updates, and manage documents
        </p>
      </div>
      
      {/* Project Overview Card */}
      <div className="glass rounded-lg [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)] mb-8">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-space text-lg font-medium text-navy mb-2">Project Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Overall Progress</span>
                  <span className="text-sm font-medium text-coral">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-coral-gradient h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-space text-lg font-medium text-navy mb-2">Timeline</h4>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Started: Feb 20, 2024</div>
                <div className="text-sm text-muted-foreground">Expected completion: Apr 10, 2024</div>
              </div>
            </div>
            <div>
              <h4 className="font-space text-lg font-medium text-navy mb-2">Current Phase</h4>
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor('in-progress')}`}>
                Rough-in Work
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)] shadow-sm">
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-coral text-coral'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'timeline' && (
            <div className="space-y-8">
              {/* Project Phases */}
              <div>
                <h3 className="font-space text-xl font-medium text-navy mb-6">Project Phases</h3>
                <div className="space-y-4">
                  {projectPhases.map((phase, index) => (
                    <div key={phase.id} className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        phase.status === 'completed' ? 'bg-green-500' :
                        phase.status === 'in-progress' ? 'bg-coral' : 'bg-gray-300'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-navy">{phase.name}</h4>
                          <div className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(phase.status)}`}>
                            {phase.status === 'in-progress' ? 'In Progress' : 
                             phase.status === 'completed' ? 'Completed' : 'Pending'}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{phase.startDate} - {phase.endDate}</span>
                          <span>{phase.progress}% complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                          <div 
                            className={`h-1.5 rounded-full ${
                              phase.status === 'completed' ? 'bg-green-500' :
                              phase.status === 'in-progress' ? 'bg-coral-gradient' : 'bg-gray-300'
                            }`}
                            style={{ width: `${phase.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="font-space text-xl font-medium text-navy mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-navy">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>{activity.date} at {activity.time}</span>
                          <span>•</span>
                          <span>{activity.user}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <DocumentViewer />
          )}

          {activeTab === 'change-orders' && (
            <ChangeOrderManager />
          )}

          {activeTab === 'photos' && (
            <PhotoGallery />
          )}

          {activeTab === 'invoices' && (
            <InvoiceManager />
          )}
        </div>
      </div>
    </div>
  );
}