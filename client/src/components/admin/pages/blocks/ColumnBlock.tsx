import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { BlockProps } from './registry';
import { blockRegistry } from './registry';

interface ColumnItem {
  id: string;
  type: string;
  props: Record<string, any>;
}

interface ColumnBlockProps extends BlockProps {
  props: {
    columns: number;
    items: ColumnItem[];
  };
}

const ColumnBlock: React.FC<ColumnBlockProps> = ({ props, isEditing, onUpdate }) => {
  const { columns = 2, items = [] } = props;
  const [showAddOptions, setShowAddOptions] = useState<number | null>(null);

  // Ensure we have the right number of column slots
  const columnItems = Array.from({ length: columns }, (_, index) => 
    items.find(item => item.id === `col-${index}`) || null
  );

  const handleAddItem = (columnIndex: number, blockType: string) => {
    // Simple default props for each block type
    const defaultProps = {
      text: { content: 'Enter your text here...' },
      image: { src: '', alt: 'Image', caption: '' }
    };

    const newItem: ColumnItem = {
      id: `col-${columnIndex}`,
      type: blockType,
      props: defaultProps[blockType as keyof typeof defaultProps] || {}
    };

    const updatedItems = [...items.filter(item => item.id !== `col-${columnIndex}`), newItem];
    
    onUpdate?.({
      ...props,
      items: updatedItems
    });
    
    setShowAddOptions(null);
  };

  const handleRemoveItem = (columnIndex: number) => {
    const updatedItems = items.filter(item => item.id !== `col-${columnIndex}`);
    
    onUpdate?.({
      ...props,
      items: updatedItems
    });
  };

  const handleUpdateItem = (columnIndex: number, newProps: Record<string, any>) => {
    const updatedItems = items.map(item => 
      item.id === `col-${columnIndex}` 
        ? { ...item, props: { ...item.props, ...newProps } }
        : item
    );
    
    onUpdate?.({
      ...props,
      items: updatedItems
    });
  };

  const handleChangeColumns = (newColumnCount: number) => {
    // Remove items that exceed the new column count
    const filteredItems = items.filter((_, index) => index < newColumnCount);
    
    onUpdate?.({
      ...props,
      columns: newColumnCount,
      items: filteredItems
    });
  };

  const getGridClass = () => {
    switch (columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      default: return 'grid-cols-2';
    }
  };

  return (
    <div className="w-full">
      {/* Column controls - only show when editing */}
      {isEditing && (
        <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 rounded border border-dashed border-gray-300">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Columns:</span>
            {[1, 2, 3, 4].map(count => (
              <button
                key={count}
                onClick={() => handleChangeColumns(count)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  columns === count
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-500">{columns} Column Layout</span>
        </div>
      )}

      {/* Column grid */}
      <div className={`grid ${getGridClass()} gap-4`}>
        {columnItems.map((item, index) => (
          <div key={index} className="min-h-[100px]">
            {item ? (
              // Render existing item
              <div className="relative group">
                <div className="border border-gray-200 rounded p-4 hover:border-gray-300 transition-colors">
                  {blockRegistry.renderBlock(item.type, {
                    id: item.id,
                    props: item.props,
                    isEditing: isEditing, // Allow full editing within columns
                    onUpdate: (newProps) => handleUpdateItem(index, newProps)
                  })}
                </div>
                
                {/* Remove button */}
                {isEditing && (
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Remove item"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ) : (
              // Empty slot - show add button
              isEditing && (
                <div className="border-2 border-dashed border-gray-300 rounded p-4 flex flex-col items-center justify-center min-h-[100px] hover:border-gray-400 transition-colors">
                  {showAddOptions === index ? (
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleAddItem(index, 'text')}
                        className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        <span>📝</span>
                        <span>Add Text</span>
                      </button>
                      <button
                        onClick={() => handleAddItem(index, 'image')}
                        className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      >
                        <span>🖼️</span>
                        <span>Add Image</span>
                      </button>
                      <button
                        onClick={() => setShowAddOptions(null)}
                        className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddOptions(index)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Content</span>
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        ))}
      </div>

      {/* Preview mode - show clean layout */}
      {!isEditing && columnItems.every(item => !item) && (
        <div className="text-center py-8 text-gray-500">
          <span>Empty column layout</span>
        </div>
      )}
    </div>
  );
};

export default ColumnBlock;

// Block definition for registration
export const columnBlockDefinition = {
  type: 'columns',
  name: 'Column Layout',
  description: 'Create multi-column layouts with 1-4 columns',
  category: 'layout' as const,
  icon: '🏗️',
  component: ColumnBlock,
  defaultProps: {
    columns: 2,
    items: []
  },
  schema: {
    type: 'object',
    properties: {
      columns: {
        type: 'number',
        minimum: 1,
        maximum: 4,
        default: 2
      },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string' },
            props: { type: 'object' }
          }
        }
      }
    }
  }
};