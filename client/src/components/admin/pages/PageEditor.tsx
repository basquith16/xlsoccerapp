import React, { memo, useCallback, useMemo, useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { Save, Eye, ArrowLeft, Plus, ChevronUp, ChevronDown, Trash2, X } from 'lucide-react';
import Button from '../../ui/Button';
import Card from '../../ui/Card';
import { GET_PAGE } from '../../../graphql/queries/pages';
import { blockRegistry } from './blocks/registry';
import PropertyPanel from './PropertyPanel';

// Interface for page data
interface PageData {
  id?: string;
  title: string;
  slug: string;
  navigation: {
    showInNavigation: boolean;
    navigationTitle?: string;
    menuOrder: number;
    parentSlug?: string;
  };
  blocks: Array<{
    id: string;
    type: string;
    props: Record<string, any>;
    position: {
      row: number;
      col: number;
      span?: number;
    };
  }>;
  status: 'draft' | 'published';
}

interface PageEditorProps {
  pageId?: string | 'new';
  initialData?: any;
  onSave?: (pageData: PageData) => Promise<void>;
  onBack?: () => void;
}

// Navigation Settings Component - moved outside to prevent focus issues
const NavigationSettings = memo(({ 
  pageData, 
  onPageDataChange 
}: { 
  pageData: PageData; 
  onPageDataChange: (updater: (prev: PageData) => PageData) => void;
}) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
      <span className="text-purple-600 mr-2">🧭</span>
      Navigation Settings
    </h3>
    
    <div className="space-y-3">
      <label className="flex items-center space-x-2">
        <input 
          type="checkbox"
          checked={pageData.navigation.showInNavigation}
          onChange={(e) => onPageDataChange(prev => ({ 
            ...prev, 
            navigation: { ...prev.navigation, showInNavigation: e.target.checked }
          }))}
          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
        <span className="text-sm font-medium text-gray-700">Show in navigation menu</span>
      </label>
      
      {pageData.navigation.showInNavigation && (
        <div className="pl-6 space-y-3 border-l-2 border-purple-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Navigation Menu Text
            </label>
            <input
              type="text"
              placeholder={`Enter menu text (default: "${pageData.title}")`}
              value={pageData.navigation.navigationTitle || ''}
              onChange={(e) => onPageDataChange(prev => ({ 
                ...prev, 
                navigation: { ...prev.navigation, navigationTitle: e.target.value }
              }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              This is the text that will appear in the navigation menu. Leave blank to use the page title.
            </p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Menu order (lower numbers appear first)
            </label>
            <input
              type="number"
              value={pageData.navigation.menuOrder}
              onChange={(e) => onPageDataChange(prev => ({ 
                ...prev, 
                navigation: { ...prev.navigation, menuOrder: parseInt(e.target.value) || 0 }
              }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
            />
          </div>
          
          <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded border border-blue-200">
            <strong>Auto-navigation:</strong> 
            {pageData.slug?.includes('/') ? (
              <>
                <br />📁 <strong>Sub-menu:</strong> "{pageData.slug.split('/')[0]}" → "{pageData.navigation.navigationTitle || pageData.title}"
              </>
            ) : (
              <>
                <br />📄 <strong>Main menu:</strong> "{pageData.navigation.navigationTitle || pageData.title}"
              </>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
));

const PageEditor: React.FC<PageEditorProps> = memo(({ 
  pageId, 
  initialData,
  onSave, 
  onBack 
}) => {
  // Editor state
  const [pageData, setPageData] = useState<PageData>({
    id: pageId === 'new' ? undefined : pageId,
    title: 'Untitled Page',
    slug: '',
    navigation: {
      showInNavigation: false,
      navigationTitle: '',
      menuOrder: 0,
      parentSlug: ''
    },
    blocks: [],
    status: 'draft'
  });
  
  // Query page data if editing existing page
  const { data: pageQueryData, loading: pageLoading } = useQuery(GET_PAGE, {
    variables: { id: pageId },
    skip: !pageId || pageId === 'new',
    fetchPolicy: 'cache-and-network'
  });
  
  // Load page data when query completes
  useEffect(() => {
    if (pageQueryData?.page) {
      const page = pageQueryData.page;
      setPageData({
        id: page.id,
        title: page.title,
        slug: page.slug,
        navigation: page.navigation || {
          showInNavigation: false,
          navigationTitle: '',
          menuOrder: 0,
          parentSlug: ''
        },
        blocks: page.blocks || [],
        status: page.status
      });
    }
  }, [pageQueryData]);
  
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  
  // Get selected block data - memoized for performance
  const selectedBlock = useMemo(() => {
    return selectedBlockId 
      ? pageData.blocks.find(block => block.id === selectedBlockId)
      : null;
  }, [selectedBlockId, pageData.blocks]);
  
  // Move block up
  const handleMoveBlockUp = useCallback((blockId: string) => {
    setPageData(prev => {
      const blockIndex = prev.blocks.findIndex(block => block.id === blockId);
      if (blockIndex <= 0) return prev; // Can't move first block up
      
      const newBlocks = [...prev.blocks];
      // Swap with previous block
      [newBlocks[blockIndex - 1], newBlocks[blockIndex]] = [newBlocks[blockIndex], newBlocks[blockIndex - 1]];
      
      // Update row positions
      const updatedBlocks = newBlocks.map((block, index) => ({
        ...block,
        position: { ...block.position, row: index }
      }));
      
      return { ...prev, blocks: updatedBlocks };
    });
  }, []);
  
  // Move block down
  const handleMoveBlockDown = useCallback((blockId: string) => {
    setPageData(prev => {
      const blockIndex = prev.blocks.findIndex(block => block.id === blockId);
      if (blockIndex >= prev.blocks.length - 1) return prev; // Can't move last block down
      
      const newBlocks = [...prev.blocks];
      // Swap with next block
      [newBlocks[blockIndex], newBlocks[blockIndex + 1]] = [newBlocks[blockIndex + 1], newBlocks[blockIndex]];
      
      // Update row positions
      const updatedBlocks = newBlocks.map((block, index) => ({
        ...block,
        position: { ...block.position, row: index }
      }));
      
      return { ...prev, blocks: updatedBlocks };
    });
  }, []);
  
  // Add new block at end
  const handleAddBlock = useCallback((blockType: string) => {
    const blockDef = blockRegistry.get(blockType);
    if (!blockDef) return;
    
    const newBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: blockType,
      props: { ...blockDef.defaultProps },
      position: {
        row: pageData.blocks.length,
        col: 0,
        span: 12
      }
    };
    
    setPageData(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
    
    // Auto-select the new block
    setSelectedBlockId(newBlock.id);
  }, [pageData.blocks.length]);

  // Add new block at specific position
  const handleAddBlockAt = useCallback((blockType: string, insertIndex: number) => {
    const blockDef = blockRegistry.get(blockType);
    if (!blockDef) return;
    
    const newBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: blockType,
      props: { ...blockDef.defaultProps },
      position: {
        row: insertIndex,
        col: 0,
        span: 12
      }
    };
    
    setPageData(prev => {
      const newBlocks = [...prev.blocks];
      newBlocks.splice(insertIndex, 0, newBlock);
      
      // Update row positions for all blocks
      const updatedBlocks = newBlocks.map((block, index) => ({
        ...block,
        position: { ...block.position, row: index }
      }));
      
      return { ...prev, blocks: updatedBlocks };
    });
    
    // Auto-select the new block
    setSelectedBlockId(newBlock.id);
  }, []);
  
  // Update block properties
  const handleUpdateBlock = useCallback((blockId: string, newProps: Record<string, any>) => {
    setPageData(prev => ({
      ...prev,
      blocks: prev.blocks.map(block =>
        block.id === blockId
          ? { ...block, props: { ...block.props, ...newProps } }
          : block
      )
    }));
  }, []);
  
  // Delete block
  const handleDeleteBlock = useCallback((blockId: string) => {
    setPageData(prev => ({
      ...prev,
      blocks: prev.blocks.filter(block => block.id !== blockId)
    }));
    
    // Clear selection if deleted block was selected
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  }, [selectedBlockId]);
  
  // Save page
  const handleSave = useCallback(async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      await onSave(pageData);
      // Show success notification
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
      successDiv.textContent = '✅ Page saved successfully';
      document.body.appendChild(successDiv);
      setTimeout(() => document.body.removeChild(successDiv), 3000);
    } catch (error) {
      console.error('Failed to save page:', error);
      // Show error notification
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
      errorDiv.textContent = '❌ Failed to save page';
      document.body.appendChild(errorDiv);
      setTimeout(() => document.body.removeChild(errorDiv), 3000);
    } finally {
      setIsSaving(false);
    }
  }, [onSave, pageData]);
  
  // Create a simple Block component with controls
  const BlockWithControls = memo(({ block, index }: { block: any, index: number }) => {
    const isSelected = selectedBlockId === block.id;
    const isFirst = index === 0;
    const isLast = index === pageData.blocks.length - 1;
    
    return (
      <div className="relative group">
        {/* Block content */}
        <div 
          className={`relative ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
          onClick={() => setSelectedBlockId(block.id)}
        >
          {blockRegistry.renderBlock(block.type, {
            id: block.id,
            props: block.props,
            isEditing: !isPreviewMode,
            onUpdate: (newProps) => handleUpdateBlock(block.id, newProps)
          })}
        </div>
        
        {/* Controls overlay - only show when editing and hovered */}
        {!isPreviewMode && (
          <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-md shadow-sm p-1">
              {/* Move up */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveBlockUp(block.id);
                }}
                disabled={isFirst}
                className={`p-1 rounded transition-colors ${
                  isFirst 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              
              {/* Move down */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveBlockDown(block.id);
                }}
                disabled={isLast}
                className={`p-1 rounded transition-colors ${
                  isLast 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {/* Delete */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteBlock(block.id);
                }}
                className="p-1 rounded text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete block"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  });

  // Inline add block component
  const InlineAddBlock = memo(({ insertIndex }: { insertIndex: number }) => {
    const [showOptions, setShowOptions] = useState(false);
    
    return (
      <div className="relative my-4">
        {!showOptions ? (
          <div className="flex justify-center">
            <button
              onClick={() => setShowOptions(true)}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 border border-dashed border-gray-300 hover:border-blue-300 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add block here</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-lg shadow-sm p-2">
              <button
                onClick={() => {
                  handleAddBlockAt('text', insertIndex);
                  setShowOptions(false);
                }}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors"
              >
                <span>📝</span>
                <span>Text</span>
              </button>
              <button
                onClick={() => {
                  handleAddBlockAt('image', insertIndex);
                  setShowOptions(false);
                }}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors"
              >
                <span>🖼️</span>
                <span>Image</span>
              </button>
              <button
                onClick={() => {
                  handleAddBlockAt('columns', insertIndex);
                  setShowOptions(false);
                }}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded transition-colors"
              >
                <span>🏗️</span>
                <span>Columns</span>
              </button>
              <button
                onClick={() => setShowOptions(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded transition-colors"
                title="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  });
  
  // Show loading state while fetching page data
  if (pageLoading && pageId !== 'new') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center space-x-6">
              <Button
                variant="outline"
                onClick={onBack}
                className="flex items-center hover:bg-slate-50 border-slate-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Pages
              </Button>
              
              <div className="flex items-center space-x-4">
                <div className="space-y-1">
                  <input
                    type="text"
                    value={pageData.title}
                    onChange={(e) => setPageData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Untitled Page"
                    className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-3 py-1 text-slate-900 placeholder-slate-400 hover:bg-slate-50 transition-colors"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-400">/p/</span>
                    <input
                      type="text"
                      value={pageData.slug}
                      onChange={(e) => setPageData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="page-url"
                      className="text-sm text-slate-600 bg-white border border-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md px-2 py-1 placeholder-slate-400 hover:border-slate-400 transition-colors min-w-[120px]"
                    />
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    pageData.status === 'published' 
                      ? 'bg-green-100 text-green-700' 
                      : pageData.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {pageData.status.charAt(0).toUpperCase() + pageData.status.slice(1)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Mode Toggle */}
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setIsPreviewMode(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    !isPreviewMode 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setIsPreviewMode(true)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    isPreviewMode 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="h-4 w-4 mr-2 inline" />
                  Preview
                </button>
              </div>
              
              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 font-medium shadow-sm"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Page
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden bg-slate-50">
        
        {/* Center Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas Header */}
          {!isPreviewMode && (
            <div className="bg-white border-b border-slate-200 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-slate-700">Canvas</span>
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <span>{pageData.blocks.length} blocks</span>
                    <span>•</span>
                    <span>{pageData.status}</span>
                  </div>
                </div>
                
                {pageData.blocks.length > 0 && (
                  <Button
                    onClick={() => handleAddBlock('text')}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Block
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {/* Canvas Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="min-h-full p-8">
              {/* Canvas Paper */}
              <div className="max-w-6xl mx-auto">
                {/* Navigation Settings - only show when editing */}
                {!isPreviewMode && (
                  <NavigationSettings 
                    pageData={pageData} 
                    onPageDataChange={setPageData} 
                  />
                )}
                
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 min-h-[700px] overflow-hidden">
                  <div className="p-8">
                    {pageData.blocks.length === 0 ? (
                      // Enhanced Empty State
                      <div className="text-center py-20">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center">
                          <Plus className="h-12 w-12 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                          Start Building Your Page
                        </h3>
                        <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                          Create engaging content by adding blocks from the sidebar. 
                          Mix text, images, and other elements to tell your story.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button
                            onClick={() => handleAddBlock('text')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Text Block
                          </Button>
                          <Button
                            onClick={() => handleAddBlock('image')}
                            variant="outline"
                            className="px-6 py-3"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Image Block
                          </Button>
                          <Button
                            onClick={() => handleAddBlock('columns')}
                            variant="outline"
                            className="px-6 py-3 border-purple-300 text-purple-700 hover:bg-purple-50"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Column Layout
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Content with Blocks and inline add buttons
                      <div>
                        {pageData.blocks.map((block, index) => (
                          <React.Fragment key={block.id}>
                            {/* Inline add block at the beginning */}
                            {index === 0 && !isPreviewMode && (
                              <InlineAddBlock insertIndex={0} />
                            )}
                            
                            {/* Block with controls */}
                            <div className="mb-6">
                              <BlockWithControls block={block} index={index} />
                            </div>
                            
                            {/* Inline add block after each block */}
                            {!isPreviewMode && (
                              <InlineAddBlock insertIndex={index + 1} />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

PageEditor.displayName = 'PageEditor';

export default PageEditor;