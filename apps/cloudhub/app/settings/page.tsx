'use client'

import { useState } from 'react'
import { Button, ErrorBoundary } from '@cloudreno/ui'

const settingsSections = [
  { id: 'profile', name: 'Profile', icon: '👤' },
  { id: 'organization', name: 'Organization', icon: '🏢' },
  { id: 'notifications', name: 'Notifications', icon: '🔔' },
  { id: 'security', name: 'Security', icon: '🔒' },
  { id: 'integrations', name: 'Integrations', icon: '🔗' },
  { id: 'billing', name: 'Billing', icon: '💳' }
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile')
  const [loading, setLoading] = useState(false)

  return (
    <ErrorBoundary>
      <div className="section-padding">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-space text-3xl font-semibold text-navy mb-2">
            Settings
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your account, organization, and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="glass rounded-lg p-4 [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
              <nav className="space-y-1">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-coral text-white'
                        : 'text-navy hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-3">{section.icon}</span>
                    <span className="font-medium">{section.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-8 [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
              {activeSection === 'profile' && <ProfileSettings loading={loading} setLoading={setLoading} />}
              {activeSection === 'organization' && <OrganizationSettings />}
              {activeSection === 'notifications' && <NotificationSettings />}
              {activeSection === 'security' && <SecuritySettings />}
              {activeSection === 'integrations' && <IntegrationsSettings />}
              {activeSection === 'billing' && <BillingSettings />}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

function ProfileSettings({ loading, setLoading }: { loading: boolean, setLoading: (loading: boolean) => void }) {
  const [profile, setProfile] = useState({
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@cloudreno.com',
    phone: '+1 (604) 555-0123',
    role: 'Project Manager',
    location: 'North Vancouver'
  })

  const handleSave = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
    // Show success message
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-space text-xl font-medium text-navy mb-4">Profile Information</h2>
        <p className="text-muted-foreground mb-6">
          Update your personal information and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-navy mb-2">First Name</label>
          <input
            type="text"
            value={profile.firstName}
            onChange={(e) => setProfile({...profile, firstName: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-navy mb-2">Last Name</label>
          <input
            type="text"
            value={profile.lastName}
            onChange={(e) => setProfile({...profile, lastName: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-2">Email</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({...profile, email: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-2">Phone</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile({...profile, phone: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-2">Role</label>
          <select
            value={profile.role}
            onChange={(e) => setProfile({...profile, role: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
          >
            <option>Project Manager</option>
            <option>Sales Manager</option>
            <option>Administrator</option>
            <option>Contractor</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-2">Primary Location</label>
          <select
            value={profile.location}
            onChange={(e) => setProfile({...profile, location: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
          >
            <option>North Vancouver</option>
            <option>Vancouver</option>
            <option>Richmond</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button variant="outline">
          Cancel
        </Button>
      </div>
    </div>
  )
}

function OrganizationSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-space text-xl font-medium text-navy mb-4">Organization Settings</h2>
        <p className="text-muted-foreground mb-6">
          Manage organization details and team settings.
        </p>
      </div>
      
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏢</div>
        <h3 className="font-space text-lg font-medium text-navy mb-2">Organization Management</h3>
        <p className="text-muted-foreground">Organization settings coming soon</p>
      </div>
    </div>
  )
}

function NotificationSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-space text-xl font-medium text-navy mb-4">Notification Preferences</h2>
        <p className="text-muted-foreground mb-6">
          Choose how you want to be notified about important updates.
        </p>
      </div>
      
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔔</div>
        <h3 className="font-space text-lg font-medium text-navy mb-2">Notifications</h3>
        <p className="text-muted-foreground">Notification settings coming soon</p>
      </div>
    </div>
  )
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-space text-xl font-medium text-navy mb-4">Security Settings</h2>
        <p className="text-muted-foreground mb-6">
          Manage your password and security preferences.
        </p>
      </div>
      
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="font-space text-lg font-medium text-navy mb-2">Security</h3>
        <p className="text-muted-foreground">Security settings coming soon</p>
      </div>
    </div>
  )
}

function IntegrationsSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-space text-xl font-medium text-navy mb-4">Integrations</h2>
        <p className="text-muted-foreground mb-6">
          Connect CloudHub with your favorite tools and services.
        </p>
      </div>
      
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔗</div>
        <h3 className="font-space text-lg font-medium text-navy mb-2">Integrations</h3>
        <p className="text-muted-foreground">Integration settings coming soon</p>
      </div>
    </div>
  )
}

function BillingSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-space text-xl font-medium text-navy mb-4">Billing & Subscription</h2>
        <p className="text-muted-foreground mb-6">
          Manage your subscription and payment information.
        </p>
      </div>
      
      <div className="text-center py-12">
        <div className="text-6xl mb-4">💳</div>
        <h3 className="font-space text-lg font-medium text-navy mb-2">Billing</h3>
        <p className="text-muted-foreground">Billing settings coming soon</p>
      </div>
    </div>
  )
}