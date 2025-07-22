import React from 'react';

interface InstanceFormBasicInfoProps {
  formData: {
    name: string;
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
  };
  errors: Record<string, string>;
  onInputChange: (field: string, value: any) => void;
}

const InstanceFormBasicInfo: React.FC<InstanceFormBasicInfoProps> = ({
  formData,
  errors,
  onInputChange
}) => {
  return (
    <div className="space-y-6">
      {/* Instance Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Instance Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder="e.g., Week 1, Session 1, March 5th"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Date *
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => onInputChange('date', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.date ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
          )}
        </div>

        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
            Start Time *
          </label>
          <input
            type="time"
            id="startTime"
            value={formData.startTime}
            onChange={(e) => onInputChange('startTime', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.startTime ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.startTime && (
            <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
          )}
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
            End Time *
          </label>
          <input
            type="time"
            id="endTime"
            value={formData.endTime}
            onChange={(e) => onInputChange('endTime', e.target.value)}
            min={formData.startTime}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.endTime ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.endTime && (
            <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
          )}
        </div>
      </div>

      {/* Capacity */}
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

export default InstanceFormBasicInfo; 