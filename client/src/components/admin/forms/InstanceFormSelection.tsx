import React from 'react';
import { SessionTemplate, SchedulePeriod } from '../../../types';

interface InstanceFormSelectionProps {
  formData: {
    templateId: string;
    periodId: string;
  };
  errors: Record<string, string>;
  instance?: any;
  templates: SessionTemplate[];
  periods: SchedulePeriod[];
  onInputChange: (field: string, value: any) => void;
}

const InstanceFormSelection: React.FC<InstanceFormSelectionProps> = ({
  formData,
  errors,
  instance,
  templates,
  periods,
  onInputChange
}) => {
  const selectedPeriod = periods.find(p => p.id === formData.periodId);
  const selectedTemplate = templates.find(t => t.id === formData.templateId);

  // Filter periods by selected template
  const availablePeriods = formData.templateId 
    ? periods.filter(p => p.templateId === formData.templateId)
    : periods;

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div>
        <label htmlFor="templateId" className="block text-sm font-medium text-gray-700 mb-2">
          Session Template *
        </label>
        <select
          id="templateId"
          value={formData.templateId}
          onChange={(e) => onInputChange('templateId', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
            errors.templateId ? 'border-red-300' : 'border-gray-300'
          }`}
          disabled={!!instance} // Can't change template for existing instances
        >
          <option value="">Select a template</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name} ({template.sport} - {template.demo})
            </option>
          ))}
        </select>
        {errors.templateId && (
          <p className="mt-1 text-sm text-red-600">{errors.templateId}</p>
        )}
        {selectedTemplate && (
          <p className="mt-1 text-sm text-gray-500">
            {selectedTemplate.description}
          </p>
        )}
      </div>

      {/* Period Selection */}
      <div>
        <label htmlFor="periodId" className="block text-sm font-medium text-gray-700 mb-2">
          Schedule Period *
        </label>
        <select
          id="periodId"
          value={formData.periodId}
          onChange={(e) => onInputChange('periodId', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
            errors.periodId ? 'border-red-300' : 'border-gray-300'
          }`}
          disabled={!!instance} // Can't change period for existing instances
        >
          <option value="">Select a period</option>
          {availablePeriods.map((period) => (
            <option key={period.id} value={period.id}>
              {period.name} ({new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()})
            </option>
          ))}
        </select>
        {errors.periodId && (
          <p className="mt-1 text-sm text-red-600">{errors.periodId}</p>
        )}
        {selectedPeriod && (
          <p className="mt-1 text-sm text-gray-500">
            Capacity: {selectedPeriod.capacity} players
          </p>
        )}
      </div>
    </div>
  );
};

export default InstanceFormSelection; 