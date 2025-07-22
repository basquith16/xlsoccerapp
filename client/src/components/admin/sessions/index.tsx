import React, { useState } from 'react';
import Loading from '../../ui/Loading';
import Error from '../../ui/Error';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import SessionActions from './SessionActions';
import SessionFilters from './SessionFilters';
import SessionTable from './SessionTable';
import { useAdminSessions } from '../../../services/graphqlService';

interface SessionsManagementProps {}

const SessionsManagement: React.FC<SessionsManagementProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: sessionsData, loading, error, refetch } = useAdminSessions();

  const sessions = sessionsData?.adminSessions?.nodes || [];

  const filteredSessions = sessions.filter((session: any) => {
    const matchesSearch = session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && session.isActive) ||
                         (filterStatus === 'inactive' && !session.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const handleCreateSession = () => {
    setShowCreateModal(true);
  };

  const handleEditSession = (session: any) => {
    setSelectedSession(session);
    setShowEditModal(true);
  };

  const handleDeleteSession = (session: any) => {
    setSelectedSession(session);
    setShowDeleteModal(true);
  };

  const handleViewSession = (session: any) => {
    // Navigate to session detail page
    window.open(`/session/${session.slug}`, '_blank');
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Session Management</h2>
          <p className="text-gray-600">Create, edit, and manage soccer sessions</p>
        </div>
        <SessionActions onCreateSession={handleCreateSession} />
      </div>

      {/* Filters */}
      <SessionFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
      />

      {/* Table */}
      <SessionTable
        sessions={filteredSessions}
        onViewSession={handleViewSession}
        onEditSession={handleEditSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* Create Session Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Session"
      >
        <div className="text-center py-8">
          <p className="text-gray-600">Session creation form coming soon...</p>
        </div>
      </Modal>

      {/* Edit Session Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Session"
      >
        <div className="text-center py-8">
          <p className="text-gray-600">Session editing form coming soon...</p>
        </div>
      </Modal>

      {/* Delete Session Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Session"
      >
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete "{selectedSession?.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => setShowDeleteModal(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Delete logic will be implemented
                setShowDeleteModal(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SessionsManagement; 