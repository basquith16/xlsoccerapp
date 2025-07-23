import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import { FilterProps } from '../../types';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterPanelProps extends FilterProps {
  placeholder?: string;
  filterOptions?: FilterOption[];
  filterLabel?: string;
}

const FilterPanel: React.FC<FilterPanelProps> = React.memo(({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onReset,
  resultCount,
  placeholder = "Search...",
  filterOptions,
  filterLabel = "Status"
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder={placeholder}
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        
        {/* Filter Controls */}
        <div className="flex items-center gap-4">
          {/* Status Filter */}
          {filterOptions && onStatusFilterChange && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                {filterLabel}:
              </label>
              <select
                value={statusFilter || ''}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Reset Button */}
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            title="Reset filters"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>
      </div>
      
      {/* Results Count */}
      {resultCount && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Showing {resultCount.filtered} of {resultCount.total} results
            {searchTerm && (
              <span className="ml-1">
                for "<span className="font-medium">{searchTerm}</span>"
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
});

FilterPanel.displayName = 'FilterPanel';

export default FilterPanel;