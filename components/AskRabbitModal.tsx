
import React from 'react';
import { X, ExternalLink, MessageCircle } from 'lucide-react';
import { RABBIT_AVATAR_URL } from '../constants';
import { ThemeColor } from '../App';
import { FluentEmoji } from '../utils/fluentEmoji';

interface AskRabbitModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeColor?: ThemeColor; // Added optional themeColor
}

const LINE_URL = "https://lin.ee/DE9DXd0";

const AskRabbitModal: React.FC<AskRabbitModalProps> = ({ isOpen, onClose, themeColor = 'pink' }) => {
  if (!isOpen) return null;

  const handleGoToLine = () => {
    // 開啟新分頁跳轉到 LINE
    window.open(LINE_URL, '_blank');
    onClose();
  };

  // Revert background to white for clarity
  const modalBg = 'bg-white';
  const headerBg = themeColor === 'pink' ? 'bg-pink-50' : themeColor === 'sky' ? 'bg-sky-50' : 'bg-night-pink-primary/10';
  const textMain = 'text-stone-700';
  const textMuted = 'text-stone-600';
  const textSub = 'text-stone-500';
  const borderColor = themeColor === 'pink' ? 'border-pink-100' : themeColor === 'sky' ? 'border-sky-100' : 'border-night-pink-primary/30';
  const circleBorder = themeColor === 'pink' ? 'border-pink-200' : themeColor === 'sky' ? 'border-sky-200' : 'border-night-pink-primary';

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`${modalBg} rounded-[2rem] w-full max-w-md shadow-2xl border-4 ${borderColor} flex flex-col relative overflow-hidden`}>
        
        {/* Header */}
        <div className={`${headerBg} p-6 text-center relative`}>
          <button 
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 bg-white/50 hover:bg-white text-stone-400 hover:text-stone-600 rounded-full transition-colors`}
          >
            <X size={20} />
          </button>
          
          <div className={`${modalBg} w-20 h-20 rounded-full mx-auto p-1 shadow-md border-2 ${circleBorder} mb-3`}>
             <img src={RABBIT_AVATAR_URL} alt="Rabbit" className="w-full h-full object-cover" />
          </div>
          <h2 className={`text-2xl font-bold ${textMain} mb-1`}>粉粉兔讓你問</h2>
          <p className={`text-xs ${themeColor === 'pink' ? 'text-pink-500' : themeColor === 'sky' ? 'text-sky-500' : 'text-night-pink-primary'} font-bold bg-white/80 inline-block px-3 py-1 rounded-full shadow-sm`}>
            有問一定有回應 不知道也會直接說不知道 XD
          </p>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center text-center gap-6">
          <div className={`${textMuted} font-medium leading-relaxed`}>
            <p className="mb-2">對建案有疑問？還是想聽聽建議？</p>
            <p className={`text-sm ${textSub}`}>
              請點擊下方按鈕加入<span className="text-[#06C755] font-bold"> LINE 官方帳號</span>，<br/>
              直接傳訊息給粉粉兔，我會親自回覆喔！<FluentEmoji emoji="🐰" size={16} />
            </p>
          </div>

          <button 
            onClick={handleGoToLine}
            className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-2 group"
          >
            <MessageCircle size={20} />
            <span>加入 LINE 好友詢問</span>
            <ExternalLink size={16} className="opacity-70 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className={`text-[10px] ${textSub}`}>
            * 將會開啟 LINE 加入好友頁面
          </p>
        </div>

      </div>
    </div>
  );
};

export default AskRabbitModal;
