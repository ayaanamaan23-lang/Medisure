import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import AdBanner from './AdBanner';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function Pricing() {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentName, setPaymentName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadyPremiumMessage, setAlreadyPremiumMessage] = useState(false);

  const isPremium = userData?.subscriptionStatus === 'active';

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !paymentName) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'subscriptions'), {
        uid: user.uid,
        email: user.email,
        paymentName: paymentName,
        status: 'pending',
        timestamp: new Date().toISOString()
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error("Error submitting subscription", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlanClick = (planName: string) => {
    if (planName === 'PREMIUM HEALTH') {
      if (isPremium) {
        setAlreadyPremiumMessage(true);
      } else {
        setShowPayment(true);
      }
    } else {
      navigate('/dashboard');
    }
  };

  const plans = [
    {
      name: 'BASIC PLAN',
      price: '₹0',
      period: '',
      features: [
        '5 medicine scans per day',
        'Fake/Real AI prediction',
        'Ads included',
        'Basic confidence score',
        'Camera upload support'
      ],
      button: 'Start Free',
      popular: false
    },
    {
      name: 'PREMIUM HEALTH',
      price: '₹99',
      period: '/month',
      features: [
        'Unlimited AI medicine scans',
        'No ads',
        'Detailed side effects & alternatives',
        'Faster scan experience',
        'Premium UI experience',
        'Detailed context analysis',
        'Priority support'
      ],
      button: 'Get Premium',
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface overflow-x-hidden relative pb-20">
      
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 px-sm py-xs flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-variant transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </button>
        <div className="font-headline-sm text-headline-sm text-primary tracking-tight">
          Subscription
        </div>
        <div className="w-10"></div>
      </header>

      <AdBanner />

      <div className="pt-xl px-md sm:px-lg lg:px-xl max-w-[1280px] mx-auto relative z-10">
        <div className="text-center mb-xl flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-xs w-full px-4"
          >
            Choose your intelligence level
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-body-md text-body-md text-on-surface-variant w-full max-w-[600px] px-4"
          >
            Unlock the full potential of AI-powered medicine verification and healthcare insights.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg items-stretch max-w-[800px] mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`relative rounded-[24px] p-[2px] transition-transform duration-300 hover:scale-[1.02] ${
                plan.popular 
                  ? 'bg-secondary shadow-[0_8px_30px_rgba(0,88,190,0.15)]' 
                  : 'bg-outline-variant/30 hover:bg-outline-variant/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  Most Popular
                </div>
              )}
              
              <div className="bg-surface-container-lowest h-full rounded-[22px] p-lg flex flex-col relative overflow-hidden">
                {plan.popular && <div className="absolute inset-0 bg-secondary/5 pointer-events-none" />}
                
                <h3 className={`font-label-md text-label-md uppercase mb-xs ${plan.popular ? 'text-secondary' : 'text-on-surface-variant'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline mb-lg">
                  <span className="font-display-lg text-display-lg text-primary">{plan.price}</span>
                  <span className="font-body-md text-body-md text-on-surface-variant ml-1">{plan.period}</span>
                </div>

                <div className="space-y-md flex-grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start text-sm text-on-surface">
                        <span className={`material-symbols-outlined text-[18px] mr-2 shrink-0 ${plan.popular ? 'text-secondary' : 'text-primary'}`}>check_circle</span>
                        <span className="font-body-sm text-body-sm leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => handlePlanClick(plan.name)}
                  className={`w-full mt-xl py-3 rounded-xl font-label-md text-label-md transition-all ${
                    plan.popular
                      ? 'bg-secondary text-white hover:shadow-lg hover:-translate-y-0.5'
                      : 'bg-surface-variant text-on-surface hover:bg-outline-variant/30'
                  }`}
                >
                  {plan.name === 'PREMIUM HEALTH' && isPremium ? 'Current Plan' : (alreadyPremiumMessage && plan.name === 'PREMIUM HEALTH' ? 'Already Premium!' : plan.button)}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badge Section */}
        <div className="mt-3xl flex flex-col items-center justify-center space-y-md px-4 w-full">
          <div className="flex flex-wrap items-center justify-center gap-4 text-on-surface-variant">
            <div className="flex items-center space-x-1.5">
              <span className="material-symbols-outlined text-secondary text-[20px]">psychology</span>
              <span className="font-label-md text-label-md">AI Powered</span>
            </div>
            <div className="w-1 h-1 bg-outline-variant rounded-full" />
            <div className="flex items-center space-x-1.5">
              <span className="material-symbols-outlined text-secondary text-[20px]">shield_locked</span>
              <span className="font-label-md text-label-md">Secure</span>
            </div>
            <div className="w-1 h-1 bg-outline-variant rounded-full" />
            <div className="flex items-center space-x-1.5">
              <span className="material-symbols-outlined text-secondary text-[20px]">bolt</span>
              <span className="font-label-md text-label-md">Fast Analysis</span>
            </div>
          </div>
          
          {/* Disclaimer - single line */}
          <p className="font-body-sm text-[11px] text-on-surface-variant/80 text-center w-full max-w-[600px]">
            Disclaimer: AI-generated results are estimates only. Always consult healthcare professionals before making medical decisions.
          </p>
        </div>
      </div>

      {/* Already Premium Modal */}
      {alreadyPremiumMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-[400px] w-full shadow-2xl relative flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-blue-600 text-3xl">workspace_premium</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Already Subscribed!</h3>
            <p className="text-sm text-gray-500 mb-6">
              You already have an active Premium Health subscription. Enjoy all your premium benefits!
            </p>
            <button 
              onClick={() => setAlreadyPremiumMessage(false)}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-[400px] w-full shadow-2xl relative overflow-hidden flex flex-col items-center"
          >
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-green-500 text-3xl">check</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
                <p className="text-sm text-gray-500">Payment process within only 5-6 hours only. You'll get premium access soon.</p>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => setShowPayment(false)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>

                <h3 className="text-xl font-bold text-gray-900 mb-1">Get Premium</h3>
                <p className="text-sm text-gray-500 text-center mb-6">Scan to pay ₹99 for unlimited access.</p>

                <div className="bg-gray-50 p-4 rounded-2xl mb-6 flex flex-col items-center border border-gray-100 w-full">
                  {/* Using standard UPI intent URL for QR */}
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=7827922018@fam&pn=Ayaan"
                    alt="Payment QR" 
                    className="w-48 h-48 mb-4 rounded-lg bg-white p-2 shadow-sm"
                  />
                  
                  <p className="text-sm font-bold text-gray-900 mb-1">UPI ID: <span className="text-blue-600 select-all">7827922018@fam</span></p>
                  
                  <a 
                    href="upi://pay?pa=7827922018@fam&pn=Ayaan"
                    className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline"
                  >
                    Open in UPI App <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  </a>
                </div>

                <form onSubmit={handleSubscribe} className="w-full">
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Name used for payment</label>
                    <input 
                      type="text" 
                      value={paymentName}
                      onChange={(e) => setPaymentName(e.target.value)}
                      placeholder="e.g. John Doe" 
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting || !paymentName}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50"
                  >
                    {isSubmitting ? 'Verifying...' : 'I have paid'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

