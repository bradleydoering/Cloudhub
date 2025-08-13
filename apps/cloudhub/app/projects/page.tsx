'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@cloudreno/ui';
import { useNotificationHelpers } from '../../src/components/NotificationSystem';
import { useProjectUpdates, useRealTimeUpdates } from '../../src/hooks/useRealTimeUpdates';
import { useErrorHandling } from '../../src/hooks/useErrorHandling';
import { ApiErrorHandler } from '../../src/utils/apiErrorHandler';
import { LoadingSpinner, LoadingCard, LoadingOverlay, SkeletonCard, useLoadingState } from '../../src/components/LoadingStates';
import ErrorBoundary from '../../src/components/ErrorBoundary';
import SearchFilters, { useSearchFilters, filterData, FilterOption } from '../../src/components/SearchFilters';
import BulkActions, { useBulkSelection, BulkSelectCheckbox, BulkAction } from '../../src/components/BulkActions';
import ProjectDetailView from '../../src/components/ProjectDetailView';
import DocumentManager from '../../src/components/DocumentManager';
import ChangeOrderManager from '../../src/components/ChangeOrderManager';
import PhotoGalleryManager from '../../src/components/PhotoGalleryManager';
import InvoiceManager from '../../src/components/InvoiceManager';
import NewProjectForm from '../../src/components/NewProjectForm';
import { ProjectWithCustomer, ProjectDetails } from '../../src/types/database';
import { useLocation } from '../../src/context/LocationContext';

const tabs = [
  { id: 'overview', name: 'Overview' },
  { id: 'timeline', name: 'Timeline' },
  { id: 'documents', name: 'Documents' },
  { id: 'change-orders', name: 'Change Orders' },
  { id: 'photos', name: 'Photos' },
  { id: 'invoices', name: 'Invoices & Payments' },
];

