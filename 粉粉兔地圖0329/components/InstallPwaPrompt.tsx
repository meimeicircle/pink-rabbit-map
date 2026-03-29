
import React, { useState, useEffect } from 'react';
import { X, Share, PlusSquare, MonitorDown, Sparkles } from 'lucide-react';
import { RABBIT_AVATAR_URL, MAP_3D_URL } from '../constants';

const InstallPwaPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 檢查是否已經在 standalone 模式 (已安裝)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    // 檢查裝置類型
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    setIsIOS(isIosDevice);
    setIsMobile(isMobileDevice);

    // 處理 Android / Desktop Chrome 的安裝事件
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // 延遲顯示，避免干擾
      setTimeout(() => {
        const hasClosed = sessionStorage.getItem('pwa-prompt-closed');
        if (!hasClosed) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS 也要顯示教學
    if (isIosDevice) {
      setTimeout(() => {
        const hasClosed = sessionStorage.getItem('pwa-prompt-closed');
        if (!hasClosed) {
          setShowPrompt(true);
        }
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
        setShowPrompt(false);
      });
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa-prompt-closed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className={`fixed z-[9999] animate-in slide-in-from-bottom-6 fade-in duration-700 pointer-events-none ${isMobile ? 'bottom-6 left-4 right-4' : 'bottom-8 right-8'}`}>
      <div className="pointer-events-auto bg-white/80 backdrop-blur-xl rounded-[1.5rem] shadow-[0_8px_32px_rgba(236,72,153,0.15)] border border-white/50 p-1 pr-2 max-w-sm ml-auto relative overflow-hidden flex items-center gap-3 group hover:shadow-[0_8px_32px_rgba(236,72,153,0.25)] transition-shadow duration-300">
        
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-200/20 to-transparent rounded-full blur-xl -mr-10 -mt-10 pointer-events-none"></div>

        {/* Icon (Composite: Rabbit + Map) */}
        <div className="w-14 h-14 bg-gradient-to-br from-pink-50 to-white rounded-2xl flex flex-col items-center justify-center border border-pink-100 shadow-sm shrink-0 ml-1 relative overflow-visible">
            {/* Rabbit on Top */}
            <img src={RABBIT_AVATAR_URL} alt="Rabbit" className="w-9 h-9 object-contain drop-shadow-sm z-10 -mb-2" />
            {/* Map on Bottom */}
            <img src={MAP_3D_URL} alt="Map" className="w-8 h-8 object-contain drop-shadow-sm z-0" />
            
            {/* Sparkle Badge */}
            <div className="absolute -bottom-1 -right-1 bg-yellow-300 text-yellow-700 p-0.5 rounded-full border-2 border-white z-20">
              <Sparkles size={10} fill="currentColor" />
            </div>
        </div>

        {/* Text Content */}
        <div className="flex flex-col py-1.5 min-w-0 flex-1">
            <h3 className="font-bold text-stone-800 text-sm leading-tight flex items-center gap-1.5">
              安裝粉粉兔 <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-pink-100 text-pink-600 font-extrabold tracking-wide">APP</span>
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5 truncate pr-2">
              {isIOS ? '加入主畫面，看房更方便' : '獲得更棒的看房體驗！'}
            </p>
            
            {/* Install Button / Instructions */}
            <div className="mt-1.5">
              {isIOS ? (
                 <div className="flex items-center gap-2 text-[10px] text-stone-400 font-medium">
                    <span>點擊 <Share size={10} className="inline mx-px" /> 分享</span>
                    <span>→ 加入主畫面 <PlusSquare size={10} className="inline mx-px" /></span>
                 </div>
              ) : (
                 <button 
                   onClick={handleInstallClick}
                   className="text-[11px] font-bold text-pink-500 hover:text-pink-600 flex items-center gap-1 transition-colors hover:bg-pink-50 px-2 py-1 -ml-2 rounded-lg w-fit"
                 >
                    <MonitorDown size={12} />
                    {isMobile ? '立即安裝' : '安裝到桌面'}
                 </button>
              )}
            </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-2 right-2 p-1 text-stone-300 hover:text-stone-500 hover:bg-stone-100 rounded-full transition-colors"
        >
          <X size={14} />
        </button>

      </div>
    </div>
  );
};

export default InstallPwaPrompt;
