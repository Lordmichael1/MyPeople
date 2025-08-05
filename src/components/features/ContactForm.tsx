import React, { useState } from 'react';
import { Contact, ContactFormData } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface ContactFormProps {
  contact?: Contact;
  onSave: (formData: ContactFormData) => void;
  onCancel: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ contact, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    role: contact?.role || '',
    location: contact?.location || ''
  });
  
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  
  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };
  
  return (
    <div className="space-y-4">
      <Input
        label="Full Name"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
        placeholder="Enter full name"
      />
      
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        error={errors.email}
        placeholder="Enter email address"
      />
      
      <Input
        label="Phone"
        value={formData.phone}
        onChange={(e) => handleChange('phone', e.target.value)}
        error={errors.phone}
        placeholder="Enter phone number"
      />
      
      <Input
        label="Role"
        value={formData.role}
        onChange={(e) => handleChange('role', e.target.value)}
        placeholder="Enter role/position"
      />
      
      <Input
        label="Location"
        value={formData.location}
        onChange={(e) => handleChange('location', e.target.value)}
        placeholder="Enter location"
      />
      
      <div className="flex space-x-3 pt-4">
        <Button onClick={handleSubmit} className="flex-1">
          {contact ? 'Update Contact' : 'Add Contact'}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};