function ProjectCard({ 
  project, 
  onSelect, 
  isSelected,
  onToggleSelect 
}: { 
  project: ProjectWithCustomer;
  onSelect: () => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}) {
  const statusColors = {
    'not-started': 'bg-navy/10 text-navy',
    'in-progress': 'bg-coral/10 text-coral',
    'on-hold': 'bg-coral/20 text-coral',
    'completed': 'bg-navy/20 text-navy',
    'cancelled': 'bg-gray-100 text-gray-800'
  };

  const getAddress = () => {
    return [project.address_line1, project.city, project.province].filter(Boolean).join(', ');
  };

  return (
    <div 
      className={`bg-card border border-border p-6 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)] hover:shadow-md transition-shadow cursor-pointer ${
        isSelected ? 'ring-2 ring-coral bg-coral/5' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {onToggleSelect && (
              <BulkSelectCheckbox
                checked={isSelected || false}
                onChange={() => onToggleSelect(project.id)}
                className="mr-2"
              />
            )}
            <h3 className="font-space font-semibold text-lg text-navy">{project.title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[project.status]}`}>
              {project.status.replace('-', ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground font-mono">{project.project_number}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-space font-semibold text-coral">
            ${project.contract_amount.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">{project.percent_complete}% complete</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-sm font-medium text-foreground">{project.customer.name}</p>
        <p className="text-sm text-muted-foreground">{getAddress()}</p>
        <p className="text-sm text-muted-foreground">PM: {project.manager}</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{project.percent_complete}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-coral-gradient-horizontal h-2 rounded-full transition-all duration-300" 
            style={{ width: `${project.percent_complete}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Started: {new Date(project.start_date).toLocaleDateString()}</span>
          <span>Due: {new Date(project.expected_completion).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

function ProjectDetail({ 
  project, 
  projectDetails, 
  activeTab, 
  setActiveTab, 
  handleDocumentUpload, 
  handleDocumentDownload, 
  handleDocumentShare, 
  handleDocumentDelete,
  handleChangeOrderCreate, 
  handleChangeOrderStatusUpdate,
  handleChangeOrderDelete,
  handlePhotoUpload, 
  handleInvoiceCreate, 
  handleInvoiceUpdate, 
  setShowProjectDetail 
}: { 
  project: ProjectWithCustomer;
  projectDetails: ProjectDetails | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleDocumentUpload: (file: File, category: string, description?: string) => void;
  handleDocumentDownload: (document: any) => void;
  handleDocumentShare: (document: any) => void;
  handleDocumentDelete: (documentId: string) => void;
  handleChangeOrderCreate: (changeOrder: any) => void;
  handleChangeOrderStatusUpdate: (id: string, status: string, reason?: string) => void;
  handleChangeOrderDelete: (id: string) => void;
  handlePhotoUpload: (files: FileList, category: any) => void;
  handleInvoiceCreate: (invoice: any) => void;
  handleInvoiceUpdate: (invoice: any) => void;
  setShowProjectDetail: (show: boolean) => void;
}) {
  const renderTabContent = () => {
    if (!projectDetails) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-4xl mb-2">⏳</div>
          <p>Loading project details...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        const daysRemaining = Math.ceil(
          (new Date(project.expected_completion).getTime() - new Date().getTime()) / 
          (1000 * 60 * 60 * 24)
        );

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border p-4 [clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)]">
                <div className="text-2xl font-space font-semibold text-navy mb-1">{project.percent_complete}%</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
              <div className="bg-card border border-border p-4 [clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)]">
                <div className="text-2xl font-space font-semibold text-coral">${project.contract_amount.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Contract Value</div>
              </div>
              <div className="bg-card border border-border p-4 [clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)]">
                <div className="text-2xl font-space font-semibold text-navy">{daysRemaining}</div>
                <div className="text-sm text-muted-foreground">Days Remaining</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border p-6 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
                <h4 className="font-space font-medium text-navy mb-4">Project Details</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-medium">{project.customer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address:</span>
                    <span className="font-medium text-right">
                      {[project.address_line1, project.city, project.province].filter(Boolean).join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Project Manager:</span>
                    <span className="font-medium">{project.manager}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="font-medium">{new Date(project.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected Completion:</span>
                    <span className="font-medium">{new Date(project.expected_completion).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border p-6 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
                <h4 className="font-space font-medium text-navy mb-4">Recent Activity</h4>
                <div className="space-y-3">
                  {projectDetails.activities.slice(0, 5).map((activity, index) => (
                    <div key={activity.id} className="border-l-2 border-coral pl-3">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString()} by {activity.performed_by}
                      </p>
                    </div>
                  ))}
                  {projectDetails.activities.length === 0 && (
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'timeline':
        return (
          <div className="bg-card border border-border p-6 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
            <h4 className="font-space font-medium text-navy mb-6">Project Timeline</h4>
            <div className="space-y-4">
              {projectDetails.activities
                .filter(activity => activity.activity_type === 'milestone' || activity.activity_type === 'progress')
                .map((activity, index) => (
                <div key={activity.id} className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-coral"></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{activity.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {projectDetails.activities.length === 0 && (
                <p className="text-sm text-muted-foreground">No timeline activities yet</p>
              )}
            </div>
          </div>
        );
        
      case 'documents':
        return (
          <DocumentManager
            documents={projectDetails.documents}
            onUpload={handleDocumentUpload}
            onDownload={handleDocumentDownload}
            onShare={handleDocumentShare}
            onDelete={handleDocumentDelete}
          />
        );
        
      case 'change-orders':
        return (
          <ChangeOrderManager
            changeOrders={projectDetails.changeOrders}
            onCreate={handleChangeOrderCreate}
            onStatusUpdate={handleChangeOrderStatusUpdate}
            onDelete={handleChangeOrderDelete}
          />
        );
        
      case 'photos':
        return (
          <PhotoGalleryManager
            photos={projectDetails.photos}
            onUpload={handlePhotoUpload}
          />
        );
        
      case 'invoices':
        return (
          <InvoiceManager
            invoices={projectDetails.invoices}
            onCreate={handleInvoiceCreate}
            onUpdate={handleInvoiceUpdate}
          />
        );
        
      default:
        return (
          <div className="bg-card border border-border p-6 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
            <p className="text-muted-foreground">Content for {activeTab} tab will be implemented here.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-card border border-border p-6 [clip-path:polygon(0.8rem_0%,100%_0%,100%_calc(100%-0.8rem),calc(100%-0.8rem)_100%,0%_100%,0%_0.8rem)]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-space text-2xl font-semibold text-navy mb-1">{project.title}</h2>
            <p className="text-muted-foreground font-mono">{project.project_number}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowProjectDetail(true)}>Edit Project</Button>
            <Button variant="coral" size="sm" onClick={() => setShowProjectDetail(true)}>Update Status</Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{project.percent_complete}% Complete</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3">
            <div 
              className="bg-coral-gradient-horizontal h-3 rounded-full transition-all duration-500" 
              style={{ width: `${project.percent_complete}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border border-border [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
        <div className="border-b border-border">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id 
                    ? 'border-coral text-coral' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithCustomer[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectWithCustomer | null>(null);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  
  // Location context
  const { selectedLocation } = useLocation();
  
  // Enhanced loading and error states
  const { 
    isLoading: initialLoading, 
    error: loadingError, 
    startLoading, 
    stopLoading, 
    setLoadingError 
  } = useLoadingState(true);
  
  const { 
    isLoading: projectDetailsLoading, 
    startLoading: startDetailsLoading, 
    stopLoading: stopDetailsLoading 
  } = useLoadingState(false);
  
  const { 
    isLoading: operationLoading, 
    startLoading: startOperationLoading, 
    stopLoading: stopOperationLoading 
  } = useLoadingState(false);
  
  const { handleError, clearError, retryOperation } = useErrorHandling({
    enableNotifications: true,
    logErrors: true
  });
  
  // Real-time updates and notifications
  const { notifySuccess, notifyInfo, notifyError } = useNotificationHelpers();
  const { isConnected } = useRealTimeUpdates({ enabled: true });
  
  // Project-specific updates for selected project
  const { projectStatus, progress, updateProjectStatus } = useProjectUpdates(
    selectedProject?.id || ''
  );

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

  // Define filter options for projects
  const filterOptions: FilterOption[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'not-started', label: 'Not Started' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'on-hold', label: 'On Hold' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    },
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
      id: 'manager',
      label: 'Project Manager',
      type: 'select',
      options: [
        { value: 'Sarah Chen', label: 'Sarah Chen' },
        { value: 'Mike Johnson', label: 'Mike Johnson' },
        { value: 'Emily Rodriguez', label: 'Emily Rodriguez' },
        { value: 'David Kim', label: 'David Kim' }
      ]
    },
    {
      id: 'contract_amount',
      label: 'Contract Amount ($)',
      type: 'number',
      min: 0,
      max: 1000000
    },
    {
      id: 'percent_complete',
      label: 'Progress (%)',
      type: 'number',
      min: 0,
      max: 100
    },
    {
      id: 'start_date',
      label: 'Start Date',
      type: 'daterange'
    },
    {
      id: 'expected_completion',
      label: 'Expected Completion',
      type: 'daterange'
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
    }
  ];

  // Filter and search projects
  const filteredProjects = useMemo(() => {
    return filterData(
      projects,
      searchTerm,
      activeFilters,
      ['title', 'project_number', 'manager', 'city', 'address_line1']
    );
  }, [projects, searchTerm, activeFilters]);

  // Bulk selection state
  const {
    selectedIds,
    selectedItems,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    toggleAll,
    clearSelection
  } = useBulkSelection(filteredProjects);

  // Define bulk actions for projects
  const bulkActions: BulkAction[] = [
    {
      id: 'status-in-progress',
      label: 'Start Projects',
      icon: '▶',
      variant: 'default'
    },
    {
      id: 'status-on-hold',
      label: 'Put On Hold',
      icon: '⏸',
      variant: 'secondary'
    },
    {
      id: 'status-completed',
      label: 'Mark Complete',
      icon: '✓',
      variant: 'default'
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
      confirmationTitle: 'Delete Projects',
      confirmationMessage: 'Are you sure you want to delete the selected projects? This action cannot be undone.'
    }
  ];
  
  // Load projects from Supabase
  useEffect(() => {
    loadProjects();
  }, [selectedLocation]);

  // Load project details when a project is selected
  useEffect(() => {
    if (selectedProject) {
      loadProjectDetails(selectedProject.id);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      startLoading();
      clearError();
      
      let locationFilter = '';
      if (selectedLocation && selectedLocation !== 'all') {
        locationFilter = `WHERE c.location = '${selectedLocation}'`;
      }
      
      const projectsData = await ApiErrorHandler.handleAsyncOperation(
        () => executeSupabaseQuery(`
          SELECT 
            p.*,
            c.name as customer_name,
            c.email as customer_email,
            c.phone as customer_phone,
            c.address_line1 as customer_address_line1,
            c.city as customer_city,
            c.province as customer_province,
            c.location as customer_location
          FROM projects p
          JOIN customers c ON p.customer_id = c.id
          ${locationFilter}
          ORDER BY p.created_at DESC
        `),
        'loading projects',
        {
          retries: 2,
          retryDelay: 1000,
          timeout: 15000,
          onRetry: (attempt) => {
            notifyInfo('Retrying...', `Attempt ${attempt} to load projects`);
          }
        }
      );

      const mappedProjects: ProjectWithCustomer[] = projectsData.map((row: any) => ({
        ...row,
        customer: {
          id: row.customer_id,
          name: row.customer_name,
          email: row.customer_email,
          phone: row.customer_phone,
          address_line1: row.customer_address_line1,
          city: row.customer_city,
          province: row.customer_province
        }
      }));

      setProjects(mappedProjects);
      stopLoading();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load projects');
      handleError(error, 'loading projects');
      setLoadingError(error.message);
    }
  };

  const loadProjectDetails = async (projectId: string) => {
    try {
      // Load all project-related data in parallel
      const [documents, photos, changeOrders, invoicesData, activities] = await Promise.all([
        executeSupabaseQuery(`SELECT * FROM documents WHERE project_id = $1 ORDER BY created_at DESC`, [projectId]),
        executeSupabaseQuery(`SELECT * FROM photos WHERE project_id = $1 ORDER BY display_order ASC, created_at DESC`, [projectId]),
        executeSupabaseQuery(`SELECT * FROM change_orders WHERE project_id = $1 ORDER BY created_at DESC`, [projectId]),
        executeSupabaseQuery(`SELECT * FROM invoices WHERE project_id = $1 ORDER BY created_at DESC`, [projectId]),
        executeSupabaseQuery(`SELECT * FROM project_activities WHERE project_id = $1 ORDER BY created_at DESC`, [projectId])
      ]);

      // Load invoice items for each invoice
      const invoicesWithItems = await Promise.all(
        invoicesData.map(async (invoice: any) => {
          const items = await executeSupabaseQuery(
            `SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY line_order ASC`,
            [invoice.id]
          );
          return { ...invoice, items };
        })
      );

      const projectDetailsData: ProjectDetails = {
        project: selectedProject!,
        documents,
        photos,
        changeOrders,
        invoices: invoicesWithItems,
        activities
      };

      setProjectDetails(projectDetailsData);
    } catch (err) {
      console.error('Error loading project details:', err);
      // Set empty details instead of failing completely
      setProjectDetails({
        project: selectedProject!,
        documents: [],
        photos: [],
        changeOrders: [],
        invoices: [],
        activities: []
      });
    }
  };

  // Execute Supabase queries using MCP
  const executeSupabaseQuery = async (sql: string, params: any[] = []): Promise<any[]> => {
    try {
      const result = await mcp__supabase__execute_sql({ query: sql });
      return result || [];
    } catch (error) {
      console.error('Error executing Supabase query:', error);
      throw error;
    }
  };
  
  // Bulk action handler
  const handleBulkAction = async (actionId: string, selectedProjects: ProjectWithCustomer[]) => {
    try {
      startOperationLoading();
      
      switch (actionId) {
        case 'status-in-progress':
          await Promise.all(
            selectedProjects.map(project =>
              executeSupabaseQuery(
                'UPDATE projects SET status = $2, updated_at = NOW() WHERE id = $1',
                [project.id, 'in-progress']
              )
            )
          );
          setProjects(prev => prev.map(p => 
            selectedProjects.some(sp => sp.id === p.id) 
              ? { ...p, status: 'in-progress' as const }
              : p
          ));
          notifySuccess('Projects Updated', `${selectedProjects.length} projects started`);
          break;

        case 'status-on-hold':
          await Promise.all(
            selectedProjects.map(project =>
              executeSupabaseQuery(
                'UPDATE projects SET status = $2, updated_at = NOW() WHERE id = $1',
                [project.id, 'on-hold']
              )
            )
          );
          setProjects(prev => prev.map(p => 
            selectedProjects.some(sp => sp.id === p.id) 
              ? { ...p, status: 'on-hold' as const }
              : p
          ));
          notifyInfo('Projects Updated', `${selectedProjects.length} projects put on hold`);
          break;

        case 'status-completed':
          await Promise.all(
            selectedProjects.map(project =>
              executeSupabaseQuery(
                'UPDATE projects SET status = $2, percent_complete = 100, updated_at = NOW() WHERE id = $1',
                [project.id, 'completed']
              )
            )
          );
          setProjects(prev => prev.map(p => 
            selectedProjects.some(sp => sp.id === p.id) 
              ? { ...p, status: 'completed' as const, percent_complete: 100 }
              : p
          ));
          notifySuccess('Projects Completed! 🎉', `${selectedProjects.length} projects marked as completed`);
          break;

        case 'export':
          const csvContent = selectedProjects.map(p => 
            `"${p.project_number}","${p.title}","${p.customer.name}","${p.status}","${p.contract_amount || 0}","${new Date(p.expected_completion).toLocaleDateString()}"`
          ).join('\n');
          const header = 'Project Number,Title,Customer,Status,Contract Amount,Expected Completion\n';
          const blob = new Blob([header + csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `projects-export-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
          notifySuccess('Export Complete', `${selectedProjects.length} projects exported to CSV`);
          break;

        case 'delete':
          await Promise.all(
            selectedProjects.map(project =>
              executeSupabaseQuery('DELETE FROM projects WHERE id = $1', [project.id])
            )
          );
          setProjects(prev => prev.filter(p => !selectedProjects.some(sp => sp.id === p.id)));
          notifyInfo('Projects Deleted', `${selectedProjects.length} projects removed`);
          break;

        default:
          console.warn('Unknown bulk action:', actionId);
      }
      
      stopOperationLoading();
    } catch (error) {
      stopOperationLoading();
      const err = error instanceof Error ? error : new Error('Bulk action failed');
      handleError(err, `bulk action: ${actionId}`);
    }
  };

  // Handler functions
  const handleNewProject = async (projectData: any) => {
    try {
      const newProjectData = {
        ...projectData,
        project_number: `CR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
        percent_complete: 0,
        status: 'not-started'
      };

      await executeSupabaseQuery(`
        INSERT INTO projects (
          project_number, title, description, customer_id, status, priority, 
          contract_amount, start_date, expected_completion, manager, project_type,
          address_line1, city, province, postal_code, country
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      `, [
        newProjectData.project_number,
        newProjectData.title,
        newProjectData.description,
        newProjectData.customer_id,
        newProjectData.status,
        newProjectData.priority,
        newProjectData.contract_amount,
        newProjectData.start_date,
        newProjectData.expected_completion,
        newProjectData.manager,
        newProjectData.project_type,
        newProjectData.address_line1,
        newProjectData.city,
        newProjectData.province,
        newProjectData.postal_code,
        newProjectData.country
      ]);

      // Reload projects
      await loadProjects();
      setShowNewProjectForm(false);
    } catch (err) {
      console.error('Error creating project:', err);
      alert('Failed to create project. Please try again.');
    }
  };
  
  const handleProjectUpdate = async (updatedProject: ProjectWithCustomer) => {
    try {
      const previousProject = selectedProject;
      const statusChanged = previousProject && previousProject.status !== updatedProject.status;
      const progressChanged = previousProject && previousProject.percent_complete !== updatedProject.percent_complete;
      
      await executeSupabaseQuery(`
        UPDATE projects 
        SET title = $2, description = $3, status = $4, priority = $5, 
            contract_amount = $6, percent_complete = $7, manager = $8, updated_at = NOW()
        WHERE id = $1
      `, [
        updatedProject.id,
        updatedProject.title,
        updatedProject.description,
        updatedProject.status,
        updatedProject.priority,
        updatedProject.contract_amount,
        updatedProject.percent_complete,
        updatedProject.manager
      ]);

      // Update local state
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
      setSelectedProject(updatedProject);
      
      // Trigger real-time notifications for status changes
      if (statusChanged || progressChanged) {
        await updateProjectStatus(
          updatedProject.status as any, 
          updatedProject.percent_complete
        );
      }
      
      // Notify about successful update
      notifySuccess('Project Updated', `${updatedProject.title} has been updated successfully`);
      
    } catch (err) {
      console.error('Error updating project:', err);
      notifyError('Update Failed', 'Failed to update project. Please try again.');
    }
  };
  
  const handleDocumentUpload = async (file: File, category: string, description?: string) => {
    if (!selectedProject) return;
    
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedProject.id}/${Date.now()}-${file.name}`;
      
      // In a real implementation, this would upload to Supabase Storage
      console.log('Uploading document:', { fileName, category, description, size: file.size });
      
      // Insert document record into database
      await executeSupabaseQuery(`
        INSERT INTO documents (
          project_id, name, type, size, category, upload_date, uploaded_by, 
          file_url, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        selectedProject.id,
        file.name,
        file.type,
        file.size,
        category,
        new Date().toISOString(),
        'Current User',
        `/storage/${fileName}`,
        description
      ]);

      // Reload project details
      await loadProjectDetails(selectedProject.id);
      alert('Document uploaded successfully!');
    } catch (err) {
      console.error('Error uploading document:', err);
      alert('Failed to upload document. Please try again.');
    }
  };
  
  const handleDocumentDownload = (document: any) => {
    try {
      // In a real implementation, this would download from Supabase Storage
      console.log('Downloading document:', document.name);
      
      // Create a temporary download link
      const link = document.createElement('a');
      link.href = document.file_url || '#';
      link.download = document.name;
      link.click();
      
      // In real implementation:
      // const { data, error } = await supabase.storage.from('documents').download(document.file_url);
      // if (data) {
      //   const url = URL.createObjectURL(data);
      //   const a = document.createElement('a');
      //   a.href = url;
      //   a.download = document.name;
      //   a.click();
      //   URL.revokeObjectURL(url);
      // }
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Failed to download document. Please try again.');
    }
  };
  
  const handleDocumentShare = (document: any) => {
    try {
      // In a real implementation, this would generate a shareable link
      const shareUrl = `${window.location.origin}/documents/shared/${document.id}`;
      
      // Copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert(`Share link copied to clipboard: ${shareUrl}`);
      
      // In real implementation:
      // const { data, error } = await supabase.storage.from('documents').createSignedUrl(document.file_url, 3600);
      // if (data) {
      //   navigator.clipboard.writeText(data.signedUrl);
      //   alert('Shareable link copied to clipboard!');
      // }
    } catch (err) {
      console.error('Error sharing document:', err);
      alert('Failed to create share link. Please try again.');
    }
  };
  
  const handleDocumentDelete = async (documentId: string) => {
    if (!selectedProject) return;
    
    try {
      // Delete from database
      await executeSupabaseQuery(`
        DELETE FROM documents WHERE id = $1
      `, [documentId]);

      // In real implementation, also delete from storage:
      // const document = projectDetails?.documents.find(d => d.id === documentId);
      // if (document?.file_url) {
      //   await supabase.storage.from('documents').remove([document.file_url]);
      // }

      // Reload project details
      await loadProjectDetails(selectedProject.id);
      alert('Document deleted successfully!');
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Failed to delete document. Please try again.');
    }
  };

  const handleChangeOrderCreate = async (changeOrder: any) => {
    if (!selectedProject) return;
    
    try {
      await executeSupabaseQuery(`
        INSERT INTO change_orders (
          project_id, title, description, amount, status, submitted_by, priority, submitted_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        selectedProject.id,
        changeOrder.title,
        changeOrder.description,
        changeOrder.amount,
        'pending',
        changeOrder.submitted_by,
        changeOrder.priority || 'medium',
        changeOrder.submitted_date
      ]);

      // Reload project details
      await loadProjectDetails(selectedProject.id);
      
      // Notify about new change order
      notifyInfo(
        'Change Order Created', 
        `New change order "${changeOrder.title}" submitted for $${changeOrder.amount.toLocaleString()}`
      );
      
    } catch (err) {
      console.error('Error creating change order:', err);
      notifyError('Creation Failed', 'Failed to create change order. Please try again.');
    }
  };
  
  const handleChangeOrderStatusUpdate = async (id: string, status: string, reason?: string) => {
    try {
      const changeOrder = projectDetails?.changeOrders.find(co => co.id === id);
      
      await executeSupabaseQuery(`
        UPDATE change_orders 
        SET status = $2, approved_by = $3, approval_date = CURRENT_DATE, reason = $4, updated_at = NOW()
        WHERE id = $1
      `, [id, status, 'Current User', reason]);

      // Reload project details
      if (selectedProject) {
        await loadProjectDetails(selectedProject.id);
      }
      
      // Notify about status change
      if (changeOrder) {
        const statusMessages = {
          'approved': '✅ Change order approved',
          'rejected': '❌ Change order rejected',
          'implemented': '🔧 Change order implemented'
        };
        
        const message = statusMessages[status as keyof typeof statusMessages] || `Status updated to ${status}`;
        notifySuccess('Change Order Updated', `${changeOrder.title}: ${message}`);
      }
      
    } catch (err) {
      console.error('Error updating change order status:', err);
      notifyError('Update Failed', 'Failed to update change order status. Please try again.');
    }
  };

  const handleChangeOrderDelete = async (id: string) => {
    try {
      await executeSupabaseQuery(`
        DELETE FROM change_orders WHERE id = $1
      `, [id]);

      // Reload project details
      if (selectedProject) {
        await loadProjectDetails(selectedProject.id);
      }
    } catch (err) {
      console.error('Error deleting change order:', err);
    }
  };
  
  const handlePhotoUpload = async (files: FileList, category: any) => {
    console.log('Uploading photos:', files.length, 'files in category:', category);
    // Implementation would handle photo upload
  };
  
  const handleInvoiceCreate = async (invoice: any) => {
    if (!selectedProject) return;
    
    try {
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
      
      const result = await executeSupabaseQuery(`
        INSERT INTO invoices (
          project_id, customer_id, invoice_number, description, total_amount,
          status, issue_date, due_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [
        selectedProject.id,
        selectedProject.customer_id,
        invoiceNumber,
        invoice.description,
        invoice.total_amount,
        'draft',
        invoice.issue_date,
        invoice.due_date
      ]);

      // Add invoice items
      for (const item of invoice.items) {
        await executeSupabaseQuery(`
          INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price, line_order)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          result[0].id,
          item.description,
          item.quantity,
          item.unit_price,
          item.total_price,
          item.line_order
        ]);
      }

      // Reload project details
      await loadProjectDetails(selectedProject.id);
    } catch (err) {
      console.error('Error creating invoice:', err);
    }
  };
  
  const handleInvoiceUpdate = async (invoice: any) => {
    try {
      await executeSupabaseQuery(`
        UPDATE invoices 
        SET description = $2, total_amount = $3, status = $4, updated_at = NOW()
        WHERE id = $1
      `, [invoice.id, invoice.description, invoice.total_amount, invoice.status]);

      // Reload project details
      if (selectedProject) {
        await loadProjectDetails(selectedProject.id);
      }
    } catch (err) {
      console.error('Error updating invoice:', err);
    }
  };
  
  const handleExportProjects = () => {
    console.log('Exporting projects to CSV');
    const csvContent = projects.map(p => 
      `${p.project_number},${p.title},${p.customer.name},${p.status},${p.percent_complete}%,$${p.contract_amount}`
    ).join('\\n');
    const header = 'Project Number,Title,Customer,Status,Progress,Contract Amount\\n';
    const blob = new Blob([header + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projects-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Loading state
  if (initialLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-space text-3xl font-semibold text-navy">Projects</h1>
            <p className="text-muted-foreground mt-1">Manage active renovation projects</p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Button variant="outline" disabled>
              <LoadingSpinner size="sm" className="mr-2" />
              Export Projects
            </Button>
            <Button variant="coral" disabled>
              + New Project
            </Button>
          </div>
        </div>

        {/* Loading skeleton */}
        <div className="space-y-6">
          <LoadingCard 
            title="Loading Projects..." 
            message="Please wait while we fetch your project data"
            icon="📋"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (loadingError) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-space text-3xl font-semibold text-navy">Projects</h1>
            <p className="text-muted-foreground mt-1">Manage active renovation projects</p>
          </div>
        </div>

        {/* Error state */}
        <div className="bg-card border border-border p-12 text-center [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-navy mb-2">Failed to Load Projects</h3>
          <p className="text-muted-foreground mb-6">{loadingError}</p>
          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={() => retryOperation(loadProjects)}
              disabled={initialLoading}
            >
              {initialLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Retrying...
                </>
              ) : (
                'Try Again'
              )}
            </Button>
            <Button variant="coral" onClick={() => setShowNewProjectForm(true)}>
              Create New Project
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedProject) {
    return (
      <ErrorBoundary>
        <LoadingOverlay isVisible={projectDetailsLoading} message="Loading project details...">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedProject(null);
                  setProjectDetails(null);
                }}
                size="sm"
                disabled={projectDetailsLoading}
              >
                ← Back to Projects
              </Button>
              {projectDetailsLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LoadingSpinner size="sm" />
                  Loading project details...
                </div>
              )}
            </div>
            <ProjectDetail 
              project={selectedProject} 
          projectDetails={projectDetails}
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          handleDocumentUpload={handleDocumentUpload}
          handleDocumentDownload={handleDocumentDownload}
          handleDocumentShare={handleDocumentShare}
          handleDocumentDelete={handleDocumentDelete}
          handleChangeOrderCreate={handleChangeOrderCreate}
          handleChangeOrderStatusUpdate={handleChangeOrderStatusUpdate}
          handleChangeOrderDelete={handleChangeOrderDelete}
          handlePhotoUpload={handlePhotoUpload}
          handleInvoiceCreate={handleInvoiceCreate}
          handleInvoiceUpdate={handleInvoiceUpdate}
          setShowProjectDetail={setShowProjectDetail}
            />
          </div>
        </LoadingOverlay>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <LoadingOverlay isVisible={operationLoading} message="Processing...">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-space text-3xl font-semibold text-navy">Projects</h1>
              <p className="text-muted-foreground mt-1">Manage active renovation projects</p>
            </div>
            <div className="flex gap-3 mt-4 sm:mt-0">
              <Button 
                variant="outline" 
                onClick={handleExportProjects}
                disabled={operationLoading}
              >
                {operationLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Exporting...
                  </>
                ) : (
                  'Export Projects'
                )}
              </Button>
              <Button 
                variant="coral" 
                onClick={() => setShowNewProjectForm(true)}
                disabled={operationLoading}
              >
                + New Project
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
            itemName="projects"
          />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          <div className="text-2xl font-space font-semibold text-navy">{filteredProjects.length}</div>
          <div className="text-sm text-muted-foreground">
            {searchTerm || Object.keys(activeFilters).length > 0 ? 'Filtered Projects' : 'Active Projects'}
          </div>
        </div>
        <div className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          <div className="text-2xl font-space font-semibold text-coral">
            ${filteredProjects.reduce((sum, p) => sum + p.contract_amount, 0).toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Contract Value</div>
        </div>
        <div className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          <div className="text-2xl font-space font-semibold text-navy">
            {filteredProjects.length > 0 ? Math.round(filteredProjects.reduce((sum, p) => sum + p.percent_complete, 0) / filteredProjects.length) : 0}%
          </div>
          <div className="text-sm text-muted-foreground">Average Progress</div>
        </div>
        <div className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          <div className="text-2xl font-space font-semibold text-navy">
            {filteredProjects.filter(p => p.status === 'completed').length}
          </div>
          <div className="text-sm text-muted-foreground">Completed Projects</div>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-navy mb-2">No Projects Yet</h3>
          <p className="text-muted-foreground mb-6">Get started by creating your first project</p>
          <Button variant="coral" onClick={() => setShowNewProjectForm(true)}>
            Create First Project
          </Button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-navy mb-2">No Projects Found</h3>
          <p className="text-muted-foreground mb-6">
            No projects match your current search criteria. Try adjusting your filters or search term.
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Results summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BulkSelectCheckbox
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onChange={toggleAll}
                className="flex items-center gap-2"
              />
              <p className="text-sm text-muted-foreground">
                Showing {filteredProjects.length} of {projects.length} projects
                {searchTerm && ` for "${searchTerm}"`}
                {selectedItems.length > 0 && ` (${selectedItems.length} selected)`}
              </p>
            </div>
            <select 
              className="text-sm border border-input rounded px-3 py-1"
              onChange={(e) => {
                // TODO: Implement sorting
                console.log('Sort by:', e.target.value);
              }}
            >
              <option value="created_at">Sort by: Recently Created</option>
              <option value="title">Sort by: Title</option>
              <option value="contract_amount">Sort by: Contract Amount</option>
              <option value="progress">Sort by: Progress</option>
              <option value="due_date">Sort by: Due Date</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={() => setSelectedProject(project)}
                isSelected={selectedIds.has(project.id)}
                onToggleSelect={toggleItem}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* New Project Form Modal */}
      {showNewProjectForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
            <NewProjectForm
              onSubmit={handleNewProject}
              onCancel={() => setShowNewProjectForm(false)}
            />
          </div>
        </div>
      )}
      
      {/* Project Detail Modal */}
      {showProjectDetail && selectedProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
            <ProjectDetailView
              project={selectedProject}
              onClose={() => setShowProjectDetail(false)}
              onUpdate={handleProjectUpdate}
            />
          </div>
        </div>
      )}
        </div>
      </LoadingOverlay>
    </ErrorBoundary>
  );
}