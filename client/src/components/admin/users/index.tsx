import React, { useState } from 'react';
import Card from '../../ui/Card';
import Loading from '../../ui/Loading';
import Error from '../../ui/Error';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import UserForm from '../UserForm';
import CreateUserForm from '../CreateUserForm';
import UserActions from './UserActions';
import UserFilters from './UserFilters';
import UserTable from './UserTable';
import UserPagination from './UserPagination';
import { useAdminSessionTemplates, useCreateSessionTemplate, useUpdateSessionTemplate, useDeleteSessionTemplate } from '../../../services/graphqlService';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../../../services/graphqlService';

interface UserManagementProps {}

const UserManagement: React.FC<UserManagementProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { data: usersData, loading, error, refetch } = useUsers();
  const [createUser, { loading: creating }] = useCreateUser();
  const [updateUser, { loading: updating }] = useUpdateUser();
  const [deleteUser, { loading: deleting }] = useDeleteUser();

  const users = usersData?.users || [];

  // Enhanced filtering
  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.active) ||
                         (filterStatus === 'inactive' && !user.active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const handleCreateUser = () => {
    setShowCreateModal(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleViewUser = (user: any) => {
    // Navigate to user detail page (future feature)
    console.log('View user:', user.name);
  };

  const handleCreateSubmit = async (formData: any) => {
    try {
      // Filter out undefined fields to match the GraphQL schema
      const createInput = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        birthday: formData.birthday,
        ...(formData.role && { role: formData.role }),
        ...(formData.active !== undefined && { active: formData.active }),
        ...(formData.waiverSigned !== undefined && { waiverSigned: formData.waiverSigned })
      };

      await createUser({
        variables: { input: createInput }
      });
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleEditSubmit = async (formData: any) => {
    if (!selectedUser) return;
    
    try {
      await updateUser({
        variables: { id: selectedUser.id, input: formData }
      });
      setShowEditModal(false);
      setSelectedUser(null);
      refetch();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      await deleteUser({
        variables: { id: selectedUser.id }
      });
      setShowDeleteModal(false);
      setSelectedUser(null);
      refetch();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterRole('all');
    setFilterStatus('all');
    setCurrentPage(1);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <UserActions onCreateUser={handleCreateUser} />
      </div>

      {/* Filters */}
      <UserFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterRole={filterRole}
        onRoleChange={setFilterRole}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        onResetFilters={resetFilters}
        filteredCount={filteredUsers.length}
        totalCount={users.length}
      />

      {/* Table */}
      <UserTable
        users={paginatedUsers}
        onViewUser={handleViewUser}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
      />

      {/* Pagination */}
      <UserPagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalCount={filteredUsers.length}
        onPageChange={setCurrentPage}
      />

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
        size="lg"
      >
        <UserForm
          user={selectedUser}
          onSubmit={handleEditSubmit}
          onCancel={() => setShowEditModal(false)}
          isLoading={updating}
        />
      </Modal>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New User"
        size="lg"
      >
        <CreateUserForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowCreateModal(false)}
          isLoading={creating}
        />
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
      >
        <div className="text-center py-8">
          {selectedUser?.email === 'tbd@system.local' ? (
            <>
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium mb-2">⚠️ System User Protection</p>
                <p className="text-red-700 text-sm">
                  The TBD coach is a system default user that cannot be deleted. 
                  This user is required for the application to function properly.
                </p>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={() => setShowDeleteModal(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete "{selectedUser?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => setShowDeleteModal(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement; 