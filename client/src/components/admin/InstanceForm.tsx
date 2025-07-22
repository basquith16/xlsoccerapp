import React, { useState, useEffect } from 'react';
import { SessionInstance, SessionTemplate, SchedulePeriod } from '../../types';
import { useAdminSessionTemplates, useAdminSchedulePeriods, useAdminCoaches } from '../../services/graphqlService';
import InstanceFormHeader from './forms/InstanceFormHeader';
import InstanceFormFields from './forms/InstanceFormFields';
import InstanceFormActions from './forms/InstanceFormActions';

interface InstanceFormProps {
  instance?: SessionInstance;
  templates: SessionTemplate[];
  periods: SchedulePeriod[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const InstanceForm: React.FC<InstanceFormProps> = ({
  instance,
  templates,
  periods,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    periodId: '',
    templateId: '',
    name: '',
    date: '',
    startTime: '',
    endTime: '',
    coachIds: [] as string[],
    capacity: 15,
    notes: '',
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch coaches
  const { data: coachesData } = useAdminCoaches();
  const coaches = coachesData?.adminCoaches || [];

  useEffect(() => {
    if (instance) {
      setFormData({
        periodId: instance.periodId || '',
        templateId: instance.templateId || '',
        name: instance.name || '',
        date: instance.date ? new Date(instance.date).toISOString().split('T')[0] : '',
        startTime: instance.startTime || '',
        endTime: instance.endTime || '',
        coachIds: instance.coachIds || [],
        capacity: instance.capacity || 15,
        notes: instance.notes || '',
        isActive: instance.isActive !== undefined ? instance.isActive : true
      });
    }
  }, [instance]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.periodId.trim()) {
      newErrors.periodId = 'Period is required';
    }

    if (!formData.templateId.trim()) {
      newErrors.templateId = 'Template is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Instance name is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime) {
      const startTime = new Date(`2000-01-01T${formData.startTime}`);
      const endTime = new Date(`2000-01-01T${formData.endTime}`);
      
      if (startTime >= endTime) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    if (formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }

    if (formData.capacity > 100) {
      newErrors.capacity = 'Capacity cannot exceed 100';
    }

    if (formData.coachIds.length === 0) {
      newErrors.coachIds = 'At least one coach or TBD is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <InstanceFormHeader isEdit={!!instance} />
      
      <form onSubmit={handleSubmit}>
        <InstanceFormFields
          formData={formData}
          errors={errors}
          instance={instance}
          templates={templates}
          periods={periods}
          coaches={coaches}
          onInputChange={handleInputChange}
        />
        
        <InstanceFormActions
          onCancel={onCancel}
          isLoading={isLoading}
          isEdit={!!instance}
        />
      </form>
    </div>
  );
};

export default InstanceForm; 