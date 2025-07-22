import React from 'react';

interface TemplateFormHeaderProps {
  isEdit: boolean;
}

const TemplateFormHeader: React.FC<TemplateFormHeaderProps> = ({ isEdit }) => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900">
        {isEdit ? 'Edit Session Template' : 'Create Session Template'}
      </h2>
      <p className="text-gray-600 mt-1">
        {isEdit ? 'Update the session template details' : 'Create a new session template for recurring sessions'}
      </p>
    </div>
  );
};

export default TemplateFormHeader; 