'use client'

import { useState } from 'react'
import { Button, ErrorBoundary } from '@cloudreno/ui'
import { useNotificationHelpers } from '../../src/components/NotificationSystem'

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
  const { notifySuccess, notifyError } = useNotificationHelpers();
  const [profile, setProfile] = useState({
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@cloudreno.com',
    phone: '+1 (604) 555-0123',
    role: 'Project Manager',
    location: 'North Vancouver',
    avatar: '',
    timezone: 'America/Vancouver',
    language: 'en'
  })
  const [originalProfile, setOriginalProfile] = useState(profile)
  const [hasChanges, setHasChanges] = useState(false)

  const handleProfileChange = (field: string, value: string) => {
    const updatedProfile = { ...profile, [field]: value };
    setProfile(updatedProfile);
    setHasChanges(JSON.stringify(updatedProfile) !== JSON.stringify(originalProfile));
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      // Simulate API call to save profile
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Update original profile to reflect saved state
      setOriginalProfile(profile)
      setHasChanges(false)
      
      notifySuccess('Profile Updated', 'Your profile has been updated successfully')
    } catch (error) {
      notifyError('Update Failed', 'Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setProfile(originalProfile)
    setHasChanges(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-space text-xl font-medium text-navy mb-4">Profile Information</h2>
        <p className="text-muted-foreground mb-6">
          Update your personal information and preferences.
        </p>
      </div>

      {/* Profile Avatar */}
      <div className="flex items-center space-x-6 pb-6 border-b border-gray-200">
        <div className="w-20 h-20 bg-coral rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {profile.firstName[0]}{profile.lastName[0]}
        </div>
        <div>
          <h3 className="text-lg font-medium text-navy">{profile.firstName} {profile.lastName}</h3>
          <p className="text-muted-foreground">{profile.role}</p>
          <Button variant="outline" size="sm" className="mt-2">
            Change Avatar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-navy mb-2">First Name *</label>
          <input
            type="text"
            value={profile.firstName}
            onChange={(e) => handleProfileChange('firstName', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-navy mb-2">Last Name *</label>
          <input
            type="text"
            value={profile.lastName}
            onChange={(e) => handleProfileChange('lastName', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-2">Email *</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => handleProfileChange('email', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-2">Phone</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => handleProfileChange('phone', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-2">Role</label>
          <select
            value={profile.role}
            onChange={(e) => handleProfileChange('role', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
          >
            <option value="Project Manager">Project Manager</option>
            <option value="Sales Manager">Sales Manager</option>
            <option value="Administrator">Administrator</option>
            <option value="Contractor">Contractor</option>
            <option value="Designer">Designer</option>
            <option value="Estimator">Estimator</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-2">Primary Location</label>
          <select
            value={profile.location}
            onChange={(e) => handleProfileChange('location', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
          >
            <option value="North Vancouver">North Vancouver</option>
            <option value="Vancouver">Vancouver</option>
            <option value="Richmond">Richmond</option>
            <option value="Burnaby">Burnaby</option>
            <option value="Surrey">Surrey</option>
            <option value="New Westminster">New Westminster</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-2">Timezone</label>
          <select
            value={profile.timezone}
            onChange={(e) => handleProfileChange('timezone', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
          >
            <option value="America/Vancouver">Pacific Time (Vancouver)</option>
            <option value="America/Edmonton">Mountain Time (Edmonton)</option>
            <option value="America/Toronto">Eastern Time (Toronto)</option>
            <option value="America/Halifax">Atlantic Time (Halifax)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-2">Language</label>
          <select
            value={profile.language}
            onChange={(e) => handleProfileChange('language', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
          </select>
        </div>
      </div>

      {/* Change indicator */}
      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center">
            <span className="text-yellow-800 text-sm">⚠️ You have unsaved changes</span>
          </div>
        </div>
      )}

      <div className="flex gap-4 pt-6">
        <Button 
          onClick={handleSave} 
          disabled={loading || !hasChanges}
          variant={hasChanges ? "coral" : "default"}
        >
          {loading ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes'}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleCancel}
          disabled={loading || !hasChanges}
        >
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
  const { notifySuccess } = useNotificationHelpers();
  const [settings, setSettings] = useState({
    email: {
      projectUpdates: true,
      dealChanges: true,
      changeOrders: true,
      invoiceReminders: true,
      systemAlerts: false
    },
    push: {
      projectUpdates: true,
      dealChanges: false,
      changeOrders: true,
      invoiceReminders: false,
      systemAlerts: true
    },
    frequency: 'immediate' // immediate, daily, weekly
  });

  const handleToggle = (category: 'email' | 'push', setting: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting as keyof typeof prev[typeof category]]
      }
    }));
  };

  const handleSave = () => {
    // Simulate save
    notifySuccess('Notifications Updated', 'Your notification preferences have been saved');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-space text-xl font-medium text-navy mb-4">Notification Preferences</h2>
        <p className="text-muted-foreground mb-6">
          Choose how you want to be notified about important updates.
        </p>
      </div>

      {/* Email Notifications */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-medium text-navy mb-4 flex items-center">
          📧 Email Notifications
        </h3>
        <div className="space-y-3">
          {Object.entries(settings.email).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handleToggle('email', key)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coral/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coral"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-medium text-navy mb-4 flex items-center">
          📱 Push Notifications
        </h3>
        <div className="space-y-3">
          {Object.entries(settings.push).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handleToggle('push', key)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coral/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coral"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Frequency */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-medium text-navy mb-4">📅 Notification Frequency</h3>
        <div className="space-y-2">
          {['immediate', 'daily', 'weekly'].map((freq) => (
            <label key={freq} className="flex items-center">
              <input
                type="radio"
                name="frequency"
                value={freq}
                checked={settings.frequency === freq}
                onChange={(e) => setSettings(prev => ({ ...prev, frequency: e.target.value }))}
                className="mr-3 text-coral focus:ring-coral"
              />
              <span className="text-sm capitalize">{freq}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <Button onClick={handleSave}>
          Save Preferences
        </Button>
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