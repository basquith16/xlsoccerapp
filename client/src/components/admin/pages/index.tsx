import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Plus, Edit, Eye, Trash2, Globe, Search } from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { GET_PAGES } from '../../../graphql/queries/pages';
import { CREATE_PAGE, UPDATE_PAGE, DELETE_PAGE, PUBLISH_PAGE, UNPUBLISH_PAGE } from '../../../graphql/mutations/pages';
import PageEditor from './PageEditor';
import { initializeBlocks } from './blocks';

interface Page {
  id: string;
  title: string;
  slug: string;
  navigation: {
    showInNavigation: boolean;
    navigationTitle?: string;
    menuOrder: number;
    parentSlug?: string;
  };
  status: 'draft' | 'published' | 'scheduled';
  updatedAt: string;
  createdAt: string;
  publishedAt?: string;
}

interface PageBuilderProps {
  initialEditPageId?: string | null;
}

const PageBuilder: React.FC<PageBuilderProps> = ({ initialEditPageId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  
  // Initialize blocks on component mount
  useEffect(() => {
    initializeBlocks();
  }, []);
  
  // Handle initial edit page ID from URL
  useEffect(() => {
    if (initialEditPageId) {
      setEditingPageId(initialEditPageId);
    } else {
      // Clear editing state when there's no editPageId
      setEditingPageId(null);
    }
  }, [initialEditPageId]);
  
  // GraphQL queries and mutations
  const { data: pagesData, loading, error, refetch } = useQuery(GET_PAGES, {
    variables: {
      limit: 50,
      offset: 0,
      search: searchTerm || undefined,
      status: statusFilter || undefined
    },
    fetchPolicy: 'cache-and-network'
  });

  const [createPage] = useMutation(CREATE_PAGE, {
    refetchQueries: [{ query: GET_PAGES }]
  });

  const [deletePage] = useMutation(DELETE_PAGE, {
    refetchQueries: [{ query: GET_PAGES }]
  });

  const [publishPage] = useMutation(PUBLISH_PAGE, {
    refetchQueries: [{ query: GET_PAGES }]
  });

  const [unpublishPage] = useMutation(UNPUBLISH_PAGE, {
    refetchQueries: [{ query: GET_PAGES }]
  });

  const [updatePage] = useMutation(UPDATE_PAGE, {
    refetchQueries: [{ query: GET_PAGES }]
  });

  const pages = pagesData?.pages?.nodes || [];
  

  // Handler functions
  const handleCreatePage = () => {
    // Navigate directly to editor for new page
    setEditingPageId('new');
  };

  const handleDeletePage = async (pageId: string) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      try {
        await deletePage({
          variables: { id: pageId }
        });
      } catch (error) {
        console.error('Error deleting page:', error);
      }
    }
  };

  const handleTogglePublish = async (page: Page) => {
    try {
      if (page.status === 'published') {
        await unpublishPage({
          variables: { id: page.id }
        });
      } else {
        await publishPage({
          variables: { id: page.id }
        });
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  const formatDate = (date: string | Date) => {
    if (!date) return 'Never';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'published':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'draft':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-blue-100 text-blue-800`;
    }
  };

  // Handle page editor save
  const handleEditorSave = async (pageData: any) => {
    // Convert blocks to the format expected by the GraphQL API
    const formattedBlocks = pageData.blocks.map((block: any) => ({
      id: block.id,
      type: block.type,
      props: block.props,
      position: {
        row: block.position.row,
        col: block.position.col,
        span: block.position.span
      },
      visibility: {
        desktop: true,
        tablet: true,
        mobile: true
      }
    }));

    try {
      if (pageData.id) {
        // Update existing page
        await updatePage({
          variables: {
            id: pageData.id,
            input: {
              title: pageData.title,
              slug: pageData.slug,
              navigation: {
                showInNavigation: pageData.navigation.showInNavigation,
                navigationTitle: pageData.navigation.navigationTitle,
                menuOrder: pageData.navigation.menuOrder,
                parentSlug: pageData.navigation.parentSlug
              },
              blocks: formattedBlocks
            }
          }
        });
      } else {
        // Create new page
        const result = await createPage({
          variables: {
            input: {
              title: pageData.title,
              slug: pageData.slug,
              navigation: {
                showInNavigation: pageData.navigation.showInNavigation,
                navigationTitle: pageData.navigation.navigationTitle,
                menuOrder: pageData.navigation.menuOrder,
                parentSlug: pageData.navigation.parentSlug
              },
              blocks: formattedBlocks,
              status: 'draft'
            }
          }
        });
        // Update the editing ID to the newly created page
        setEditingPageId(result.data.createPage.id);
      }
      
      console.log('Page saved successfully');
    } catch (error) {
      console.error('Failed to save page:', error);
      throw error;
    }
  };

  // Show editor if a page is being edited
  if (editingPageId) {
    // Find the page data for editing
    const pageToEdit = editingPageId === 'new' ? null : pages.find(p => p.id === editingPageId);
    
    return (
      <PageEditor
        pageId={editingPageId}
        initialData={pageToEdit}
        onSave={handleEditorSave}
        onBack={() => setEditingPageId(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading pages: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Page Builder</h1>
          <p className="text-gray-600 mt-1">Create and manage website pages</p>
        </div>
        <Button 
          onClick={handleCreatePage}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Page
        </Button>
      </div>

      {/* Search, Filters, and Stats in one row */}
      <Card>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            {/* Left 50% - Search and Filter */}
            <div className="w-1/2 flex items-center space-x-4 pr-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search pages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 pr-10 w-36 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            {/* Right 50% - Stats evenly distributed */}
            <div className="w-1/2 grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2 text-center">
                <div className="text-lg font-bold text-blue-600">{pages.length}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2 text-center">
                <div className="text-lg font-bold text-green-600">
                  {pages.filter(p => p.status === 'published').length}
                </div>
                <div className="text-xs text-gray-500">Published</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2 text-center">
                <div className="text-lg font-bold text-gray-600">
                  {pages.filter(p => p.status === 'draft').length}
                </div>
                <div className="text-xs text-gray-500">Drafts</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Pages List */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Pages</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Modified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{page.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">/{page.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(page.status)}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(page.updatedAt || page.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900" 
                        title="Edit"
                        onClick={() => setEditingPageId(page.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <a
                        href={`/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-900 inline-flex items-center justify-center p-1 rounded transition-colors"
                        title="View Live Page"
                        aria-label={`View live page: ${page.title}`}
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      <button 
                        className={`${page.status === 'published' ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                        title={page.status === 'published' ? 'Unpublish' : 'Publish'}
                        onClick={() => handleTogglePublish(page)}
                      >
                        <Globe className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900" 
                        title="Delete"
                        onClick={() => handleDeletePage(page.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Coming Soon Notice */}
      <Card className="bg-blue-50 border border-blue-200">
        <div className="p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Globe className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Phase 1: Foundation Complete
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>✅ Page listing and management interface</p>
                <p>✅ Visual editor with intuitive block controls</p>
                <p>⚡ Performance impact: Minimal (list view only)</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PageBuilder;