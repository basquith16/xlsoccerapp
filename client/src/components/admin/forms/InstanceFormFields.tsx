import React from 'react';
import { SessionInstance, SessionTemplate, SchedulePeriod, User } from '../../../types';
import InstanceFormSelection from './InstanceFormSelection';
import InstanceFormBasicInfo from './InstanceFormBasicInfo';
import InstanceFormCoaches from './InstanceFormCoaches';
import InstanceFormAdditional from './InstanceFormAdditional';

interface InstanceFormFieldsProps {
  formData: {
    periodId: string;
    templateId: string;
    name: string;
    date: string;
    startTime: string;
    endTime: string;
    coachIds: string[];
    capacity: number;
    notes: string;
    isActive: boolean;
  };
  errors: Record<string, string>;
  instance?: SessionInstance;
  templates: SessionTemplate[];
  periods: SchedulePeriod[];
  coaches: User[];
  onInputChange: (field: string, value: any) => void;
}

const InstanceFormFields: React.FC<InstanceFormFieldsProps> = ({
  formData,
  errors,
  instance,
  templates,
  periods,
  coaches,
  onInputChange
}) => {
  return (
    <div className="space-y-6">
      <InstanceFormSelection
        formData={formData}
        errors={errors}
        instance={instance}
        templates={templates}
        periods={periods}
        onInputChange={onInputChange}
      />

      <InstanceFormBasicInfo
        formData={formData}
        errors={errors}
        onInputChange={onInputChange}
      />

      <InstanceFormCoaches
        formData={formData}
        errors={errors}
        coaches={coaches}
        onInputChange={onInputChange}
      />

      <InstanceFormAdditional
        formData={formData}
        errors={errors}
        onInputChange={onInputChange}
      />
    </div>
  );
};

export default InstanceFormFields; 