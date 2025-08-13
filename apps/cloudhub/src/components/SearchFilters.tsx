'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@cloudreno/ui';

export interface FilterOption {
  id: string;
  label: string;
  value?: string | number | boolean;
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'boolean';
  options?: { value: string | number; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: FilterOption[];
  activeFilters: Record<string, any>;
  onFilterChange: (filterId: string, value: any) => void;
  onClearFilters: () => void;
  className?: string;
  showAdvanced?: boolean;
  onToggleAdvanced?: () => void;
}

export default function SearchFilters({
  searchTerm,
  onSearchChange,
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters,
  className = '',
  showAdvanced = false,
  onToggleAdvanced
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const activeFilterCount = Object.keys(activeFilters).filter(key => {
    const value = activeFilters[key];
    return value !== null && value !== undefined && value !== '' && 
           !(Array.isArray(value) && value.length === 0);
  }).length;

  const handleFilterChange = useCallback((filterId: string, value: any) => {
    onFilterChange(filterId, value);
  }, [onFilterChange]);

  const renderFilterInput = (filter: FilterOption) => {
    const value = activeFilters[filter.id];

    switch (filter.type) {
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="w-full px-3 py-2 text-sm border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
          >
            <option value="">{filter.placeholder || `All ${filter.label}`}</option>
            {filter.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="relative">
            <select
              multiple
              value={Array.isArray(value) ? value : []}
              onChange={(e) => {
                const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                handleFilterChange(filter.id, selectedValues);
              }}
              className="w-full px-3 py-2 text-sm border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral min-h-[100px]"
            >
              {filter.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="text-xs text-muted-foreground mt-1">
              Hold Ctrl/Cmd to select multiple
            </div>
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="w-full px-3 py-2 text-sm border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
          />
        );

      case 'daterange':
        return (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={value?.start || ''}
              onChange={(e) => handleFilterChange(filter.id, { ...value, start: e.target.value })}
              placeholder="Start date"
              className="w-full px-3 py-2 text-sm border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
            />
            <input
              type="date"
              value={value?.end || ''}
              onChange={(e) => handleFilterChange(filter.id, { ...value, end: e.target.value })}
              placeholder="End date"
              className="w-full px-3 py-2 text-sm border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
            />
          </div>
        );

      case 'number':
        return (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={value?.min || ''}
              onChange={(e) => handleFilterChange(filter.id, { ...value, min: Number(e.target.value) || undefined })}
              placeholder={`Min ${filter.label.toLowerCase()}`}
              min={filter.min}
              max={filter.max}
              className="w-full px-3 py-2 text-sm border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
            />
            <input
              type="number"
              value={value?.max || ''}
              onChange={(e) => handleFilterChange(filter.id, { ...value, max: Number(e.target.value) || undefined })}
              placeholder={`Max ${filter.label.toLowerCase()}`}
              min={filter.min}
              max={filter.max}
              className="w-full px-3 py-2 text-sm border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
            />
          </div>
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name={filter.id}
                value="true"
                checked={value === true}
                onChange={() => handleFilterChange(filter.id, true)}
                className="mr-2 text-coral focus:ring-coral"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={filter.id}
                value="false"
                checked={value === false}
                onChange={() => handleFilterChange(filter.id, false)}
                className="mr-2 text-coral focus:ring-coral"
              />
              <span className="text-sm">No</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={filter.id}
                value=""
                checked={value === null || value === undefined}
                onChange={() => handleFilterChange(filter.id, null)}
                className="mr-2 text-coral focus:ring-coral"
              />
              <span className="text-sm">Any</span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  const basicFilters = filters.slice(0, 3);
  const advancedFilters = filters.slice(3);

  return (
    <div className={`bg-card border border-border rounded-lg p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)] ${className}`}>
      {/* Search Bar */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-muted-foreground">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>
        
        {/* Filter Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <span>🔽</span>
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-coral text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
        
        {/* Clear Filters Button */}
        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-coral border-coral hover:bg-coral/10"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {basicFilters.map(filter => (
              <div key={filter.id}>
                <label className="block text-sm font-medium text-navy mb-2">
                  {filter.label}
                </label>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>

          {/* Advanced Filters Toggle */}
          {advancedFilters.length > 0 && (
            <div className="border-t border-border pt-4">
              <button
                onClick={() => onToggleAdvanced?.()}
                className="flex items-center gap-2 text-sm font-medium text-navy hover:text-coral transition-colors"
              >
                <span className={`transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>▶</span>
                Advanced Filters
              </button>
              
              {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {advancedFilters.map(filter => (
                    <div key={filter.id}>
                      <label className="block text-sm font-medium text-navy mb-2">
                        {filter.label}
                      </label>
                      {renderFilterInput(filter)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Utility hook for managing search and filter state
export function useSearchFilters(initialFilters: Record<string, any> = {}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = useCallback((filterId: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters({});
    setSearchTerm('');
  }, []);

  const toggleAdvanced = useCallback(() => {
    setShowAdvanced(prev => !prev);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    activeFilters,
    setActiveFilters,
    showAdvanced,
    handleFilterChange,
    clearFilters,
    toggleAdvanced
  };
}

// Utility function for filtering data based on search and filters
export function filterData<T extends Record<string, any>>(
  data: T[],
  searchTerm: string,
  filters: Record<string, any>,
  searchFields: (keyof T)[]
): T[] {
  return data.filter(item => {
    // Search term matching
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchFields.some(field => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchLower);
      });
      if (!matchesSearch) return false;
    }

    // Filter matching
    for (const [filterKey, filterValue] of Object.entries(filters)) {
      if (filterValue === null || filterValue === undefined || filterValue === '') continue;
      
      const itemValue = item[filterKey];
      
      if (Array.isArray(filterValue)) {
        if (filterValue.length === 0) continue;
        if (!filterValue.includes(itemValue)) return false;
      } else if (typeof filterValue === 'object' && filterValue.start !== undefined) {
        // Date range filter
        const itemDate = new Date(itemValue);
        if (filterValue.start && itemDate < new Date(filterValue.start)) return false;
        if (filterValue.end && itemDate > new Date(filterValue.end)) return false;
      } else if (typeof filterValue === 'object' && filterValue.min !== undefined) {
        // Number range filter
        const numValue = Number(itemValue);
        if (filterValue.min !== undefined && numValue < filterValue.min) return false;
        if (filterValue.max !== undefined && numValue > filterValue.max) return false;
      } else if (typeof filterValue === 'boolean') {
        if (itemValue !== filterValue) return false;
      } else {
        if (itemValue !== filterValue) return false;
      }
    }

    return true;
  });
}