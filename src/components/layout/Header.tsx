import React from 'react';
import { Plus, User, Moon, Sun, Menu, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from '../../contexts/ThemeContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onAddContact: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
};

export const Header: React.FC<HeaderProps> = ({ onAddContact, onToggleSidebar, isSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>
            <div className="w-8 h-8 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center">
              <User className="text-white" size={20} />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              <span className="hidden sm:inline">MyPeople</span>
              <span className="sm:hidden">Contacts</span>
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button onClick={onAddContact} className="flex items-center space-x-1 sm:space-x-2" size="sm">
              <Plus size={18} />
              <span className="hidden sm:inline">Add Contact</span>
              <span className="sm:hidden">Add</span>
            </Button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
