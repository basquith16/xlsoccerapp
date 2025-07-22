import React from 'react';
import { Search } from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

interface InstanceFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  filterTemplate: string;
  onTemplateChange: (value: string) => void;
  filterPeriod: string;
  onPeriodChange: (value: string) => void;
  filterDate: string;
  onDateChange: (value: string) => void;
  onResetFilters: () => void;
  filteredCount: number;
  totalCount: number;
  uniqueTemplates: string[];
  uniquePeriods: string[];
  instances: any[];
}

const InstanceFilters: React.FC<InstanceFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterTemplate,
  onTemplateChange,
  filterPeriod,
  onPeriodChange,
  filterDate,
  onDateChange,
  onResetFilters,
  filteredCount,
  totalCount,
  uniqueTemplates,
  uniquePeriods,
  instances
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
                placeholder="Search instances by name, template, or period..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="cancelled">Cancelled</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
            <select
              value={filterTemplate}
              onChange={(e) => onTemplateChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Templates</option>
              {uniqueTemplates.map((templateId: any) => {
                const instance = instances.find((i: any) => i.templateInfo?.id === templateId);
                return (
                  <option key={templateId} value={templateId}>
                    {instance?.templateInfo?.name || 'Unknown Template'}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <select
              value={filterPeriod}
              onChange={(e) => onPeriodChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Periods</option>
              {uniquePeriods.map((periodId: any) => {
                const instance = instances.find((i: any) => i.periodInfo?.id === periodId);
                return (
                  <option key={periodId} value={periodId}>
                    {instance?.periodInfo?.name || 'Unknown Period'}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <select
              value={filterDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              {filteredCount} of {totalCount} instances
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InstanceFilters; 