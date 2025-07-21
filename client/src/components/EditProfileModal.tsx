import React, { useState } from 'react';
import { Upload, User } from 'lucide-react';
import { useUpdateMe } from '../services/graphqlService';
import { uploadSingleImage, UploadResult } from '../services/cloudinaryUploadService';
import Button from './ui/Button';
import FormInput from './ui/FormInput';
import Modal from './ui/Modal';
import Loading from './ui/Loading';
import Error from './ui/Error';

interface EditProfileModalProps {
  user: {
    id: string;
    name: string;
    email: string;
    photo?: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<UploadResult | null>(null);
  const [updateMe] = useUpdateMe();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoUpload = async () => {
    setUploadingPhoto(true);
    setErrors({});
    
    try {
      const result = await uploadSingleImage('xl-soccer/users');
      setSelectedPhoto(result);
      console.log('Photo uploaded:', result);
    } catch (error: any) {
      console.error('Photo upload error:', error);
      setErrors({ general: 'Failed to upload photo. Please try again.' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
      };

      // Include photo URL if a new photo was uploaded
      if (selectedPhoto) {
        updateData.photo = selectedPhoto.secure_url;
      }

      const { data } = await updateMe({
        variables: {
          input: updateData
        }
      });

      if (data?.updateMe) {
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      setErrors({ general: error.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Get the current photo URL to display
  const getCurrentPhotoUrl = () => {
    if (selectedPhoto) {
      return selectedPhoto.secure_url;
    }
    if (user.photo) {
      // Handle both Cloudinary URLs and local file paths
      if (user.photo.startsWith('http')) {
        return user.photo;
      }
      return `/img/users/${user.photo}`;
    }
    return null;
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Edit Profile"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 mx-auto mb-4">
              {getCurrentPhotoUrl() ? (
                <img
                  src={getCurrentPhotoUrl()}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePhotoUpload}
              disabled={uploadingPhoto || loading}
              className="absolute bottom-0 right-0 rounded-full p-2"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            {uploadingPhoto ? 'Uploading...' : 'Click to upload a new photo'}
          </p>
          {selectedPhoto && (
            <p className="text-xs text-green-600 mt-1">
              ✓ New photo selected
            </p>
          )}
        </div>

        {/* Name Field */}
        <FormInput
          id="name"
          name="name"
          label="Name"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          error={errors.name}
          required
        />

        {/* Email Field */}
        <FormInput
          id="email"
          name="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={errors.email}
          required
        />

        {/* General Error */}
        {errors.general && (
          <Error message={errors.general} />
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || uploadingPhoto}
            className="flex-1"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal; 