import React from 'react';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, Calendar, Users, Clock } from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

interface InstanceListProps {
  instances: any[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewInstance: (instance: any) => void;
  onEditInstance: (instance: any) => void;
  onDeleteInstance: (instance: any) => void;
}

const InstanceList: React.FC<InstanceListProps> = ({
  instances,
  currentPage,
  totalPages,
  onPageChange,
  onViewInstance,
  onEditInstance,
  onDeleteInstance
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusBadge = (instance: any) => {
    if (instance.isCancelled) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Cancelled</span>;
    }
    if (!instance.isActive) {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Inactive</span>;
    }
    if (instance.isPast) {
      return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Past</span>;
    }
    if (instance.isUpcoming) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Upcoming</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Active</span>;
  };

  const getBookingStatus = (instance: any) => {
    const percentage = instance.bookingPercentage || 0;
    if (percentage >= 90) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Full</span>;
    }
    if (percentage >= 75) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Almost Full</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Available</span>;
  };

  return (
    <div className="space-y-4">
      {/* Instance Cards */}
      <div className="grid gap-4">
        {instances.map((instance) => (
          <Card key={instance.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{instance.name}</h3>
                  {getStatusBadge(instance)}
                  {getBookingStatus(instance)}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(instance.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(instance.startTime)} - {formatTime(instance.endTime)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{instance.bookedCount}/{instance.capacity}</span>
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">Template:</span> {instance.template?.name}
                  </div>
                </div>
                
                {instance.period && (
                  <div className="mt-2 text-xs text-gray-500">
                    <span className="font-medium">Period:</span> {instance.period.name}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewInstance(instance)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditInstance(instance)}
                  className="text-green-600 hover:text-green-800"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteInstance(instance)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstanceList; 