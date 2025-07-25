import React from 'react';
import { Calendar, FileText, Users, Clock, User, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import Modal from '../../ui/Modal';
import Card from '../../ui/Card';

interface SchedulePeriodViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: any;
}

const SchedulePeriodViewModal: React.FC<SchedulePeriodViewModalProps> = ({
  isOpen,
  onClose,
  period
}) => {
  if (!period) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = () => {
    if (!period.startDate || !period.endDate) return 'Not specified';
    
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`;
    return `${Math.floor(diffDays / 30)} months`;
  };

  const getStatusIcon = () => {
    if (!period.isActive) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const getStatusText = () => {
    return period.isActive ? 'Active' : 'Inactive';
  };

  const getStatusBadgeClass = () => {
    return period.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getDayOfWeekNames = (daysArray: number[]) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (!daysArray || daysArray.length === 0) return 'No days specified';
    
    return daysArray
      .sort((a, b) => a - b)
      .map(day => dayNames[day] || `Day ${day}`)
      .join(', ');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Period Details"
      size="xl"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{period.name}</h3>
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
          {/* Period Schedule */}
          <Card>
            <h4 className="flex items-center text-lg font-medium text-gray-900 mb-4">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              Schedule Information
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Start Date</label>
                <p className="text-gray-900">{period.startDate ? formatDate(period.startDate) : 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">End Date</label>
                <p className="text-gray-900">{period.endDate ? formatDate(period.endDate) : 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Duration</label>
                <p className="text-gray-900">{calculateDuration()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Days of Week</label>
                <p className="text-gray-900">{getDayOfWeekNames(period.daysOfWeek)}</p>
              </div>
            </div>
          </Card>

          {/* Template & Capacity */}
          <Card>
            <h4 className="flex items-center text-lg font-medium text-gray-900 mb-4">
              <FileText className="h-5 w-5 mr-2 text-green-500" />
              Template & Capacity
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Template</label>
                <p className="text-gray-900">{period.templateInfo?.name || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Template Sport</label>
                <p className="text-gray-900 capitalize">{period.templateInfo?.sport || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Capacity</label>
                <p className="text-gray-900 flex items-center">
                  <Users className="h-4 w-4 mr-1 text-gray-400" />
                  {period.capacity || 0} participants
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Time Configuration */}
        {(period.timeStart || period.timeEnd) && (
          <Card>
            <h4 className="flex items-center text-lg font-medium text-gray-900 mb-4">
              <Clock className="h-5 w-5 mr-2 text-purple-500" />
              Time Configuration
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Start Time</label>
                <p className="text-gray-900">{period.timeStart || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">End Time</label>
                <p className="text-gray-900">{period.timeEnd || 'Not specified'}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Assigned Coaches */}
        {period.coachIds && period.coachIds.length > 0 && (
          <Card>
            <h4 className="flex items-center text-lg font-medium text-gray-900 mb-4">
              <User className="h-5 w-5 mr-2 text-indigo-500" />
              Assigned Coaches
            </h4>
            <div className="space-y-2">
              {period.coachIds.map((coachId: string, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Coach ID: {coachId}</p>
                    <p className="text-xs text-gray-500">Coach details would be loaded from user data</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Statistics & Usage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h4 className="flex items-center text-lg font-medium text-gray-900 mb-4">
              <BarChart3 className="h-5 w-5 mr-2 text-orange-500" />
              Usage Statistics
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Total Instances</label>
                <p className="text-gray-900">{period.instancesCount || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Active Instances</label>
                <p className="text-gray-900">{period.activeInstancesCount || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Period ID</label>
                <p className="text-gray-900 text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                  {period.id}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h4 className="flex items-center text-lg font-medium text-gray-900 mb-4">
              <Calendar className="h-5 w-5 mr-2 text-teal-500" />
              Creation Information
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-gray-900">{formatDateTime(period.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-900">{formatDateTime(period.updatedAt)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Template Details Preview */}
        {period.templateInfo && (
          <Card>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Template Preview</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</label>
                  <p className="text-sm text-gray-900 font-medium">{period.templateInfo.name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sport</label>
                  <p className="text-sm text-gray-900 capitalize">{period.templateInfo.sport}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Demographics</label>
                  <p className="text-sm text-gray-900 capitalize">{period.templateInfo.demo}</p>
                </div>
              </div>
              {period.templateInfo.description && (
                <div className="mt-3">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</label>
                  <p className="text-sm text-gray-700 mt-1">{period.templateInfo.description}</p>
                </div>
              )}
            </div>
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

export default SchedulePeriodViewModal;