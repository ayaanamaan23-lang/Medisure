import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import AdBanner from './AdBanner';

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Small local preview while uploading
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoURL(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsSaving(true);
    setMessage({ text: '', type: '' });

    const storageRef = ref(storage, `profile_images/${user.uid}_${Date.now()}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        setMessage({ text: 'Failed to upload image.', type: 'error' });
        setIsSaving(false);
        setUploadProgress(0);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setPhotoURL(downloadURL);
          await updateProfile(user, { photoURL: downloadURL });
          setMessage({ text: 'Profile picture updated!', type: 'success' });
        } catch (error) {
          console.error('Failed to update profile:', error);
          setMessage({ text: 'Failed to save profile picture.', type: 'error' });
        } finally {
          setIsSaving(false);
          setUploadProgress(0);
        }
      }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    
    try {
      await updateProfile(user, {
        displayName: displayName
      });
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Failed to update profile.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-body-md text-on-background pb-20 sm:pb-0">
      {/* App Bar */}
      <header className="h-16 px-4 flex items-center gap-4 bg-surface/90 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant/20 shadow-sm">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-variant/50 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold text-slate-900 truncate">Settings</h1>
      </header>

      <main className="max-w-[600px] mx-auto w-full px-5 pt-8 pb-12 space-y-8">
        
        <AdBanner />
        
        {/* Profile Card */}
        <section className="bg-white dark:bg-[#1b1b1e] rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Profile Settings</h2>
          
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="relative group cursor-pointer mb-3">
                <label htmlFor="avatar-upload" className="block cursor-pointer">
                  <div className="w-24 h-24 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 overflow-hidden border-4 border-white shadow-md flex items-center justify-center relative">
                    {photoURL ? (
                      <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl text-blue-600 font-bold">
                        {displayName ? displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || '?'}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-white">photo_camera</span>
                    </div>
                  </div>
                </label>
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none"
                />
                <p className="text-[10px] text-gray-500 mt-1">Email cannot be changed directly.</p>
              </div>
            </div>

            {message.text && (
              <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message.text}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Account Actions */}
        <section className="bg-white dark:bg-[#1b1b1e] rounded-[24px] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Account Settings</h2>
          </div>
          <div className="p-2 space-y-2">
            {user?.email === 'ayaanamaan23@gmail.com' && (
              <button
                onClick={() => navigate('/admin')}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-blue-50 dark:hover:bg-blue-900/10 text-blue-600 dark:text-blue-400 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100/50 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                </div>
                <div>
                  <span className="font-bold block text-sm">Admin Panel</span>
                  <span className="text-[11px] text-blue-600/70 dark:text-blue-400/70">Manage users and waitlist</span>
                </div>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-red-100/50 dark:bg-red-900/20 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </div>
              <div>
                <span className="font-bold block text-sm">Log Out</span>
                <span className="text-[11px] text-red-600/70 dark:text-red-400/70">Sign out of your account</span>
              </div>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
