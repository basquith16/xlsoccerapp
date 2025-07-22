import React from 'react';

interface InstanceFormHeaderProps {
  isEdit: boolean;
}

const InstanceFormHeader: React.FC<InstanceFormHeaderProps> = ({ isEdit }) => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900">
        {isEdit ? 'Edit Session Instance' : 'Create Session Instance'}
      </h2>
      <p className="text-gray-600 mt-1">
        {isEdit ? 'Update the session instance details' : 'Create a new session instance for a specific date and time'}
      </p>
    </div>
  );
};

export default InstanceFormHeader; 