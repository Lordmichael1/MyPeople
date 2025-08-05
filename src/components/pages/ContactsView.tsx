import React from 'react';
import { User } from 'lucide-react';
import { Contact, TabId } from '../../types';
import { SearchBar } from '../features/SearchBar';
import { ContactCard } from '../features/ContactCard';

interface ContactsViewProps {
  activeTab: TabId;
  contacts: Contact[];
  filteredContacts: Contact[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (id: number) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  activeTab,
  filteredContacts,
  searchTerm,
  onSearchChange,
  onEditContact,
  onDeleteContact
}) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'contacts': return 'All Contacts';
      case 'active': return 'Active Contacts';
      case 'inactive': return 'Inactive Contacts';
      default: return 'Contacts';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {getTitle()}
        </h2>
        <div className="flex items-center">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            placeholder="Search contacts..."
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredContacts.map(contact => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onEdit={onEditContact}
            onDelete={onDeleteContact}
          />
        ))}
      </div>
      
      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No contacts found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new contact.'}
          </p>
        </div>
      )}
    </div>
  );
};