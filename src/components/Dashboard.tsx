import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ScanResult, Stats } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, real: 0, fake: 0, accuracy: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const authFileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const fetchScans = async () => {
    try {
      const res = await fetch('/api/scans');
      const data = await res.json();
      setScans(data);
    } catch (e) {
      console.error("Failed to fetch scans", e);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error("Failed to fetch stats", e);
    }
  };

  useEffect(() => {
    fetchScans();
    fetchStats();
  }, []);

  const handleDirectAction = async (file: File, actionType: 'authenticity' | 'info') => {
    setIsUploading(true);
    setPredictionError(null);
    setCurrentScan(null);
    
    const preview = URL.createObjectURL(file);
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const endpoint = actionType === 'authenticity' ? '/api/scan' : '/api/info';
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const result = await res.json();
        
        const scanResult = {
          ...result,
          imageUrl: preview
        };
        
        if (actionType === 'authenticity') {
          setCurrentScan(scanResult);
        } else {
          // If info, navigate straight to the details page
          navigate(`/medicine/${scanResult.id}`);
        }
        
        await fetchScans();
        await fetchStats();
      } else {
        const errorText = await res.text();
        let errorMessage = "Failed to analyze image. Please try again.";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Failed to analyze image (Server returned ${res.status}: ${res.statusText || 'Error'}).`;
        }
        setPredictionError(errorMessage);
      }
    } catch (e) {
      console.error('Prediction pipeline failed:', e);
      setPredictionError("Network error. Please try again.");
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
      handleDirectAction(e.dataTransfer.files[0], 'authenticity');
    }
  };

  const handleAuthFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleDirectAction(e.target.files[0], 'authenticity');
    }
  };

  const recentScan = scans.length > 0 ? scans[0] : null;

  return (
    <div className="bg-background font-body-md text-on-surface pb-24 min-h-screen">
      <input 
        type="file" 
        ref={authFileInputRef} 
        onChange={handleAuthFileSelect} 
        className="hidden" 
        accept="image/jpeg, image/png, image/webp"
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        onChange={handleAuthFileSelect} 
        className="hidden" 
        accept="image/jpeg, image/png, image/webp"
        capture="environment"
      />
      
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 px-lg py-sm flex justify-between items-center h-16">
        <div className="flex items-center gap-2">
          <span className="font-headline-sm text-headline-sm font-bold text-primary">Medisure</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-surface-variant/50 rounded-full transition-all duration-200">
            <span className="material-symbols-outlined text-primary">history</span>
          </button>
          <button className="p-2 hover:bg-surface-variant/50 rounded-full transition-all duration-200 relative">
            <span className="material-symbols-outlined text-primary">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
          </button>
          <div className="relative">
            <div 
              className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30 cursor-pointer"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <img className="w-full h-full object-cover" alt="Profile" src={user?.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuD-Vw3JD7wrc3bU2K45cC7dMa4xKrnnkvmx4dQzDjjmGr2wufEqwbcdUkHrVtrJuuSG1Fq0aIjKmLOlgWmL4XgWAuBrt3PzDcZK7AY7D2hC4DGBZVNeAXLES0MhrZ2ncEKhxiiB4TcNkXkpJMTuLQ06uIanAbtaEarzUDQYq5U5LNf37kjwmVVKTk4QVjEs8JEVB-35wG0f6ryd4A5e8ga7suz5LmZjjl_um12OKOWHzh9JzV9UttdCv4Q9EBv5Zl90E6YAXeMRGlB-"}/>
            </div>

            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-surface rounded-xl shadow-xl border border-outline-variant/20 overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-outline-variant/10">
                      <p className="font-bold text-sm text-primary">{user?.displayName || 'Dr. Smith'}</p>
                      <p className="text-xs text-on-surface-variant truncate">{user?.email || 'smith@medisure.com'}</p>
                    </div>
                    <div className="py-1">
                      <button 
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/subscription');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-variant/50 flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                        Subscription
                      </button>
                      <button 
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/doctor');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-variant/50 flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">person</span>
                        Profile Settings
                      </button>
                      <button onClick={async () => {
                        await logout();
                        navigate('/login');
                      }} className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Log Out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-20 px-lg space-y-lg max-w-[600px] mx-auto">
        {/* Personalized Greeting */}
        <section className="mt-4">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary truncate">Hello, {user?.displayName?.split(' ')[0] || 'Dr. Smith'}</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Ready for today's clinical verifications?</p>
        </section>

        {/* Summary Cards - Horizontal Scroll */}
        <section className="-mx-lg px-lg overflow-x-auto no-scrollbar pb-2">
          <div className="flex gap-md w-max">
            {/* Total Checks */}
            <div className="glass-card w-[140px] p-md rounded-xl">
              <span className="material-symbols-outlined text-secondary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Checks</p>
              <p className="font-headline-md text-headline-md text-primary mt-1">{stats.total}</p>
            </div>
            {/* Real Medicines */}
            <div className="glass-card w-[140px] p-md rounded-xl border-t-2 border-t-green-500/30">
              <span className="material-symbols-outlined text-green-600 mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Real Meds</p>
              <p className="font-headline-md text-headline-md text-primary mt-1">{stats.total > 0 ? Math.round((stats.real / stats.total) * 100) : 0}%</p>
            </div>
            {/* Accuracy */}
            <div className="glass-card w-[140px] p-md rounded-xl border-t-2 border-t-tertiary/30">
              <span className="material-symbols-outlined text-tertiary-fixed-variant mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>target</span>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Accuracy</p>
              <p className="font-headline-md text-headline-md text-primary mt-1">{stats.accuracy}%</p>
            </div>
          </div>
        </section>

        {/* Quick Medicine Check CTA */}
        <section>
          
          {predictionError && (
            <div className="glass-card bg-error/5 border-l-4 border-l-error p-md rounded-xl mb-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-error mt-0.5">error</span>
              <div>
                <p className="font-label-md text-error uppercase tracking-wider">Prediction Failed</p>
                <p className="font-body-sm text-on-surface-variant mt-1">{predictionError}</p>
              </div>
            </div>
          )}

          <button 
            disabled={isUploading}
            onClick={() => setShowChoiceModal(true)}
            className={`w-full gradient-button p-lg rounded-2xl flex items-center justify-between shadow-lg shadow-secondary/20 transition-all ${isUploading ? 'opacity-70 cursor-wait' : 'active:scale-95'}`}
          >
            <div className="text-left">
              <h2 className="text-white font-headline-sm text-headline-sm">
                {isUploading ? 'Analyzing Medicine...' : 'Quick Medicine Check'}
              </h2>
              <p className="text-white/80 font-body-sm text-body-sm">
                {isUploading ? 'Processing image with AI...' : 'Verify authenticity'}
              </p>
            </div>
            <div className="bg-white/20 p-md rounded-full backdrop-blur-md">
              <span className={`material-symbols-outlined text-white text-3xl ${isUploading ? 'animate-spin' : ''}`}>
                {isUploading ? 'refresh' : 'photo_camera'}
              </span>
            </div>
          </button>
        </section>

        {/* AI Insights Banner */}
        <section className="glass-card p-md rounded-2xl relative overflow-hidden ai-shimmer">
          <div className="flex items-start gap-md">
            <div className="bg-tertiary-fixed p-sm rounded-lg">
              <span className="material-symbols-outlined text-tertiary">psychology</span>
            </div>
            <div>
              <h3 className="font-label-md text-label-md text-tertiary uppercase">AI Verification Insight</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-snug">Increased counterfeit activity detected in "Amoxicillin" batches in your region. Exercise caution.</p>
            </div>
          </div>
        </section>

        {/* Recent Scans List */}
        <section className="space-y-md">
          <div className="flex justify-between items-center">
            <h2 className="font-headline-sm text-headline-sm text-primary">Recent Scans</h2>
            <button className="font-label-md text-label-md text-secondary">View All</button>
          </div>
          <div className="space-y-sm">
            {scans.length > 0 ? (
              scans.slice(0, 5).map((scan) => (
                <div 
                  key={scan.id} 
                  onClick={() => navigate(`/medicine/${scan.id}`)}
                  className={`glass-card p-md rounded-xl flex items-center justify-between cursor-pointer hover:bg-surface-variant/50 transition-colors ${scan.status === 'Fake' ? 'border-l-4 border-l-error' : ''}`}
                >
                  <div className="flex items-center gap-md">
                    <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-on-surface-variant">medication</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-label-md text-label-md text-primary truncate">{scan.medicineName}</p>
                      <p className="font-body-sm text-[10px] text-on-surface-variant truncate">
                        {new Date(scan.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {scan.status === 'Real' && <span className="status-pill-real px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Real</span>}
                    {scan.status === 'Fake' && <span className="status-pill-fake px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Fake</span>}
                    {scan.status === 'Unknown' && <span className="bg-surface-variant text-on-surface px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Info</span>}
                    <span className="material-symbols-outlined text-on-surface-variant text-sm">chevron_right</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-on-surface-variant">
                No recent scans.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <nav className="mx-auto max-w-[600px] bg-surface/90 backdrop-blur-xl border-t border-outline-variant/10 px-lg h-20 flex items-center justify-between pointer-events-auto">
          <button className="flex flex-col items-center gap-1 bottom-nav-active">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span className="text-[10px] font-bold uppercase">Dashboard</span>
          </button>
          <button 
            disabled={isUploading}
            onClick={() => navigate('/clarify')}
            className="flex flex-col items-center gap-1 text-on-surface-variant/60 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">health_and_safety</span>
            <span className="text-[10px] font-bold uppercase">Check</span>
          </button>
          <div className="-mt-12">
            <button 
              disabled={isUploading}
              onClick={() => setShowChoiceModal(true)} 
              className={`gradient-button w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-secondary/30 ring-4 ring-background transition-transform ${isUploading ? 'opacity-70 cursor-wait' : 'active:scale-95'}`}
            >
              <span className={`material-symbols-outlined text-white text-3xl ${isUploading ? 'animate-spin' : ''}`}>
                {isUploading ? 'refresh' : 'add'}
              </span>
            </button>
          </div>
          <button onClick={() => navigate('/doctor')} className="flex flex-col items-center gap-1 text-on-surface-variant/60 hover:text-secondary transition-colors cursor-pointer">
            <span className="material-symbols-outlined">medical_services</span>
            <span className="text-[10px] font-bold uppercase">Doctor</span>
          </button>
          <button onClick={() => navigate('/settings')} className="flex flex-col items-center gap-1 text-on-surface-variant/60 hover:text-secondary transition-colors cursor-pointer">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-[10px] font-bold uppercase">Settings</span>
          </button>
        </nav>
      </div>

      {/* Result Modal */}
      <AnimatePresence>
        {currentScan && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6" style={{ touchAction: 'none' }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              className="bg-white dark:bg-[#1b1b1e] rounded-[24px] w-full max-w-[360px] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col"
            >
              {/* Image Header */}
              <div className="relative h-[220px] w-full bg-gray-100 dark:bg-gray-900">
                {currentScan.imageUrl ? (
                  <img src={currentScan.imageUrl} alt="Medicine" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
                    <span className="material-symbols-outlined text-5xl text-blue-300">medication</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                <button 
                  onClick={() => setCurrentScan(null)} 
                  className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 backdrop-blur text-white p-2 rounded-full transition-colors flex items-center justify-center z-10"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>

                {/* Floating Badge */}
                <div className="absolute -bottom-4 left-5 z-10">
                  <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm shadow-lg ${
                    currentScan.status === 'Real' ? 'bg-green-500 text-white border-2 border-white dark:border-[#1b1b1e]' : 
                    currentScan.status === 'Fake' ? 'bg-red-500 text-white border-2 border-white dark:border-[#1b1b1e]' : 
                    'bg-gray-200 text-gray-800 border-2 border-white dark:border-[#1b1b1e]'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">
                      {currentScan.status === 'Real' ? 'verified' : currentScan.status === 'Fake' ? 'warning' : 'help'}
                    </span>
                    <span className="uppercase tracking-widest">{currentScan.status}</span>
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-5 pt-8 bg-white dark:bg-[#1b1b1e]">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-1">
                  {currentScan.medicineName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-5">
                  <span className="material-symbols-outlined text-[16px]">tag</span>
                  Batch: {currentScan.batchNumber}
                </p>

                {/* Confidence Bar */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Confidence Score</span>
                    <span className={`text-base font-bold ${
                      currentScan.status === 'Real' ? 'text-green-600 dark:text-green-400' : 
                      currentScan.status === 'Fake' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                    }`}>
                      {currentScan.confidence}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        currentScan.status === 'Real' ? 'bg-green-500' : 
                        currentScan.status === 'Fake' ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${currentScan.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Details Box */}
                <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30 mb-5">
                  <p className="text-xs font-bold text-blue-900 dark:text-blue-400 uppercase tracking-wider mb-1">AI Analysis</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {currentScan.details}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setCurrentScan(null)} 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98]"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              className="relative bg-white dark:bg-[#1b1b1e] rounded-t-[1.5rem] sm:rounded-[1.5rem] shadow-2xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 z-10 shrink-0 transform transition-transform"
              style={{ width: 'calc(100% - 24px)', maxWidth: '340px', minWidth: '280px' }}
            >
              {/* Handle bar for mobile */}
              <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-3 sm:hidden" />
              
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white mb-1 text-center">
                Select Photo Source
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center mb-4">
                How would you like to upload your medicine photo?
              </p>

              {/* Video Hint */}
              <div className="mb-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative aspect-video">
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
                  authFileInputRef.current?.click();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-100 dark:hover:border-blue-900/50 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 text-left transition-all active:scale-[0.99] group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex flex-shrink-0 items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">photo_library</span>
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 text-xs sm:text-sm truncate">Choose from Gallery</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">Pick an existing photo</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowChoiceModal(false);
                  cameraInputRef.current?.click();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 text-left transition-all active:scale-[0.99] group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex flex-shrink-0 items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 text-xs sm:text-sm truncate">Take Photo (Camera)</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">Capture using device camera</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowChoiceModal(false)}
              className="mt-4 w-full py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}
