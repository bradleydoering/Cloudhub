'use client';

import { useState } from 'react';
import { Button } from '@cloudreno/ui';

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

function DealCard({ deal }: { deal: Deal }) {
  const priorityColors = {
    low: 'border-l-navy/40',
    medium: 'border-l-navy/60',
    high: 'border-l-coral/60',
    urgent: 'border-l-coral'
  };

  return (
    <div className={`bg-card border border-border p-4 border-l-4 ${priorityColors[deal.priority]} [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)] hover:shadow-md transition-shadow cursor-pointer`}>
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-space font-medium text-navy text-sm leading-tight">{deal.title}</h4>
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

function KanbanColumn({ stage, deals }: { stage: typeof stages[0], deals: Deal[] }) {
  return (
    <div className="flex-1 min-w-80">
      <div className="bg-muted p-3 mb-4 [clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)]">
        <div className="flex items-center justify-between">
          <h3 className="font-space font-medium text-foreground">{stage.name}</h3>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full ${stage.color} font-medium`}>
              {deals.length}
            </span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              +
            </Button>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {deals.map(deal => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>
    </div>
  );
}

export default function DealsPage() {
  const [deals] = useState<Deal[]>(mockDeals);

  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = deals.filter(deal => deal.stage === stage.id);
    return acc;
  }, {} as Record<string, Deal[]>);

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const averageValue = totalValue / deals.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-space text-3xl font-semibold text-navy">Deals Pipeline</h1>
          <p className="text-muted-foreground mt-1">Manage your renovation project opportunities</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Button variant="outline">
            Import Deals
          </Button>
          <Button variant="coral">
            + New Deal
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
          <div className="text-2xl font-space font-semibold text-navy">{deals.length}</div>
          <div className="text-sm text-muted-foreground">Active Deals</div>
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
            />
          ))}
        </div>
      </div>
    </div>
  );
}