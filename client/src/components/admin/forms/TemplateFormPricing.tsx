import React from 'react';

interface TemplateFormPricingProps {
  formData: {
    rosterLimit: number;
    price: number;
    staffOnly: boolean;
  };
  errors: Record<string, string>;
  onInputChange: (field: string, value: any) => void;
}

const TemplateFormPricing: React.FC<TemplateFormPricingProps> = ({
  formData,
  errors,
  onInputChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Pricing & Capacity</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Roster Limit *
          </label>
          <input
            type="number"
            value={formData.rosterLimit}
            onChange={(e) => onInputChange('rosterLimit', parseInt(e.target.value) || 0)}
            min="1"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.rosterLimit ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="15"
          />
          {errors.rosterLimit && <p className="text-red-500 text-sm mt-1">{errors.rosterLimit}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (USD) *
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => onInputChange('price', parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.price ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0.00"
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="staffOnly"
          checked={formData.staffOnly}
          onChange={(e) => onInputChange('staffOnly', e.target.checked)}
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <label htmlFor="staffOnly" className="ml-2 block text-sm text-gray-900">
          Staff Only (not publicly visible)
        </label>
      </div>
    </div>
  );
};

export default TemplateFormPricing; 