
import React, { useState } from 'react';
import { EstateProject } from '../types';
import { X, Swords, Trash2, ArrowRight, Minus, ChevronUp } from 'lucide-react';
import { ThemeColor } from '../App';
import { FluentEmoji } from '../utils/fluentEmoji';

interface CompareWidgetProps {
  compareList: EstateProject[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onStart: () => void;
  themeColor: ThemeColor;
  onOpenAsk?: () => void;
}

const CompareWidget: React.FC<CompareWidgetProps> = ({ compareList, onRemove, onClear, onStart, themeColor }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (compareList.length === 0) return null;

  // Color mappings
  const borderColor = themeColor === 'pink' ? 'border-pink-100' : themeColor === 'sky' ? 'border-sky-100' : 'border-night-pink-primary';
  const headerBorder = themeColor === 'pink' ? 'border-pink-50' : themeColor === 'sky' ? 'border-sky-50' : 'border-night-pink-primary/20';
  const accentText = themeColor === 'pink' ? 'text-pink-500' : themeColor === 'sky' ? 'text-sky-500' : 'text-night-pink-primary';
  const itemBg = themeColor === 'pink' ? 'bg-pink-50 border-pink-200' : themeColor === 'sky' ? 'bg-sky-50 border-sky-200' : 'bg-night-pink-primary/10 border-night-pink-primary';
  const btnClass = themeColor === 'pink' ? 'bg-pink-500 hover:bg-pink-600' : themeColor === 'sky' ? 'bg-sky-500 hover:bg-sky-600' : 'bg-night-pink-primary hover:bg-night-pink-secondary';
  const minimizedIconBg = themeColor === 'pink' ? 'bg-pink-500' : themeColor === 'sky' ? 'bg-sky-500' : 'bg-night-pink-primary';
  const minimizedHoverText = themeColor === 'pink' ? 'hover:text-pink-500 hover:bg-pink-50' : themeColor === 'sky' ? 'hover:text-sky-500 hover:bg-sky-50' : 'hover:text-night-pink-primary hover:bg-night-pink-primary/10';
  
  // Revert Widget Background to White for clarity
  const widgetBg = 'bg-white';

  if (isMinimized) {
    return (
      <div className="fixed bottom-24 right-4 md:right-8 z-[1500] animate-in slide-in-from-bottom-5 duration-300">
        <button
          onClick={() => setIsMinimized(false)}
          className={`${widgetBg} rounded-full shadow-xl border-4 ${borderColor} p-3 flex items-center gap-2 hover:scale-105 transition-transform`}
        >
          <div className={`${minimizedIconBg} text-white p-1.5 rounded-full`}>
            <Swords size={16} />
          </div>
          <span className={`font-bold text-sm ${themeColor === 'dark' ? 'text-stone-600' : 'text-stone-600'}`}>
            PK ({compareList.length})
          </span>
          <ChevronUp size={16} className="text-stone-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 md:right-8 z-[1500] animate-in slide-in-from-bottom-5 duration-300">
      <div className={`${widgetBg} rounded-3xl shadow-2xl border-4 ${borderColor} p-3 md:p-4 w-[300px] md:w-[340px]`}>
        
        {/* Header */}
        <div className={`flex justify-between items-center mb-3 border-b ${headerBorder} pb-2`}>
          <div className={`flex items-center gap-2 ${accentText} font-bold`}>
            <Swords size={20} />
            <span>粉粉兔幫你看 ({compareList.length}/3)</span>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={onClear}
              className={`text-xs flex items-center gap-1 transition-colors px-2 py-1 rounded-md text-stone-400 hover:text-red-400 hover:bg-stone-50`}
              title="清空列表"
            >
              <Trash2 size={12} /> 清空
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className={`p-1 rounded-full transition-colors text-stone-400 ${minimizedHoverText}`}
              title="最小化"
            >
              <Minus size={18} />
            </button>
          </div>
        </div>

        {/* Selected Items List */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
          {compareList.map((item) => (
            <div key={item.id} className="relative shrink-0 w-16 group">
              <button 
                onClick={() => onRemove(item.id)}
                className={`absolute -top-1 -right-1 rounded-full p-0.5 transition-colors z-10 bg-stone-200 text-stone-500 hover:bg-red-400 hover:text-white`}
              >
                <X size={12} />
              </button>
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center border-2 text-[10px] text-center p-1 overflow-hidden shadow-sm ${itemBg}`}>
                 <span className={`line-clamp-2 font-bold leading-tight text-stone-600`}>
                   {item.name}
                 </span>
              </div>
            </div>
          ))}
          
          {/* Empty Placeholders */}
          {[...Array(3 - compareList.length)].map((_, i) => (
            <div key={i} className={`shrink-0 w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center border-stone-200`}>
              <div className="opacity-20 grayscale filter">
                <FluentEmoji emoji="🐰" size={32} />
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={onStart}
          disabled={compareList.length < 2}
          className={`
            w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all
            ${compareList.length < 2 
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : `${btnClass} text-white hover:scale-[1.02] active:scale-95`
            }
          `}
        >
          {compareList.length < 2 ? (
            <span className="text-sm">請再選 {2 - compareList.length} 個建案</span>
          ) : (
            <>
              <span>開始 PK !</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

      </div>
    </div>
  );
};

export default CompareWidget;
