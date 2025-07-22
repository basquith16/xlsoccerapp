import React from 'react';
import { Upload, Trash2 } from 'lucide-react';

interface TemplateFormImagesProps {
  formData: {
    coverImage: string;
    images: string[];
  };
  errors: Record<string, string>;
  onInputChange: (field: string, value: any) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
}

const TemplateFormImages: React.FC<TemplateFormImagesProps> = ({
  formData,
  errors,
  onInputChange,
  onImageUpload,
  onRemoveImage
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Images</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cover Image URL
        </label>
        <input
          type="url"
          value={formData.coverImage}
          onChange={(e) => onInputChange('coverImage', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
            errors.coverImage ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="https://example.com/image.jpg"
        />
        {errors.coverImage && <p className="text-red-500 text-sm mt-1">{errors.coverImage}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Images
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-2">
            <label htmlFor="image-upload" className="cursor-pointer">
              <span className="text-sm font-medium text-green-600 hover:text-green-500">
                Upload images
              </span>
              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={onImageUpload}
                className="sr-only"
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
          </div>
        </div>
      </div>

      {formData.images.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
                  <div className="p-4 text-center text-sm text-gray-500">
                    {image}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateFormImages; 