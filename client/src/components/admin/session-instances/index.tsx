import React, { useState } from 'react';
import Loading from '../../ui/Loading';
import Error from '../../ui/Error';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import InstanceForm from '../InstanceForm';
import GenerateInstancesModal from '../GenerateInstancesModal';
import InstanceActions from './InstanceActions';
import InstanceFilters from './InstanceFilters';
import InstanceTable from './InstanceTable';
import InstancePagination from './InstancePagination';
import SessionInstanceViewModal from './SessionInstanceViewModal';
import { useAdminSessionInstances, useCreateSessionInstance, useUpdateSessionInstance, useDeleteSessionInstance, useAdminSessionTemplates, useAdminSchedulePeriods, useGenerateInstancesFromPeriod } from '../../../services/graphqlService';

interface SessionInstanceManagementProps {}

const SessionInstanceManagement: React.FC<SessionInstanceManagementProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTemplate, setFilterTemplate] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { data: instancesData, loading, error, refetch } = useAdminSessionInstances();
  const { data: templatesData } = useAdminSessionTemplates();
  const { data: periodsData } = useAdminSchedulePeriods();
  const [createInstance, { loading: creating }] = useCreateSessionInstance();
  const [updateInstance, { loading: updating }] = useUpdateSessionInstance();
  const [deleteInstance, { loading: deleting }] = useDeleteSessionInstance();
  const [generateInstances, { loading: generating }] = useGenerateInstancesFromPeriod();

  const instances = instancesData?.adminSessionInstances?.nodes || [];
  const templates = templatesData?.adminSessionTemplates?.nodes || [];
  const periods = periodsData?.adminSchedulePeriods?.nodes || [];
  const totalCount = instancesData?.adminSessionInstances?.totalCount || 0;

  // Enhanced filtering
  const filteredInstances = instances.filter((instance: any) => {
    const matchesSearch = instance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instance.templateInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instance.periodInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && instance.isActive) ||
                         (filterStatus === 'inactive' && !instance.isActive) ||
                         (filterStatus === 'cancelled' && instance.isCancelled) ||
                         (filterStatus === 'upcoming' && instance.isUpcoming) ||
                         (filterStatus === 'past' && instance.isPast);
    
    const matchesTemplate = filterTemplate === 'all' || 
                           instance.templateInfo?.id === filterTemplate;
    
    const matchesPeriod = filterPeriod === 'all' || 
                         instance.periodInfo?.id === filterPeriod;
    
    const matchesDate = filterDate === 'all' || 
                       (filterDate === 'today' && instance.isToday) ||
                       (filterDate === 'this-week' && instance.isThisWeek) ||
                       (filterDate === 'this-month' && instance.isThisMonth);
    
    return matchesSearch && matchesStatus && matchesTemplate && matchesPeriod && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInstances.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInstances = filteredInstances.slice(startIndex, endIndex);

  // Get unique templates and periods for filter options
  const uniqueTemplates = [...new Set(instances.map((i: any) => i.templateInfo?.id).filter(Boolean))] as string[];
  const uniquePeriods = [...new Set(instances.map((i: any) => i.periodInfo?.id).filter(Boolean))] as string[];

  const handleCreateInstance = () => {
    setShowCreateModal(true);
  };

  const handleGenerateInstances = () => {
    setShowGenerateModal(true);
  };

  const handleEditInstance = (instance: any) => {
    setSelectedInstance(instance);
    setShowEditModal(true);
  };

  const handleDeleteInstance = (instance: any) => {
    setSelectedInstance(instance);
    setShowDeleteModal(true);
  };

  const handleViewInstance = (instance: any) => {
    setSelectedInstance(instance);
    setShowViewModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedInstance) return;
    
    try {
      await deleteInstance({
        variables: { id: selectedInstance.id }
      });
      setShowDeleteModal(false);
      setSelectedInstance(null);
      refetch();
    } catch (error) {
      console.error('Error deleting instance:', error);
    }
  };

  const handleCreateInstanceSubmit = async (formData: any) => {
    try {
      await createInstance({
        variables: { input: formData }
      });
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      console.error('Error creating instance:', error);
    }
  };

  const handleUpdateInstanceSubmit = async (formData: any) => {
    if (!selectedInstance) return;
    
    try {
      await updateInstance({
        variables: { id: selectedInstance.id, input: formData }
      });
      setShowEditModal(false);
      setSelectedInstance(null);
      refetch();
    } catch (error) {
      console.error('Error updating instance:', error);
    }
  };

  const handleGenerateInstancesSubmit = async (data: {
    periodId: string;
    startDate: string;
    endDate: string;
    daysOfWeek: number[];
    startTime: string;
    endTime: string;
  }) => {
    try {
      await generateInstances({
        variables: data
      });
      setShowGenerateModal(false);
      refetch();
    } catch (error) {
      console.error('Error generating instances:', error);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterTemplate('all');
    setFilterPeriod('all');
    setFilterDate('all');
    setCurrentPage(1);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Session Instance Management</h2>
          <p className="text-sm md:text-base text-gray-600">Create, edit, and manage individual session instances</p>
        </div>
        <InstanceActions
          onCreateInstance={handleCreateInstance}
          onGenerateInstances={handleGenerateInstances}
        />
      </div>

      {/* Filters */}
      <InstanceFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        filterTemplate={filterTemplate}
        onTemplateChange={setFilterTemplate}
        filterPeriod={filterPeriod}
        onPeriodChange={setFilterPeriod}
        filterDate={filterDate}
        onDateChange={setFilterDate}
        onResetFilters={resetFilters}
        filteredCount={filteredInstances.length}
        totalCount={instances.length}
        uniqueTemplates={uniqueTemplates}
        uniquePeriods={uniquePeriods}
        instances={instances}
      />

      {/* Table */}
      <InstanceTable
        instances={paginatedInstances}
        onViewInstance={handleViewInstance}
        onEditInstance={handleEditInstance}
        onDeleteInstance={handleDeleteInstance}
      />

      {/* Pagination */}
      <InstancePagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalCount={filteredInstances.length}
        onPageChange={setCurrentPage}
      />

      {/* Create Instance Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Session Instance"
        size="xl"
      >
        <InstanceForm
          templates={templates}
          periods={periods}
          onSubmit={handleCreateInstanceSubmit}
          onCancel={() => setShowCreateModal(false)}
          isLoading={creating}
        />
      </Modal>

      {/* Edit Instance Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Session Instance"
        size="xl"
      >
        <InstanceForm
          instance={selectedInstance}
          templates={templates}
          periods={periods}
          onSubmit={handleUpdateInstanceSubmit}
          onCancel={() => setShowEditModal(false)}
          isLoading={updating}
        />
      </Modal>

      {/* Delete Instance Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Session Instance"
      >
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete "{selectedInstance?.name}"? This action cannot be undone.
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

      {/* Generate Instances Modal */}
      <GenerateInstancesModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onSubmit={handleGenerateInstancesSubmit}
        periods={periods}
        isLoading={generating}
      />

      {/* View Instance Modal */}
      <SessionInstanceViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        instance={selectedInstance}
      />
    </div>
  );
};

export default SessionInstanceManagement; 