'use client';

import { useState, useMemo } from 'react';
import { Button } from '@cloudreno/ui';
import { useNotificationHelpers } from '../../src/components/NotificationSystem';
import { useDealUpdates, useRealTimeUpdates } from '../../src/hooks/useRealTimeUpdates';
import SearchFilters, { useSearchFilters, filterData, FilterOption } from '../../src/components/SearchFilters';
import BulkActions, { useBulkSelection, BulkSelectCheckbox, BulkAction } from '../../src/components/BulkActions';
import Modal from '../../src/components/Modal';
import DealDetailView from '../../src/components/DealDetailView';
import ImportDealsForm from '../../src/components/ImportDealsForm';
import NewDealForm from '../../src/components/NewDealForm';

type Deal = {
  id: string;
  title: string;
  customer: string;
  value: number;
  stage: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expectedClose: string;
  source: string;
  lastActivity: string;
};

const mockDeals: Deal[] = [
  {
    id: '1',
    title: 'Kitchen Renovation - Doe Residence',
    customer: 'John & Jane Doe',
    value: 35000,
    stage: 'new',
    priority: 'high',
    expectedClose: '2025-09-15',
    source: 'website',
    lastActivity: '2 hours ago'
  },
  {
    id: '2',
    title: 'Bathroom Remodel - Smith Home',
    customer: 'Bob Smith',
    value: 18000,
    stage: 'qualified',
    priority: 'medium',
    expectedClose: '2025-10-01',
    source: 'design-library',
    lastActivity: '1 day ago'
  },
  {
    id: '3',
    title: 'Master Suite Addition',
    customer: 'Alice Wong',
    value: 75000,
    stage: 'estimating',
    priority: 'urgent',
    expectedClose: '2025-08-20',
    source: 'referral',
    lastActivity: '30 minutes ago'
  },
  {
    id: '4',
    title: 'Guest Bath Renovation',
    customer: 'Mike & Sarah Chen',
    value: 12000,
    stage: 'proposal-sent',
    priority: 'low',
    expectedClose: '2025-09-30',
    source: 'website',
    lastActivity: '3 days ago'
  },
];

