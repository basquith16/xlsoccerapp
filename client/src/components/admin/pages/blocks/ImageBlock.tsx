import React, { memo, useCallback, useState } from 'react';
import { Image as ImageIcon, Upload, Edit3 } from 'lucide-react';
import { BlockProps } from './registry';

interface ImageBlockProps extends BlockProps {
  props: {
    src: string;
    alt: string;
    width: 'auto' | 'full' | '1/2' | '1/3' | '2/3';
    height: 'auto' | 'fixed';
    alignment: 'left' | 'center' | 'right';
    caption?: string;
  };
}

const ImageBlock: React.FC<ImageBlockProps> = memo(({ 
  id, 
  props, 
  isEditing = false, 
  onUpdate 
}) => {
  const [imageError, setImageError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Handle image URL change - optimized with useCallback
  const handleUrlChange = useCallback((newUrl: string) => {
    if (onUpdate) {
      onUpdate({ ...props, src: newUrl });
      setImageError(false);
    }
  }, [onUpdate, props]);
  
  // Handle alt text change
  const handleAltChange = useCallback((newAlt: string) => {
    if (onUpdate) {
      onUpdate({ ...props, alt: newAlt });
    }
  }, [onUpdate, props]);
  
  // Handle image error
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);
  
  // Handle file upload (convert to base64 for persistence)
  const handleFileUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    try {
      // Convert to base64 data URL for persistence
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        handleUrlChange(dataUrl);
        setIsUploading(false);
      };
      reader.onerror = () => {
        console.error('Failed to read file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
      
      // TODO: In production, upload to your storage service:
      // const uploadedUrl = await uploadService.upload(file);
      // handleUrlChange(uploadedUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
    }
  }, [handleUrlChange]);
  
  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);
  
  // Memoize container style
  const containerStyle = React.useMemo(() => {
    const widthClass = {
      'auto': 'w-auto',
      'full': 'w-full',
      '1/2': 'w-1/2',
      '1/3': 'w-1/3',
      '2/3': 'w-2/3'
    }[props.width] || 'w-auto';
    
    const alignmentClass = {
      'left': 'justify-start',
      'center': 'justify-center',
      'right': 'justify-end'
    }[props.alignment] || 'justify-start';
    
    return `flex ${alignmentClass}`;
  }, [props.width, props.alignment]);
  
  // Render empty state
  if (!props.src || imageError) {
    return (
      <div className={`${containerStyle} ${isEditing ? 'min-h-[200px]' : 'min-h-[100px]'}`}>
        <div className={`relative group border-2 border-dashed border-gray-300 rounded-lg p-8 ${
          isEditing ? 'hover:border-blue-500 cursor-pointer' : ''
        }`}>
          {isEditing && (
            <div className="absolute -top-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center space-x-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                <Edit3 className="h-3 w-3" />
                <span>Configure image</span>
              </div>
            </div>
          )}
          
          <div className="text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                {imageError ? 'Failed to load image' : 'No image selected'}
              </p>
              {isEditing && (
                <div className="mt-4 space-y-2">
                  <input
                    type="text"
                    placeholder="Enter image URL..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onBlur={(e) => e.target.value && handleUrlChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement;
                        target.value && handleUrlChange(target.value);
                      }
                    }}
                  />
                  <div className="text-xs text-gray-500">or</div>
                  <label className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Upload file'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render image with content
  return (
    <div className={containerStyle}>
      <div className="relative group">
        {/* Edit overlay for editing mode */}
        {isEditing && (
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500 rounded pointer-events-none z-10">
            <div className="absolute -top-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center space-x-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                <Edit3 className="h-3 w-3" />
                <span>Click to edit</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Image */}
        <img
          src={props.src}
          alt={props.alt || 'Image'}
          onError={handleImageError}
          className={`${
            props.height === 'fixed' ? 'h-64 object-cover' : 'h-auto'
          } max-w-full rounded-lg shadow-sm ${
            isEditing ? 'cursor-pointer' : ''
          }`}
          loading="lazy"
        />
        
        {/* Caption */}
        {props.caption && (
          <div className="mt-2 text-sm text-gray-600 text-center">
            {isEditing ? (
              <input
                type="text"
                value={props.caption}
                onChange={(e) => onUpdate && onUpdate({ ...props, caption: e.target.value })}
                className="w-full text-center bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
                placeholder="Image caption..."
              />
            ) : (
              props.caption
            )}
          </div>
        )}
        
        {/* Edit form overlay */}
        {isEditing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg space-y-3 min-w-[250px]">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={props.src}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Alt Text</label>
                <input
                  type="text"
                  value={props.alt}
                  onChange={(e) => handleAltChange(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Describe the image..."
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// Set display name for debugging
ImageBlock.displayName = 'ImageBlock';

export default ImageBlock;

// Block definition for registration
export const imageBlockDefinition = {
  type: 'image',
  name: 'Image',
  description: 'Add images with captions and formatting options',
  category: 'media' as const,
  icon: 'image',
  component: ImageBlock,
  defaultProps: {
    src: '',
    alt: '',
    width: 'auto',
    height: 'auto',
    alignment: 'left',
    caption: ''
  },
  schema: {
    type: 'object' as const,
    properties: {
      src: {
        type: 'string',
        title: 'Image URL',
        description: 'URL of the image to display'
      },
      alt: {
        type: 'string',
        title: 'Alt Text',
        description: 'Alternative text for accessibility'
      },
      width: {
        type: 'string',
        title: 'Width',
        enum: ['auto', 'full', '1/2', '1/3', '2/3'],
        default: 'auto'
      },
      height: {
        type: 'string',
        title: 'Height',
        enum: ['auto', 'fixed'],
        default: 'auto'
      },
      alignment: {
        type: 'string',
        title: 'Alignment',
        enum: ['left', 'center', 'right'],
        default: 'left'
      },
      caption: {
        type: 'string',
        title: 'Caption',
        description: 'Optional caption text'
      }
    }
  }
};