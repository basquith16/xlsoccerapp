import React from 'react';

interface PeriodFormHeaderProps {
  isEdit: boolean;
}

const PeriodFormHeader: React.FC<PeriodFormHeaderProps> = ({ isEdit }) => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900">
        {isEdit ? 'Edit Schedule Period' : 'Create Schedule Period'}
      </h2>
      <p className="text-gray-600 mt-1">
        {isEdit ? 'Update the schedule period details' : 'Create a new schedule period for a session template'}
      </p>
    </div>
  );
};

export default PeriodFormHeader; 