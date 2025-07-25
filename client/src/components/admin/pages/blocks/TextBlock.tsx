import React, { memo, useCallback, useState, useRef, useEffect } from 'react';
import { Type, Edit3, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Palette } from 'lucide-react';
import { BlockProps } from './registry';

interface TextBlockProps extends BlockProps {
  props: {
    content: string;
    fontSize: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
    textAlign: 'left' | 'center' | 'right';
    color: string;
    fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
    proseSize: 'prose-sm' | 'prose' | 'prose-lg' | 'prose-xl';
  };
}

const TextBlock: React.FC<TextBlockProps> = memo(({ 
  id, 
  props, 
  isEditing = false, 
  onUpdate 
}) => {
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [localContent, setLocalContent] = useState(props.content || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Handle inline editing toggle - using useCallback to prevent re-renders
  const handleStartEditing = useCallback(() => {
    if (isEditing) {
      setIsInlineEditing(true);
      setLocalContent(props.content || '');
    }
  }, [isEditing, props.content]);
  
  // Basic HTML sanitization for security
  const sanitizeHTML = useCallback((html: string) => {
    // Allow only safe HTML tags
    const allowedTags = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a'];
    
    // Simple regex-based sanitization (for production, use a proper library like DOMPurify)
    let sanitized = html.replace(/<script[^>]*>.*?<\/script>/gi, '');
    sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    return sanitized;
  }, []);

  // Handle content save - optimized with useCallback
  const handleSave = useCallback(() => {
    if (onUpdate && localContent !== props.content) {
      const sanitizedContent = sanitizeHTML(localContent);
      onUpdate({ content: sanitizedContent });
    }
    setIsInlineEditing(false);
  }, [onUpdate, localContent, props.content, sanitizeHTML]);
  
  // Handle escape key to cancel editing
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setLocalContent(props.content || '');
      setIsInlineEditing(false);
    }
  }, [props.content]);
  
  // Auto-focus textarea when entering edit mode
  useEffect(() => {
    if (isInlineEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isInlineEditing]);
  
  // Sync local content with props when not editing
  useEffect(() => {
    if (!isInlineEditing) {
      setLocalContent(props.content || '');
    }
  }, [props.content, isInlineEditing]);
  
  // Memoize style object to prevent re-renders
  const textStyle = React.useMemo(() => ({
    fontSize: {
      'sm': '0.875rem',
      'base': '1rem', 
      'lg': '1.125rem',
      'xl': '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem'
    }[props.fontSize] || '1rem',
    textAlign: props.textAlign || 'left',
    color: props.color || '#1f2937',
    fontWeight: {
      'normal': '400',
      'medium': '500',
      'semibold': '600',
      'bold': '700'
    }[props.fontWeight] || '400'
  }), [props.fontSize, props.textAlign, props.color, props.fontWeight]);
  
  // Handle property updates
  const handlePropertyUpdate = useCallback((property: string, value: any) => {
    if (onUpdate) {
      onUpdate({ [property]: value });
    }
  }, [onUpdate]);

  // Insert HTML tags
  const insertHtmlTag = useCallback((tag: string, closeTag?: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = localContent.substring(start, end);
    
    const openTag = `<${tag}>`;
    const closing = closeTag || `</${tag}>`;
    const newText = localContent.substring(0, start) + openTag + selectedText + closing + localContent.substring(end);
    
    setLocalContent(newText);
    
    // Set cursor position after insertion
    setTimeout(() => {
      const newPosition = start + openTag.length + selectedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 0);
  }, [localContent]);

  // Render inline editor
  if (isInlineEditing) {
    return (
      <div className="relative">
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          {/* Modern Toolbar */}
          <div className="bg-white border-b border-slate-200 px-3 py-2">
            <div className="flex items-center space-x-1">
              {/* Text Formatting */}
              <div className="flex items-center space-x-0.5 mr-3">
                <button
                  onClick={() => insertHtmlTag('strong')}
                  className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                  title="Bold"
                >
                  <Bold className="h-3.5 w-3.5 text-slate-600" />
                </button>
                <button
                  onClick={() => insertHtmlTag('em')}
                  className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                  title="Italic"
                >
                  <Italic className="h-3.5 w-3.5 text-slate-600" />
                </button>
              </div>

              {/* Alignment */}
              <div className="flex items-center space-x-0.5 mr-3 border-l border-slate-200 pl-3">
                <button
                  onClick={() => handlePropertyUpdate('textAlign', 'left')}
                  className={`p-1.5 hover:bg-slate-100 rounded transition-colors ${
                    props.textAlign === 'left' ? 'bg-blue-100 text-blue-600' : 'text-slate-600'
                  }`}
                  title="Align Left"
                >
                  <AlignLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handlePropertyUpdate('textAlign', 'center')}
                  className={`p-1.5 hover:bg-slate-100 rounded transition-colors ${
                    props.textAlign === 'center' ? 'bg-blue-100 text-blue-600' : 'text-slate-600'
                  }`}
                  title="Align Center"
                >
                  <AlignCenter className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handlePropertyUpdate('textAlign', 'right')}
                  className={`p-1.5 hover:bg-slate-100 rounded transition-colors ${
                    props.textAlign === 'right' ? 'bg-blue-100 text-blue-600' : 'text-slate-600'
                  }`}
                  title="Align Right"
                >
                  <AlignRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Font Size */}
              <div className="flex items-center mr-3 border-l border-slate-200 pl-3">
                <select
                  value={props.fontSize}
                  onChange={(e) => handlePropertyUpdate('fontSize', e.target.value)}
                  className="text-xs border border-slate-200 rounded px-2 py-1 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 w-[110px]"
                >
                  <option value="sm">Small</option>
                  <option value="base">Normal</option>
                  <option value="lg">Large</option>
                  <option value="xl">XL</option>
                  <option value="2xl">2XL</option>
                  <option value="3xl">3XL</option>
                </select>
              </div>

              {/* Font Weight */}
              <div className="flex items-center">
                <select
                  value={props.fontWeight}
                  onChange={(e) => handlePropertyUpdate('fontWeight', e.target.value)}
                  className="text-xs border border-slate-200 rounded px-2 py-1 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 w-[120px]"
                >
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="semibold">Semi Bold</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* HTML Quick Tags */}
          <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-100">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => insertHtmlTag('h2')}
                className="text-xs bg-white hover:bg-slate-100 px-2 py-0.5 rounded border transition-colors"
              >
                H2
              </button>
              <button
                onClick={() => insertHtmlTag('h3')}
                className="text-xs bg-white hover:bg-slate-100 px-2 py-0.5 rounded border transition-colors"
              >
                H3
              </button>
              <button
                onClick={() => insertHtmlTag('p')}
                className="text-xs bg-white hover:bg-slate-100 px-2 py-0.5 rounded border transition-colors"
              >
                P
              </button>
              <button
                onClick={() => insertHtmlTag('ul')}
                className="text-xs bg-white hover:bg-slate-100 px-2 py-0.5 rounded border transition-colors"
              >
                List
              </button>
              <button
                onClick={() => insertHtmlTag('a href="#"')}
                className="text-xs bg-white hover:bg-slate-100 px-2 py-0.5 rounded border transition-colors"
              >
                Link
              </button>
            </div>
          </div>
          
          {/* Enhanced textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={localContent}
              onChange={(e) => setLocalContent(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="w-full h-40 p-4 resize-none focus:outline-none bg-white font-mono text-sm leading-relaxed placeholder-slate-400 border-none"
              style={{ 
                fontSize: '14px',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                lineHeight: '1.6'
              }}
              placeholder="Enter your HTML content here...

Examples:
<h2>Welcome to Our Center</h2>
<p>This is a <strong>paragraph</strong> with <em>emphasis</em>.</p>
<ul>
  <li>First item</li>
  <li>Second item</li>
</ul>
<p><a href='#'>Learn more</a></p>"
            />
            
            {/* Character count */}
            <div className="absolute bottom-2 right-2 text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded shadow-sm">
              {localContent.length} characters
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="bg-slate-50 px-3 py-2 border-t border-slate-200 flex justify-between items-center">
            <div className="text-xs text-slate-500">
              Press Escape to cancel • Click outside to save
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setLocalContent(props.content || '');
                  setIsInlineEditing(false);
                }}
                className="px-2 py-1 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render display mode
  return (
    <div 
      className={`relative group ${isEditing ? 'cursor-pointer hover:bg-blue-50' : ''}`}
      onClick={handleStartEditing}
    >
      {/* Edit overlay for editing mode */}
      {isEditing && (
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500 rounded pointer-events-none">
          <div className="absolute -top-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center space-x-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
              <Edit3 className="h-3 w-3" />
              <span>Click to edit</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Text content with Tailwind typography */}
      <div 
        className={`${props.proseSize || 'prose'} prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-em:text-gray-600 prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700`}
        style={textStyle as React.CSSProperties}
        dangerouslySetInnerHTML={{ 
          __html: props.content || '<p class="text-gray-400 italic">Click to add text...</p>' 
        }}
      />
    </div>
  );
});

