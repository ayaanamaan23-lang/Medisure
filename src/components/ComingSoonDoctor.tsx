import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdBanner from './AdBanner';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function ComingSoonDoctor() {
  const navigate = useNavigate();
  const [joined, setJoined] = useState(false);
  const [email, setEmail] = useState('');
  
  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await addDoc(collection(db, 'waitlist'), {
        email,
        timestamp: new Date().toISOString()
      });
      setJoined(true);
    } catch (error) {
      console.error("Error joining waitlist: ", error);
    }
  };

  return (
    <div className="bg-[#f8fbff] text-slate-800 min-h-screen font-sans w-full">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3 border-b border-blue-50/50">
        <button onClick={() => navigate('/dashboard')} aria-label="Go back" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors flex-shrink-0">
          <svg className="w-6 h-6" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
            <line x1="19" x2="5" y1="12" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h1 className="text-xl font-bold text-slate-900 truncate">Doctor</h1>
      </header>

      <AdBanner />

      <main className="max-w-[448px] mx-auto w-full px-5 pt-6 pb-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute top-40 left-0 w-16 h-16 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d1d5db 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }}></div>

        {/* Hero Section */}
        <section className="w-full flex flex-col">
          {/* Coming Soon Badge */}
          <div className="self-start inline-flex items-center gap-2 bg-blue-100/50 border border-blue-200 px-3 py-1.5 rounded-xl mb-6">
            <svg fill="none" height="14" stroke="#2563eb" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg">
              <rect height="18" rx="2" ry="2" width="18" x="3" y="4"></rect>
              <line x1="16" x2="16" y1="2" y2="6"></line>
              <line x1="8" x2="8" y1="2" y2="6"></line>
              <line x1="3" x2="21" y1="10" y2="10"></line>
            </svg>
            <span className="text-blue-600 text-xs font-bold tracking-widest uppercase">Coming Soon</span>
          </div>

          {/* Main Headline */}
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
            Talk to Expert Doctors
          </h2>
          <p className="text-base text-slate-500 leading-relaxed mb-8">
            Connect with certified medical professionals from the comfort of your home.
          </p>
        </section>

        {/* Feature List */}
        <section className="mt-16 space-y-6 w-full">
          <div className="flex items-start gap-4 w-full">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100/80 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0">
              <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
                <path d="m16 11 2 2 4-4"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Expert Doctors</h3>
              <p className="text-slate-500 text-sm">Verified &amp; experienced medical professionals</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 w-full">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100/80 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0">
              <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <rect height="14" rx="2" ry="2" width="20" x="2" y="3"></rect>
                <line x1="8" x2="16" y1="21" y2="21"></line>
                <line x1="12" x2="12" y1="17" y2="21"></line>
                <path d="m10 10 4 4m0-4-4 4"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Secure Consultations</h3>
              <p className="text-slate-500 text-sm">Private &amp; encrypted video or voice calls</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 w-full">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100/80 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0">
              <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" x2="12" y1="18" y2="12"></line>
                <line x1="9" x2="15" y1="15" y2="15"></line>
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Health Records</h3>
              <p className="text-slate-500 text-sm">Your data is safe and confidential</p>
            </div>
          </div>
        </section>

        {/* Waitlist Section */}
        <section className="mt-12 w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl text-center relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-500 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border-4 border-[#f8fbff]">
            <svg fill="none" height="20" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
              <path d="m22 2-7 20-4-9-9-4Z"></path>
              <path d="M22 2 11 13"></path>
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-6 mb-2">Join the Waitlist</h2>
          <p className="text-slate-500 text-sm mb-6 sm:mb-8">
            Be the first to experience our doctor consultation service when it launches.
          </p>
          
          {!joined ? (
            <form className="space-y-4 w-full" onSubmit={handleJoinWaitlist}>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                  <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                    <rect height="16" rx="2" width="20" x="2" y="4"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                </div>
                <input 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-slate-100 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 text-sm" 
                  placeholder="Enter your email" 
                  type="email" 
                  required 
                />
              </div>
              <button className="w-full py-3 sm:py-4 px-4 rounded-xl sm:rounded-2xl text-white font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all text-sm sm:text-base whitespace-nowrap" type="submit" style={{ background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)' }}>
                <span>Notify Me When It's Live</span>
                <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 hidden sm:block">
                  <line x1="5" x2="19" y1="12" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </form>
          ) : (
            <div className="w-full bg-blue-50 border border-blue-100 rounded-xl sm:rounded-2xl p-5 sm:p-6 flex flex-col items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center mb-3 shadow-lg shadow-blue-500/30">
                <svg fill="none" height="24" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">You're on the list!</h3>
              <p className="text-xs text-slate-500">We'll notify you as soon as consultations are available.</p>
            </div>
          )}
          
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[10px] text-slate-400 font-medium uppercase tracking-wider w-full">
            <svg className="text-blue-500 flex-shrink-0" fill="none" height="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="12" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span className="text-center">We respect your privacy. No spam.</span>
          </div>
        </section>

        {/* Trust Pillars Footer Grid */}
        <section className="mt-12 grid grid-cols-2 gap-4 w-full">
          <div className="bg-white/50 border border-white/80 p-4 rounded-3xl text-center flex flex-col items-center justify-center min-h-[120px]">
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2 flex-shrink-0">
              <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
            </div>
            <p className="font-bold text-xs text-slate-900 mb-1 w-full">Secure</p>
            <p className="text-[10px] text-slate-500 leading-tight w-full line-clamp-2">Data protected with top-level security</p>
          </div>
          
          <div className="bg-white/50 border border-white/80 p-4 rounded-3xl text-center flex flex-col items-center justify-center min-h-[120px]">
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2 flex-shrink-0">
              <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <p className="font-bold text-xs text-slate-900 mb-1 w-full">Convenient</p>
            <p className="text-[10px] text-slate-500 leading-tight w-full line-clamp-2">Consult from anywhere, anytime</p>
          </div>
          
          <div className="bg-white/50 border border-white/80 p-4 rounded-3xl text-center flex flex-col items-center justify-center min-h-[120px]">
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2 flex-shrink-0">
              <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <p className="font-bold text-xs text-slate-900 mb-1 w-full">Trusted</p>
            <p className="text-[10px] text-slate-500 leading-tight w-full line-clamp-2">Certified doctors you can rely on</p>
          </div>
          
          <div className="bg-white/50 border border-white/80 p-4 rounded-3xl text-center flex flex-col items-center justify-center min-h-[120px]">
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2 flex-shrink-0">
              <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
              </svg>
            </div>
            <p className="font-bold text-xs text-slate-900 mb-1 w-full">Care</p>
            <p className="text-[10px] text-slate-500 leading-tight w-full line-clamp-2">Compassionate care just a click away</p>
          </div>
        </section>

        {/* Legal Disclaimer */}
        <footer className="mt-12 text-center w-full">
          <div className="flex items-start gap-2 w-full text-left">
            <svg className="text-slate-400 mt-0.5 flex-shrink-0" fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" x2="12" y1="16" y2="12"></line>
              <line x1="12" x2="12.01" y1="8" y2="8"></line>
            </svg>
            <p className="text-[10px] text-slate-400 leading-relaxed italic">
              AI-generated information is for general purposes only and not a substitute for professional medical advice. Always consult a healthcare professional before making any medical decisions.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
