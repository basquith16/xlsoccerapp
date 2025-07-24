import React, { useState } from 'react';
import Card from '../../ui/Card';
import Loading from '../../ui/Loading';
import Error from '../../ui/Error';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import TemplateForm from '../TemplateForm';
import TemplateActions from './TemplateActions';
import TemplateFilters from './TemplateFilters';
import TemplateTable from './TemplateTable';
import TemplatePagination from './TemplatePagination';
import { useAdminSessionTemplates, useCreateSessionTemplate, useUpdateSessionTemplate, useDeleteSessionTemplate } from '../../../services/graphqlService';

interface SessionTemplateManagementProps {}

const SessionTemplateManagement: React.FC<SessionTemplateManagementProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSport, setFilterSport] = useState('all');
  const [filterDemo, setFilterDemo] = useState('all');
  const [filterStaffOnly, setFilterStaffOnly] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { data: templatesData, loading, error, refetch } = useAdminSessionTemplates();
  const [createTemplate, { loading: creating }] = useCreateSessionTemplate();
  const [updateTemplate, { loading: updating }] = useUpdateSessionTemplate();
  const [deleteTemplate, { loading: deleting }] = useDeleteSessionTemplate();

  const templates = templatesData?.adminSessionTemplates?.nodes || [];
  const totalCount = templatesData?.adminSessionTemplates?.totalCount || 0;

  // Enhanced filtering
  const filteredTemplates = templates.filter((template: any) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.sport.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.demo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && template.isActive) ||
                         (filterStatus === 'inactive' && !template.isActive);
    
    const matchesSport = filterSport === 'all' || template.sport === filterSport;
    const matchesDemo = filterDemo === 'all' || template.demo === filterDemo;
    const matchesStaffOnly = filterStaffOnly === 'all' || 
                            (filterStaffOnly === 'staff' && template.staffOnly) ||
                            (filterStaffOnly === 'public' && !template.staffOnly);
    
    return matchesSearch && matchesStatus && matchesSport && matchesDemo && matchesStaffOnly;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex);

  // Get unique sports and demos for filter options
  const sports = [...new Set(templates.map((t: any) => t.sport))] as string[];
  const demos = [...new Set(templates.map((t: any) => t.demo))] as string[];

  const handleCreateTemplate = () => {
    setShowCreateModal(true);
  };

  const handleEditTemplate = (template: any) => {
    setSelectedTemplate(template);
    setShowEditModal(true);
  };

  const handleDeleteTemplate = (template: any) => {
    setSelectedTemplate(template);
    setShowDeleteModal(true);
  };

  const handleViewTemplate = (template: any) => {
    // Navigate to template detail page (future feature)
    console.log('View template:', template.name);
  };

  const handleCreateSubmit = async (formData: any) => {
    try {
      await createTemplate({
        variables: { input: formData }
      });
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleEditSubmit = async (formData: any) => {
    if (!selectedTemplate) return;
    
    try {
      await updateTemplate({
        variables: { id: selectedTemplate.id, input: formData }
      });
      setShowEditModal(false);
      setSelectedTemplate(null);
      refetch();
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTemplate) return;
    
    try {
      await deleteTemplate({
        variables: { id: selectedTemplate.id }
      });
      setShowDeleteModal(false);
      setSelectedTemplate(null);
      refetch();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterSport('all');
    setFilterDemo('all');
    setFilterStaffOnly('all');
    setCurrentPage(1);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Session Template Management</h2>
          <p className="text-sm md:text-base text-gray-600">Create, edit, and manage session templates</p>
        </div>
        <TemplateActions onCreateTemplate={handleCreateTemplate} />
      </div>

      {/* Filters */}
      <TemplateFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        filterSport={filterSport}
        onSportChange={setFilterSport}
        filterDemo={filterDemo}
        onDemoChange={setFilterDemo}
        filterStaffOnly={filterStaffOnly}
        onStaffOnlyChange={setFilterStaffOnly}
        onResetFilters={resetFilters}
        filteredCount={filteredTemplates.length}
        totalCount={templates.length}
        sports={sports}
        demos={demos}
      />

      {/* Table */}
      <TemplateTable
        templates={paginatedTemplates}
        onViewTemplate={handleViewTemplate}
        onEditTemplate={handleEditTemplate}
        onDeleteTemplate={handleDeleteTemplate}
      />

      {/* Pagination */}
      <TemplatePagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalCount={filteredTemplates.length}
        onPageChange={setCurrentPage}
      />

      {/* Create Template Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Session Template"
        size="lg"
      >
        <TemplateForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowCreateModal(false)}
          isLoading={creating}
        />
      </Modal>

      {/* Edit Template Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Session Template"
        size="lg"
      >
        <TemplateForm
          template={selectedTemplate}
          onSubmit={handleEditSubmit}
          onCancel={() => setShowEditModal(false)}
          isLoading={updating}
        />
      </Modal>

      {/* Delete Template Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Session Template"
      >
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete "{selectedTemplate?.name}"? This action cannot be undone.
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

export default SessionTemplateManagement; 