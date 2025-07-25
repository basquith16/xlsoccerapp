import React from 'react';
import { Eye, Edit, Trash2, Clock, Users, Calendar } from 'lucide-react';
import Card from '../../ui/Card';

interface InstanceTableProps {
  instances: any[];
  onViewInstance: (instance: any) => void;
  onEditInstance: (instance: any) => void;
  onDeleteInstance: (instance: any) => void;
}

const InstanceTable: React.FC<InstanceTableProps> = ({
  instances,
  onViewInstance,
  onEditInstance,
  onDeleteInstance
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    if (!timeString || timeString === 'Invalid Date') return 'Time TBD';
    
    // Handle different time formats
    try {
      // If it's already a time string like "14:30"
      if (timeString.includes(':') && !timeString.includes('T')) {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
      
      // If it's a full date/time string
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        return 'Time TBD';
      }
      
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return 'Time TBD';
    }
  };

  const getStatusBadge = (instance: any) => {
    if (instance.isCancelled) {
      return { text: 'Cancelled', class: 'bg-red-100 text-red-800' };
    }
    if (!instance.isActive) {
      return { text: 'Inactive', class: 'bg-gray-100 text-gray-800' };
    }
    if (instance.isPast) {
      return { text: 'Past', class: 'bg-blue-100 text-blue-800' };
    }
    if (instance.isUpcoming) {
      return { text: 'Upcoming', class: 'bg-yellow-100 text-yellow-800' };
    }
    return { text: 'Unknown', class: 'bg-gray-100 text-gray-800' };
  };

  const getBookingStatus = (instance: any) => {
    const percentage = instance.bookingPercentage || 0;
    if (percentage >= 90) {
      return { text: 'Full', class: 'bg-red-100 text-red-800' };
    }
    if (percentage >= 75) {
      return { text: 'Almost Full', class: 'bg-orange-100 text-orange-800' };
    }
    if (percentage >= 50) {
      return { text: 'Half Full', class: 'bg-yellow-100 text-yellow-800' };
    }
    return { text: 'Available', class: 'bg-green-100 text-green-800' };
  };

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Instance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Template
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacity
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
            {instances.map((instance: any) => {
              const statusBadge = getStatusBadge(instance);
              const bookingStatus = getBookingStatus(instance);
              return (
                <tr key={instance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium text-gray-900 truncate">{instance.name}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {instance.coaches?.length || 0} coaches assigned
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium truncate">
                        {instance.templateInfo?.name || instance.template?.name || 'No Template'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium truncate">
                        {instance.periodInfo?.name || instance.period?.name || 'No Period'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{formatDate(instance.date)}</div>
                      <div className="text-gray-500">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {formatTime(instance.startTime)} - {formatTime(instance.endTime)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-gray-400" />
                        {instance.bookedCount || 0}/{instance.capacity || 0}
                      </div>
                      <div className="mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${bookingStatus.class}`}>
                          {bookingStatus.text}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.class}`}>
                      {statusBadge.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewInstance(instance)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Instance"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditInstance(instance)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit Instance"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteInstance(instance)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Instance"
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
        
        {instances.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No session instances found</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default InstanceTable; 