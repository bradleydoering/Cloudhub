'use client'

import { useState, useEffect } from 'react'
import { Button } from '@cloudreno/ui'
import { supabase, type Location } from '@cloudreno/lib'

interface LocationSwitcherProps {
  currentLocationId?: string
  organizationId: string
  onLocationChange: (locationId: string) => void
}

export function LocationSwitcher({ 
  currentLocationId, 
  organizationId, 
  onLocationChange 
}: LocationSwitcherProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLocations() {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('is_active', true)
          .order('name')

        if (error) throw error
        setLocations(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load locations')
      } finally {
        setLoading(false)
      }
    }

    if (organizationId) {
      fetchLocations()
    }
  }, [organizationId])

  const currentLocation = locations.find(loc => loc.id === currentLocationId)
  const allLocationsOption = { id: 'all', name: 'All Locations', city: '', state: '' }

  const handleLocationSelect = (locationId: string) => {
    onLocationChange(locationId)
    setIsOpen(false)
  }

  if (loading) {
    return (
      <div className="w-48 h-9 bg-gray-200 rounded animate-pulse"></div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">
        Failed to load locations
      </div>
    )
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-48 justify-between"
      >
        <div className="flex items-center">
          <span className="text-sm">📍</span>
          <span className="ml-2 truncate">
            {currentLocation ? currentLocation.name : 'All Locations'}
          </span>
        </div>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ↓
        </span>
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-64 overflow-auto">
          {/* All Locations Option */}
          <button
            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b ${
              !currentLocationId ? 'bg-coral/5 text-coral font-medium' : ''
            }`}
            onClick={() => handleLocationSelect('all')}
          >
            <div className="flex items-center">
              <span className="text-sm mr-2">🌐</span>
              <div>
                <div className="font-medium">All Locations</div>
                <div className="text-xs text-muted-foreground">
                  View data from all locations
                </div>
              </div>
            </div>
          </button>

          {/* Individual Locations */}
          {locations.map((location) => (
            <button
              key={location.id}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                currentLocationId === location.id ? 'bg-coral/5 text-coral font-medium' : ''
              }`}
              onClick={() => handleLocationSelect(location.id)}
            >
              <div className="flex items-center">
                <span className="text-sm mr-2">📍</span>
                <div>
                  <div className="font-medium">{location.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {location.city}, {location.state}
                  </div>
                </div>
              </div>
            </button>
          ))}

          {locations.length === 0 && (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              No locations available
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

// Hook for location management
export function useLocationFilter(organizationId: string) {
  const [selectedLocationId, setSelectedLocationId] = useState<string>('all')
  const [locations, setLocations] = useState<Location[]>([])

  useEffect(() => {
    async function fetchLocations() {
      if (!organizationId) return

      try {
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('is_active', true)
          .order('name')

        if (error) throw error
        setLocations(data || [])
      } catch (err) {
        console.error('Failed to fetch locations:', err)
      }
    }

    fetchLocations()
  }, [organizationId])

  const filterByLocation = <T extends { location_id?: string | null }>(items: T[]): T[] => {
    if (selectedLocationId === 'all') {
      return items
    }
    return items.filter(item => item.location_id === selectedLocationId)
  }

  const currentLocation = locations.find(loc => loc.id === selectedLocationId)

  return {
    selectedLocationId,
    setSelectedLocationId,
    locations,
    currentLocation,
    filterByLocation
  }
}