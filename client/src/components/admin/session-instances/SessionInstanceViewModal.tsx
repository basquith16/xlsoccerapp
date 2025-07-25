import React from 'react';
import { Calendar, Clock, Users, MapPin, User, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Modal from '../../ui/Modal';
import Card from '../../ui/Card';

interface SessionInstanceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  instance: any;
}

const SessionInstanceViewModal: React.FC<SessionInstanceViewModalProps> = ({
  isOpen,
  onClose,
  instance
}) => {
  if (!instance) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString || timeString === 'Invalid Date') return 'Time TBD';
    
    try {
      if (timeString.includes(':') && !timeString.includes('T')) {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
      
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

  const getStatusIcon = () => {
    if (instance.isCancelled) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    if (!instance.isActive) {
      return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const getStatusText = () => {
    if (instance.isCancelled) return 'Cancelled';
    if (!instance.isActive) return 'Inactive';
    if (instance.isPast) return 'Past';
    if (instance.isUpcoming) return 'Upcoming';
    return 'Active';
  };

  const getStatusBadgeClass = () => {
    if (instance.isCancelled) return 'bg-red-100 text-red-800';
    if (!instance.isActive) return 'bg-gray-100 text-gray-800';
    if (instance.isPast) return 'bg-blue-100 text-blue-800';
    if (instance.isUpcoming) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getBookingStatusClass = () => {
    const percentage = instance.bookingPercentage || 0;
    if (percentage >= 90) return 'bg-red-100 text-red-800';
    if (percentage >= 75) return 'bg-orange-100 text-orange-800';
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getBookingStatusText = () => {
    const percentage = instance.bookingPercentage || 0;
    if (percentage >= 90) return 'Full';
    if (percentage >= 75) return 'Almost Full';
    if (percentage >= 50) return 'Half Full';
    return 'Available';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Session Instance Details"
      size="xl"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{instance.name}</h3>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center">
                {getStatusIcon()}
                <span className="ml-2 text-sm font-medium">{getStatusText()}</span>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass()}`}>
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>

        {/* Main Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date & Time */}
          <Card>
            <h4 className="flex items-center text-lg font-medium text-gray-900 mb-4">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              Date & Time
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Date</label>
                <p className="text-gray-900">{formatDate(instance.date)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Time</label>
                <p className="text-gray-900 flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                  {formatTime(instance.startTime)} - {formatTime(instance.endTime)}
                </p>
              </div>
            </div>
          </Card>

          {/* Capacity & Booking */}
          <Card>
            <h4 className="flex items-center text-lg font-medium text-gray-900 mb-4">
              <Users className="h-5 w-5 mr-2 text-green-500" />
              Capacity & Booking
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Capacity</label>
                <p className="text-gray-900">{instance.capacity || 0} participants</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Current Bookings</label>
                <p className="text-gray-900">{instance.bookedCount || 0} / {instance.capacity || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Booking Status</label>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBookingStatusClass()}`}>
                    {getBookingStatusText()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {instance.bookingPercentage || 0}% filled
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Template & Period Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Template Info */}
          <Card>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Template Information</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Template Name</label>
                <p className="text-gray-900">{instance.templateInfo?.name || instance.template?.name || 'No Template'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Sport</label>
                <p className="text-gray-900 capitalize">{instance.templateInfo?.sport || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900">{instance.templateInfo?.description || 'No description available'}</p>
              </div>
            </div>
          </Card>

          {/* Period Info */}
          <Card>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Period Information</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Period Name</label>
                <p className="text-gray-900">{instance.periodInfo?.name || instance.period?.name || 'No Period'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Period Duration</label>
                <p className="text-gray-900">
                  {instance.periodInfo?.startDate && instance.periodInfo?.endDate ? 
                    `${new Date(instance.periodInfo.startDate).toLocaleDateString()} - ${new Date(instance.periodInfo.endDate).toLocaleDateString()}` :
                    'Not specified'
                  }
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Coaches Information */}
        {instance.coachInfo && instance.coachInfo.length > 0 && (
          <Card>
            <h4 className="flex items-center text-lg font-medium text-gray-900 mb-4">
              <User className="h-5 w-5 mr-2 text-purple-500" />
              Assigned Coaches
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {instance.coachInfo.map((coach: any, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{coach.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{coach.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Additional Notes */}
        {instance.notes && (
          <Card>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Notes</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{instance.notes}</p>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SessionInstanceViewModal;