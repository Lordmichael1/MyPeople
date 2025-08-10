import React, { useState, useEffect } from 'react';
import { Plus, BookUser, Moon, Sun, Menu, LogOut, Camera, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from '../../contexts/ThemeContext';
import { signOut, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../Redux/Redux';
import { setProfileImage, setUsername, setEmail, clearProfile, loadProfile } from '../../Redux/profileSlice';

interface HeaderProps {
  onAddContact: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onAddContact, onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Redux state
  const { profileImage, username: reduxUsername, email: reduxEmail } = useAppSelector(state => state.profile);
  
  // Local component state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [username, setUsernameLocal] = useState('');
  const [email, setEmailLocal] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tempProfilePic, setTempProfilePic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load profile data from localStorage on component mount
  useEffect(() => {
    const loadStoredProfile = () => {
      try {
        if (auth.currentUser) {
          const userId = auth.currentUser.uid;
          const storedProfileData = localStorage.getItem(`userProfile_${userId}`);
          
          if (storedProfileData) {
            const profileData = JSON.parse(storedProfileData);
            // Load the stored profile data into Redux
            dispatch(loadProfile(profileData));
          }
        }
      } catch (error) {
        console.error('Error loading profile from localStorage:', error);
      }
    };

    loadStoredProfile();
  }, [dispatch]);

  // Initialize data from Firebase Auth and Redux
  useEffect(() => {
    if (auth.currentUser) {
      const user = auth.currentUser;
      
      // Update Redux with Firebase auth data if not already present
      if (!reduxUsername && user.displayName) {
        dispatch(setUsername(user.displayName));
      }
      if (!reduxEmail && user.email) {
        dispatch(setEmail(user.email));
      }
      
      // Use Redux data if available, otherwise use Firebase data
      setUsernameLocal(reduxUsername || user.displayName || '');
      setEmailLocal(reduxEmail || user.email || '');
    }
  }, [reduxUsername, reduxEmail, dispatch]);

  // Save profile to localStorage whenever Redux state changes
  useEffect(() => {
    const saveProfileToStorage = () => {
      try {
        if (auth.currentUser) {
          const userId = auth.currentUser.uid;
          const profileData = {
            profileImage,
            username: reduxUsername,
            email: reduxEmail,
            lastUpdated: new Date().toISOString()
          };
          localStorage.setItem(`userProfile_${userId}`, JSON.stringify(profileData));
        }
      } catch (error) {
        console.error('Error saving profile to localStorage:', error);
      }
    };

    if (auth.currentUser && (profileImage || reduxUsername || reduxEmail)) {
      saveProfileToStorage();
    }
  }, [profileImage, reduxUsername, reduxEmail]);

  // Set temp profile pic when modal opens
  useEffect(() => {
    if (showProfileModal) {
      setTempProfilePic(profileImage);
    }
  }, [showProfileModal, profileImage]);

  const handleLogout = async () => {
    try {
      // Note: We don't clear the profile data from localStorage on logout
      // This allows the profile picture to persist across sessions
      await signOut(auth);
      dispatch(clearProfile()); // Clear Redux state but keep localStorage
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file size (2MB limit for better performance)
    if (file.size > 2 * 1024 * 1024) {
      return { isValid: false, error: 'Image size should be less than 2MB' };
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Please select a valid image file (JPEG, PNG, GIF, WebP)' };
    }
    
    return { isValid: true };
  };

  const compressImage = (file: File, maxWidth: number = 400, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = (width * maxWidth) / height;
            height = maxWidth;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file');
        return;
      }
      
      try {
        setError('');
        setIsLoading(true);
        
        // Compress image for better performance and storage
        const compressedImage = await compressImage(file, 400, 0.8);
        setTempProfilePic(compressedImage);
        
      } catch (error) {
        console.error('Failed to process image:', error);
        setError('Failed to process the image. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const validatePasswords = () => {
    if (newPassword && newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No authenticated user found');
      }

      let hasChanges = false;

      // Update display name in Firebase if changed
      if (username !== user.displayName) {
        await updateProfile(user, { displayName: username });
        dispatch(setUsername(username)); // Update Redux
        setSuccess('Username updated successfully!');
        hasChanges = true;
      }

      // Update profile image in Redux (and localStorage via useEffect)
      if (tempProfilePic !== profileImage) {
        dispatch(setProfileImage(tempProfilePic));
        console.log('Profile image updated and saved to localStorage');
        setSuccess(prev => prev ? `${prev} Profile picture updated!` : 'Profile picture updated successfully!');
        hasChanges = true;
      }

      // Handle password change if new password is provided
      if (newPassword) {
        if (!oldPassword) {
          setError('Please enter your current password to change it');
          setIsLoading(false);
          return;
        }

        if (!validatePasswords()) {
          setIsLoading(false);
          return;
        }

        // Re-authenticate user with old password
        const credential = EmailAuthProvider.credential(user.email, oldPassword);
        await reauthenticateWithCredential(user, credential);

        // Update password
        await updatePassword(user, newPassword);
        setSuccess(prev => prev ? `${prev} Password updated!` : 'Password updated successfully!');
        hasChanges = true;
      }

      // Show success message if nothing else was updated
      if (!hasChanges) {
        setSuccess('No changes to save');
      }
      
      // Close modal after 1.5 seconds to show success message
      setTimeout(() => {
        setShowProfileModal(false);
        // Reset form
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
        setTempProfilePic(null);
      }, 1500);

    } catch (error: any) {
      console.error('Failed to update profile:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/wrong-password') {
        setError('Current password is incorrect');
      } else if (error.code === 'auth/weak-password') {
        setError('New password is too weak');
      } else if (error.code === 'auth/requires-recent-login') {
        setError('Please log out and log in again to change your password');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(error.message || 'Failed to update profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowProfileModal(false);
    setError('');
    setSuccess('');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTempProfilePic(null);
  };

  // Generate a consistent default avatar based on user email/id
  const getDefaultAvatar = () => {
    if (auth.currentUser) {
      const email = auth.currentUser.email || '';
      const initials = email.slice(0, 2).toUpperCase();
      // You could also use a service like Gravatar or generate an SVG
      return `https://ui-avatars.com/api/?name=${initials}&background=3b82f6&color=ffffff&size=128`;
    }
    return '/default-avatar.png';
  };

  return (
    <>
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
                <BookUser className="text-white" size={20} />
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

              {/* Profile picture button */}
              <button
                onClick={() => setShowProfileModal(true)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 hover:ring-2 hover:ring-blue-500 transition-all"
                title={reduxUsername || 'Profile'}
              >
                <img
                  src={profileImage || getDefaultAvatar()}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = getDefaultAvatar();
                  }}
                />
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

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[95vh] relative flex flex-col">
            {/* Header with Title and Close Button */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Profile</h2>
              <button
                onClick={handleModalClose}
                className="p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {/* Error and Success Messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <X className="h-4 w-4 text-red-400" />
                    </div>
                    <div className="ml-2">{error}</div>
                  </div>
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-2">{success}</div>
                  </div>
                </div>
              )}

              <div className="flex flex-col space-y-6">
                {/* Profile Picture - Centered */}
                <div className="flex justify-center">
                  <label className="cursor-pointer relative group">
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/gif,image/webp" 
                      className="hidden" 
                      onChange={handleProfilePicChange}
                      disabled={isLoading}
                    />
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                      <img
                        src={tempProfilePic || profileImage || getDefaultAvatar()}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getDefaultAvatar();
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Camera className="text-white" size={28} />
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg group-hover:bg-blue-700 transition-colors">
                      <Camera size={16} />
                    </div>
                  </label>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsernameLocal(e.target.value)}
                      disabled={isLoading}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Email (readonly) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                      title="Email cannot be changed"
                    />
                  </div>

                  {/* Password Change Section */}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0h-2m8-5a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Change Password (Optional)
                    </h3>
                    
                    <input
                      type="password"
                      placeholder="Current Password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                    />
                    
                    <input
                      type="password"
                      placeholder="New Password (min 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                    />
                    
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4">
                  <Button 
                    onClick={handleSave}
                    disabled={isLoading}
                    className="w-full py-3 text-base font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;