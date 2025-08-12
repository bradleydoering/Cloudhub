'use client';

import { useState, useEffect } from 'react';
import { Button } from '@cloudreno/ui';
import ProjectDetailView from '../../src/components/ProjectDetailView';
import DocumentManager from '../../src/components/DocumentManager';
import ChangeOrderManager from '../../src/components/ChangeOrderManager';
import PhotoGalleryManager from '../../src/components/PhotoGalleryManager';
import InvoiceManager from '../../src/components/InvoiceManager';
import NewProjectForm from '../../src/components/NewProjectForm';
import { ProjectWithCustomer, ProjectDetails } from '../../src/types/database';

const tabs = [
  { id: 'overview', name: 'Overview' },
  { id: 'timeline', name: 'Timeline' },
  { id: 'documents', name: 'Documents' },
  { id: 'change-orders', name: 'Change Orders' },
  { id: 'photos', name: 'Photos' },
  { id: 'invoices', name: 'Invoices & Payments' },
];

function ProjectCard({ project, onSelect }: { project: ProjectWithCustomer, onSelect: () => void }) {
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
      className="bg-card border border-border p-6 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)] hover:shadow-md transition-shadow cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
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
  handleChangeOrderCreate, 
  handleChangeOrderStatusUpdate, 
  handlePhotoUpload, 
  handleInvoiceCreate, 
  handleInvoiceUpdate, 
  setShowProjectDetail 
}: { 
  project: ProjectWithCustomer;
  projectDetails: ProjectDetails | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleDocumentUpload: (file: File) => void;
  handleDocumentDownload: (document: any) => void;
  handleDocumentShare: (document: any) => void;
  handleChangeOrderCreate: (changeOrder: any) => void;
  handleChangeOrderStatusUpdate: (id: string, status: string, reason?: string) => void;
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
          />
        );
        
      case 'change-orders':
        return (
          <ChangeOrderManager
            changeOrders={projectDetails.changeOrders}
            onCreate={handleChangeOrderCreate}
            onStatusUpdate={handleChangeOrderStatusUpdate}
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load projects from Supabase
  useEffect(() => {
    loadProjects();
  }, []);

  // Load project details when a project is selected
  useEffect(() => {
    if (selectedProject) {
      loadProjectDetails(selectedProject.id);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      // Mock implementation using MCP Supabase queries
      const projectsData = await executeSupabaseQuery(`
        SELECT 
          p.*,
          c.name as customer_name,
          c.email as customer_email,
          c.phone as customer_phone,
          c.address_line1 as customer_address_line1,
          c.city as customer_city,
          c.province as customer_province
        FROM projects p
        JOIN customers c ON p.customer_id = c.id
        ORDER BY p.created_at DESC
      `);

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
    } catch (err) {
      setError('Failed to load projects');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
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
      // This would use the MCP Supabase client
      // For now, return empty data to prevent runtime errors
      console.log('Would execute Supabase query:', sql, params);
      return [];
    } catch (error) {
      console.error('Error executing Supabase query:', error);
      throw error;
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
    } catch (err) {
      console.error('Error updating project:', err);
      alert('Failed to update project. Please try again.');
    }
  };
  
  const handleDocumentUpload = async (file: File) => {
    console.log('Uploading document:', file.name);
    // Implementation would handle actual file upload to Supabase Storage
  };
  
  const handleDocumentDownload = (document: any) => {
    console.log('Downloading document:', document.name);
    // Implementation would handle file download
  };
  
  const handleDocumentShare = (document: any) => {
    console.log('Sharing document:', document.name);
    // Implementation would handle sharing functionality
  };
  
  const handleChangeOrderCreate = async (changeOrder: any) => {
    if (!selectedProject) return;
    
    try {
      await executeSupabaseQuery(`
        INSERT INTO change_orders (
          project_id, title, description, amount, status, submitted_by, priority
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        selectedProject.id,
        changeOrder.title,
        changeOrder.description,
        changeOrder.amount,
        'pending',
        changeOrder.submitted_by,
        changeOrder.priority || 'medium'
      ]);

      // Reload project details
      await loadProjectDetails(selectedProject.id);
    } catch (err) {
      console.error('Error creating change order:', err);
    }
  };
  
  const handleChangeOrderStatusUpdate = async (id: string, status: string, reason?: string) => {
    try {
      await executeSupabaseQuery(`
        UPDATE change_orders 
        SET status = $2, approved_by = $3, approval_date = CURRENT_DATE, reason = $4, updated_at = NOW()
        WHERE id = $1
      `, [id, status, 'Current User', reason]);

      // Reload project details
      if (selectedProject) {
        await loadProjectDetails(selectedProject.id);
      }
    } catch (err) {
      console.error('Error updating change order status:', err);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading projects...</p>
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
          <Button onClick={loadProjects} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  if (selectedProject) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedProject(null);
              setProjectDetails(null);
            }}
            size="sm"
          >
            ← Back to Projects
          </Button>
        </div>
        <ProjectDetail 
          project={selectedProject} 
          projectDetails={projectDetails}
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          handleDocumentUpload={handleDocumentUpload}
          handleDocumentDownload={handleDocumentDownload}
          handleDocumentShare={handleDocumentShare}
          handleChangeOrderCreate={handleChangeOrderCreate}
          handleChangeOrderStatusUpdate={handleChangeOrderStatusUpdate}
          handlePhotoUpload={handlePhotoUpload}
          handleInvoiceCreate={handleInvoiceCreate}
          handleInvoiceUpdate={handleInvoiceUpdate}
          setShowProjectDetail={setShowProjectDetail}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-space text-3xl font-semibold text-navy">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage active renovation projects</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Button variant="outline" onClick={handleExportProjects}>
            Export Projects
          </Button>
          <Button variant="coral" onClick={() => setShowNewProjectForm(true)}>
            + New Project
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          <div className="text-2xl font-space font-semibold text-navy">{projects.length}</div>
          <div className="text-sm text-muted-foreground">Active Projects</div>
        </div>
        <div className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          <div className="text-2xl font-space font-semibold text-coral">
            ${projects.reduce((sum, p) => sum + p.contract_amount, 0).toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Contract Value</div>
        </div>
        <div className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          <div className="text-2xl font-space font-semibold text-navy">
            {projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.percent_complete, 0) / projects.length) : 0}%
          </div>
          <div className="text-sm text-muted-foreground">Average Progress</div>
        </div>
        <div className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          <div className="text-2xl font-space font-semibold text-navy">100%</div>
          <div className="text-sm text-muted-foreground">On Time Delivery</div>
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={() => setSelectedProject(project)}
            />
          ))}
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
  );
}