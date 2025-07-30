import React, { useState, useEffect } from 'react';
import { SportType, DemoType } from '../../types';
import { useQuery } from '@apollo/client';
import { GET_ADMIN_COACHES } from '../../graphql/queries/admin';
import { isDateInPast } from '../../utils/dateUtils';

interface EditSessionFormProps {
  session: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
  onErrorClear?: () => void;
}

const EditSessionForm: React.FC<EditSessionFormProps> = ({
  session,
  onSubmit,
  onCancel,
  isLoading = false,
  error = null,
  onErrorClear
}) => {
  // Utility function to safely parse numeric inputs
  const parseNumericInput = (value: string, defaultValue: number = 0): number => {
    if (value === '') return defaultValue;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };
  const [formData, setFormData] = useState({
    name: '',
    sport: 'soccer' as SportType,
    demo: 'boys' as DemoType,
    description: '',
    birthYear: new Date().getFullYear(),
    ageRange: '',
    rosterLimit: 20,
    price: 0,
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

  // Initialize form data with session values
  useEffect(() => {
    if (session) {
      console.log('Session data:', session);
      console.log('Price type:', typeof session.price, 'Value:', session.price);
      
      setFormData({
        name: session.name || '',
        sport: session.sport || 'soccer',
        demo: session.demo || 'boys',
        description: session.description || '',
        birthYear: session.birthYear || new Date().getFullYear(),
        ageRange: session.ageRange ? `${session.ageRange.minAge}-${session.ageRange.maxAge}` : '',
        rosterLimit: session.rosterLimit || 20,
        price: typeof session.price === 'number' ? session.price : (parseFloat(session.price) || 0),
        startDates: session.startDates || [''],
        endDate: session.endDate || '',
        timeStart: session.timeStart || '',
        timeEnd: session.timeEnd || '',
        trainer: session.trainer?.id || session.trainer || '',
        staffOnly: session.staffOnly || false,
        coverImage: session.coverImage || '',
        images: session.images || [''],
        field: {
          fieldNumb: session.field?.fieldNumb || 'TBD',
          location: session.field?.location || 'TBD'
        }
      });
    }
  }, [session]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      field: {
        ...prev.field,
        [field]: value
      }
    }));
  };

  const handleArrayChange = (field: 'startDates' | 'images', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'startDates' | 'images') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'startDates' | 'images', index: number) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Session name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.rosterLimit < 1) {
      newErrors.rosterLimit = 'Roster limit must be at least 1';
    }

    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
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

    // Validate start dates
    const validStartDates = formData.startDates.filter(date => date.trim());
    if (validStartDates.length === 0) {
      newErrors.startDates = 'At least one start date is required';
    }

    // Check if any start dates are in the past
    const pastDates = validStartDates.filter(date => isDateInPast(date));
    if (pastDates.length > 0) {
      newErrors.startDates = 'Start dates cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onErrorClear) {
      onErrorClear();
    }

    if (!validateForm()) {
      return;
    }

    // Clean up the data before submitting
    const submitData: any = {
      ...formData,
      // Ensure price is a number
      price: Number(formData.price),
      startDates: formData.startDates.filter(date => date.trim()),
      images: formData.images.filter(img => img.trim()),
      trainer: formData.trainer || null
    };

    console.log('Form data before submit:', {
      price: formData.price,
      priceType: typeof formData.price
    });

    console.log('Final submit data:', submitData);
    console.log('Price to send:', submitData.price, 'Type:', typeof submitData.price);
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              {onErrorClear && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={onErrorClear}
                    className="text-sm text-red-800 underline hover:no-underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Session Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter session name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Sport */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sport
          </label>
          <select
            value={formData.sport}
            onChange={(e) => handleInputChange('sport', e.target.value as SportType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="soccer">Soccer</option>
            <option value="basketball">Basketball</option>
            <option value="tennis">Tennis</option>
          </select>
        </div>

        {/* Demo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Demographics
          </label>
          <select
            value={formData.demo}
            onChange={(e) => handleInputChange('demo', e.target.value as DemoType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="boys">Boys</option>
            <option value="girls">Girls</option>
            <option value="coed">Coed</option>
          </select>
        </div>

        {/* Birth Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Birth Year
          </label>
          <input
            type="number"
            value={formData.birthYear}
            onChange={(e) => handleInputChange('birthYear', parseNumericInput(e.target.value, new Date().getFullYear()))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="2000"
            max={new Date().getFullYear() + 5}
          />
        </div>

        {/* Age Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age Range
          </label>
          <input
            type="text"
            value={formData.ageRange}
            onChange={(e) => handleInputChange('ageRange', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 8-10 years"
          />
        </div>

        {/* Roster Limit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Roster Limit *
          </label>
          <input
            type="number"
            value={formData.rosterLimit}
            onChange={(e) => handleInputChange('rosterLimit', Math.floor(parseNumericInput(e.target.value)))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.rosterLimit ? 'border-red-300' : 'border-gray-300'
            }`}
            min="1"
          />
          {errors.rosterLimit && <p className="mt-1 text-sm text-red-600">{errors.rosterLimit}</p>}
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price ($) *
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleInputChange('price', parseNumericInput(e.target.value))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.price ? 'border-red-300' : 'border-gray-300'
            }`}
            min="0"
          />
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.description ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Enter session description"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      {/* Start Dates */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Start Dates *
        </label>
        {formData.startDates.map((date, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="date"
              value={date}
              onChange={(e) => handleArrayChange('startDates', index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.startDates.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem('startDates', index)}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('startDates')}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Add Start Date
        </button>
        {errors.startDates && <p className="mt-1 text-sm text-red-600">{errors.startDates}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date *
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.endDate ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Time *
          </label>
          <input
            type="time"
            value={formData.timeStart}
            onChange={(e) => handleInputChange('timeStart', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.timeStart ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.timeStart && <p className="mt-1 text-sm text-red-600">{errors.timeStart}</p>}
        </div>

        {/* End Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Time *
          </label>
          <input
            type="time"
            value={formData.timeEnd}
            onChange={(e) => handleInputChange('timeEnd', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.timeEnd ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.timeEnd && <p className="mt-1 text-sm text-red-600">{errors.timeEnd}</p>}
        </div>
      </div>

      {/* Trainer */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Trainer
        </label>
        <select
          value={formData.trainer}
          onChange={(e) => handleInputChange('trainer', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={coachesLoading}
        >
          <option value="">Select a trainer...</option>
          {coaches.map((coach: any) => (
            <option key={coach.id} value={coach.id}>
              {coach.name}
            </option>
          ))}
        </select>
      </div>

      {/* Field Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Field Number
          </label>
          <input
            type="text"
            value={formData.field.fieldNumb}
            onChange={(e) => handleFieldChange('fieldNumb', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Field 1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Field Location
          </label>
          <select
            value={formData.field.location}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="TBD">TBD</option>
            <option value="Inside">Inside</option>
            <option value="Outside">Outside</option>
          </select>
        </div>
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cover Image URL
        </label>
        <input
          type="text"
          value={formData.coverImage}
          onChange={(e) => handleInputChange('coverImage', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/image.jpg or /images/session-cover.jpg"
        />
      </div>

      {/* Additional Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Images
        </label>
        {formData.images.map((image, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={image}
              onChange={(e) => handleArrayChange('images', index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg or /images/session.jpg"
            />
            {formData.images.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem('images', index)}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('images')}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Add Image
        </button>
      </div>

      {/* Staff Only */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="staffOnly"
          checked={formData.staffOnly}
          onChange={(e) => handleInputChange('staffOnly', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="staffOnly" className="ml-2 block text-sm text-gray-700">
          Staff Only Session
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Updating...' : 'Update Session'}
        </button>
      </div>
    </form>
  );
};

export default EditSessionForm;