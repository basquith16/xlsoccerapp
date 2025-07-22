import React from 'react';

interface PeriodFormActionsProps {
  onCancel: () => void;
  isLoading: boolean;
  isEdit: boolean;
}

const PeriodFormActions: React.FC<PeriodFormActionsProps> = ({
  onCancel,
  isLoading,
  isEdit
}) => {
  return (
    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        disabled={isLoading}
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Saving...' : (isEdit ? 'Update Period' : 'Create Period')}
      </button>
    </div>
  );
};

export default PeriodFormActions; 