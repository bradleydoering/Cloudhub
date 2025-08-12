'use client';

import React, { useState } from 'react';
import { Button } from '@cloudreno/ui';

interface ReportsViewProps {
  onClose: () => void;
}

export default function ReportsView({ onClose }: ReportsViewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');

  const reports = [
    { id: 'overview', name: 'Business Overview', description: 'Key metrics and performance indicators' },
    { id: 'sales', name: 'Sales Pipeline', description: 'Deals by stage, conversion rates, and forecasting' },
    { id: 'projects', name: 'Project Performance', description: 'Project completion rates and timelines' },
    { id: 'financial', name: 'Financial Summary', description: 'Revenue, costs, and profitability analysis' },
    { id: 'customer', name: 'Customer Analytics', description: 'Customer satisfaction and retention metrics' }
  ];

  const periods = [
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' },
    { id: 'quarter', name: 'This Quarter' },
    { id: 'year', name: 'This Year' },
    { id: 'custom', name: 'Custom Range' }
  ];

  // Mock data for demonstration
  const mockData = {
    overview: {
      revenue: 485000,
      deals: 12,
      projects: 8,
      satisfaction: 98,
      growth: 15.2
    },
    charts: [
      { name: 'Revenue Trend', value: '$485K', change: '+15.2%', positive: true },
      { name: 'Deal Conversion', value: '78%', change: '+5.1%', positive: true },
      { name: 'Project Completion', value: '95%', change: '-2.1%', positive: false },
      { name: 'Customer Retention', value: '92%', change: '+3.4%', positive: true }
    ]
  };

  const handleExport = () => {
    // In a real app, this would generate and download a report
    alert(`Exporting ${reports.find(r => r.id === selectedReport)?.name} for ${periods.find(p => p.id === selectedPeriod)?.name.toLowerCase()}`);
  };

  const handleEmailReport = () => {
    // In a real app, this would send the report via email
    alert(`Emailing ${reports.find(r => r.id === selectedReport)?.name} report`);
  };

  return (
    <div className="space-y-6">
      {/* Report Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="report-type" className="block text-sm font-medium text-navy mb-2">
            Report Type
          </label>
          <select
            id="report-type"
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
          >
            {reports.map(report => (
              <option key={report.id} value={report.id}>
                {report.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-muted-foreground mt-1">
            {reports.find(r => r.id === selectedReport)?.description}
          </p>
        </div>

        <div>
          <label htmlFor="time-period" className="block text-sm font-medium text-navy mb-2">
            Time Period
          </label>
          <select
            id="time-period"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-coral focus:border-coral [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
          >
            {periods.map(period => (
              <option key={period.id} value={period.id}>
                {period.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Stats Preview */}
      <div className="bg-navy/5 border border-navy/20 rounded-lg p-6 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
        <h3 className="font-space text-lg font-semibold text-navy mb-4">Report Preview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockData.charts.map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-space font-semibold text-navy">{item.value}</div>
              <div className="text-sm text-muted-foreground">{item.name}</div>
              <div className={`text-xs font-medium ${item.positive ? 'text-coral' : 'text-muted-foreground'}`}>
                {item.change}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Actions */}
      <div className="bg-background border border-border rounded-lg p-6 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
        <h3 className="font-space text-lg font-semibold text-navy mb-4">Report Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-navy">📊 Generate Report</div>
            <Button 
              variant="coral" 
              className="w-full"
              onClick={handleExport}
            >
              Download PDF
            </Button>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-navy">📧 Email Report</div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleEmailReport}
            >
              Send via Email
            </Button>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-navy">📅 Schedule Report</div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => alert('Report scheduling coming soon!')}
            >
              Set Schedule
            </Button>
          </div>
        </div>
      </div>

      {/* Available Report Types */}
      <div>
        <h3 className="font-space text-lg font-semibold text-navy mb-4">Available Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map(report => (
            <div 
              key={report.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedReport === report.id 
                  ? 'border-coral bg-coral/5' 
                  : 'border-border bg-background hover:border-coral/50'
              } [clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)]`}
              onClick={() => setSelectedReport(report.id)}
            >
              <div className="font-medium text-navy">{report.name}</div>
              <div className="text-sm text-muted-foreground">{report.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Close Button */}
      <div className="flex justify-end pt-6 border-t border-border">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}