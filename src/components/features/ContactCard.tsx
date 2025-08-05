import React from 'react';
import { Edit, Trash2, User, Mail, Phone, MapPin, Calendar, Clock, CheckCircle } from 'lucide-react';
import { Contact } from '../../types';

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: number) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">{contact.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{contact.role}</p>
          </div>
        </div>
        <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
          <button
            onClick={() => onEdit(contact)}
            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors touch-manipulation"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDelete(contact.id)}
            className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors touch-manipulation"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-2 min-w-0">
          <Mail size={16} />
          <span className="truncate">{contact.email}</span>
        </div>
        <div className="flex items-center space-x-2 min-w-0">
          <Phone size={16} />
          <span className="truncate">{contact.phone}</span>
        </div>
        <div className="flex items-center space-x-2 min-w-0">
          <MapPin size={16} />
          <span className="truncate">{contact.location}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar size={14} />
            <span>Added {contact.dateAdded}</span>
          </div>
          <div className={`flex items-center space-x-1 ${
            contact.status === 'active' 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-gray-400 dark:text-gray-500'
          }`}>
            {contact.status === 'active' ? <CheckCircle size={14} /> : <Clock size={14} />}
            <span className="capitalize">{contact.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
};