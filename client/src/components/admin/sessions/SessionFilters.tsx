import React from 'react';
import { Search, Filter } from 'lucide-react';
import Card from '../../ui/Card';

interface SessionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  onReset: () => void;
}

const SessionFilters: React.FC<SessionFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onStatusChange,
  onReset
}) => {
  return (
    <Card>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Sessions</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {(searchTerm || filterStatus !== 'all') && (
            <button
              onClick={onReset}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              style={{ fontSize: '1.2rem' }}
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default SessionFilters; 