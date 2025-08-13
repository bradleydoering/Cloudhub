'use client';

import { useState, useEffect } from 'react';
import { Button } from '@cloudreno/ui';
import { useRouter } from 'next/navigation';
import Modal from '../src/components/Modal';
import NewDealForm from '../src/components/NewDealForm';
import NewProjectForm from '../src/components/NewProjectForm';
import ReportsView from '../src/components/ReportsView';
import { useLocation } from '../src/context/LocationContext';
import { supabaseService } from '../src/lib/supabase';

// Mock data - in real app this would come from API/database
const mockStats = {
  activeDeals: 12,
  totalPipelineValue: 485000,
  activeProjects: 8,
  projectsCompleted: 24,
  customerSatisfaction: 98,
  revenueThisMonth: 125000,
};

const mockRecentDeals = [
  { id: '1', title: 'Kitchen Renovation - Doe Residence', customer: 'John & Jane Doe', value: 35000, stage: 'estimating', priority: 'high' },
  { id: '2', title: 'Master Suite Addition', customer: 'Alice Wong', value: 75000, stage: 'proposal-sent', priority: 'urgent' },
  { id: '3', title: 'Bathroom Remodel - Smith Home', customer: 'Bob Smith', value: 18000, stage: 'qualified', priority: 'medium' },
];

const mockActiveProjects = [
  { id: '1', title: 'Kitchen Renovation - Doe Residence', customer: 'John & Jane Doe', progress: 45, status: 'in-progress' },
  { id: '2', title: 'Master Suite Addition', customer: 'Alice Wong', progress: 25, status: 'in-progress' },
  { id: '3', title: 'Guest Bath Renovation', customer: 'Mike & Sarah Chen', progress: 85, status: 'in-progress' },
];

