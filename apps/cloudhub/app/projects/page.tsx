'use client';

import { useState } from 'react';
import { Button } from '@cloudreno/ui';

type Project = {
  id: string;
  projectNumber: string;
  title: string;
  customer: string;
  address: string;
  status: 'not-started' | 'in-progress' | 'on-hold' | 'completed';
  percentComplete: number;
  contractAmount: number;
  startDate: string;
  expectedCompletion: string;
  manager: string;
};

const mockProjects: Project[] = [
  {
    id: '1',
    projectNumber: 'CR-2025-001',
    title: 'Kitchen Renovation - Doe Residence',
    customer: 'John & Jane Doe',
    address: '123 Maple Street, North Vancouver, BC',
    status: 'in-progress',
    percentComplete: 45,
    contractAmount: 35000,
    startDate: '2025-07-01',
    expectedCompletion: '2025-09-15',
    manager: 'Sarah Johnson'
  },
  {
    id: '2',
    projectNumber: 'CR-2025-002',
    title: 'Master Suite Addition',
    customer: 'Alice Wong',
    address: '789 Pine Road, Burnaby, BC',
    status: 'in-progress',
    percentComplete: 25,
    contractAmount: 75000,
    startDate: '2025-06-15',
    expectedCompletion: '2025-10-20',
    manager: 'Emily Rodriguez'
  },
];

const tabs = [
  { id: 'overview', name: 'Overview' },
  { id: 'timeline', name: 'Timeline' },
  { id: 'documents', name: 'Documents' },
  { id: 'change-orders', name: 'Change Orders' },
  { id: 'photos', name: 'Photos' },
  { id: 'invoices', name: 'Invoices & Payments' },
];

function ProjectCard({ project, onSelect }: { project: Project, onSelect: () => void }) {
  const statusColors = {
    'not-started': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'on-hold': 'bg-yellow-100 text-yellow-800',
    'completed': 'bg-green-100 text-green-800'
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
          <p className="text-sm text-muted-foreground font-mono">{project.projectNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-space font-semibold text-coral">
            ${project.contractAmount.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">{project.percentComplete}% complete</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-sm font-medium text-foreground">{project.customer}</p>
        <p className="text-sm text-muted-foreground">{project.address}</p>
        <p className="text-sm text-muted-foreground">PM: {project.manager}</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{project.percentComplete}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-coral-gradient-horizontal h-2 rounded-full transition-all duration-300" 
            style={{ width: `${project.percentComplete}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Started: {new Date(project.startDate).toLocaleDateString()}</span>
          <span>Due: {new Date(project.expectedCompletion).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

function ProjectDetail({ project, activeTab, setActiveTab }: { 
  project: Project, 
  activeTab: string, 
  setActiveTab: (tab: string) => void 
}) {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border p-4 [clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)]">
                <div className="text-2xl font-space font-semibold text-navy mb-1">{project.percentComplete}%</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
              <div className="bg-card border border-border p-4 [clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)]">
                <div className="text-2xl font-space font-semibold text-coral">${project.contractAmount.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Contract Value</div>
              </div>
              <div className="bg-card border border-border p-4 [clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)]">
                <div className="text-2xl font-space font-semibold text-navy">32</div>
                <div className="text-sm text-muted-foreground">Days Remaining</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border p-6 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
                <h4 className="font-space font-medium text-navy mb-4">Project Details</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-medium">{project.customer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address:</span>
                    <span className="font-medium text-right">{project.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Project Manager:</span>
                    <span className="font-medium">{project.manager}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="font-medium">{new Date(project.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected Completion:</span>
                    <span className="font-medium">{new Date(project.expectedCompletion).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border p-6 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
                <h4 className="font-space font-medium text-navy mb-4">Recent Activity</h4>
                <div className="space-y-3">
                  <div className="border-l-2 border-coral pl-3">
                    <p className="text-sm font-medium">Electrical rough-in completed</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                  <div className="border-l-2 border-blue-300 pl-3">
                    <p className="text-sm font-medium">Plumbing inspection passed</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                  <div className="border-l-2 border-green-300 pl-3">
                    <p className="text-sm font-medium">Demolition phase completed</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
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
              {[
                { phase: 'Demolition', status: 'completed', date: '2025-07-01 - 2025-07-10' },
                { phase: 'Electrical Rough-in', status: 'completed', date: '2025-07-11 - 2025-07-18' },
                { phase: 'Plumbing Rough-in', status: 'in-progress', date: '2025-07-19 - 2025-07-26' },
                { phase: 'Drywall & Paint', status: 'pending', date: '2025-07-27 - 2025-08-10' },
                { phase: 'Finishes Installation', status: 'pending', date: '2025-08-11 - 2025-09-01' },
                { phase: 'Final Inspection', status: 'pending', date: '2025-09-10 - 2025-09-15' },
              ].map((phase, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    phase.status === 'completed' ? 'bg-green-500' :
                    phase.status === 'in-progress' ? 'bg-coral' : 'bg-gray-300'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{phase.phase}</span>
                      <span className="text-sm text-muted-foreground">{phase.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
            <p className="text-muted-foreground font-mono">{project.projectNumber}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Edit Project</Button>
            <Button variant="coral" size="sm">Update Status</Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{project.percentComplete}% Complete</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3">
            <div 
              className="bg-coral-gradient-horizontal h-3 rounded-full transition-all duration-500" 
              style={{ width: `${project.percentComplete}%` }}
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
  const [projects] = useState<Project[]>(mockProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  if (selectedProject) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedProject(null)}
            size="sm"
          >
            ← Back to Projects
          </Button>
        </div>
        <ProjectDetail 
          project={selectedProject} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
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
          <Button variant="outline">
            Export Projects
          </Button>
          <Button variant="coral">
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
            ${projects.reduce((sum, p) => sum + p.contractAmount, 0).toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Contract Value</div>
        </div>
        <div className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          <div className="text-2xl font-space font-semibold text-navy">
            {Math.round(projects.reduce((sum, p) => sum + p.percentComplete, 0) / projects.length)}%
          </div>
          <div className="text-sm text-muted-foreground">Average Progress</div>
        </div>
        <div className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          <div className="text-2xl font-space font-semibold text-green-600">100%</div>
          <div className="text-sm text-muted-foreground">On Time Delivery</div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onSelect={() => setSelectedProject(project)}
          />
        ))}
      </div>
    </div>
  );
}