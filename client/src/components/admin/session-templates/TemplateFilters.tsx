import React from 'react';
import { Search } from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

interface TemplateFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  filterSport: string;
  onSportChange: (value: string) => void;
  filterDemo: string;
  onDemoChange: (value: string) => void;
  filterStaffOnly: string;
  onStaffOnlyChange: (value: string) => void;
  onResetFilters: () => void;
  filteredCount: number;
  totalCount: number;
  sports: string[];
  demos: string[];
}

const TemplateFilters: React.FC<TemplateFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterSport,
  onSportChange,
  filterDemo,
  onDemoChange,
  filterStaffOnly,
  onStaffOnlyChange,
  onResetFilters,
  filteredCount,
  totalCount,
  sports,
  demos
}) => {
  return (
    <Card>
      <div className="space-y-4">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates by name, description, sport, or demo..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <Button
            onClick={onResetFilters}
            variant="outline"
            className="whitespace-nowrap"
          >
            Reset Filters
          </Button>
        </div>

        {/* Filter Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
            <select
              value={filterSport}
              onChange={(e) => onSportChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Sports</option>
              {sports.map((sport: any) => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Demo</label>
            <select
              value={filterDemo}
              onChange={(e) => onDemoChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Demos</option>
              {demos.map((demo: any) => (
                <option key={demo} value={demo}>{demo}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
            <select
              value={filterStaffOnly}
              onChange={(e) => onStaffOnlyChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Templates</option>
              <option value="public">Public</option>
              <option value="staff">Staff Only</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              {filteredCount} of {totalCount} templates
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TemplateFilters; 