export default function Home() {
  const router = useRouter();
  const { selectedLocation } = useLocation();
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [deals, setDeals] = useState(mockRecentDeals);
  const [projects, setProjects] = useState(mockActiveProjects);
  const [stats, setStats] = useState(mockStats);
  const [loading, setLoading] = useState(true);

  const priorityColors = {
    low: 'border-l-navy/40',
    medium: 'border-l-navy/60',
    high: 'border-l-coral/60',
    urgent: 'border-l-coral'
  };

  // Load real data from database
  useEffect(() => {
    loadDashboardData();
  }, [selectedLocation]);


  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard stats
      const statsData = await supabaseService.getDashboardStats(selectedLocation);
      
      // Load recent deals (limit to 3 for dashboard)
      const allDeals = await supabaseService.getDeals(selectedLocation);
      const recentDeals = allDeals.slice(0, 3).map(deal => ({
        id: deal.id,
        title: deal.title,
        customer: deal.customer_name || 'Unknown Customer',
        value: deal.value || 0,
        stage: deal.stage,
        priority: deal.priority
      }));
      
      // Load recent projects (limit to 3 for dashboard) 
      const allProjects = await supabaseService.getProjects(selectedLocation);
      const recentProjects = allProjects
        .filter(p => ['in-progress', 'not-started'].includes(p.status || ''))
        .slice(0, 3)
        .map(project => ({
          id: project.id,
          title: project.title,
          customer: project.customer?.name || 'Unknown Customer',
          progress: project.percent_complete || 0,
          status: project.status
        }));
      
      // Update state with data from supabaseService
      setDeals(recentDeals);
      setProjects(recentProjects);
      setStats({
        activeDeals: statsData.activeDeals,
        totalPipelineValue: statsData.totalPipelineValue,
        activeProjects: statsData.activeProjects,
        projectsCompleted: statsData.completedProjects,
        customerSatisfaction: 98, // This would come from customer surveys
        revenueThisMonth: statsData.revenueThisMonth,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Keep mock data on error
    } finally {
      setLoading(false);
    }
  };

  const handleNewDeal = async (dealData: any) => {
    try {
      // Create customer first if needed
      let customerId = dealData.customer_id;
      if (!customerId && dealData.customer_name) {
        const newCustomer = await supabaseService.createCustomer({
          name: dealData.customer_name,
          email: dealData.customer_email || '',
          phone: dealData.customer_phone || '',
          status: 'prospect',
          customer_type: 'individual',
          location: selectedLocation !== 'all' ? selectedLocation : 'Vancouver'
        });
        customerId = newCustomer.id;
      }

      // Create the deal
      await supabaseService.createDeal({
        title: dealData.title,
        description: dealData.description || '',
        customer_id: customerId,
        customer_name: dealData.customer_name,
        value: dealData.value,
        stage: dealData.stage || 'new',
        priority: dealData.priority || 'medium',
        expected_close_date: dealData.expectedClose,
        source: dealData.source || 'website',
        notes: dealData.notes || ''
      });

      // Reload dashboard data to reflect the new deal
      await loadDashboardData();
      
      setShowNewDealModal(false);
      alert('Deal created successfully!');
    } catch (error) {
      console.error('Error creating deal:', error);
      alert('Failed to create deal. Please try again.');
    }
  };

  const handleNewProject = async (projectData: any) => {
    try {
      // Create customer first if needed
      let customerId = projectData.customer_id;
      if (!customerId && projectData.customer_name) {
        const newCustomer = await supabaseService.createCustomer({
          name: projectData.customer_name,
          email: projectData.customer_email || '',
          phone: projectData.customer_phone || '',
          status: 'active',
          customer_type: 'individual',
          location: selectedLocation !== 'all' ? selectedLocation : 'Vancouver'
        });
        customerId = newCustomer.id;
      }

      // Create the project
      await supabaseService.createProject({
        title: projectData.title,
        description: projectData.description || '',
        customer_id: customerId,
        status: 'not-started',
        priority: projectData.priority || 'medium',
        contract_amount: projectData.contract_amount,
        start_date: projectData.start_date,
        expected_completion: projectData.expected_completion,
        manager: projectData.manager,
        project_type: projectData.project_type,
        address_line1: projectData.address_line1,
        city: projectData.city,
        province: projectData.province,
        postal_code: projectData.postal_code,
        country: projectData.country
      });

      // Reload dashboard data to reflect the new project
      await loadDashboardData();
      
      setShowNewProjectModal(false);
      alert('Project created successfully!');
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const handleDealClick = (dealId: string) => {
    router.push(`/deals?highlight=${dealId}`);
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects?highlight=${projectId}`);
  };

  const handleMetricClick = (metric: string) => {
    // Navigate to filtered views based on metric
    switch (metric) {
      case 'deals':
        router.push('/deals');
        break;
      case 'pipeline':
        router.push('/deals');
        break;
      case 'projects':
        router.push('/projects');
        break;
      case 'completed':
        router.push('/projects?filter=completed');
        break;
      case 'satisfaction':
        router.push('/customers?tab=feedback');
        break;
      case 'revenue':
        setShowReportsModal(true);
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-coral/10 to-coral/5 border border-coral/20 p-8 [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
        <div className="max-w-2xl">
          <h1 className="font-space text-3xl md:text-4xl font-semibold text-navy mb-3">
            Welcome to CloudHub
          </h1>
          <p className="text-lg text-muted-foreground font-inter mb-6">
            Your command center for managing renovation deals and projects
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="coral" onClick={() => router.push('/deals')}>
              View Active Deals
            </Button>
            <Button variant="outline" onClick={() => router.push('/projects')}>
              Manage Projects
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div 
          className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)] hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleMetricClick('deals')}
        >
          <div className="text-2xl font-space font-semibold text-navy">{stats.activeDeals}</div>
          <div className="text-sm text-muted-foreground">Active Deals</div>
        </div>
        <div 
          className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)] hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleMetricClick('pipeline')}
        >
          <div className="text-2xl font-space font-semibold text-coral">${(stats.totalPipelineValue / 1000).toFixed(0)}K</div>
          <div className="text-sm text-muted-foreground">Pipeline Value</div>
        </div>
        <div 
          className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)] hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleMetricClick('projects')}
        >
          <div className="text-2xl font-space font-semibold text-navy">{stats.activeProjects}</div>
          <div className="text-sm text-muted-foreground">Active Projects</div>
        </div>
        <div 
          className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)] hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleMetricClick('completed')}
        >
          <div className="text-2xl font-space font-semibold text-navy">{stats.projectsCompleted}</div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </div>
        <div 
          className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)] hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleMetricClick('satisfaction')}
        >
          <div className="text-2xl font-space font-semibold text-navy">{stats.customerSatisfaction}%</div>
          <div className="text-sm text-muted-foreground">Satisfaction</div>
        </div>
        <div 
          className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)] hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleMetricClick('revenue')}
        >
          <div className="text-2xl font-space font-semibold text-coral">${(stats.revenueThisMonth / 1000).toFixed(0)}K</div>
          <div className="text-sm text-muted-foreground">This Month</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Deals */}
        <div className="bg-card border border-border [clip-path:polygon(0.8rem_0%,100%_0%,100%_calc(100%-0.8rem),calc(100%-0.8rem)_100%,0%_100%,0%_0.8rem)]">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="font-space text-xl font-semibold text-navy">Hot Deals</h2>
              <Button variant="outline" size="sm" onClick={() => router.push('/deals')}>
                View All
              </Button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {deals.map((deal) => (
              <div 
                key={deal.id} 
                className={`bg-background border border-border p-4 border-l-4 ${priorityColors[deal.priority as keyof typeof priorityColors]} [clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)] hover:shadow-sm transition-shadow cursor-pointer`}
                onClick={() => handleDealClick(deal.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-navy text-sm">{deal.title}</h4>
                  <span className="text-xs text-muted-foreground capitalize">{deal.priority}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{deal.customer}</p>
                <div className="flex justify-between items-center">
                  <span className="font-space font-semibold text-coral">${deal.value.toLocaleString()}</span>
                  <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground capitalize">
                    {deal.stage.replace('-', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-card border border-border [clip-path:polygon(0.8rem_0%,100%_0%,100%_calc(100%-0.8rem),calc(100%-0.8rem)_100%,0%_100%,0%_0.8rem)]">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="font-space text-xl font-semibold text-navy">Active Projects</h2>
              <Button variant="outline" size="sm" onClick={() => router.push('/projects')}>
                View All
              </Button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="bg-background border border-border p-4 [clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)] hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => handleProjectClick(project.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-navy text-sm mb-1">{project.title}</h4>
                    <p className="text-xs text-muted-foreground">{project.customer}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-navy/10 text-navy rounded-full capitalize">
                    {project.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div 
                      className="bg-coral-gradient-horizontal h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border p-6 [clip-path:polygon(0.8rem_0%,100%_0%,100%_calc(100%-0.8rem),calc(100%-0.8rem)_100%,0%_100%,0%_0.8rem)]">
        <h2 className="font-space text-xl font-semibold text-navy mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={() => setShowNewDealModal(true)}
          >
            <span className="text-lg">+</span>
            <span className="text-sm">New Deal</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={() => setShowNewProjectModal(true)}
          >
            <span className="text-lg">📁</span>
            <span className="text-sm">New Project</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={() => setShowReportsModal(true)}
          >
            <span className="text-lg">📊</span>
            <span className="text-sm">Reports</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/settings')}>
            <span className="text-lg">⚙️</span>
            <span className="text-sm">Settings</span>
          </Button>
        </div>
      </div>

      {/* Modals */}
      <Modal 
        isOpen={showNewDealModal} 
        onClose={() => setShowNewDealModal(false)} 
        title="Create New Deal"
        size="lg"
      >
        <NewDealForm 
          onSubmit={handleNewDeal}
          onCancel={() => setShowNewDealModal(false)}
        />
      </Modal>

      <Modal 
        isOpen={showNewProjectModal} 
        onClose={() => setShowNewProjectModal(false)} 
        title="Create New Project"
        size="lg"
      >
        <NewProjectForm 
          onSubmit={handleNewProject}
          onCancel={() => setShowNewProjectModal(false)}
        />
      </Modal>

      <Modal 
        isOpen={showReportsModal} 
        onClose={() => setShowReportsModal(false)} 
        title="Reports & Analytics"
        size="xl"
      >
        <ReportsView 
          onClose={() => setShowReportsModal(false)}
        />
      </Modal>
    </div>
  );
}