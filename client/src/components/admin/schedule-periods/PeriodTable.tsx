import React from 'react';
import { Eye, Edit, Trash2, Calendar } from 'lucide-react';
import Card from '../../ui/Card';

interface PeriodTableProps {
  periods: any[];
  onViewPeriod: (period: any) => void;
  onEditPeriod: (period: any) => void;
  onDeletePeriod: (period: any) => void;
}

const PeriodTable: React.FC<PeriodTableProps> = ({
  periods,
  onViewPeriod,
  onEditPeriod,
  onDeletePeriod
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (period: any) => {
    if (!period.isActive) {
      return { text: 'Inactive', class: 'bg-red-100 text-red-800' };
    }
    if (period.isCurrentlyActive) {
      return { text: 'Active', class: 'bg-green-100 text-green-800' };
    }
    if (period.isUpcoming) {
      return { text: 'Upcoming', class: 'bg-blue-100 text-blue-800' };
    }
    if (period.isPast) {
      return { text: 'Past', class: 'bg-gray-100 text-gray-800' };
    }
    return { text: 'Unknown', class: 'bg-gray-100 text-gray-800' };
  };

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Template
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Instances
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {periods.map((period: any) => {
              const statusBadge = getStatusBadge(period);
              return (
                <tr key={period.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium text-gray-900 truncate">{period.name}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {period.coaches?.length || 0} coaches assigned
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="max-w-xs">
                      <div className="font-medium">{period.template?.name}</div>
                      <div className="text-gray-500">{period.template?.sport} - {period.template?.demo}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{formatDate(period.startDate)}</div>
                      <div className="text-gray-500">to {formatDate(period.endDate)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {period.capacity} players
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {period.instancesCount || 0} total
                    <br />
                    <span className="text-gray-500">{period.activeInstancesCount || 0} active</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.class}`}>
                      {statusBadge.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewPeriod(period)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Period"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditPeriod(period)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit Period"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeletePeriod(period)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Period"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {periods.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No schedule periods found</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PeriodTable; 