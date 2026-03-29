
import React from 'react';
import { X, BookOpen, Swords, FileSpreadsheet, CircleDollarSign, Calculator, Map, AtSign, ExternalLink, MessageCircle, Gamepad2, Search } from 'lucide-react';
import { RABBIT_AVATAR_URL } from '../constants';
import { ThemeColor } from '../App';
import { FluentEmoji } from '../utils/fluentEmoji';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeColor: ThemeColor;
}

const LINE_URL = "https://lin.ee/DE9DXd0";
const THREADS_URL = "https://www.threads.net/@rabbitpinkpink"; // Corrected URL structure
const STANDALONE_SCORER_URL = "https://rabbitpinkpinkpkgogo.meimeicircle.workers.dev/";

const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose, themeColor }) => {
  if (!isOpen) return null;

  // Background and Text colors based on Theme
  // REVERTED to White background for clarity as requested
  const modalBg = 'bg-white';
  const textMain = 'text-stone-700';
  const textMuted = 'text-stone-500';
  const textMutedLight = 'text-stone-400';
  const cardBg = 'bg-stone-50';
  const cardBorder = 'border-stone-200';
  
  // Header specific colors
  const headerBgColor = themeColor === 'pink' ? 'bg-pink-50 border-pink-100' : themeColor === 'sky' ? 'bg-sky-50 border-sky-100' : 'bg-night-pink-primary/10 border-night-pink-primary/20';
  const headerIconBg = 'bg-white';
  const headerTextMain = 'text-stone-700';
  const headerSubText = themeColor === 'pink' ? 'text-pink-400' : themeColor === 'sky' ? 'text-sky-400' : 'text-night-pink-primary';

  // Close button
  const closeBtnClass = themeColor === 'pink' ? 'hover:bg-pink-100' : themeColor === 'sky' ? 'hover:bg-sky-100' : 'hover:bg-night-pink-primary/10';

  // Common card style inside content
  const commonCardStyle = `${cardBg} ${cardBorder}`;

  // 中間的功能介紹列表 (移除評分器，評分器獨立放到底部)
  const features = [
    {
      title: "粉粉兔地標顏色解密",
      icon: <img src={RABBIT_AVATAR_URL} className="w-6 h-6 object-contain" alt="icon" />,
      color: `${commonCardStyle} ${themeColor === 'dark' ? 'text-night-pink-primary' : 'text-pink-500'}`,
      content: (
        <ul className={`text-xs space-y-2 font-medium mt-2 text-stone-600`}>
          <li className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-pink-500 shadow-sm border border-white"></span>
            <span>跑分：<span className="font-bold text-[#FF4E80]">90分以上</span>，<FluentEmoji emoji="😍" size={14} /> 讚讚！</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#d6c09c] shadow-sm border border-white"></span>
            <span>跑分：<span className="font-bold text-[#b09673]">81~90分</span>，<FluentEmoji emoji="😎" size={14} /> 可以欸！</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-400 shadow-sm border border-white"></span>
            <span>跑分：<span className="font-bold text-gray-500">80分以下</span>，<FluentEmoji emoji="🙈" size={14} /> 還行囉。</span>
          </li>
        </ul>
      )
    },
    {
      title: "地圖與列表連動",
      icon: <Map size={20} />,
      color: `${commonCardStyle} text-purple-600`,
      content: (
        <div className={`text-xs mt-2 leading-relaxed text-stone-600`}>
          手機版可以隨時切換「地圖模式」與「列表模式」，點擊地圖上的大頭針，列表會<span className="font-bold text-purple-500">自動滾動</span>到該建案喔！
        </div>
      )
    },
    {
      title: "殘酷 PK 擂台",
      icon: <Swords size={20} />,
      color: `${commonCardStyle} text-orange-600`,
      content: (
        <div className={`text-xs mt-2 leading-relaxed text-stone-600`}>
          看到喜歡的建案，點擊卡片上的 <span className={`inline-flex items-center px-1 py-0.5 border rounded text-[10px] font-bold mx-1 shadow-sm bg-white border-stone-300`}><Swords size={10} className="mr-0.5"/>加入PK</span>。
          <br/>
          最多選 <strong>3</strong> 個，右下角會出現比較工具，點擊「開始 PK」就能看到詳細的勝敗分析表喔！
        </div>
      )
    },
    {
      title: "網友投稿功能",
      icon: (
        <div className="flex items-center -space-x-1">
          <FluentEmoji emoji="🐰" size={20} />
          <FluentEmoji emoji="📝" size={20} />
        </div>
      ),
      color: `${commonCardStyle} text-blue-600`,
      content: (
        <div className={`text-xs mt-2 leading-relaxed text-stone-600`}>
          點擊右上角「網友投稿」，填寫建案資料。粉粉兔會根據建材跟工法等給予評分，並標註您的專屬暱稱與 Emoji 喔！
        </div>
      )
    },
    {
      title: "關於價格資訊",
      icon: <CircleDollarSign size={20} />,
      color: `${commonCardStyle} text-yellow-600`,
      content: (
        <div className={`text-xs mt-2 leading-relaxed text-stone-600`}>
          <span className={`font-bold text-stone-700`}>本系統無提供價格資訊</span>：房價隨時浮動，建議查詢最新實價登錄較具參考意義。
        </div>
      )
    },
    {
      title: "萬能搜尋功能",
      icon: <Search size={20} />,
      color: `${commonCardStyle} text-emerald-600`,
      content: (
        <div className={`text-xs mt-2 leading-relaxed text-stone-600`}>
          列表不只可以搜尋<span className={`font-bold text-stone-700`}>建案名稱</span>，還可搜尋<span className="font-bold text-emerald-600">特色</span>或<span className="font-bold text-emerald-600">特殊建材</span> (ex: 防水保固、3.6m、BOSCH 等等)，快來玩玩看！<FluentEmoji emoji="😎" size={14} />
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
      <div className={`${modalBg} rounded-[2rem] w-full max-w-2xl shadow-2xl border-4 ${themeColor === 'pink' ? 'border-pink-100' : themeColor === 'sky' ? 'border-sky-100' : 'border-night-pink-primary/20'} flex flex-col relative overflow-hidden max-h-[90vh]`}>
        
        {/* Header */}
        <div className={`p-4 md:p-5 flex justify-between items-center border-b ${headerBgColor}`}>
          <div className="flex items-center gap-3">
             <div className={`${headerIconBg} p-2 rounded-full shadow-sm ${themeColor === 'pink' ? 'text-pink-500' : themeColor === 'sky' ? 'text-sky-500' : 'text-night-pink-primary'}`}>
                <BookOpen size={24} />
             </div>
             <div>
               <h2 className={`text-lg md:text-xl font-bold ${headerTextMain}`}>粉粉兔教戰手冊</h2>
               <p className={`text-xs ${headerSubText} font-bold tracking-wider`}>GUIDEBOOK</p>
             </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full text-stone-400 hover:text-stone-600 transition-colors ${closeBtnClass}`}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto rabbit-scroll space-y-6">
           
           {/* 1. TOP SECTION: Follow Us / Social Media */}
           <div className={`${cardBg} border-2 ${cardBorder} rounded-2xl p-5 flex flex-col items-center gap-4 text-center shadow-sm`}>
              <div className="flex items-center gap-2">
                 <img src={RABBIT_AVATAR_URL} className="w-8 h-8 object-contain" alt="Rabbit" />
                 <h3 className={`font-bold ${textMain} text-base`}>
                   追蹤看房粉粉兔
                 </h3>
              </div>
              <p className={`text-xs ${textMuted} leading-relaxed max-w-sm`}>
                 想看詳細建案懶人包？想要知道粉粉兔怎麼看?<br/>
                 歡迎追蹤粉粉兔的Threads 或 加入LINE官方<FluentEmoji emoji="🐧" size={14} />
              </p>
              
              <div className="flex gap-3 w-full justify-center">
                 <a 
                   href={THREADS_URL} 
                   target="_blank" 
                   rel="noreferrer"
                   className={`flex-1 max-w-[160px] px-4 py-3 bg-black hover:bg-stone-800 text-white text-xs md:text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2`}
                 >
                   <AtSign size={18} />
                   <span className="hidden md:inline">Threads 追蹤</span>
                   <span className="md:hidden">Threads</span>
                 </a>
                 <a 
                   href={LINE_URL} 
                   target="_blank" 
                   rel="noreferrer"
                   className="flex-1 max-w-[160px] px-4 py-3 bg-[#06C755] hover:bg-[#05b34c] text-white text-xs md:text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                 >
                   <MessageCircle size={18} />
                   <span className="hidden md:inline">加入 LINE 好友</span>
                   <span className="md:hidden">@LINE</span>
                 </a>
              </div>
           </div>

           {/* 2. MIDDLE SECTION: Features Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, idx) => (
                <div key={idx} className={`rounded-2xl p-4 border-2 ${feature.color}`}>
                   <div className="flex items-center gap-2 mb-2 font-bold text-lg">
                      {feature.icon}
                      <span>{feature.title}</span>
                   </div>
                   {feature.content}
                </div>
              ))}
           </div>

           {/* 3. BOTTOM SECTION: Scorer Intro & Standalone Link */}
           <div className={`rounded-2xl p-5 border-2 ${commonCardStyle} ${themeColor === 'pink' ? 'text-pink-600' : themeColor === 'sky' ? 'text-sky-600' : 'text-night-pink-primary'}`}>
              <div className="flex items-center gap-2 mb-3 font-bold text-lg">
                  <Calculator size={20} />
                  <span>粉粉兔偽客觀評分器</span>
              </div>
              
              <div className={`text-xs text-stone-600 leading-relaxed mb-4`}>
                 參考 <span className={`font-bold text-stone-700`}>300+ 筆預售屋評比資料</span> + <span className={`font-bold text-stone-700`}>建材等級加權</span> + <span className={`font-bold text-stone-700`}>基準分</span> = 只有粉粉兔才有的標準<FluentEmoji emoji="🐰" size={14} />
              </div>

              <div className={`bg-white border-stone-200 rounded-xl p-4 border`}>
                <p className={`mb-3 font-bold text-sm text-center ${themeColor === 'pink' ? 'text-pink-600' : themeColor === 'sky' ? 'text-sky-600' : 'text-night-pink-primary'}`}>
                   已經明確知道自己想要什麼案子？
                </p>
                <a 
                  href={STANDALONE_SCORER_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-full flex items-center justify-center gap-2 border py-3 rounded-xl font-bold transition-colors shadow-sm active:scale-95 ${themeColor === 'pink' ? 'bg-pink-50 hover:bg-pink-100 text-pink-600 border-pink-200' : themeColor === 'sky' ? 'bg-sky-50 hover:bg-sky-100 text-sky-600 border-sky-200' : 'bg-night-pink-primary/10 hover:bg-night-pink-primary/20 text-night-pink-primary border-night-pink-primary/30'}`}
                >
                  <Gamepad2 size={18} />
                  <span>直接玩評分器獨立版</span>
                  <ExternalLink size={14} className="opacity-50"/>
                </a>
                <p className={`text-[10px] ${textMutedLight} mt-2 text-center`}>
                  (支援一次篩選多種條件標籤跟區域喔！)
                </p>
              </div>
           </div>

           <div className="mt-2 text-center">
              <button 
                onClick={onClose}
                className={`px-8 py-2.5 ${themeColor === 'pink' ? 'bg-[#FF7BA8] hover:bg-[#ff6497] shadow-pink-200' : themeColor === 'sky' ? 'bg-sky-400 hover:bg-sky-500 shadow-sky-200' : 'bg-night-pink-primary hover:bg-night-pink-secondary shadow-stone-300'} text-white rounded-xl font-bold shadow-lg transition-all active:scale-95`}
              >
                我知道了，開始看房！
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default GuideModal;
