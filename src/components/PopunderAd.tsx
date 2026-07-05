import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function PopunderAd() {
  const { userData } = useAuth();
  
  const isPremium = userData?.subscriptionStatus === 'active';

  useEffect(() => {
    // Only load the popunder script if the user is not premium
    if (isPremium) return;

    // Check if script already exists to avoid duplicates
    if (document.querySelector('script[src*="e3adf8b941d67de54d55fd377a9b27aa.js"]')) return;

    // Create the script element
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//pl30207737.effectivecpmnetwork.com/e3/ad/f8/e3adf8b941d67de54d55fd377a9b27aa.js';
    
    // Append to document head
    document.head.appendChild(script);

    // We don't remove it on unmount because in a React SPA, navigating between pages 
    // might remove the script before it can trigger on the next click.
  }, [isPremium]);

  return null; // This component doesn't render any visible UI
}
