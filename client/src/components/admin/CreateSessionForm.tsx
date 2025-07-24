import React, { useState } from 'react';
import { SportType, DemoType } from '../../types';
import { useQuery } from '@apollo/client';
import { GET_ADMIN_COACHES } from '../../graphql/queries/admin';

interface CreateSessionFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
  onErrorClear?: () => void;
}

const CreateSessionForm: React.FC<CreateSessionFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  error = null,
  onErrorClear
}) => {
  const [formData, setFormData] = useState({
    name: '',
    sport: 'soccer' as SportType,
    demo: 'boys' as DemoType,
    description: '',
    birthYear: new Date().getFullYear(),
    ageRange: '',
    rosterLimit: 20,
    price: 0,
    priceDiscount: 0,
    startDates: [''],
    endDate: '',
    timeStart: '',
    timeEnd: '',
    trainer: '',
    staffOnly: false,
    coverImage: '',
    images: [''],
    field: {
      fieldNumb: 'TBD',
      location: 'TBD' as 'Inside' | 'Outside' | 'TBD'
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch coaches for dropdown
  const { data: coachesData, loading: coachesLoading } = useQuery(GET_ADMIN_COACHES);
  const coaches = coachesData?.adminCoaches || [];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 10) {
      newErrors.name = 'Name must be at least 10 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.birthYear) {
      newErrors.birthYear = 'Birth year is required';
    } else if (formData.birthYear > new Date().getFullYear()) {
      newErrors.birthYear = 'Birth year cannot be in the future';
    }

    if (!formData.ageRange.trim()) {
      newErrors.ageRange = 'Age range is required';
    }

    if (!formData.rosterLimit || formData.rosterLimit <= 0) {
      newErrors.rosterLimit = 'Roster limit must be greater than 0';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.priceDiscount && formData.priceDiscount >= formData.price) {
      newErrors.priceDiscount = 'Discount must be less than price';
    }

    if (!formData.startDates.length || !formData.startDates[0]) {
      newErrors.startDates = 'At least one start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (!formData.timeStart) {
      newErrors.timeStart = 'Start time is required';
    }

    if (!formData.timeEnd) {
      newErrors.timeEnd = 'End time is required';
    }

    if (formData.timeStart && formData.timeEnd && formData.timeStart >= formData.timeEnd) {
      newErrors.timeEnd = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Filter out empty start dates and images
      const cleanData = {
        ...formData,
        startDates: formData.startDates.filter(date => date.trim() !== ''),
        images: formData.images.filter(img => img.trim() !== '')
      };
      onSubmit(cleanData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear server error when user starts typing in name field
    if (field === 'name' && error && onErrorClear) {
      onErrorClear();
    }
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      field: {
        ...prev.field,
        [fieldName]: value
      }
    }));
  };

  const addStartDate = () => {
    setFormData(prev => ({
      ...prev,
      startDates: [...prev.startDates, '']
    }));
  };

  const removeStartDate = (index: number) => {
    setFormData(prev => ({
      ...prev,
      startDates: prev.startDates.filter((_, i) => i !== index)
    }));
  };

  const updateStartDate = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      startDates: prev.startDates.map((date, i) => i === index ? value : date)
    }));
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const updateImage = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter session name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sport *
            </label>
            <select
              value={formData.sport}
              onChange={(e) => handleInputChange('sport', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="soccer">Soccer</option>
              <option value="basketball">Basketball</option>
              <option value="volleyball">Volleyball</option>
              <option value="camp">Camp</option>
              <option value="futsal">Futsal</option>
              <option value="football">Football</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Demo *
            </label>
            <select
              value={formData.demo}
              onChange={(e) => handleInputChange('demo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
              <option value="coed">Coed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Birth Year *
            </label>
            <input
              type="number"
              value={formData.birthYear}
              onChange={(e) => handleInputChange('birthYear', parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.birthYear ? 'border-red-500' : 'border-gray-300'
              }`}
              min="1990"
              max={new Date().getFullYear()}
            />
            {errors.birthYear && <p className="text-red-500 text-sm mt-1">{errors.birthYear}</p>}
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
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter session description"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Age Range *
          </label>
          <input
            type="text"
            value={formData.ageRange}
            onChange={(e) => handleInputChange('ageRange', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.ageRange ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., 8-12 years old"
          />
          {errors.ageRange && <p className="text-red-500 text-sm mt-1">{errors.ageRange}</p>}
        </div>
      </div>

      {/* Pricing & Capacity */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Pricing & Capacity</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Roster Limit *
            </label>
            <input
              type="number"
              value={formData.rosterLimit}
              onChange={(e) => handleInputChange('rosterLimit', parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.rosterLimit ? 'border-red-500' : 'border-gray-300'
              }`}
              min="1"
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
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              min="0"
              step="0.01"
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount ($)
            </label>
            <input
              type="number"
              value={formData.priceDiscount}
              onChange={(e) => handleInputChange('priceDiscount', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.priceDiscount ? 'border-red-500' : 'border-gray-300'
              }`}
              min="0"
              step="0.01"
            />
            {errors.priceDiscount && <p className="text-red-500 text-sm mt-1">{errors.priceDiscount}</p>}
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Schedule</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date *
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.endDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trainer
            </label>
            <select
              value={formData.trainer}
              onChange={(e) => handleInputChange('trainer', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={coachesLoading}
            >
              <option value="">Select a Trainer</option>
              {coachesLoading ? (
                <option value="" disabled>Loading coaches...</option>
              ) : (
                coaches
                  .filter((coach: any) => coach.role === 'coach' || coach.role === 'admin')
                  .map((coach: any) => (
                    <option key={coach.id} value={coach.name}>
                      {coach.name} ({coach.role})
                    </option>
                  ))
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time *
            </label>
            <input
              type="time"
              value={formData.timeStart}
              onChange={(e) => handleInputChange('timeStart', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.timeStart ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.timeStart && <p className="text-red-500 text-sm mt-1">{errors.timeStart}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time *
            </label>
            <input
              type="time"
              value={formData.timeEnd}
              onChange={(e) => handleInputChange('timeEnd', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.timeEnd ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.timeEnd && <p className="text-red-500 text-sm mt-1">{errors.timeEnd}</p>}
          </div>
        </div>

        {/* Field Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Number
            </label>
            <input
              type="text"
              value={formData.field.fieldNumb}
              onChange={(e) => handleFieldChange('fieldNumb', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 1, 2, A, B (or leave as TBD)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Location
            </label>
            <select
              value={formData.field.location}
              onChange={(e) => handleFieldChange('location', e.target.value as 'Inside' | 'Outside' | 'TBD')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="TBD">To Be Determined</option>
              <option value="Outside">Outside</option>
              <option value="Inside">Inside</option>
            </select>
          </div>
        </div>

        {/* Start Dates */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Dates *
          </label>
          {formData.startDates.map((date, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="date"
                value={date}
                onChange={(e) => updateStartDate(index, e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.startDates ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formData.startDates.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStartDate(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addStartDate}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            + Add Start Date
          </button>
          {errors.startDates && <p className="text-red-500 text-sm mt-1">{errors.startDates}</p>}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Images
          </label>
          {formData.images.map((image, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="url"
                value={image}
                onChange={(e) => updateImage(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
              {formData.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addImage}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            + Add Image
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Settings</h3>
        
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.staffOnly}
              onChange={(e) => handleInputChange('staffOnly', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Staff Only</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating...' : 'Create Session'}
        </button>
      </div>
    </form>
  );
};

export default CreateSessionForm; 