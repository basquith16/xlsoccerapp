import React from 'react';

interface InstanceFormAdditionalProps {
  formData: {
    notes: string;
    isActive: boolean;
  };
  errors: Record<string, string>;
  onInputChange: (field: string, value: any) => void;
}

const InstanceFormAdditional: React.FC<InstanceFormAdditionalProps> = ({
  formData,
  errors,
  onInputChange
}) => {
  return (
    <div className="space-y-4">
      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => onInputChange('notes', e.target.value)}
          rows={3}
          placeholder="Optional notes about this session instance..."
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
            errors.notes ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
        )}
      </div>

      {/* Active Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => onInputChange('isActive', e.target.checked)}
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
          Active (available for booking)
        </label>
      </div>
    </div>
  );
};

export default InstanceFormAdditional; 