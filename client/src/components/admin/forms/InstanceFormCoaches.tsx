import React from 'react';
import { User } from '../../../types';

interface InstanceFormCoachesProps {
  formData: {
    coachIds: string[];
  };
  errors: Record<string, string>;
  coaches: User[];
  onInputChange: (field: string, value: any) => void;
}

const InstanceFormCoaches: React.FC<InstanceFormCoachesProps> = ({
  formData,
  errors,
  coaches,
  onInputChange
}) => {
  const handleCoachToggle = (coachId: string) => {
    const newCoachIds = formData.coachIds.includes(coachId)
      ? formData.coachIds.filter(id => id !== coachId)
      : [...formData.coachIds, coachId];
    
    onInputChange('coachIds', newCoachIds);
  };

  const handleTBDToggle = () => {
    const tbdId = 'TBD';
    const newCoachIds = formData.coachIds.includes(tbdId)
      ? formData.coachIds.filter(id => id !== tbdId)
      : [...formData.coachIds, tbdId];
    
    onInputChange('coachIds', newCoachIds);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Coaches *
      </label>
      <div className="space-y-2">
        {/* TBD Option */}
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.coachIds.includes('TBD')}
            onChange={handleTBDToggle}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-900">TBD - To Be Determined</span>
        </label>

        {/* Coach Options */}
        {coaches.map((coach: any) => (
          <label key={coach.id} className="flex items-center">
            <input
              type="checkbox"
              checked={formData.coachIds.includes(coach.id)}
              onChange={() => handleCoachToggle(coach.id)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-900">
              {coach.name} ({coach.email})
            </span>
          </label>
        ))}
      </div>
      {errors.coachIds && (
        <p className="mt-1 text-sm text-red-600">{errors.coachIds}</p>
      )}
      <p className="mt-2 text-sm text-gray-500">
        Select at least one coach or TBD for this session.
      </p>
    </div>
  );
};

export default InstanceFormCoaches; 