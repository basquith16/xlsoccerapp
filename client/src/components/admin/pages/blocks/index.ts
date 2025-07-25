// Block registration file
import { blockRegistry } from './registry';
import { textBlockDefinition } from './TextBlock';
import { imageBlockDefinition } from './ImageBlock';
import { columnBlockDefinition } from './ColumnBlock';

// Register all available blocks
export function initializeBlocks() {
  // Core content blocks
  blockRegistry.register(textBlockDefinition);
  blockRegistry.register(imageBlockDefinition);
  blockRegistry.register(columnBlockDefinition);
  
  console.log('📦 Registered blocks:', blockRegistry.getAll().map(b => b.name).join(', '));
}

// Export registry for use in components
export { blockRegistry } from './registry';
export type { BlockProps, BlockDefinition } from './registry';