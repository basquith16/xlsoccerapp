import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Player } from '../../../types';

const GET_USERS_FOR_PLAYER_EDIT = gql`
  query GetUsersForPlayerEdit {
    adminUsers {
      nodes {
        id
        name
        email
      }
    }
  }
`;

interface EditPlayerFormProps {
  player: Player;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const EditPlayerForm: React.FC<EditPlayerFormProps> = ({
  player,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: player.name || '',
    birthDate: player.birthDate ? new Date(player.birthDate).toISOString().split('T')[0] : '',
    sex: player.sex || 'male',
    parentId: player.parent?.id || '',
    waiverSigned: player.waiverSigned || false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: usersData, loading: usersLoading } = useQuery(GET_USERS_FOR_PLAYER_EDIT, {
    errorPolicy: 'all'
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birthDate = 'Birth date cannot be in the future';
      }
    }

    if (!formData.parentId) {
      newErrors.parentId = 'Parent is required';
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const users = usersData?.adminUsers?.nodes || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Edit Player Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Player Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter player name"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Birth Date *
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.birthDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sex *
            </label>
            <select
              value={formData.sex}
              onChange={(e) => handleInputChange('sex', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parent *
          </label>
          <select
            value={formData.parentId}
            onChange={(e) => handleInputChange('parentId', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.parentId ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={usersLoading}
          >
            <option value="">Select a parent</option>
            {users.map((user: any) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          {errors.parentId && <p className="text-red-500 text-sm mt-1">{errors.parentId}</p>}
          {usersLoading && <p className="text-gray-500 text-sm mt-1">Loading users...</p>}
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.waiverSigned}
              onChange={(e) => handleInputChange('waiverSigned', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Waiver Signed</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || usersLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Updating...' : 'Update Player'}
        </button>
      </div>
    </form>
  );
};

export default EditPlayerForm;