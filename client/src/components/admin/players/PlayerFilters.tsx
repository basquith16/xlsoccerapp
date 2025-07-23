import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import Button from '../../ui/Button';

interface PlayerFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterSex: string;
  onSexChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  filterWaiverStatus: string;
  onWaiverStatusChange: (value: string) => void;
  onResetFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

const PlayerFilters: React.FC<PlayerFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterSex,
  onSexChange,
  filterStatus,
  onStatusChange,
  filterWaiverStatus,
  onWaiverStatusChange,
  onResetFilters,
  filteredCount,
  totalCount
}) => {
  const hasActiveFilters = searchTerm || filterSex !== 'all' || filterStatus !== 'all' || filterWaiverStatus !== 'all';

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search players by name..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Sex Filter */}
        <div className="lg:w-48">
          <select
            value={filterSex}
            onChange={(e) => onSexChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Sex</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="lg:w-48">
          <select
            value={filterStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Ages</option>
            <option value="minor">Minor (Under 18)</option>
            <option value="adult">Adult (18+)</option>
          </select>
        </div>

        {/* Waiver Status Filter */}
        <div className="lg:w-48">
          <select
            value={filterWaiverStatus}
            onChange={(e) => onWaiverStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Waivers</option>
            <option value="signed">Waiver Signed</option>
            <option value="pending">Waiver Pending</option>
          </select>
        </div>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <div className="lg:w-auto">
            <Button
              onClick={onResetFilters}
              variant="outline"
              className="flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>
            Showing {filteredCount} of {totalCount} players
          </span>
        </div>
        {hasActiveFilters && (
          <span className="text-blue-600">
            {filteredCount} result{filteredCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
};

export default PlayerFilters;