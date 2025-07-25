import React from 'react';
import { FileText, Users, DollarSign, Calendar, Image, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Modal from '../../ui/Modal';
import Card from '../../ui/Card';

interface SessionTemplateViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: any;
}

const SessionTemplateViewModal: React.FC<SessionTemplateViewModalProps> = ({
  isOpen,
  onClose,
  template
}) => {
  if (!template) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = () => {
    if (!template.isActive) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const getStatusText = () => {
    return template.isActive ? 'Active' : 'Inactive';
  };

  const getStatusBadgeClass = () => {
    return template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Session Template Details"
      size="xl"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{template.name}</h3>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center">
                {getStatusIcon()}
                <span className="ml-2 text-sm font-medium">{getStatusText()}</span>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass()}`}>
                {getStatusText()}
              </span>
            </div>
            {template.slug && (
              <p className="text-sm text-gray-500 mt-1">Slug: {template.slug}</p>
            )}
          </div>
        </div>

        {/* Main Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <h4 className="flex items-center text-lg font-medium text-gray-900 mb-4">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              Basic Information
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Sport</label>
                <p className="text-gray-900 capitalize">{template.sport || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Demographics</label>
                <p className="text-gray-900 capitalize">{template.demo || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Birth Year</label>
                <p className="text-gray-900">{template.birthYear || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Trainer</label>
                <p className="text-gray-900">{template.trainer || 'Not assigned'}</p>
              </div>
            </div>
          </Card>

          {/* Capacity & Pricing */}
          <Card>
            <h4 className="flex items-center text-lg font-medium text-gray-900 mb-4">
              <Users className="h-5 w-5 mr-2 text-green-500" />
              Capacity & Pricing
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Roster Limit</label>
                <p className="text-gray-900">{template.rosterLimit || 0} participants</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Price</label>
                <p className="text-gray-900 flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                  ${template.price || 0}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Staff Only</label>
                <p className="text-gray-900">
                  {template.staffOnly ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Staff Only
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Public
                    </span>
                  )}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Description */}
        {template.description && (
          <Card>
            <h4 className="flex items-center text-lg font-medium text-gray-900 mb-4">
              <FileText className="h-5 w-5 mr-2 text-purple-500" />
              Description
            </h4>
            <p className="text-gray-700 whitespace-pre-wrap">{template.description}</p>
          </Card>
        )}

        {/* Images */}
        {(template.coverImage || (template.images && template.images.length > 0)) && (
          <Card>
            <h4 className="flex items-center text-lg font-medium text-gray-900 mb-4">
              <Image className="h-5 w-5 mr-2 text-pink-500" />
              Images
            </h4>
            <div className="space-y-4">
              {template.coverImage && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Cover Image</label>
                  <div className="mt-1">
                    <img
                      src={template.coverImage.startsWith('/img/') ? template.coverImage : `/img/sessions/${template.coverImage}`}
                      alt="Cover"
                      className="w-32 h-24 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/img/soccer-ball.png';
                      }}
                    />
                  </div>
                </div>
              )}
              
              {template.images && template.images.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Additional Images</label>
                  <div className="mt-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {template.images.map((image: string, index: number) => (
                      <img
                        key={index}
                        src={image.startsWith('/img/') ? image : `/img/sessions/${image}`}
                        alt={`Image ${index + 1}`}
                        className="w-24 h-18 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/img/soccer-ball.png';
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Timestamps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h4 className="flex items-center text-lg font-medium text-gray-900 mb-4">
              <Calendar className="h-5 w-5 mr-2 text-indigo-500" />
              Creation Information
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-gray-900">{formatDate(template.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-900">{formatDate(template.updatedAt)}</p>
              </div>
            </div>
          </Card>

          {/* Template Usage Stats (if available) */}
          <Card>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Usage Statistics</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Periods Using Template</label>
                <p className="text-gray-900">{template.periodsCount || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Instances Generated</label>
                <p className="text-gray-900">{template.instancesCount || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Template ID</label>
                <p className="text-gray-900 text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                  {template.id}
                </p>
              </div>
            </div>
          </Card>
        </div>

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

export default SessionTemplateViewModal;