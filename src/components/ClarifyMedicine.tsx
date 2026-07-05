import React, { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import AdBanner from './AdBanner';
import PopunderAd from './PopunderAd';
import { useAuth } from '../contexts/AuthContext';

export default function ClarifyMedicine() {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(false);

  const isPremium = userData?.subscriptionStatus === 'active';

  if (!isPremium) {
    return (
      <div className="bg-[#f8fbff] font-sans text-slate-800 min-h-screen w-full flex flex-col relative pb-20 items-center justify-center p-4">
        <PopunderAd />
        <header className="absolute top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 px-4 py-4 flex items-center shadow-sm">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined text-gray-700">arrow_back</span>
          </button>
          <h1 className="ml-2 text-lg font-bold text-gray-900 truncate">Clarification of your Medicine</h1>
        </header>

        <div className="bg-white rounded-3xl p-8 max-w-[400px] w-full text-center shadow-xl border border-gray-100 mt-16">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-blue-600">workspace_premium</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Premium Feature</h2>
          <p className="text-gray-500 mb-8">Detailed AI insights on what a medicine does, side effects, and alternatives are only available for Premium Health subscribers.</p>
          
          <Link to="/subscription" className="block w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
            Upgrade to Premium
          </Link>
          <button onClick={() => navigate(-1)} className="w-full mt-3 py-3 text-gray-500 font-bold text-sm hover:bg-gray-50 rounded-xl">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleInfoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleInfoCheck(e.target.files[0]);
    }
  };

  const handleInfoCheck = async (file: File) => {
    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const res = await fetch('/api/info', {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        const result = await res.json();
        // Redirect directly to the full medicine details interface
        navigate(`/medicine/${result.id}`);
      } else {
        const errorText = await res.text();
        let errorMessage = "Failed to clarify medicine. Please try again.";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Failed to clarify medicine (Server returned ${res.status}: ${res.statusText || 'Error'}).`;
        }
        setError(errorMessage);
      }
    } catch (e: any) {
      console.error('Info check failed:', e);
      setError("Network error. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleInfoCheck(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col pb-10 font-sans">
      <PopunderAd />
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleInfoFileSelect} 
        className="hidden" 
        accept="image/jpeg, image/png, image/webp"
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        onChange={handleInfoFileSelect} 
        className="hidden" 
        accept="image/jpeg, image/png, image/webp"
        capture="environment"
      />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-4 flex items-center shadow-sm">
        <button 
          onClick={() => navigate('/dashboard')}
          disabled={isUploading}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-800 transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="ml-2 text-lg font-bold text-gray-900 truncate">Clarification of your Medicine</h1>
      </header>

      <AdBanner />

      <main className="flex-1 w-full max-w-[896px] mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col animate-fadeIn">
        
        {/* Hero Section */}
        <div className="mb-8 md:mb-12 relative max-w-[672px]">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2 tracking-tight leading-tight">
            Understand Your <span className="text-blue-600">Medicine</span>
          </h2>
          <p className="text-gray-600 mb-6 mt-4 text-base">
            Upload a clear photo of your medicine. Our AI will instantly analyze and give you the result.
          </p>
          
          <ul className="flex flex-wrap gap-4 mb-2 md:mb-0">
            <li className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center text-green-500 border border-green-100">
                <span className="material-symbols-outlined text-[14px]">verified</span>
              </div>
              AI-Powered Analysis
            </li>
            <li className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100">
                <span className="material-symbols-outlined text-[14px]">speed</span>
              </div>
              Fast & Accurate
            </li>
            <li className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 border border-purple-100">
                <span className="material-symbols-outlined text-[14px]">lock</span>
              </div>
              Private & Secure
            </li>
          </ul>
        </div>

        {error && (
          <div className="w-full bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 mb-6 border border-red-100 animate-slideDown">
            <span className="material-symbols-outlined mt-0.5">error</span>
            <p className="font-medium text-sm flex-1">{error}</p>
          </div>
        )}

        {/* Upload Card */}
        <div className="bg-white rounded-[2rem] p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
          <div 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={isUploading ? undefined : () => setShowChoiceModal(true)}
            className={`w-full relative overflow-hidden rounded-[1.5rem] border-2 border-dashed transition-all duration-300 p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-blue-200 bg-[#f8fbff] hover:bg-blue-50/50'
            }`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${
              isUploading ? 'bg-blue-100 text-blue-600 animate-pulse' : 'bg-blue-100 text-blue-500'
            }`}>
              <span className={`material-symbols-outlined text-3xl ${isUploading ? 'animate-bounce' : ''}`}>
                cloud_upload
              </span>
            </div>
            
            <h3 className="font-bold text-lg text-gray-900 mb-1">
              {isUploading ? 'Analyzing Photo...' : 'Upload Medicine Photo'}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {isUploading ? 'Extracting medicine details...' : 'Drag & drop or tap to upload'}
            </p>
            
            <button 
              disabled={isUploading}
              onClick={(e) => {
                e.stopPropagation();
                if (!isUploading) setShowChoiceModal(true);
              }}
              className="bg-[#4e54c8] hover:bg-[#3f44a4] text-white font-medium py-3 px-6 rounded-xl flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 shadow-md shadow-blue-900/20"
            >
              <span className={`material-symbols-outlined text-[20px] ${isUploading ? 'animate-spin' : ''}`}>
                {isUploading ? 'refresh' : 'image'}
              </span>
              {isUploading ? 'Processing...' : 'Choose Photo'}
            </button>
            
            <div className="mt-6 flex items-center gap-2 text-xs font-medium text-gray-400">
              <span>Supports: JPG, PNG</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span>Max size: 10MB</span>
            </div>
          </div>
        </div>

        {/* Features Row */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-3 gap-4 divide-x divide-gray-100">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex flex-shrink-0 items-center justify-center text-blue-500">
                <span className="material-symbols-outlined">bolt</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-[13px] sm:text-sm">Instant Results</h4>
                <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">Get results in seconds</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-green-50 flex flex-shrink-0 items-center justify-center text-green-500">
                <span className="material-symbols-outlined">memory</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-[13px] sm:text-sm">Smart AI</h4>
                <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">Advanced AI technology</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex flex-shrink-0 items-center justify-center text-purple-500">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-[13px] sm:text-sm">Reliable</h4>
                <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">Trusted by thousands</p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Banner */}
        <div className="bg-[#f0f4f8] rounded-2xl p-4 sm:p-5 flex items-start gap-4 border border-blue-100/50">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex flex-shrink-0 items-center justify-center text-blue-500">
            <span className="material-symbols-outlined">lightbulb</span>
          </div>
          <div>
            <h4 className="font-bold text-blue-600 text-sm mb-1">Important</h4>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              This app is for informational purposes only and not a substitute for professional medical advice.
            </p>
          </div>
        </div>

      </main>

      {/* Choice Modal */}
      {showChoiceModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowChoiceModal(false)}
          />
          
            {/* Modal Container - Plain div with rigid inline style constraints to prevent flexbox squeezing */}
            <div 
              className="relative bg-white rounded-t-[1.5rem] sm:rounded-[1.5rem] shadow-2xl p-4 sm:p-5 border border-gray-100 z-10 shrink-0 transform transition-transform"
              style={{ width: 'calc(100% - 24px)', maxWidth: '340px', minWidth: '280px' }}
            >
              {/* Handle bar for mobile */}
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3 sm:hidden" />
              
              <h3 className="font-extrabold text-base text-gray-900 mb-1 text-center">
                Select Photo Source
              </h3>
              <p className="text-[11px] text-gray-500 text-center mb-4">
                How would you like to upload your medicine photo?
              </p>

              {/* Video Hint */}
              <div className="mb-4 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center relative aspect-video">
                <img 
                  src="https://i.ibb.co/35MTHh9c/Wan-Generate-A-close-up-over-the-shoulder-cinematic-shot-of-a-persons-hands-ho.gif" 
                  alt="How to scan" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-2">
                  <p className="text-[10px] text-white font-medium">For best results, keep medicine flat and well lit.</p>
                </div>
              </div>
              
              <div className="space-y-2">
              <button
                onClick={() => {
                  setShowChoiceModal(false);
                  fileInputRef.current?.click();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/40 text-left transition-all active:scale-[0.99] group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex flex-shrink-0 items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">photo_library</span>
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-800 text-xs sm:text-sm truncate">Choose from Gallery</h4>
                  <p className="text-[10px] text-gray-500 truncate">Pick an existing photo</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowChoiceModal(false);
                  cameraInputRef.current?.click();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/40 text-left transition-all active:scale-[0.99] group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex flex-shrink-0 items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-800 text-xs sm:text-sm truncate">Take Photo (Camera)</h4>
                  <p className="text-[10px] text-gray-500 truncate">Capture using device camera</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowChoiceModal(false)}
              className="mt-4 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
