
import React, { useRef } from 'react';
import { Download, Share2, CheckCircle2, Calendar, MapPin, Building2, Hammer, User } from 'lucide-react';
import { FluentEmoji } from '../utils/fluentEmoji';
import { ThemeColor } from '../App';
import * as htmlToImage from 'html-to-image';
import download from 'downloadjs';

interface CertificationCardProps {
  data: any;
  themeColor: ThemeColor;
  onClose: () => void;
}

const CertificationCard: React.FC<CertificationCardProps> = ({ data, themeColor, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (cardRef.current === null) return;
    
    try {
      // Use a higher scale for better quality
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        // Skip problematic external stylesheets if they still cause issues
        filter: (node: any) => {
          if (node.tagName === 'LINK' && node.rel === 'stylesheet' && !node.href.includes(window.location.hostname)) {
            return false;
          }
          return true;
        }
      });
      download(dataUrl, `粉粉兔認證-${data.name}.png`);
    } catch (err) {
      console.error('Oops, something went wrong!', err);
    }
  };

  const accentBg = themeColor === 'pink' ? 'bg-pink-500' : themeColor === 'sky' ? 'bg-sky-500' : 'bg-night-pink-primary';

  const InfoItem = ({ label, value, emoji }: { label: string, value: string | boolean | string[], emoji: string }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    
    let displayValue = "";
    if (typeof value === 'boolean') displayValue = value ? "有" : "無";
    else if (Array.isArray(value)) displayValue = value.join(', ');
    else displayValue = String(value);

    return (
      <div className="bg-stone-50/80 rounded-xl p-2.5 border border-stone-100 flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
           <FluentEmoji emoji={emoji} size={12} />
           <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">{label}</span>
        </div>
        <div className="text-[11px] font-black text-stone-700 truncate">{displayValue}</div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500 max-w-full">
      {/* The Printable Card */}
      <div 
        ref={cardRef}
        className="w-[380px] bg-white rounded-[3rem] overflow-hidden shadow-2xl border-[10px] border-pink-100 relative p-7 flex flex-col gap-5"
      >
        {/* Background Decoration */}
        <div className="absolute -top-12 -right-12 opacity-[0.07] rotate-12 pointer-events-none">
           <FluentEmoji emoji="🐰" size={240} />
        </div>
        <div className="absolute -bottom-10 -left-10 opacity-[0.05] -rotate-12 pointer-events-none">
           <FluentEmoji emoji="🥕" size={180} />
        </div>
        
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-1 relative z-10">
          <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-1 shadow-inner border-2 border-pink-100 -space-x-2">
             <FluentEmoji emoji="🐰" size={32} />
             <FluentEmoji emoji="📜" size={32} />
          </div>
          <h2 className="text-xl font-black text-stone-800 tracking-tight">粉粉兔看房認證卡</h2>
          <div className="px-3 py-0.5 bg-pink-500 text-white text-[9px] font-black rounded-full uppercase tracking-widest shadow-sm">
            Official Estate Report
          </div>
        </div>

        {/* Main Info Section */}
        <div className="space-y-3 relative z-10">
          {/* Project Header */}
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-[2rem] p-5 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
               <Building2 size={60} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-widest">Project Name</span>
              </div>
              <div className="text-2xl font-black mb-1 drop-shadow-sm">{data.name}</div>
              <div className="flex items-center gap-1 text-xs font-bold opacity-90">
                 <MapPin size={14} />
                 {data.region}
              </div>
            </div>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-2">
             <InfoItem label="管理費" value={data.managementFee ? `${data.managementFee} 元/坪` : ""} emoji="💰" />
             <InfoItem label="樓高" value={data.floorHeight ? `${data.floorHeight} 米` : ""} emoji="📏" />
             <InfoItem label="窗戶品牌" value={data.windowBrand} emoji="🪟" />
             <InfoItem label="玻璃規格" value={data.glassType} emoji="💎" />
             <InfoItem label="廚具品牌" value={data.kitchenBrand} emoji="🍳" />
             <InfoItem label="衛浴品牌" value={data.bathroomBrands} emoji="🚿" />
             <InfoItem label="地板建材" value={data.flooring} emoji="🪵" />
             <InfoItem label="淨水系統" value={data.waterSystem} emoji="💧" />
          </div>

          {/* Features Tags */}
          {data.features && data.features.length > 0 && (
            <div className="flex flex-wrap gap-1">
               {data.features.map((f: string) => (
                 <span key={f} className="text-[8px] font-bold bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-md border border-stone-200">
                   #{f}
                 </span>
               ))}
            </div>
          )}

          {/* Boolean Features */}
          <div className="flex flex-wrap gap-1.5">
             {data.hasDishwasher && <div className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black border border-blue-100 flex items-center gap-1"><FluentEmoji emoji="🧼" size={10}/> 洗碗機</div>}
             {data.hasApplianceCabinet && <div className="px-2 py-1 bg-orange-50 text-orange-600 rounded-lg text-[9px] font-black border border-orange-100 flex items-center gap-1"><FluentEmoji emoji="🍱" size={10}/> 電器櫃</div>}
             {data.hasOven && <div className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-[9px] font-black border border-red-100 flex items-center gap-1"><FluentEmoji emoji="🔥" size={10}/> 烤箱</div>}
             {data.hasSmartToilet && <div className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black border border-indigo-100 flex items-center gap-1"><FluentEmoji emoji="🚽" size={10}/> 智慧馬桶</div>}
          </div>

          {/* Submitter Section */}
          <div className="bg-stone-800 rounded-2xl p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <FluentEmoji emoji={data.userEmoji} size={24} />
               </div>
               <div>
                  <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">特約投稿人</div>
                  <div className="text-sm font-black">{data.userName}</div>
               </div>
            </div>
            <div className="text-right">
               <div className="text-[8px] font-bold text-stone-500 uppercase">Serial Number</div>
               <div className="text-[10px] font-mono font-bold text-pink-400">PR-{Math.floor(Math.random() * 90000) + 10000}</div>
            </div>
          </div>

          {/* Notes Section */}
          {data.notes && (
            <div className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-3 relative">
               <div className="absolute -top-2 -left-1">
                  <FluentEmoji emoji="📝" size={14} />
               </div>
               <div className="text-[9px] text-stone-600 font-medium leading-relaxed italic">
                 「 {data.notes} 」
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-dashed border-stone-200 flex justify-between items-center relative z-10">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-[9px] text-stone-400 font-bold">
              <Calendar size={10} />
              認證日期: {new Date().toLocaleDateString()}
            </div>
            <div className="text-[8px] text-stone-300 font-medium italic">
              * 資料由網友提供，粉粉兔審核中
            </div>
          </div>
          <div className="flex items-center gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></div>
             <span className="text-[9px] font-black text-pink-500 uppercase tracking-widest">Verified</span>
          </div>
        </div>

        {/* Official Stamp */}
        <div className="absolute bottom-16 right-4 rotate-12 opacity-90 pointer-events-none">
           <div className="w-14 h-14 border-[3px] border-pink-500/30 rounded-full flex items-center justify-center flex-col leading-none scale-110">
              <span className="text-[7px] font-black text-pink-500/40 uppercase">Pink</span>
              <span className="text-[10px] font-black text-pink-500/40 uppercase tracking-tighter">Rabbit</span>
              <span className="text-[7px] font-black text-pink-500/40 uppercase">Approved</span>
           </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3 w-full max-w-[380px] px-4">
        <button 
          onClick={handleDownload}
          className={`flex-1 py-3.5 rounded-2xl ${accentBg} text-white font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm`}
        >
          <Download size={18} />
          保存紀念卡
        </button>
        <button 
          onClick={onClose}
          className="px-5 py-3.5 rounded-2xl bg-stone-100 text-stone-500 font-black hover:bg-stone-200 transition-all active:scale-95 text-sm"
        >
          關閉
        </button>
      </div>
      
      <p className="mt-4 text-[10px] text-stone-400 font-bold tracking-wide uppercase">
        🐰 截圖或保存圖片即可分享給好友喔！
      </p>
    </div>
  );
};

export default CertificationCard;
