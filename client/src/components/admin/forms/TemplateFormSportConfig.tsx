import React from 'react';
import { SportType, DemoType } from '../../../types';

interface TemplateFormSportConfigProps {
  formData: {
    sport: SportType;
    demo: DemoType;
    birthYear: string;
  };
  errors: Record<string, string>;
  onInputChange: (field: string, value: any) => void;
}

const TemplateFormSportConfig: React.FC<TemplateFormSportConfigProps> = ({
  formData,
  errors,
  onInputChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Sport & Demo Configuration</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sport *
          </label>
          <select
            value={formData.sport}
            onChange={(e) => onInputChange('sport', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.sport ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {Object.values(SportType).map((sport) => (
              <option key={sport} value={sport}>
                {sport}
              </option>
            ))}
          </select>
          {errors.sport && <p className="text-red-500 text-sm mt-1">{errors.sport}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Demo *
          </label>
          <select
            value={formData.demo}
            onChange={(e) => onInputChange('demo', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.demo ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {Object.values(DemoType).map((demo) => (
              <option key={demo} value={demo}>
                {demo}
              </option>
            ))}
          </select>
          {errors.demo && <p className="text-red-500 text-sm mt-1">{errors.demo}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Birth Year *
          </label>
          <input
            type="text"
            value={formData.birthYear}
            onChange={(e) => onInputChange('birthYear', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.birthYear ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., 2015-2016"
          />
          {errors.birthYear && <p className="text-red-500 text-sm mt-1">{errors.birthYear}</p>}
        </div>
      </div>
    </div>
  );
};

export default TemplateFormSportConfig; 