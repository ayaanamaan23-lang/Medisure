import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import AdBanner from './AdBanner';

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      
      // Save user to Firestore
      const userRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          subscriptionStatus: 'free',
          scansToday: 0,
          createdAt: new Date().toISOString()
        });
      }
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-md font-body-md text-on-surface flex-col" style={{ background: 'radial-gradient(circle at 0% 0%, #fbf8fc 0%, #f2f0f3 100%)' }}>
      
      <div className="w-full max-w-[440px]">
        <AdBanner />
      </div>

      <main className="w-full max-w-[440px] flex flex-col gap-xl">
        {/* Header & Hero Section */}
        <div className="flex flex-col items-center text-center gap-md">
          <div className="w-24 h-24 sm:w-32 sm:h-32 relative animate-[float_6s_ease-in-out_infinite] bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
            <span className="material-symbols-outlined text-[60px] sm:text-[80px] text-white">medical_services</span>
          </div>
          <div className="space-y-xs">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-tight">Medisure</h1>
            <p className="font-body-md text-body-md text-on-surface-variant px-xl">
              Sign in to access your dashboard and medicine reports.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <section className="glass-card rounded-[32px] p-xl shadow-2xl space-y-lg">
          {error && (
            <div className="bg-error/10 text-error p-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <button 
            type="button" 
            onClick={handleGoogleSignIn}
            className="w-full bg-white border border-outline-variant/30 text-on-surface font-label-md py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-surface-variant transition-all shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
        </section>

        <footer className="flex flex-col items-center gap-md opacity-60 text-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-label-md text-label-md text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              HIPAA Compliant
            </span>
            <div className="w-px h-3 bg-outline-variant"></div>
            <span className="flex items-center gap-1 font-label-md text-label-md text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">security</span>
              256-bit AES
            </span>
          </div>
          <p className="font-body-sm text-[11px] text-on-surface-variant/80">© {new Date().getFullYear()} Medisure. Verify Medicine. Protect Health.</p>
        </footer>
      </main>
    </div>
  );
}
