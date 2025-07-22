import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import Card from '../ui/Card';
import Loading from '../ui/Loading';
import Error from '../ui/Error';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useAdminSessions } from '../../services/graphqlService';

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
        <Button 
          onClick={handleCreateSession}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Session
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Sessions</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Sessions List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coach
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
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
              {filteredSessions.map((session: any) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium text-gray-900 truncate">{session.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.trainer || 'Not assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${session.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.rosterLimit} players
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      session.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {session.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewSession(session)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Session"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditSession(session)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit Session"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Session"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredSessions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No sessions found</p>
            </div>
          )}
        </div>
      </Card>

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