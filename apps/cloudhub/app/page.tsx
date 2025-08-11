'use client';

import { useState } from 'react';
import { Button } from '@cloudreno/ui';
import { apiClient } from '@cloudreno/lib';

export default function Home() {
  const [apiStatus, setApiStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testApiConnection = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/api/health') as { service: string; time: string };
      setApiStatus(`✅ API Connected: ${response.service} (${response.time})`);
    } catch (error) {
      setApiStatus(`❌ API Error: ${error instanceof Error ? error.message : 'Connection failed'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="section-padding">
      <div className="glass p-8 [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
        <div className="text-center">
          <h1 className="font-space text-4xl font-semibold text-navy mb-4">
            Welcome to CloudHub
          </h1>
          <p className="text-lg text-muted-foreground mb-8 font-inter">
            Staff portal for managing deals and projects
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button variant="coral" size="lg" className="min-w-32">
              View Deals
            </Button>
            <Button variant="outline" size="lg" className="min-w-32">
              View Projects
            </Button>
          </div>
          
          <div className="mt-8 p-6 bg-card border border-border [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
            <h3 className="font-space text-lg font-medium text-navy mb-4">System Status</h3>
            <div className="space-y-3">
              <Button 
                onClick={testApiConnection}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="min-w-40"
              >
                {isLoading ? 'Testing...' : 'Test API Connection'}
              </Button>
              {apiStatus && (
                <p className="text-sm font-mono text-muted-foreground bg-muted px-3 py-2 rounded">{apiStatus}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}