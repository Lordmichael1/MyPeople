export type TabId = 'dashboard' | 'contacts' | 'active' | 'inactive';

export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  status: 'active' | 'inactive';
  dateAdded: string;
};

export type ContactFormData = Omit<Contact, 'id' | 'status' | 'dateAdded'>;
export type ContactFormProps = {
  contact?: Contact;
  onSave: (data: ContactFormData) => void;
  onCancel: () => void;
};