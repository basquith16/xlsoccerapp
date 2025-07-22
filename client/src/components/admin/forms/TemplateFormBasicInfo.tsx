import React from 'react';
import { useAdminCoaches } from '../../../services/graphqlService';

interface TemplateFormBasicInfoProps {
  formData: {
    name: string;
    description: string;
    trainer: string;
  };
  errors: Record<string, string>;
  onInputChange: (field: string, value: any) => void;
}

const TemplateFormBasicInfo: React.FC<TemplateFormBasicInfoProps> = ({
  formData,
  errors,
  onInputChange
}) => {
  const { data: coachesData } = useAdminCoaches();
  const coaches = coachesData?.adminCoaches || [];

  return (
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
            onChange={(e) => onInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter template name"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="trainer" className="block text-sm font-medium text-gray-700 mb-2">
            Trainer
          </label>
          <select
            id="trainer"
            value={formData.trainer}
            onChange={(e) => onInputChange('trainer', e.target.value)}
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
          onChange={(e) => onInputChange('description', e.target.value)}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter template description"
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>
    </div>
  );
};

export default TemplateFormBasicInfo; 