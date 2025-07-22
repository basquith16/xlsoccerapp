import React, { useState, useEffect } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { SportType, DemoType } from '../../types';
import { useAdminCoaches } from '../../services/graphqlService';

interface TemplateFormProps {
  template?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const TemplateForm: React.FC<TemplateFormProps> = ({
  template,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    sport: SportType.SOCCER,
    demo: DemoType.YOUTH,
    description: '',
    birthYear: '',
    rosterLimit: 15,
    price: 0,
    trainer: '',
    staffOnly: false,
    coverImage: '',
    images: [] as string[],
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch coaches
  const { data: coachesData } = useAdminCoaches();
  const coaches = coachesData?.adminCoaches || [];

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        sport: template.sport || SportType.SOCCER,
        demo: template.demo || DemoType.YOUTH,
        description: template.description || '',
        birthYear: template.birthYear || '',
        rosterLimit: template.rosterLimit || 15,
        price: template.price || 0,
        trainer: template.trainer || '',
        staffOnly: template.staffOnly || false,
        coverImage: template.coverImage || '',
        images: template.images || [],
        isActive: template.isActive !== undefined ? template.isActive : true
      });
    }
  }, [template]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.birthYear.trim()) {
      newErrors.birthYear = 'Birth year is required';
    }

    if (formData.rosterLimit <= 0) {
      newErrors.rosterLimit = 'Roster limit must be greater than 0';
    }

    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Generate slug from name if not provided
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const submitData = {
        ...formData,
        slug: slug
      };
      
      onSubmit(submitData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // For now, we'll just store the file names
      // In a real implementation, you'd upload to Cloudinary
      const fileNames = Array.from(files).map(file => file.name);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...fileNames] }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter template name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Trainer */}
          <div>
            <label htmlFor="trainer" className="block text-sm font-medium text-gray-700 mb-2">
              Trainer
            </label>
            <select
              id="trainer"
              value={formData.trainer}
              onChange={(e) => handleInputChange('trainer', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.trainer ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select a trainer</option>
              <option value="TBD">TBD - To Be Determined</option>
              {coaches.map((coach: any) => (
                <option key={coach.id} value={coach.name}>
                  {coach.name} ({coach.email})
                </option>
              ))}
            </select>
            {errors.trainer && (
              <p className="mt-1 text-sm text-red-600">{errors.trainer}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter template description"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>
      </div>

      {/* Sport & Demo Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Sport & Demo Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
            <select
              value={formData.sport}
              onChange={(e) => handleInputChange('sport', e.target.value as SportType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {Object.values(SportType).map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Demo</label>
            <select
              value={formData.demo}
              onChange={(e) => handleInputChange('demo', e.target.value as DemoType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {Object.values(DemoType).map((demo) => (
                <option key={demo} value={demo}>
                  {demo}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Birth Year *
          </label>
          <input
            type="text"
            value={formData.birthYear}
            onChange={(e) => handleInputChange('birthYear', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.birthYear ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., 2015-2016"
          />
          {errors.birthYear && <p className="text-red-500 text-sm mt-1">{errors.birthYear}</p>}
        </div>
      </div>

      {/* Capacity & Pricing */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Capacity & Pricing</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Roster Limit *
            </label>
            <input
              type="number"
              value={formData.rosterLimit}
              onChange={(e) => handleInputChange('rosterLimit', parseInt(e.target.value) || 0)}
              min="1"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.rosterLimit ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.rosterLimit && <p className="text-red-500 text-sm mt-1">{errors.rosterLimit}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price ($) *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="staffOnly"
              checked={formData.staffOnly}
              onChange={(e) => handleInputChange('staffOnly', e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="staffOnly" className="ml-2 block text-sm text-gray-900">
              Staff Only (not publicly visible)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active (template is available for use)
            </label>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Images</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cover Image URL
          </label>
          <input
            type="url"
            value={formData.coverImage}
            onChange={(e) => handleInputChange('coverImage', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Images
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Images
            </label>
          </div>
          
          {formData.images.length > 0 && (
            <div className="mt-4 space-y-2">
              {formData.images.map((image, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">{image}</span>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : (template ? 'Update Template' : 'Create Template')}
        </button>
      </div>
    </form>
  );
};

export default TemplateForm; 