// Set display name for debugging
TextBlock.displayName = 'TextBlock';

export default TextBlock;

// Block definition for registration
export const textBlockDefinition = {
  type: 'text',
  name: 'Text',
  description: 'Add text content with HTML formatting support',
  category: 'content' as const,
  icon: 'type',
  component: TextBlock,
  defaultProps: {
    content: '<h3>Welcome to Our Soccer Center</h3><p>Experience the best <strong>soccer training</strong> and <em>field rentals</em> in the area.</p><ul><li>Professional coaching</li><li>Modern facilities</li><li>Flexible scheduling</li></ul>',
    fontSize: 'base',
    textAlign: 'left',
    color: '#1f2937',
    fontWeight: 'normal',
    proseSize: 'prose'
  },
  schema: {
    type: 'object' as const,
    properties: {
      content: {
        type: 'string',
        title: 'Content',
        description: 'HTML content to display (supports tags like <strong>, <em>, <p>, <br>)'
      },
      fontSize: {
        type: 'string',
        title: 'Font Size',
        enum: ['sm', 'base', 'lg', 'xl', '2xl', '3xl'],
        default: 'base'
      },
      textAlign: {
        type: 'string',
        title: 'Text Alignment',
        enum: ['left', 'center', 'right'],
        default: 'left'
      },
      color: {
        type: 'string',
        title: 'Text Color',
        format: 'color',
        default: '#1f2937'
      },
      fontWeight: {
        type: 'string',
        title: 'Font Weight',
        enum: ['normal', 'medium', 'semibold', 'bold'],
        default: 'normal'
      },
      proseSize: {
        type: 'string',
        title: 'Typography Size',
        description: 'Overall scale of headings, paragraphs, and spacing',
        enum: ['prose-sm', 'prose', 'prose-lg', 'prose-xl'],
        default: 'prose'
      }
    }
  }
};