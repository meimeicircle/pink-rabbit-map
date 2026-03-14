
import React from 'react';
import { EstateProject } from '../types';
import { RABBIT_AVATAR_URL } from '../constants';
import { MapPin, Sparkles, Swords, Check, Zap } from 'lucide-react';
import { ThemeColor } from '../App';
import { FluentEmoji, TextWithFluentEmojis } from '../utils/fluentEmoji';

interface ProjectListProps {
  projects: EstateProject[];
  onSelect: (id: string) => void;
  selectedId: string | null;
  compareList: EstateProject[];
  onAddToCompare: (project: EstateProject) => void;
  onRemoveFromCompare: (id: string) => void;
  themeColor: ThemeColor;
}

const ProjectList: React.FC<ProjectListProps> = ({ 
  projects, 
  onSelect, 
  selectedId,
  compareList,
  onAddToCompare,
  onRemoveFromCompare,
  themeColor
}) => {
  
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-stone-400 flex flex-col items-center">
        <div className="w-20 h-20 opacity-50 mb-4 transition-all duration-500">
          <img src={RABBIT_AVATAR_URL} alt="Nothing found" className="w-full h-full object-contain" />
        </div>
        <p className="mb-1 font-medium">找不到符合的建案耶...</p>
        <p className="text-xs text-stone-300">請重新搜尋或選擇其他區域</p>
      </div>
    );
  }

  // 訴求文字拆解器
  const renderSellingPoints = (text: string) => {
    // 修正：要求數字後面必須有點和空白 (例如 "1. ") 才進行切割，避免切斷小數點
    const items = text
      .split(/(?:\d+\.\s|[、；\n]+)/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    return (
      <div className="flex flex-wrap gap-1.5 mt-1">
        {items.map((item, i) => (
          <span 
            key={i} 
            className={`flex items-center text-[11px] font-bold border px-2 py-0.5 rounded-md leading-tight ${themeColor === 'pink' ? 'text-pink-500 bg-pink-50 border-pink-100' : themeColor === 'sky' ? 'text-sky-500 bg-sky-50 border-sky-100' : 'text-white bg-night-600 border-night-600'}`}
          >
            <Sparkles size={10} className="mr-1 shrink-0" fill="currentColor" />
            <TextWithFluentEmojis text={item} emojiSize={12} />
          </span>
        ))}
      </div>
    );
  };

  const getCardClasses = (isSelected: boolean) => {
    const base = "relative rounded-3xl p-4 transition-all duration-200 cursor-pointer border-2";
    if (themeColor === 'dark') {
      // Dark Mode: Card is Light (Night-800) because sidebar is Dark (Night-900)
      return isSelected 
        ? `${base} bg-night-800 border-night-pink-primary shadow-xl shadow-night-pink-primary/20 scale-[1.01] z-10`
        : `${base} bg-night-800 border-transparent hover:border-night-pink-primary/50 hover:shadow-md`;
    }
    // Light themes
    return isSelected 
      ? `${base} bg-white ${themeColor === 'pink' ? 'border-pink-400' : 'border-sky-400'} shadow-xl scale-[1.01] z-10`
      : `${base} bg-white/90 border-white ${themeColor === 'pink' ? 'hover:border-pink-100' : 'hover:border-sky-100'} hover:shadow-md`;
  };

  return (
    <div className="grid grid-cols-1 gap-3 pb-20 md:pb-0">
      {projects.map((project) => {
        const isSelected = selectedId === project.id;
        const isInCompare = compareList.some(p => p.id === project.id);

        return (
          <div
            key={project.id}
            onClick={() => onSelect(project.id)}
            className={getCardClasses(isSelected)}
          >
            <div className="flex gap-3">
              
              {/* LEFT SIDE: Info & Stats */}
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                
                {/* Header: Name & Region */}
                <div>
                  <h3 className={`text-xl font-black leading-tight mb-1 truncate ${themeColor === 'dark' ? 'text-night-200' : 'text-stone-800'}`}>
                    <TextWithFluentEmojis text={project.name} emojiSize={20} />
                  </h3>
                  <div className="flex items-center text-xs text-stone-500 font-bold gap-2">
                     <div className="flex items-center">
                        <MapPin size={12} className={`mr-0.5 ${themeColor === 'pink' ? 'text-pink-500' : themeColor === 'sky' ? 'text-sky-500' : 'text-night-pink-primary'}`} fill="currentColor" />
                        <span className={themeColor === 'dark' ? 'text-night-300' : ''}>{project.region}</span>
                     </div>
                     {project.submitter && (
                        <div className={`relative flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] ${themeColor === 'dark' ? 'bg-night-700 text-night-pink-primary border-night-600' : 'bg-yellow-50 text-yellow-700 border-yellow-100'} border shadow-sm`}>
                           <FluentEmoji emoji={project.submitter.emoji} size={10} />
                           <span>{project.submitter.name} 投稿</span>
                        </div>
                     )}
                  </div>
                </div>

                {/* Stats Box */}
                <div className={`rounded-2xl p-3 grid grid-cols-2 gap-y-2 gap-x-2 border ${themeColor === 'dark' ? 'bg-night-700 border-night-600' : 'bg-stone-50 border-stone-100'}`}>
                   {/* 坪數 */}
                   <div className="flex items-center gap-1.5 min-w-0">
                      <FluentEmoji emoji="🏠" size={16} />
                      <span className={`text-xs font-bold truncate ${themeColor === 'dark' ? 'text-night-200' : 'text-stone-600'}`}>{project.mainSquareFootage || '-'}</span>
                   </div>
                   {/* 戶數 */}
                   <div className="flex items-center gap-1.5 min-w-0">
                      <FluentEmoji emoji="👥" size={16} />
                      <span className={`text-xs font-bold truncate ${themeColor === 'dark' ? 'text-night-200' : 'text-stone-600'}`}>{project.totalUnits ? `${project.totalUnits}戶` : '-'}</span>
                   </div>
                   {/* 基地 */}
                   <div className="flex items-center gap-1.5 min-w-0">
                      <FluentEmoji emoji="📐" size={16} />
                      <span className={`text-xs font-bold truncate ${themeColor === 'dark' ? 'text-night-200' : 'text-stone-600'}`}>{project.baseArea ? `${project.baseArea}坪` : '-'}</span>
                   </div>
                   {/* 公設 */}
                   <div className="flex items-center gap-1.5 min-w-0">
                      <FluentEmoji emoji="🌳" size={16} />
                      <span className={`text-xs font-bold truncate ${themeColor === 'dark' ? 'text-night-200' : 'text-stone-600'}`}>{project.publicRatio ? `公設 ${project.publicRatio}` : '-'}</span>
                   </div>
                </div>

                {/* Selling Points (Moved Here) */}
                {project.sellingPoint && renderSellingPoints(project.sellingPoint)}

              </div>

              {/* RIGHT SIDE: Materials & Score */}
              <div className={`w-[38%] max-w-[140px] flex flex-col justify-between pl-2 border-l border-dashed ${themeColor === 'dark' ? 'border-night-400' : 'border-stone-100'}`}>
                 
                 {/* Material Tags (Top Right) */}
                 <div>
                    <div className={`flex items-center gap-1 text-[10px] font-bold ${themeColor === 'dark' ? 'text-night-300' : 'text-stone-400'} mb-1.5`}>
                       <Zap size={10} fill="currentColor"/> 建材標籤
                    </div>
                    <div className="flex flex-col gap-1.5 items-start">
                      {project.materialTags ? (
                        project.materialTags.split('|').slice(0, 3).map((tag, i) => (
                           <span key={i} className={`relative text-[10px] px-1.5 py-0.5 rounded-md border truncate max-w-full block ${themeColor === 'dark' ? 'bg-night-900 text-white border-night-900' : 'bg-stone-100 text-stone-600 border-stone-200'}`}>
                              <TextWithFluentEmojis text={tag.trim()} emojiSize={12} />
                           </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-stone-300">-</span>
                      )}
                      {(project.materialTags && project.materialTags.split('|').length > 3) && (
                        <span className="text-[10px] text-stone-300 pl-1">...</span>
                      )}
                    </div>
                 </div>

                 {/* Score (Bottom Right) */}
                 <div className="mt-2 flex justify-end">
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center bg-gradient-to-br border-2 shadow-sm ${themeColor === 'pink' ? 'from-white to-white border-pink-100' : themeColor === 'sky' ? 'from-white to-white border-sky-100' : 'from-night-700 to-night-700 border-night-600'}`}>
                        <span className={`text-2xl font-black leading-none ${themeColor === 'pink' ? 'text-pink-300' : themeColor === 'sky' ? 'text-sky-300' : 'text-night-400'}`}>?</span>
                        <span className={`text-[9px] font-bold mt-0.5 ${themeColor === 'pink' ? 'text-pink-400' : themeColor === 'sky' ? 'text-sky-400' : 'text-night-300'}`}>
                          點擊揭曉
                        </span>
                    </div>
                 </div>

              </div>
            </div>

            {/* Bottom: Actions */}
            <div className={`mt-3 pt-2 border-t flex justify-end ${themeColor === 'dark' ? 'border-night-400' : 'border-stone-50'}`}>
               <button
                 onClick={(e) => {
                   e.stopPropagation();
                   isInCompare ? onRemoveFromCompare(project.id) : onAddToCompare(project);
                 }}
                 className={`
                   flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm active:scale-95
                   ${isInCompare 
                     ? (themeColor === 'pink' ? 'bg-pink-100 text-pink-600 border-pink-200' : themeColor === 'sky' ? 'bg-sky-100 text-sky-600 border-sky-200' : 'bg-night-pink-primary text-white border-night-pink-primary')
                     : (themeColor === 'dark' ? 'bg-white text-night-pink-primary border-night-pink-primary hover:bg-night-700 hover:text-white' : `bg-white text-stone-500 border-stone-200 ${themeColor === 'pink' ? 'hover:bg-pink-50 hover:text-pink-500 hover:border-pink-200' : 'hover:bg-sky-50 hover:text-sky-500 hover:border-sky-200'}`)
                   }
                 `}
               >
                 {isInCompare ? <Check size={12} strokeWidth={3} /> : <Swords size={12} />}
                 <span>{isInCompare ? '已加入PK' : '加入PK'}</span>
               </button>
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default ProjectList;