const stages = [
  { id: 'new', name: 'New', color: 'bg-navy/10 text-navy' },
  { id: 'qualified', name: 'Qualified', color: 'bg-navy/15 text-navy' },
  { id: 'estimating', name: 'Estimating', color: 'bg-coral/10 text-coral' },
  { id: 'proposal-sent', name: 'Proposal Sent', color: 'bg-coral/15 text-coral' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-coral/20 text-coral' },
  { id: 'closed-won', name: 'Closed Won', color: 'bg-navy/20 text-navy' },
];

function DealCard({ 
  deal, 
  onClick, 
  isSelected, 
  onToggleSelect 
}: { 
  deal: Deal;
  onClick: (deal: Deal) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}) {
  const priorityColors = {
    low: 'border-l-navy/40',
    medium: 'border-l-navy/60',
    high: 'border-l-coral/60',
    urgent: 'border-l-coral'
  };

  return (
    <div 
      className={`bg-card border border-border p-4 border-l-4 ${priorityColors[deal.priority]} [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)] hover:shadow-md transition-shadow cursor-pointer ${
        isSelected ? 'ring-2 ring-coral bg-coral/5' : ''
      }`}
      onClick={() => onClick(deal)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          {onToggleSelect && (
            <BulkSelectCheckbox
              checked={isSelected || false}
              onChange={() => onToggleSelect(deal.id)}
              className="mr-2"
            />
          )}
          <h4 className="font-space font-medium text-navy text-sm leading-tight">{deal.title}</h4>
        </div>
        <span className="text-xs text-muted-foreground capitalize">{deal.priority}</span>
      </div>
      
      <div className="space-y-2 mb-3">
        <p className="text-sm text-foreground font-medium">{deal.customer}</p>
        <p className="text-lg font-space font-semibold text-coral">
          ${deal.value.toLocaleString()}
        </p>
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Close:</span>
          <span>{new Date(deal.expectedClose).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Source:</span>
          <span className="capitalize">{deal.source}</span>
        </div>
        <div className="mt-2 pt-2 border-t border-border">
          <span>{deal.lastActivity}</span>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ 
  stage, 
  deals, 
  onDealClick, 
  onAddDeal,
  selectedIds,
  onToggleSelect 
}: { 
  stage: typeof stages[0];
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
  onAddDeal: (stage: string) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
}) {
  return (
    <div className="flex-1 min-w-80">
      <div className="bg-muted p-3 mb-4 [clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)]">
        <div className="flex items-center justify-between">
          <h3 className="font-space font-medium text-foreground">{stage.name}</h3>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full ${stage.color} font-medium`}>
              {deals.length}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 hover:bg-coral/10"
              onClick={() => onAddDeal(stage.id)}
            >
              +
            </Button>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {deals.map(deal => (
          <DealCard 
            key={deal.id} 
            deal={deal} 
            onClick={onDealClick}
            isSelected={selectedIds?.has(deal.id)}
            onToggleSelect={onToggleSelect}
          />
        ))}
      </div>
    </div>
  );
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDealDetailModal, setShowDealDetailModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [newDealStage, setNewDealStage] = useState<string>('new');
  
  // Real-time updates and notifications
  const { notifySuccess, notifyInfo, notifyError } = useNotificationHelpers();
  const { isConnected } = useRealTimeUpdates({ enabled: true });
  const { notifyDealStageChange, notifyNewDeal } = useDealUpdates();

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

  // Define filter options for deals
  const filterOptions: FilterOption[] = [
    {
      id: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
      ]
    },
    {
      id: 'source',
      label: 'Lead Source',
      type: 'select',
      options: [
        { value: 'website', label: 'Website' },
        { value: 'referral', label: 'Referral' },
        { value: 'design-library', label: 'Design Library' },
        { value: 'social-media', label: 'Social Media' },
        { value: 'advertising', label: 'Advertising' }
      ]
    },
    {
      id: 'value',
      label: 'Deal Value ($)',
      type: 'number',
      min: 0,
      max: 500000
    },
    {
      id: 'expectedClose',
      label: 'Expected Close Date',
      type: 'daterange'
    }
  ];

  // Filter and search deals
  const filteredDeals = useMemo(() => {
    return filterData(
      deals,
      searchTerm,
      activeFilters,
      ['title', 'customer', 'source']
    );
  }, [deals, searchTerm, activeFilters]);

  // Bulk selection state
  const {
    selectedIds,
    selectedItems,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    toggleAll,
    clearSelection
  } = useBulkSelection(filteredDeals);

  // Define bulk actions for deals
  const bulkActions: BulkAction[] = [
    {
      id: 'stage-qualified',
      label: 'Mark Qualified',
      icon: '✅',
      variant: 'default'
    },
    {
      id: 'stage-proposal-sent',
      label: 'Send Proposal',
      icon: '📄',
      variant: 'default'
    },
    {
      id: 'stage-closed-won',
      label: 'Mark Won',
      icon: '🎉',
      variant: 'default'
    },
    {
      id: 'convert-to-project',
      label: 'Convert to Projects',
      icon: '🚀',
      variant: 'default',
      requiresConfirmation: true,
      confirmationTitle: 'Convert Deals to Projects',
      confirmationMessage: 'This will convert the selected deals to active projects and remove them from the pipeline.'
    },
    {
      id: 'export',
      label: 'Export',
      icon: '📊',
      variant: 'secondary'
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: '🗑️',
      variant: 'destructive',
      requiresConfirmation: true,
      confirmationTitle: 'Delete Deals',
      confirmationMessage: 'Are you sure you want to delete the selected deals? This action cannot be undone.'
    }
  ];

  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = filteredDeals.filter(deal => deal.stage === stage.id);
    return acc;
  }, {} as Record<string, Deal[]>);

  const totalValue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0);
  const averageValue = filteredDeals.length > 0 ? totalValue / filteredDeals.length : 0;

  // Bulk action handler for deals
  const handleBulkAction = async (actionId: string, selectedDeals: Deal[]) => {
    try {
      switch (actionId) {
        case 'stage-qualified':
          setDeals(prev => prev.map(d => 
            selectedDeals.some(sd => sd.id === d.id) 
              ? { ...d, stage: 'qualified' }
              : d
          ));
          selectedDeals.forEach(deal => {
            notifyDealStageChange(deal.id, deal.title, deal.stage, 'qualified');
          });
          notifySuccess('Deals Updated', `${selectedDeals.length} deals marked as qualified`);
          break;

        case 'stage-proposal-sent':
          setDeals(prev => prev.map(d => 
            selectedDeals.some(sd => sd.id === d.id) 
              ? { ...d, stage: 'proposal-sent' }
              : d
          ));
          selectedDeals.forEach(deal => {
            notifyDealStageChange(deal.id, deal.title, deal.stage, 'proposal-sent');
          });
          notifySuccess('Proposals Sent', `${selectedDeals.length} proposals sent to clients`);
          break;

        case 'stage-closed-won':
          setDeals(prev => prev.map(d => 
            selectedDeals.some(sd => sd.id === d.id) 
              ? { ...d, stage: 'closed-won' }
              : d
          ));
          selectedDeals.forEach(deal => {
            notifyDealStageChange(deal.id, deal.title, deal.stage, 'closed-won');
          });
          notifySuccess('Deals Won! 🎉', `${selectedDeals.length} deals marked as won`);
          break;

        case 'convert-to-project':
          // Remove deals from pipeline
          setDeals(prev => prev.filter(d => !selectedDeals.some(sd => sd.id === d.id)));
          selectedDeals.forEach(deal => {
            notifySuccess(
              'Deal Converted! 🚀', 
              `"${deal.title}" has been converted to a project`
            );
          });
          break;

        case 'export':
          const csvContent = selectedDeals.map(d => 
            `"${d.title}","${d.customer}","${d.value}","${d.stage}","${d.priority}","${d.source}","${new Date(d.expectedClose).toLocaleDateString()}"`
          ).join('\n');
          const header = 'Title,Customer,Value,Stage,Priority,Source,Expected Close\n';
          const blob = new Blob([header + csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `deals-export-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
          notifySuccess('Export Complete', `${selectedDeals.length} deals exported to CSV`);
          break;

        case 'delete':
          setDeals(prev => prev.filter(d => !selectedDeals.some(sd => sd.id === d.id)));
          notifyInfo('Deals Deleted', `${selectedDeals.length} deals removed from pipeline`);
          break;

        default:
          console.warn('Unknown bulk action:', actionId);
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
      notifyError('Action Failed', 'Failed to complete bulk action. Please try again.');
    }
  };

  const handleNewDeal = (dealData: any) => {
    const newDeal = {
      ...dealData,
      id: `deal-${Date.now()}`,
      stage: newDealStage,
      lastActivity: 'just now'
    };
    setDeals(prev => [...prev, newDeal]);
    setShowNewDealModal(false);
    setNewDealStage('new');
    
    // Notify about new deal creation
    notifyNewDeal(newDeal.title, newDeal.value);
    notifySuccess('Deal Created', `New deal "${newDeal.title}" has been added to the pipeline`);
  };

  const handleImportDeals = (importedDeals: Deal[]) => {
    setDeals(prev => [...prev, ...importedDeals]);
    setShowImportModal(false);
    
    // Notify about import
    notifySuccess('Deals Imported', `Successfully imported ${importedDeals.length} deals`);
  };

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setShowDealDetailModal(true);
  };

  const handleUpdateDeal = (updatedDeal: Deal) => {
    const previousDeal = deals.find(d => d.id === updatedDeal.id);
    const stageChanged = previousDeal && previousDeal.stage !== updatedDeal.stage;
    
    setDeals(prev => prev.map(deal => 
      deal.id === updatedDeal.id ? updatedDeal : deal
    ));
    setSelectedDeal(updatedDeal);
    
    // Notify about stage changes
    if (stageChanged && previousDeal) {
      notifyDealStageChange(
        updatedDeal.id, 
        updatedDeal.title, 
        previousDeal.stage, 
        updatedDeal.stage
      );
    }
    
    // General update notification
    notifySuccess('Deal Updated', `${updatedDeal.title} has been updated successfully`);
  };

  const handleDeleteDeal = (dealId: string) => {
    const dealToDelete = deals.find(d => d.id === dealId);
    setDeals(prev => prev.filter(deal => deal.id !== dealId));
    setShowDealDetailModal(false);
    setSelectedDeal(null);
    
    // Notify about deletion
    if (dealToDelete) {
      notifyInfo('Deal Deleted', `"${dealToDelete.title}" has been removed from the pipeline`);
    }
  };

  const handleConvertToProject = (deal: Deal) => {
    // In a real app, this would create a project and remove the deal
    setDeals(prev => prev.filter(d => d.id !== deal.id));
    setShowDealDetailModal(false);
    setSelectedDeal(null);
    
    // Notify about successful conversion
    notifySuccess(
      'Deal Converted! 🎉', 
      `"${deal.title}" has been converted to a project and moved to the Projects section`
    );
    
    // Also trigger deal stage change to 'won'
    notifyDealStageChange(deal.id, deal.title, deal.stage, 'won');
  };

  const handleAddDealToStage = (stage: string) => {
    setNewDealStage(stage);
    setShowNewDealModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-space text-3xl font-semibold text-navy">Deals Pipeline</h1>
          <p className="text-muted-foreground mt-1">Manage your renovation project opportunities</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Button variant="outline" onClick={() => setShowImportModal(true)}>
            Import Deals
          </Button>
          <Button variant="coral" onClick={() => setShowNewDealModal(true)}>
            + New Deal
          </Button>
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
        itemName="deals"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          <div className="text-2xl font-space font-semibold text-navy">{filteredDeals.length}</div>
          <div className="text-sm text-muted-foreground">
            {searchTerm || Object.keys(activeFilters).length > 0 ? 'Filtered Deals' : 'Active Deals'}
          </div>
        </div>
        <div className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          <div className="text-2xl font-space font-semibold text-coral">${totalValue.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Total Pipeline Value</div>
        </div>
        <div className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          <div className="text-2xl font-space font-semibold text-navy">${averageValue.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Average Deal Size</div>
        </div>
        <div className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          <div className="text-2xl font-space font-semibold text-navy">78%</div>
          <div className="text-sm text-muted-foreground">Close Rate</div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="bg-background border border-border p-6 [clip-path:polygon(0.8rem_0%,100%_0%,100%_calc(100%-0.8rem),calc(100%-0.8rem)_100%,0%_100%,0%_0.8rem)]">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map(stage => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              deals={dealsByStage[stage.id] || []}
              onDealClick={handleDealClick}
              onAddDeal={handleAddDealToStage}
              selectedIds={selectedIds}
              onToggleSelect={toggleItem}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <Modal 
        isOpen={showNewDealModal} 
        onClose={() => {
          setShowNewDealModal(false);
          setNewDealStage('new');
        }} 
        title="Create New Deal"
        size="lg"
      >
        <NewDealForm 
          onSubmit={handleNewDeal}
          onCancel={() => {
            setShowNewDealModal(false);
            setNewDealStage('new');
          }}
          initialStage={newDealStage}
        />
      </Modal>

      <Modal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)} 
        title="Import Deals"
        size="xl"
      >
        <ImportDealsForm 
          onImport={handleImportDeals}
          onCancel={() => setShowImportModal(false)}
        />
      </Modal>

      {selectedDeal && (
        <Modal 
          isOpen={showDealDetailModal} 
          onClose={() => {
            setShowDealDetailModal(false);
            setSelectedDeal(null);
          }} 
          title={`Deal Details: ${selectedDeal.title}`}
          size="xl"
        >
          <DealDetailView 
            deal={selectedDeal}
            onClose={() => {
              setShowDealDetailModal(false);
              setSelectedDeal(null);
            }}
            onUpdate={handleUpdateDeal}
            onDelete={handleDeleteDeal}
            onConvertToProject={handleConvertToProject}
          />
        </Modal>
      )}
    </div>
  );
}