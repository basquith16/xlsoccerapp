import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Calendar, Clock, Users } from 'lucide-react';

interface GenerateInstancesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    periodId: string;
    startDate: string;
    endDate: string;
    daysOfWeek: number[];
    startTime: string;
    endTime: string;
  }) => Promise<void>;
  periods: any[];
  isLoading?: boolean;
}

const GenerateInstancesModal: React.FC<GenerateInstancesModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  periods,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    periodId: '',
    startDate: '',
    endDate: '',
    daysOfWeek: [] as number[],
    startTime: '16:00',
    endTime: '17:00'
  });

  const daysOfWeekOptions = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  const handleDayToggle = (day: number) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.periodId || !formData.startDate || !formData.endDate || formData.daysOfWeek.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    await onSubmit(formData);
    onClose();
  };

  const selectedPeriod = periods.find(p => p.id === formData.periodId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Session Instances">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Period Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Period *
          </label>
          <select
            value={formData.periodId}
            onChange={(e) => setFormData(prev => ({ ...prev, periodId: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          >
            <option value="">Choose a period...</option>
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.name} ({period.templateInfo?.name})
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Days of Week */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Days of Week *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {daysOfWeekOptions.map((day) => (
              <label key={day.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.daysOfWeek.includes(day.value)}
                  onChange={() => handleDayToggle(day.value)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">{day.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time *
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time *
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Period Info */}
        {selectedPeriod && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Period Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Template:</span>
                <span className="ml-2 font-medium">{selectedPeriod.templateInfo?.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Capacity:</span>
                <span className="ml-2 font-medium">{selectedPeriod.capacity} players</span>
              </div>
              <div>
                <span className="text-gray-600">Coaches:</span>
                <span className="ml-2 font-medium">
                  {selectedPeriod.coaches?.length > 0 ? selectedPeriod.coaches.length : 'TBD'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  selectedPeriod.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedPeriod.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Instances'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GenerateInstancesModal; 