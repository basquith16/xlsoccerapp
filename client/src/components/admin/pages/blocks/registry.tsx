import React, { ComponentType, memo } from 'react';

// Block component interface following React patterns
export interface BlockProps {
  id: string;
  props: Record<string, any>;
  isEditing?: boolean;
  onUpdate?: (props: Record<string, any>) => void;
}

// Block definition interface
export interface BlockDefinition {
  type: string;
  name: string;
  description: string;
  category: 'content' | 'layout' | 'media' | 'soccer';
  icon: string;
  component: ComponentType<BlockProps>;
  defaultProps: Record<string, any>;
  schema: {
    type: 'object';
    properties: Record<string, any>;
  };
  previewImage?: string;
}

// Block registry class following singleton pattern
class BlockRegistry {
  private blocks = new Map<string, BlockDefinition>();
  
  // Register a block type
  register(definition: BlockDefinition): void {
    if (this.blocks.has(definition.type)) {
      // Silently skip if already registered (no warning needed)
      return;
    }
    
    // Wrap component with memo for performance (React Rule: minimize re-renders)
    definition.component = memo(definition.component);
    
    this.blocks.set(definition.type, definition);
  }
  
  // Get block definition
  get(type: string): BlockDefinition | undefined {
    return this.blocks.get(type);
  }
  
  // Get all blocks by category
  getByCategory(category: string): BlockDefinition[] {
    return Array.from(this.blocks.values()).filter(
      block => block.category === category
    );
  }
  
  // Get all blocks
  getAll(): BlockDefinition[] {
    return Array.from(this.blocks.values());
  }
  
  // Check if block type exists
  has(type: string): boolean {
    return this.blocks.has(type);
  }
  
  // Render a block component
  renderBlock(type: string, props: BlockProps): React.ReactElement | null {
    const definition = this.get(type);
    if (!definition) {
      console.error(`Block type "${type}" not found in registry`);
      return null;
    }
    
    const Component = definition.component;
    return <Component {...props} />;
  }
}

// Export singleton instance
export const blockRegistry = new BlockRegistry();

// Utility function to register multiple blocks
export function registerBlocks(definitions: BlockDefinition[]): void {
  definitions.forEach(definition => blockRegistry.register(definition));
}