'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@cloudreno/ui';
import { useNotificationHelpers } from '../../src/components/NotificationSystem';
import { useDealUpdates, useRealTimeUpdates } from '../../src/hooks/useRealTimeUpdates';
import SearchFilters, { useSearchFilters, filterData, FilterOption } from '../../src/components/SearchFilters';
import BulkActions, { useBulkSelection, BulkSelectCheckbox, BulkAction } from '../../src/components/BulkActions';
import Modal from '../../src/components/Modal';
import DealDetailView from '../../src/components/DealDetailView';
import ImportDealsForm from '../../src/components/ImportDealsForm';
import NewDealForm from '../../src/components/NewDealForm';
import { useLocation } from '../../src/context/LocationContext';

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
  description?: string;
  notes?: string;
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
  { id: 'proposal', name: 'Proposal', color: 'bg-coral/10 text-coral' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-coral/15 text-coral' },
  { id: 'won', name: 'Won', color: 'bg-navy/20 text-navy' },
  { id: 'lost', name: 'Lost', color: 'bg-gray-100 text-gray-800' },
];

function DealCard({ 
  deal, 
  onClick, 
  isSelected, 
  onToggleSelect,
  onDragStart,
  onDragEnd
}: { 
  deal: Deal;
  onClick: (deal: Deal) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onDragStart?: (deal: Deal) => void;
  onDragEnd?: () => void;
}) {
  const priorityColors = {
    low: 'border-l-navy/40',
    medium: 'border-l-navy/60',
    high: 'border-l-coral/60',
    urgent: 'border-l-coral'
  };

  return (
    <div 
      draggable
      onDragStart={() => onDragStart?.(deal)}
      onDragEnd={() => onDragEnd?.()}
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
  onToggleSelect,
  onDragStart,
  onDragEnd,
  onDrop,
  draggedDeal
}: { 
  stage: typeof stages[0];
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
  onAddDeal: (stage: string) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onDragStart?: (deal: Deal) => void;
  onDragEnd?: () => void;
  onDrop?: (deal: Deal, newStage: string) => void;
  draggedDeal?: Deal | null;
}) {
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggedOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggedOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggedOver(false);
    if (draggedDeal && onDrop) {
      onDrop(draggedDeal, stage.id);
    }
  };

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
      
      <div 
        className={`space-y-3 min-h-32 p-2 rounded-lg transition-colors ${
          isDraggedOver ? 'bg-coral/10 border-2 border-coral border-dashed' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {deals.map(deal => (
          <DealCard 
            key={deal.id} 
            deal={deal} 
            onClick={onDealClick}
            isSelected={selectedIds?.has(deal.id)}
            onToggleSelect={onToggleSelect}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
        {deals.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            Drop deals here or click + to add
          </div>
        )}
      </div>
    </div>
  );
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDealDetailModal, setShowDealDetailModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [newDealStage, setNewDealStage] = useState<string>('new');
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  
  // Location context
  const { selectedLocation } = useLocation();
  
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
      icon: '✓',
      variant: 'default'
    },
    {
      id: 'stage-proposal-sent',
      label: 'Send Proposal',
      icon: '→',
      variant: 'default'
    },
    {
      id: 'stage-closed-won',
      label: 'Mark Won',
      icon: '✓',
      variant: 'default'
    },
    {
      id: 'convert-to-project',
      label: 'Convert to Projects',
      icon: '→',
      variant: 'default',
      requiresConfirmation: true,
      confirmationTitle: 'Convert Deals to Projects',
      confirmationMessage: 'This will convert the selected deals to active projects and remove them from the pipeline.'
    },
    {
      id: 'export',
      label: 'Export',
      icon: '↓',
      variant: 'secondary'
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: '×',
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

  // Load deals from Supabase
  useEffect(() => {
    loadDeals();
  }, [selectedLocation]);

  const loadDeals = async () => {
    try {
      setLoading(true);
      
      let locationFilter = '';
      let queryParams: any[] = [];
      
      if (selectedLocation && selectedLocation !== 'all') {
        locationFilter = 'WHERE c.location = $1';
        queryParams = [selectedLocation];
      }
      
      const dealsData = await executeSupabaseQuery(`
        SELECT 
          d.*,
          c.name as customer_name,
          c.location as customer_location
        FROM deals d
        LEFT JOIN customers c ON d.customer_id = c.id
        ${locationFilter}
        ORDER BY d.created_at DESC
      `, queryParams);
      
      const mappedDeals: Deal[] = dealsData.map((row: any) => ({
        id: row.id,
        title: row.title,
        customer: row.customer_name || 'Unknown Customer',
        value: parseFloat(row.value) || 0,
        stage: row.stage,
        priority: row.priority,
        expectedClose: row.expected_close_date,
        source: row.source || 'unknown',
        lastActivity: row.last_activity || 'No recent activity'
      }));

      setDeals(mappedDeals);
    } catch (err) {
      setError('Failed to load deals');
      console.error('Error loading deals:', err);
    } finally {
      setLoading(false);
    }
  };

  // Execute Supabase queries using MCP
  const executeSupabaseQuery = async (sql: string, params: any[] = []): Promise<any[]> => {
    try {
      // Check if MCP function is available (only in Claude Code environment)
      if (typeof (globalThis as any).mcp__supabase__execute_sql === 'function') {
        // For parameterized queries, we need to handle parameter substitution
        let processedSql = sql;
        if (params && params.length > 0) {
          params.forEach((param, index) => {
            const placeholder = `$${index + 1}`;
            processedSql = processedSql.replace(placeholder, `'${param}'`);
          });
        }
        
        const result = await (globalThis as any).mcp__supabase__execute_sql({ query: processedSql });
        return result || [];
      } else {
        // Fallback for build environment - return mock data or empty array
        console.log('MCP function not available, using fallback data');
        return [];
      }
    } catch (error) {
      console.error('Error executing Supabase query:', error);
      throw error;
    }
  };

  // Bulk action handler for deals
  const handleBulkAction = async (actionId: string, selectedDeals: Deal[]) => {
    try {
      switch (actionId) {
        case 'stage-qualified':
          await Promise.all(
            selectedDeals.map(deal =>
              executeSupabaseQuery(
                'UPDATE deals SET stage = $2, updated_at = NOW() WHERE id = $1',
                [deal.id, 'qualified']
              )
            )
          );
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
          await Promise.all(
            selectedDeals.map(deal =>
              executeSupabaseQuery(
                'UPDATE deals SET stage = $2, updated_at = NOW() WHERE id = $1',
                [deal.id, 'proposal']
              )
            )
          );
          setDeals(prev => prev.map(d => 
            selectedDeals.some(sd => sd.id === d.id) 
              ? { ...d, stage: 'proposal' }
              : d
          ));
          selectedDeals.forEach(deal => {
            notifyDealStageChange(deal.id, deal.title, deal.stage, 'proposal');
          });
          notifySuccess('Proposals Sent', `${selectedDeals.length} proposals sent to clients`);
          break;

        case 'stage-closed-won':
          await Promise.all(
            selectedDeals.map(deal =>
              executeSupabaseQuery(
                'UPDATE deals SET stage = $2, updated_at = NOW() WHERE id = $1',
                [deal.id, 'won']
              )
            )
          );
          setDeals(prev => prev.map(d => 
            selectedDeals.some(sd => sd.id === d.id) 
              ? { ...d, stage: 'won' }
              : d
          ));
          selectedDeals.forEach(deal => {
            notifyDealStageChange(deal.id, deal.title, deal.stage, 'won');
          });
          notifySuccess('Deals Won! 🎉', `${selectedDeals.length} deals marked as won`);
          break;

        case 'convert-to-project':
          // Convert deals to projects and remove from deals table
          for (const deal of selectedDeals) {
            const projectNumber = `CR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`;
            
            // Create project from deal
            const projectResult = await executeSupabaseQuery(`
              INSERT INTO projects (
                project_number, title, description, customer_id, status, priority,
                contract_amount, start_date, expected_completion, manager, project_type
              ) 
              SELECT 
                $1, $2, $3, customer_id, 'not-started', priority,
                value, CURRENT_DATE, expected_close_date, 'TBD', 'renovation'
              FROM deals WHERE id = $4
              RETURNING id
            `, [projectNumber, deal.title, `Converted from deal: ${deal.title}`, deal.id]);
            
            // Update deal with project reference before deleting
            if (projectResult && projectResult.length > 0) {
              await executeSupabaseQuery(
                'UPDATE deals SET converted_to_project_id = $1 WHERE id = $2',
                [projectResult[0].id, deal.id]
              );
            }
            
            // Remove deal from deals table
            await executeSupabaseQuery('DELETE FROM deals WHERE id = $1', [deal.id]);
          }
          
          // Remove deals from local state
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
          await Promise.all(
            selectedDeals.map(deal =>
              executeSupabaseQuery('DELETE FROM deals WHERE id = $1', [deal.id])
            )
          );
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

  const handleNewDeal = async (dealData: any) => {
    try {
      await executeSupabaseQuery(`
        INSERT INTO deals (
          title, description, customer_id, value, stage, priority, 
          expected_close_date, source, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        dealData.title,
        dealData.description,
        dealData.customer_id,
        dealData.value,
        newDealStage,
        dealData.priority,
        dealData.expectedClose,
        dealData.source,
        dealData.notes
      ]);

      // Reload deals
      await loadDeals();
      setShowNewDealModal(false);
      setNewDealStage('new');
      
      // Notify about new deal creation
      notifyNewDeal(dealData.title, dealData.value);
      notifySuccess('Deal Created', `New deal "${dealData.title}" has been added to the pipeline`);
    } catch (err) {
      console.error('Error creating deal:', err);
      notifyError('Creation Failed', 'Failed to create deal. Please try again.');
    }
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

  const handleUpdateDeal = async (updatedDeal: Deal) => {
    try {
      const previousDeal = deals.find(d => d.id === updatedDeal.id);
      const stageChanged = previousDeal && previousDeal.stage !== updatedDeal.stage;
      
      await executeSupabaseQuery(`
        UPDATE deals 
        SET title = $2, description = $3, value = $4, stage = $5, priority = $6,
            expected_close_date = $7, source = $8, notes = $9, updated_at = NOW()
        WHERE id = $1
      `, [
        updatedDeal.id,
        updatedDeal.title,
        updatedDeal.description || '',
        updatedDeal.value,
        updatedDeal.stage,
        updatedDeal.priority,
        updatedDeal.expectedClose,
        updatedDeal.source,
        updatedDeal.notes || ''
      ]);

      // Update local state
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
    } catch (err) {
      console.error('Error updating deal:', err);
      notifyError('Update Failed', 'Failed to update deal. Please try again.');
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    try {
      const dealToDelete = deals.find(d => d.id === dealId);
      
      await executeSupabaseQuery('DELETE FROM deals WHERE id = $1', [dealId]);
      
      setDeals(prev => prev.filter(deal => deal.id !== dealId));
      setShowDealDetailModal(false);
      setSelectedDeal(null);
      
      // Notify about deletion
      if (dealToDelete) {
        notifyInfo('Deal Deleted', `"${dealToDelete.title}" has been removed from the pipeline`);
      }
    } catch (err) {
      console.error('Error deleting deal:', err);
      notifyError('Delete Failed', 'Failed to delete deal. Please try again.');
    }
  };

  const handleConvertToProject = async (deal: Deal) => {
    try {
      const projectNumber = `CR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`;
      
      // Create project from deal
      const projectResult = await executeSupabaseQuery(`
        INSERT INTO projects (
          project_number, title, description, customer_id, status, priority,
          contract_amount, start_date, expected_completion, manager, project_type
        ) 
        SELECT 
          $1, $2, $3, customer_id, 'not-started', priority,
          value, CURRENT_DATE, expected_close_date, 'TBD', 'renovation'
        FROM deals WHERE id = $4
        RETURNING id
      `, [projectNumber, deal.title, `Converted from deal: ${deal.title}`, deal.id]);
      
      // Update deal with project reference before deleting
      if (projectResult && projectResult.length > 0) {
        await executeSupabaseQuery(
          'UPDATE deals SET converted_to_project_id = $1 WHERE id = $2',
          [projectResult[0].id, deal.id]
        );
      }
      
      // Remove deal from deals table
      await executeSupabaseQuery('DELETE FROM deals WHERE id = $1', [deal.id]);
      
      // Update local state
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
    } catch (err) {
      console.error('Error converting deal to project:', err);
      notifyError('Conversion Failed', 'Failed to convert deal to project. Please try again.');
    }
  };

  const handleAddDealToStage = (stage: string) => {
    setNewDealStage(stage);
    setShowNewDealModal(true);
  };

  const handleDragStart = (deal: Deal) => {
    setDraggedDeal(deal);
  };

  const handleDragEnd = () => {
    setDraggedDeal(null);
  };

  const handleDrop = async (deal: Deal, newStage: string) => {
    if (deal.stage === newStage) return; // No change needed

    try {
      // Update database
      await executeSupabaseQuery(
        'UPDATE deals SET stage = $1, updated_at = NOW() WHERE id = $2',
        [newStage, deal.id]
      );

      // Update local state
      setDeals(prev => prev.map(d => 
        d.id === deal.id ? { ...d, stage: newStage } : d
      ));

      // Notify about stage change
      notifyDealStageChange(deal.id, deal.title, deal.stage, newStage);
      notifySuccess('Deal Updated', `"${deal.title}" moved to ${stages.find(s => s.id === newStage)?.name}`);
    } catch (err) {
      console.error('Error updating deal stage:', err);
      notifyError('Update Failed', 'Failed to update deal stage. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading deals...</p>
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
          <Button onClick={loadDeals} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

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

      {/* Sticky Search, Filters, and Stats */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border pb-6 mb-6">
        {/* Search and Filters */}
        <div className="mb-4">
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
        </div>

        {/* Bulk Actions */}
        <div className="mb-4">
          <BulkActions
            selectedItems={selectedItems}
            onClearSelection={clearSelection}
            actions={bulkActions}
            onAction={handleBulkAction}
            itemName="deals"
          />
        </div>

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
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              draggedDeal={draggedDeal}
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