import React, { useState, useEffect } from 'react';
import { Contact, ContactFormData } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface ContactFormProps {
  contact?: Contact;
  contacts: Contact[];
  onSave: (formData: ContactFormData) => void;
  onCancel: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  contact,
  contacts,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    role: contact?.role || '',
    location: contact?.location || ''
  });

  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  // Update form data when contact prop changes (for editing different contacts)
  useEffect(() => {
    setFormData({
      name: contact?.name || '',
      email: contact?.email || '',
      phone: contact?.phone || '',
      role: contact?.role || '',
      location: contact?.location || ''
    });
    setErrors({}); // Clear errors when switching contacts
  }, [contact]);

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};
    
    // Required field validations
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      onSave(formData);
    } catch (error) {
      console.error('Error saving contact:', error);
      setErrors(prev => ({
        ...prev,
        name: 'Failed to save contact. Please try again.'
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        value={formData.name}
        onChange={e => handleChange('name', e.target.value)}
        error={errors.name}
        placeholder="Enter full name"
        required
      />

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={e => handleChange('email', e.target.value)}
        error={errors.email}
        placeholder="Enter email address"
        required
      />

      <Input
        label="Phone"
        type="tel"
        value={formData.phone}
        onChange={e => handleChange('phone', e.target.value)}
        error={errors.phone}
        placeholder="Enter phone number"
        required
      />

      <Input
        label="Role"
        value={formData.role}
        onChange={e => handleChange('role', e.target.value)}
        error={errors.role}
        placeholder="Enter role/position"
      />

      <Input
        label="Location"
        value={formData.location}
        onChange={e => handleChange('location', e.target.value)}
        error={errors.location}
        placeholder="Enter location"
      />

      <div className="flex space-x-3 pt-4">
        <button type="submit" className="flex-1">
          {contact ? 'Update Contact' : 'Add Contact'}
        </button>
        <button type="button" className="variant-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};