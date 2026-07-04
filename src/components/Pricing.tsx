import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import AdBanner from './AdBanner';

export default function Pricing() {
  const navigate = useNavigate();

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
                  className={`w-full mt-xl py-3 rounded-xl font-label-md text-label-md transition-all ${
                    plan.popular
                      ? 'bg-secondary text-white hover:shadow-lg hover:-translate-y-0.5'
                      : 'bg-surface-variant text-on-surface hover:bg-outline-variant/30'
                  }`}
                >
                  {plan.button}
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
    </div>
  );
}

