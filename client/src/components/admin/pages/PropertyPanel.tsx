import React, { memo, useCallback } from 'react';
import { X, Settings } from 'lucide-react';
import { blockRegistry } from './blocks/registry';

interface Block {
  id: string;
  type: string;
  props: Record<string, any>;
}

interface PropertyPanelProps {
  block: Block;
  onUpdate: (newProps: Record<string, any>) => void;
  onClose: () => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = memo(({
  block,
  onUpdate,
  onClose
}) => {
  const blockDef = blockRegistry.get(block.type);
  
  if (!blockDef) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Properties</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-red-600">Block type "{block.type}" not found.</p>
      </div>
    );
  }
  
  // Handle property change
  const handlePropertyChange = useCallback((key: string, value: any) => {
    onUpdate({ [key]: value });
  }, [onUpdate]);
  
  // Render form field based on schema property
  const renderField = useCallback((key: string, property: any, value: any) => {
    const handleChange = (newValue: any) => handlePropertyChange(key, newValue);
    
    switch (property.type) {
      case 'string':
        if (property.enum) {
          // Select dropdown
          return (
            <select
              value={value || property.default || ''}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {property.enum.map((option: string) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          );
        } else if (property.format === 'color') {
          // Color picker
          return (
            <div className="flex space-x-2">
              <input
                type="color"
                value={value || property.default || '#000000'}
                onChange={(e) => handleChange(e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={value || property.default || ''}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="#000000"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          );
        } else {
          // Text input or textarea
          const isLongText = key === 'content' || key === 'caption' || key === 'description';
          
          if (isLongText) {
            return (
              <textarea
                value={value || property.default || ''}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={property.description || `Enter ${property.title?.toLowerCase() || key}`}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            );
          } else {
            return (
              <input
                type="text"
                value={value || property.default || ''}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={property.description || `Enter ${property.title?.toLowerCase() || key}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            );
          }
        }
        
      case 'number':
        return (
          <input
            type="number"
            value={value ?? property.default ?? ''}
            onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
        
      case 'boolean':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value ?? property.default ?? false}
              onChange={(e) => handleChange(e.target.checked)}
              className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              {property.description || 'Enable this option'}
            </span>
          </label>
        );
        
      default:
        return (
          <input
            type="text"
            value={value || property.default || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
    }
  }, [handlePropertyChange]);
  
  return (
    <div className="p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">
            {blockDef.name} Properties
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* Properties form */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          {Object.entries(blockDef.schema.properties).map(([key, property]: [string, any]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {property.title || key.charAt(0).toUpperCase() + key.slice(1)}
                {property.description && (
                  <span className="block text-xs text-gray-500 font-normal mt-1">
                    {property.description}
                  </span>
                )}
              </label>
              {renderField(key, property, block.props[key])}
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <div>Block ID: {block.id}</div>
          <div>Type: {block.type}</div>
        </div>
      </div>
    </div>
  );
});

PropertyPanel.displayName = 'PropertyPanel';

export default PropertyPanel;