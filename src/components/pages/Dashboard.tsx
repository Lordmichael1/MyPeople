import React from 'react';
import { User, CheckCircle, Clock, Calendar } from 'lucide-react';
import { Contact } from '../../types';
import { StatsCard } from '../features/StatsCard';
import { ContactCard } from '../features/ContactCard';

interface DashboardProps {
  contacts: Contact[];
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (id: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ contacts, onEditContact, onDeleteContact }) => {
  const stats = {
    total: contacts.length,
    active: contacts.filter(c => c.status === 'active').length,
    inactive: contacts.filter(c => c.status === 'inactive').length,
    thisMonth: contacts.filter(c => {
      const contactDate = new Date(c.dateAdded);
      const now = new Date();
      return contactDate.getMonth() === now.getMonth() && contactDate.getFullYear() === now.getFullYear();
    }).length
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Dashboard</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <StatsCard
            title="Total Contacts"
            value={stats.total}
            icon={User}
            color="blue"
          />
          <StatsCard
            title="Active Contacts"
            value={stats.active}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Inactive Contacts"
            value={stats.inactive}
            icon={Clock}
            color="orange"
          />
          <StatsCard
            title="Added This Month"
            value={stats.thisMonth}
            icon={Calendar}
            color="purple"
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Contacts</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {contacts.slice(0, 4).map(contact => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={onEditContact}
              onDelete={onDeleteContact}
            />
          ))}
        </div>
      </div>
    </div>
  );
};