import React from 'react';
import { Link } from 'react-router-dom';
import { Edit } from 'lucide-react';
import { blockRegistry } from './admin/pages/blocks/registry';

interface Block {
  id: string;
  type: string;
  props: Record<string, any>;
}

interface PageRendererProps {
  blocks: Block[];
  title?: string;
  pageId?: string;
  isAdmin?: boolean;
}

const PageRenderer: React.FC<PageRendererProps> = ({ blocks, title, pageId, isAdmin }) => {
  
  return (
    <div className="min-h-screen bg-white">
      {title && (
        <div className="bg-gray-50 py-8 relative">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              
              {/* Admin Edit Button */}
              {isAdmin && pageId && (
                <Link
                  to={`/admin?tab=pages&editPage=${pageId}`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Page
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {blocks.map((block) => {
            const blockElement = blockRegistry.renderBlock(block.type, {
              id: block.id,
              props: block.props,
              isEditing: false
            });
            
            if (!blockElement) {
              return (
                <div key={block.id} className="p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-600">Block type "{block.type}" not found</p>
                </div>
              );
            }
            
            return (
              <div key={block.id} className="block-container">
                {blockElement}
              </div>
            );
          })}
        </div>
        
        {blocks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">This page has no content yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageRenderer;