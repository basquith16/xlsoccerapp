import React from 'react';
import { SessionTemplate } from '../../../types';

interface PeriodFormTemplateSelectionProps {
  formData: {
    templateId: string;
  };
  templates: SessionTemplate[];
  errors: Record<string, string>;
  isEdit: boolean;
  onInputChange: (field: string, value: any) => void;
}

const PeriodFormTemplateSelection: React.FC<PeriodFormTemplateSelectionProps> = ({
  formData,
  templates,
  errors,
  isEdit,
  onInputChange
}) => {
  const selectedTemplate = templates.find(t => t.id === formData.templateId);

  return (
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
        disabled={isEdit} // Can't change template for existing periods
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
  );
};

export default PeriodFormTemplateSelection; 