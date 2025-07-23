import React, { useState } from 'react';
import Loading from '../../ui/Loading';
import Error from '../../ui/Error';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import SessionActions from './SessionActions';
import SessionFilters from './SessionFilters';
import SessionTable from './SessionTable';
import CreateSessionForm from '../CreateSessionForm';
import { useAdminSessions, useCreateSession, useUpdateSession, useDeleteSession } from '../../../services/graphqlService';
import { useAuth } from '../../../hooks/useAuth';

interface SessionsManagementProps {}

const SessionsManagement: React.FC<SessionsManagementProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [createError, setCreateError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { data: sessionsData, loading, error, refetch } = useAdminSessions();
  const [createSession, { loading: creating }] = useCreateSession();
  const [updateSession, { loading: updating }] = useUpdateSession();
  const [deleteSession, { loading: deleting }] = useDeleteSession();

  const sessions = sessionsData?.adminSessions?.nodes || [];
  const totalCount = sessionsData?.adminSessions?.totalCount || 0;

  const filteredSessions = sessions.filter((session: any) => {
    const matchesSearch = session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && session.isActive) ||
                         (filterStatus === 'inactive' && !session.isActive);
    
    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSessions = filteredSessions.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setCurrentPage(1);
  };

  const handleCreateSession = () => {
    setCreateError(null);
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (formData: any) => {
    try {
      setCreateError(null);
      console.log('Creating session with data:', formData);
      
      const result = await createSession({
        variables: { input: formData }
      });
      
      console.log('Session created successfully:', result);
      setShowCreateModal(false);
      
      // Force refetch the sessions list
      await refetch();
      console.log('Sessions list refetched');
      
    } catch (error: any) {
      console.error('Error creating session:', error);
      
      // Handle specific error types
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const graphQLError = error.graphQLErrors[0];
        
        if (graphQLError.message.includes('duplicate key error') && graphQLError.message.includes('name')) {
          setCreateError('A session with this name already exists. Please choose a different name.');
        } else if (graphQLError.message.includes('validation failed')) {
          setCreateError('Please check your input and try again. Some fields may be invalid.');
        } else {
          setCreateError(graphQLError.message || 'An error occurred while creating the session.');
        }
      } else if (error.networkError) {
        setCreateError('Network error. Please check your connection and try again.');
      } else {
        setCreateError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleEditSession = (session: any) => {
    setSelectedSession(session);
    setShowEditModal(true);
  };

  const handleDeleteSession = (session: any) => {
    setSelectedSession(session);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSession) return;
    
    try {
      await deleteSession({
        variables: { id: selectedSession.id }
      });
      setShowDeleteModal(false);
      setSelectedSession(null);
      refetch();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
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
        onReset={resetFilters}
      />

      {/* Table */}
      <SessionTable
        sessions={paginatedSessions}
        onViewSession={handleViewSession}
        onEditSession={handleEditSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: '1.2rem' }}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: '1.2rem' }}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-gray-700" style={{ fontSize: '1.2rem' }}>
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, filteredSessions.length)}</span> of{' '}
                <span className="font-medium">{filteredSessions.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontSize: '1.2rem' }}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border font-medium ${
                      currentPage === page
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                    style={{ fontSize: '1.2rem' }}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontSize: '1.2rem' }}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Session"
        size="lg"
      >
        <CreateSessionForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowCreateModal(false)}
          isLoading={creating}
          error={createError}
          onErrorClear={() => setCreateError(null)}
        />
      </Modal>

      {/* Edit Session Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Session"
        size="lg"
      >
        <div className="text-center py-8">
          <p className="text-gray-600">Session editing form coming soon...</p>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Session"
        size="md"
      >
        <div className="text-center py-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete "{selectedSession?.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-center space-x-3">
            <Button
              onClick={() => setShowDeleteModal(false)}
              variant="secondary"
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="danger"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Session'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SessionsManagement; 