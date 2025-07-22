import React from 'react';

interface PeriodFormBasicInfoProps {
  formData: {
    name: string;
    startDate: string;
    endDate: string;
    capacity: number;
  };
  errors: Record<string, string>;
  onInputChange: (field: string, value: any) => void;
}

const PeriodFormBasicInfo: React.FC<PeriodFormBasicInfoProps> = ({
  formData,
  errors,
  onInputChange
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Period Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder="e.g., Spring 2024, Summer Camp, Fall League"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            id="startDate"
            value={formData.startDate}
            onChange={(e) => onInputChange('startDate', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.startDate ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
          )}
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
            End Date *
          </label>
          <input
            type="date"
            id="endDate"
            value={formData.endDate}
            onChange={(e) => onInputChange('endDate', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.endDate ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
          Capacity *
        </label>
        <input
          type="number"
          id="capacity"
          value={formData.capacity}
          onChange={(e) => onInputChange('capacity', parseInt(e.target.value) || 0)}
          min="1"
          max="100"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
            errors.capacity ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.capacity && (
          <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
        )}
      </div>
    </div>
  );
};

export default PeriodFormBasicInfo; 