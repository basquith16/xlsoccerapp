import React, { useState } from 'react';
import Card from '../../ui/Card';
import Loading from '../../ui/Loading';
import Error from '../../ui/Error';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import PeriodForm from '../PeriodForm';
import PeriodActions from './PeriodActions';
import PeriodFilters from './PeriodFilters';
import PeriodTable from './PeriodTable';
import PeriodPagination from './PeriodPagination';
import { useAdminSchedulePeriods, useCreateSchedulePeriod, useUpdateSchedulePeriod, useDeleteSchedulePeriod, useAdminSessionTemplates } from '../../../services/graphqlService';

interface SchedulePeriodManagementProps {}

const SchedulePeriodManagement: React.FC<SchedulePeriodManagementProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTemplate, setFilterTemplate] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { data: periodsData, loading, error, refetch } = useAdminSchedulePeriods();
  const { data: templatesData } = useAdminSessionTemplates();
  const [createPeriod, { loading: creating }] = useCreateSchedulePeriod();
  const [updatePeriod, { loading: updating }] = useUpdateSchedulePeriod();
  const [deletePeriod, { loading: deleting }] = useDeleteSchedulePeriod();

  const periods = periodsData?.adminSchedulePeriods?.nodes || [];
  const templates = templatesData?.adminSessionTemplates?.nodes || [];
  const totalCount = periodsData?.adminSchedulePeriods?.totalCount || 0;

  // Enhanced filtering
  const filteredPeriods = periods.filter((period: any) => {
    const matchesSearch = period.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         period.templateInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && period.isActive) ||
                         (filterStatus === 'inactive' && !period.isActive) ||
                         (filterStatus === 'current' && period.isCurrentlyActive) ||
                         (filterStatus === 'upcoming' && period.isUpcoming) ||
                         (filterStatus === 'past' && period.isPast);
    
    const matchesTemplate = filterTemplate === 'all' || 
                           period.templateInfo?.id === filterTemplate;
    
    return matchesSearch && matchesStatus && matchesTemplate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPeriods.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPeriods = filteredPeriods.slice(startIndex, endIndex);

  // Get unique templates for filter options
  const uniqueTemplates = [...new Set(periods.map((p: any) => p.templateInfo?.id).filter(Boolean))] as string[];

  const handleCreatePeriod = () => {
    setShowCreateModal(true);
  };

  const handleEditPeriod = (period: any) => {
    setSelectedPeriod(period);
    setShowEditModal(true);
  };

  const handleDeletePeriod = (period: any) => {
    setSelectedPeriod(period);
    setShowDeleteModal(true);
  };

  const handleViewPeriod = (period: any) => {
    // Navigate to period detail page (future feature)
    console.log('View period:', period.name);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPeriod) return;
    
    try {
      await deletePeriod({
        variables: { id: selectedPeriod.id }
      });
      setShowDeleteModal(false);
      setSelectedPeriod(null);
      refetch();
    } catch (error) {
      console.error('Error deleting period:', error);
    }
  };

  const handleCreatePeriodSubmit = async (formData: any) => {
    try {
      await createPeriod({
        variables: { input: formData }
      });
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      console.error('Error creating period:', error);
    }
  };

  const handleUpdatePeriod = async (formData: any) => {
    if (!selectedPeriod) return;
    
    try {
      await updatePeriod({
        variables: { id: selectedPeriod.id, input: formData }
      });
      setShowEditModal(false);
      setSelectedPeriod(null);
      refetch();
    } catch (error) {
      console.error('Error updating period:', error);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterTemplate('all');
    setCurrentPage(1);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Schedule Period Management</h2>
          <p className="text-sm md:text-base text-gray-600">Create, edit, and manage schedule periods for session templates</p>
        </div>
        <PeriodActions onCreatePeriod={handleCreatePeriod} />
      </div>

      {/* Filters */}
      <PeriodFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        filterTemplate={filterTemplate}
        onTemplateChange={setFilterTemplate}
        onResetFilters={resetFilters}
        filteredCount={filteredPeriods.length}
        totalCount={periods.length}
        uniqueTemplates={uniqueTemplates}
        periods={periods}
      />

      {/* Table */}
      <PeriodTable
        periods={paginatedPeriods}
        onViewPeriod={handleViewPeriod}
        onEditPeriod={handleEditPeriod}
        onDeletePeriod={handleDeletePeriod}
      />

      {/* Pagination */}
      <PeriodPagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalCount={filteredPeriods.length}
        onPageChange={setCurrentPage}
      />

      {/* Create Period Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Schedule Period"
        size="xl"
      >
        <PeriodForm
          templates={templates}
          onSubmit={handleCreatePeriodSubmit}
          onCancel={() => setShowCreateModal(false)}
          isLoading={creating}
        />
      </Modal>

      {/* Edit Period Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Schedule Period"
        size="xl"
      >
        <PeriodForm
          period={selectedPeriod}
          templates={templates}
          onSubmit={handleUpdatePeriod}
          onCancel={() => setShowEditModal(false)}
          isLoading={updating}
        />
      </Modal>

      {/* Delete Period Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Schedule Period"
      >
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete "{selectedPeriod?.name}"? This action cannot be undone.
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
        </div>
      </Modal>
    </div>
  );
};

export default SchedulePeriodManagement; 