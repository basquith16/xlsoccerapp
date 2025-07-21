import { useState, useCallback } from 'react';

interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

interface ValidationErrors {
  [key: string]: string;
}

export const useFormValidation = (validationRules: ValidationRule[]) => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = useCallback((field: string, value: string): string | null => {
    const rule = validationRules.find(r => r.field === field);
    if (!rule) return null;

    // Required validation
    if (rule.required && !value.trim()) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value.trim() && !rule.required) {
      return null;
    }

    // Min length validation
    if (rule.minLength && value.length < rule.minLength) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rule.minLength} characters`;
    }

    // Max length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be no more than ${rule.maxLength} characters`;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      return `Please enter a valid ${field}`;
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [validationRules]);

  const validateForm = useCallback((formData: Record<string, string>): boolean => {
    const newErrors: ValidationErrors = {};

    validationRules.forEach(rule => {
      const error = validateField(rule.field, formData[rule.field] || '');
      if (error) {
        newErrors[rule.field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validationRules, validateField]);

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearError,
    clearAllErrors,
    setErrors,
  };
};

// Common validation rules
export const commonValidations = {
  email: (field: string = 'email'): ValidationRule => ({
    field,
    required: true,
    pattern: /\S+@\S+\.\S+/,
    custom: (value: string) => {
      if (!/\S+@\S+\.\S+/.test(value)) {
        return 'Please enter a valid email address';
      }
      return null;
    }
  }),

  password: (field: string = 'password', minLength: number = 6): ValidationRule => ({
    field,
    required: true,
    minLength,
    custom: (value: string) => {
      if (value.length < minLength) {
        return `Password must be at least ${minLength} characters`;
      }
      return null;
    }
  }),

  name: (field: string = 'name', minLength: number = 2): ValidationRule => ({
    field,
    required: true,
    minLength,
    custom: (value: string) => {
      if (value.trim().length < minLength) {
        return `Name must be at least ${minLength} characters`;
      }
      return null;
    }
  }),

  required: (field: string): ValidationRule => ({
    field,
    required: true,
  }),
}; 