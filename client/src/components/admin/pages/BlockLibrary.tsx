import React, { memo, useMemo } from 'react';
import { Type, Image, Layout, Zap } from 'lucide-react';
import { blockRegistry } from './blocks/registry';

interface BlockLibraryProps {
  onAddBlock: (blockType: string) => void;
}

const BlockLibrary: React.FC<BlockLibraryProps> = memo(({ onAddBlock }) => {
  // Get icon component based on string
  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      type: Type,
      image: Image,
      layout: Layout,
      zap: Zap,
    };
    return icons[iconName] || Layout;
  };
  
  // Group blocks by category - memoized for performance
  const blocksByCategory = useMemo(() => {
    const categories = ['content', 'media', 'layout', 'soccer'] as const;
    const grouped: Record<string, any[]> = {};
    
    categories.forEach(category => {
      grouped[category] = blockRegistry.getByCategory(category);
    });
    
    return grouped;
  }, []);
  
  // Category display names
  const categoryNames = {
    content: 'Content',
    media: 'Media',
    layout: 'Layout', 
    soccer: 'Soccer Center'
  };
  
  return (
    <div className="space-y-6">
      {Object.entries(blocksByCategory).map(([category, blocks]) => {
        if (blocks.length === 0) return null;
        
        return (
          <div key={category}>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              {categoryNames[category as keyof typeof categoryNames]}
            </h4>
            <div className="space-y-2">
              {blocks.map((blockDef) => {
                const IconComponent = getIcon(blockDef.icon);
                
                return (
                  <button
                    key={blockDef.type}
                    onClick={() => onAddBlock(blockDef.type)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 group-hover:text-blue-900">
                          {blockDef.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {blockDef.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      
      {/* Empty state if no blocks registered */}
      {Object.values(blocksByCategory).every(blocks => blocks.length === 0) && (
        <div className="text-center py-8">
          <Layout className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No blocks available</p>
        </div>
      )}
    </div>
  );
});

BlockLibrary.displayName = 'BlockLibrary';

export default BlockLibrary;