import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import AdBanner from './AdBanner';

export default function Login() {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/dashboard');
    }, 1500);
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
              {isLogin ? 'Sign in to access your dashboard and medicine reports.' : 'Join the future of clinical precision and medical intelligence.'}
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

          <div className="flex items-center gap-4 py-2 opacity-60">
            <div className="flex-1 h-px bg-outline-variant"></div>
            <span className="font-body-sm text-[12px] text-on-surface-variant uppercase tracking-wider">or email</span>
            <div className="flex-1 h-px bg-outline-variant"></div>
          </div>

          <form className="space-y-md" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary ml-1" htmlFor="name">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">person</span>
                  <input className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-3 pl-12 pr-4 font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all" id="name" name="name" placeholder="Dr. Jane Smith" type="text" required />
                </div>
              </div>
            )}

            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-primary ml-1" htmlFor="email">Medical Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">medical_services</span>
                <input className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-3 pl-12 pr-4 font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all" id="email" name="email" placeholder="name@clinic.com" type="email" required />
              </div>
              {!isLogin && <p className="text-[10px] text-on-surface-variant/60 ml-1">Enterprise SSO supported for verified institutions.</p>}
            </div>

            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-primary ml-1" htmlFor="password">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                <input className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-3 pl-12 pr-12 font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all" id="password" name="password" placeholder="••••••••••••" type={showPassword ? "text" : "password"} required />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors" type="button" onClick={() => setShowPassword(!showPassword)}>
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="flex items-start gap-3 py-2">
                <div className="flex items-center h-5">
                  <input className="h-4 w-4 rounded border-outline-variant text-secondary focus:ring-secondary cursor-pointer" id="terms" name="terms" type="checkbox" required />
                </div>
                <label className="font-body-sm text-body-sm text-on-surface-variant" htmlFor="terms">
                  I agree to the <a className="text-secondary font-semibold hover:underline" href="#">Terms of Service</a> and <a className="text-secondary font-semibold hover:underline" href="#">Privacy Policy</a>.
                </label>
              </div>
            )}

            <button disabled={isSubmitting} className={`w-full text-white font-label-md text-label-md py-4 rounded-xl flex items-center justify-center gap-2 mt-sm group transition-all ${isSubmitting ? 'bg-secondary opacity-70' : 'primary-gradient hover:shadow-[0_8px_20px_rgba(0,88,190,0.25)] hover:-translate-y-[1px]'}`} type="submit">
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin">refresh</span> Processing...
                </>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-md border-t border-outline-variant/20 text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-secondary font-bold hover:text-primary transition-colors">
                {isLogin ? 'Sign up' : 'Login'}
              </button>
            </p>

          </div>
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
