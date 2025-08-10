import React, { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { Contact, ContactFormData, TabId } from './types';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/pages/Dashboard';
import { ContactsView } from './components/pages/ContactsView';
import { Modal } from './components/ui/Modal';
import { ContactForm } from './components/features/ContactForm';
import LoadingPage from './components/LoadingSpinner'; 

function ContactManagerApp() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // ✅ Added loading state

  // Get the current user ID
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
      setLoading(false); // ✅ Stop loading after auth check
    });

    return () => unsubscribeAuth();
  }, []);

  // Fetch contacts only for this user
  useEffect(() => {
    if (!userId) return;

    const contactsRef = collection(db, 'contacts');
    const q = query(contactsRef, where('userId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contactData: Contact[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Contact, 'id'>),
      }));
      setContacts(contactData);
    });

    return () => unsubscribe();
  }, [userId]);

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'contacts') return matchesSearch;
    if (activeTab === 'active') return matchesSearch && contact.status === 'active';
    if (activeTab === 'inactive') return matchesSearch && contact.status === 'inactive';
    return true;
  });

  const handleAddContact = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleSaveContact = async (formData: ContactFormData) => {
    if (!userId) return;

    if (editingContact) {
      const contactRef = doc(db, 'contacts', editingContact.id);
      await updateDoc(contactRef, { ...formData });
    } else {
      const newContact = {
        ...formData,
        userId,
        status: 'active',
        dateAdded: new Date().toISOString().split('T')[0],
      };
      await addDoc(collection(db, 'contacts'), newContact);
    }

    setIsModalOpen(false);
    setEditingContact(null);
  };

  const handleDeleteContact = async (id: string) => {
    const contactRef = doc(db, 'contacts', id);
    await deleteDoc(contactRef);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // ✅ Show loading screen before app loads
  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <Header
        onAddContact={handleAddContact}
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' ? (
            <Dashboard
              contacts={contacts}
              onEditContact={handleEditContact}
              onDeleteContact={handleDeleteContact}
            />
          ) : (
            <ContactsView
              activeTab={activeTab}
              contacts={contacts}
              filteredContacts={filteredContacts}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onEditContact={handleEditContact}
              onDeleteContact={handleDeleteContact}
            />
          )}
        </main>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingContact(null);
        }}
        title={editingContact ? 'Edit Contact' : 'Add New Contact'}
      >
        <ContactForm
          contact={editingContact}
          onSave={handleSaveContact}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingContact(null);
          }}
        />
      </Modal>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ContactManagerApp />
    </ThemeProvider>
  );
}

export default App;
export { ContactManagerApp };
