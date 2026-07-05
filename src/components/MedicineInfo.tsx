import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ScanResult } from '../types';
import AdBanner from './AdBanner';
import PopunderAd from './PopunderAd';
import { useAuth } from '../contexts/AuthContext';

export default function MedicineInfo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'uses' | 'sideEffects' | 'precautions' | 'composition'>('overview');

  const isPremium = userData?.subscriptionStatus === 'active';

  useEffect(() => {
    if (!isPremium) {
      setLoading(false);
      return;
    }

    window.scrollTo(0, 0);
    const fetchScanDetails = async () => {
      try {
        const res = await fetch(`/api/scans/${id}`);
        if (res.ok) {
          const data = await res.json();
          setScan(data);
        } else {
          console.error("Scan not found");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchScanDetails();
  }, [id, isPremium]);

  if (!isPremium) {
    return (
      <div className="bg-[#f8fbff] font-sans text-slate-800 min-h-screen w-full flex flex-col relative pb-20 items-center justify-center p-4">
        <PopunderAd />
        <header className="absolute top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 px-4 py-4 flex items-center shadow-sm">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined text-gray-700">arrow_back</span>
          </button>
          <h1 className="ml-2 text-lg font-bold text-gray-900 truncate">Medicine Information</h1>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-on-surface-variant animate-pulse font-medium">Loading medicine details...</p>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
        <h2 className="text-2xl font-bold text-on-background mb-2">Details Not Found</h2>
        <p className="text-on-surface-variant mb-6">The requested medicine information could not be found or has expired.</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const details = scan.fullDetails;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'info' },
    { id: 'uses', label: 'Uses', icon: 'medical_services' },
    { id: 'sideEffects', label: 'Side Effects', icon: 'warning' },
    { id: 'precautions', label: 'Precautions', icon: 'health_and_safety' },
    { id: 'composition', label: 'Composition', icon: 'science' },
  ] as const;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <PopunderAd />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 px-4 py-4 flex items-center">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-2 -ml-2 rounded-full hover:bg-surface-variant text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="ml-2 text-xl font-bold text-on-surface truncate">Medicine Details</h1>
      </header>

      <main className="max-w-[896px] mx-auto p-4 sm:p-6 lg:p-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Left Column: Image & Quick Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-[#1b1b1e] rounded-[24px] overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800">
              <div className="h-64 bg-gray-100 dark:bg-gray-900 relative">
                {scan.imageUrl ? (
                  <img src={scan.imageUrl} alt={scan.medicineName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700">medication</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  {scan.status !== 'Unknown' && (
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm shadow-lg mb-2 ${
                      scan.status === 'Real' ? 'bg-green-500 text-white' : 
                      scan.status === 'Fake' ? 'bg-red-500 text-white' : 
                      'bg-gray-200 text-gray-800'
                    }`}>
                      <span className="material-symbols-outlined text-[16px]">
                        {scan.status === 'Real' ? 'verified' : scan.status === 'Fake' ? 'warning' : 'help'}
                      </span>
                      <span className="uppercase tracking-widest">{scan.status}</span>
                    </div>
                  )}
                  <h2 className="text-white font-bold text-xl leading-tight line-clamp-2">
                    {scan.medicineName}
                  </h2>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-start gap-3 text-sm">
                  <span className="material-symbols-outlined text-primary mt-0.5">factory</span>
                  <div>
                    <p className="font-semibold text-on-surface">Manufacturer</p>
                    <p className="text-on-surface-variant leading-relaxed">{details?.manufacturer || 'Unknown'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <span className="material-symbols-outlined text-primary mt-0.5">prescriptions</span>
                  <div>
                    <p className="font-semibold text-on-surface">Prescription</p>
                    <p className="text-on-surface-variant leading-relaxed">{details?.prescriptionRequirement || 'Unknown'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <span className="material-symbols-outlined text-primary mt-0.5">tag</span>
                  <div>
                    <p className="font-semibold text-on-surface">Batch Number</p>
                    <p className="text-on-surface-variant leading-relaxed">{scan.batchNumber || 'Unknown'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Warnings Card */}
            {details?.warnings && details.warnings !== 'No warnings data available.' && (
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                  <span className="material-symbols-outlined">warning</span>
                  <h3 className="font-bold text-sm uppercase tracking-wider">Critical Warnings</h3>
                </div>
                <p className="text-sm text-red-800 dark:text-red-200 leading-relaxed">
                  {details.warnings}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Detailed Tabs */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-[#1b1b1e] rounded-[24px] shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-full min-h-[500px]">
              
              {/* Tab Navigation */}
              <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1b1b1e]">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors relative outline-none ${
                      activeTab === tab.id 
                        ? 'text-primary border-primary bg-white dark:bg-[#252529]' 
                        : 'text-on-surface-variant border-transparent hover:text-on-surface hover:bg-gray-100 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6 md:p-8 flex-1 relative bg-white dark:bg-[#1b1b1e]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="prose dark:prose-invert max-w-none"
                  >
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">info</span>
                            Overview
                          </h3>
                          <p className="text-on-surface-variant leading-relaxed">
                            {details?.overview || 'No overview available.'}
                          </p>
                        </div>
                        {details?.usefulFor && details.usefulFor !== 'Unknown' && (
                          <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                            <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px]">group</span>
                              Useful For
                            </h4>
                            <p className="text-blue-900 dark:text-blue-100 font-medium">{details.usefulFor}</p>
                          </div>
                        )}
                        <div className="bg-surface-variant/30 p-5 rounded-2xl border border-outline-variant/30">
                          <h4 className="font-semibold text-sm text-on-surface uppercase tracking-wider mb-2">Salt Composition</h4>
                          <p className="text-primary font-medium">{details?.saltComposition || 'Unknown'}</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-on-surface mb-2">AI Verification Summary</h4>
                          <p className="text-sm text-on-surface-variant leading-relaxed">
                            {scan.details}
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'uses' && (
                      <div>
                        <h3 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary">medical_services</span>
                          Common Uses
                        </h3>
                        <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                          {details?.uses || 'No usage data available.'}
                        </p>
                      </div>
                    )}

                    {activeTab === 'sideEffects' && (
                      <div>
                        <h3 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary">warning</span>
                          Side Effects
                        </h3>
                        <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                          {details?.sideEffects || 'No side effects data available.'}
                        </p>
                      </div>
                    )}

                    {activeTab === 'precautions' && (
                      <div>
                        <h3 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary">health_and_safety</span>
                          Precautions
                        </h3>
                        <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                          {details?.precautions || 'No precautions data available.'}
                        </p>
                      </div>
                    )}

                    {activeTab === 'composition' && (
                      <div>
                        <h3 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary">science</span>
                          Detailed Composition
                        </h3>
                        <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                          {details?.composition || 'No composition data available.'}
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </div>

        </div>
        
        <AdBanner />
      </main>
    </div>
  );
}
