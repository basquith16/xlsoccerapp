import React, { useState, useEffect } from 'react';
import { SchedulePeriod, SessionTemplate } from '../../types';
import PeriodFormHeader from './forms/PeriodFormHeader';
import PeriodFormTemplateSelection from './forms/PeriodFormTemplateSelection';
import PeriodFormBasicInfo from './forms/PeriodFormBasicInfo';
import PeriodFormCoaches from './forms/PeriodFormCoaches';
import PeriodFormActions from './forms/PeriodFormActions';

interface PeriodFormProps {
  period?: SchedulePeriod;
  templates: SessionTemplate[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PeriodForm: React.FC<PeriodFormProps> = ({
  period,
  templates,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    templateId: '',
    name: '',
    startDate: '',
    endDate: '',
    coachIds: [] as string[],
    capacity: 15,
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (period) {
      setFormData({
        templateId: period.templateId || '',
        name: period.name || '',
        startDate: period.startDate ? new Date(period.startDate).toISOString().split('T')[0] : '',
        endDate: period.endDate ? new Date(period.endDate).toISOString().split('T')[0] : '',
        coachIds: period.coachIds || [],
        capacity: period.capacity || 15,
        isActive: period.isActive !== undefined ? period.isActive : true
      });
    }
  }, [period]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.templateId.trim()) {
      newErrors.templateId = 'Template is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Period name is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (startDate >= endDate) {
        newErrors.endDate = 'End date must be after start date';
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
      <PeriodFormHeader isEdit={!!period} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <PeriodFormTemplateSelection
          formData={formData}
          templates={templates}
          errors={errors}
          isEdit={!!period}
          onInputChange={handleInputChange}
        />

        <PeriodFormBasicInfo
          formData={formData}
          errors={errors}
          onInputChange={handleInputChange}
        />

        <PeriodFormCoaches
          formData={formData}
          errors={errors}
          onInputChange={handleInputChange}
        />

        <PeriodFormActions
          onCancel={onCancel}
          isLoading={isLoading}
          isEdit={!!period}
        />
      </form>
    </div>
  );
};

export default PeriodForm; 