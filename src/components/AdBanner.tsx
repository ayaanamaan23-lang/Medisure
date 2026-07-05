import React, { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AdBanner() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { userData } = useAuth();
  
  const isPremium = userData?.subscriptionStatus === 'active';

  useEffect(() => {
    if (isPremium || !iframeRef.current) return;
    
    const doc = iframeRef.current.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background-color: transparent; }
            </style>
          </head>
          <body>
            <script type="text/javascript">
              atOptions = {
                'key' : 'e7a7cddc93af2029ae02dc83e53a4b5f',
                'format' : 'iframe',
                'height' : 50,
                'width' : 320,
                'params' : {}
              };
            </script>
            <script type="text/javascript" src="https://www.highperformanceformat.com/e7a7cddc93af2029ae02dc83e53a4b5f/invoke.js"></script>
          </body>
        </html>
      `);
      doc.close();
    }
  }, [isPremium]);

  if (isPremium) return null;

  return (
    <div className="w-full flex justify-center items-center my-6">
      <div className="w-[320px] h-[50px] bg-gray-50 dark:bg-gray-800/30 flex items-center justify-center rounded overflow-hidden relative">
        <div className="absolute inset-0 flex items-center justify-center -z-10">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Advertisement</p>
        </div>
        <iframe 
          ref={iframeRef} 
          width="320" 
          height="50" 
          frameBorder="0" 
          scrolling="no" 
          className="z-10 bg-transparent"
          title="Advertisement"
        />
      </div>
    </div>
  );
}

