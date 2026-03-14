
import React, { useState, useEffect, useRef } from 'react';
import { EstateProject, RabbitVerdict } from '../types';
import { 
  X, MapPin, Sparkles, 
  Navigation, Swords, Check, 
  TrainFront, Droplets,
  Zap, ChefHat, Heart, FileSearch, Coins,
  ArrowUpFromLine, TreePine
} from 'lucide-react';
import { getVerdictStyle } from '../constants';
import { ThemeColor } from '../App';
import { FluentEmoji, TextWithFluentEmojis } from '../utils/fluentEmoji';

interface ProjectDrawerProps {
  project: EstateProject | null;
  onClose: () => void;
  compareList: EstateProject[];
  onAddToCompare: (project: EstateProject) => void;
  onRemoveFromCompare: (id: string) => void;
  themeColor: ThemeColor;
}

const SCAN_KEYWORDS = [
  "YKK AP", "TOTO", "SRC結構", "Low-E 玻璃", "中空樓板", 
  "V&B", "Hansgrohe", "Alfa Safe", "SHARP", "BWT 淨水",
  "制震壁", "充電樁", "防霾紗窗", "Kronotex", "Duravit",
  "Panasonic", "林內", "櫻花", "三菱電梯", "住友制震"
];

const ProjectDrawer: React.FC<ProjectDrawerProps> = ({ 
  project, 
  onClose,
  compareList,
  onAddToCompare,
  onRemoveFromCompare,
  themeColor
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0); 
  const [scanText, setScanText] = useState("掃描中...");

  // Swipe Gesture States
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchMove, setTouchMove] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (project) {
      setIsExpanded(false);
      setAnalysisStep(0);
      // Reset drag states
      setTouchStart(null);
      setTouchMove(null);
      setIsDragging(false);
    }
  }, [project]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (analysisStep === 2) {
      interval = setInterval(() => {
        const randomWord = SCAN_KEYWORDS[Math.floor(Math.random() * SCAN_KEYWORDS.length)];
        setScanText(randomWord);
      }, 80); 
    }
    return () => clearInterval(interval);
  }, [analysisStep]);

  if (!project) return null;

  const style = getVerdictStyle(project.verdict);
  const isInCompare = compareList.some(p => p.id === project.id);

  const handleRevealScore = () => {
    if (analysisStep > 0) return;
    setAnalysisStep(1); 
    setTimeout(() => setAnalysisStep(2), 1500);
    setTimeout(() => setAnalysisStep(3), 3000);
    setTimeout(() => setAnalysisStep(4), 5000);
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '😍';
    if (score >= 81) return '😎';
    return '🙈';
  };

  const renderSellingPointTags = (text: string) => {
    // 修正：要求數字後面必須有點和空白 (例如 "1. ") 才進行切割，避免切斷小數點
    const items = text.split(/(?:\d+\.\s|[、；\n]+)/).map(s => s.trim()).filter(s => s.length > 0);
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {items.map((item, i) => (
          <span key={i} className={`flex items-center text-sm font-bold border px-3 py-1.5 rounded-xl shadow-sm leading-tight h-fit whitespace-normal text-left ${themeColor === 'pink' ? 'text-pink-600 bg-pink-50 border-pink-200' : themeColor === 'sky' ? 'text-sky-600 bg-sky-50 border-sky-200' : 'text-white bg-night-600 border-night-600'}`}>
            <Sparkles size={14} className="mr-1.5 shrink-0" fill="currentColor" />
            <TextWithFluentEmojis text={item} emojiSize={14} />
          </span>
        ))}
      </div>
    );
  };

  // Helper to aggregate feature tags
  const getFeatureTags = (): string[] => {
    const tags = [
      project.trafficTags,
      project.featureMaterialTags,
      project.viewTags,
      project.waterproofTags,
      project.featureFloorTags
    ];
    
    return tags
      .filter((t): t is string => typeof t === 'string' && t.trim() !== '')
      .map(t => t.trim());
  };

  // Helper to get Tag Style
  const getTagStyle = (tag: string) => {
    if (tag.includes('建材') || tag.includes('讚')) {
      return {
        className: 'bg-[#FFF7ED] text-[#EA580C] border-[#FED7AA]', // Orange-ish
        icon: <Zap size={16} className="fill-orange-500 text-orange-500" />
      };
    }
    if (tag.includes('防水') || tag.includes('保固')) {
      return {
        className: 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]', // Light Blue
        icon: <Droplets size={16} className="fill-sky-400 text-sky-500" />
      };
    }
    if (tag.includes('樓高') || tag.includes('挑高')) {
      return {
        className: 'bg-[#FAF5FF] text-[#9333EA] border-[#E9D5FF]', // Purple
        icon: <ArrowUpFromLine size={16} className="text-purple-600" />
      };
    }
    if (tag.includes('捷運') || tag.includes('鐵') || tag.includes('站')) {
      return {
        className: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]', // Emerald
        icon: <TrainFront size={16} className="text-emerald-600" />
      };
    }
    if (tag.includes('景') || tag.includes('公園') || tag.includes('校')) {
      return {
        className: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]', // Green
        icon: <TreePine size={16} className="fill-green-500 text-green-600" />
      };
    }
    return {
      className: 'bg-stone-50 text-stone-600 border-stone-200',
      icon: <Sparkles size={16} className="text-stone-400" />
    };
  };

  // Helper for management fee display
  const getManagementFeeDisplay = () => {
    if (!project.managementFee) return '-';
    // If it already contains "元" or "坪", don't append unit
    if (project.managementFee.includes('元') || project.managementFee.includes('坪')) {
      return project.managementFee;
    }
    return `${project.managementFee}元/坪`;
  };

  // Helper for floor height display
  const getFloorHeightDisplay = () => {
    if (project.floorHeightMeters) return `${project.floorHeightMeters}米`;
    // Fallback to text tag if numeric is missing but tag exists
    if (project.floorHeight) return project.floorHeight;
    return '-';
  };

  // --- Gesture Handlers ---
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow drag if scrolled to top
    if (contentRef.current && contentRef.current.scrollTop <= 0) {
      setTouchStart(e.touches[0].clientY);
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !isDragging) return;
    const currentY = e.touches[0].clientY;
    
    // Only track downward movement
    if (currentY > touchStart) {
      setTouchMove(currentY);
    }
  };

  const handleTouchEnd = () => {
    if (touchStart && touchMove) {
      const distance = touchMove - touchStart;
      // Threshold to close: 100px
      if (distance > 100) {
        onClose();
      }
    }
    // Reset
    setTouchStart(null);
    setTouchMove(null);
    setIsDragging(false);
  };

  // Calculate transform for drag effect
  const dragTranslateY = (touchStart && touchMove && touchMove > touchStart) ? (touchMove - touchStart) : 0;

  // Scorer Styles based on Theme
  const scorerStyles = {
    container: analysisStep === 4 
      ? `bg-dot-pattern ${themeColor === 'pink' ? 'border-[#FF9DBE] shadow-xl shadow-pink-100/50' : themeColor === 'sky' ? 'border-sky-300 shadow-xl shadow-sky-100/50' : 'border-night-pink-primary shadow-xl shadow-night-pink-primary/30'}` 
      : `${themeColor === 'pink' ? 'bg-[#FFE8EE]' : themeColor === 'sky' ? 'bg-[#E0F2FE]' : 'bg-night-800'} border-white shadow-inner`,
    button: themeColor === 'pink' 
      ? 'bg-[#FF7BA8] hover:bg-[#ff6497] shadow-pink-200' 
      : themeColor === 'sky' ? 'bg-sky-400 hover:bg-sky-500 shadow-sky-200'
      : 'bg-night-pink-primary hover:bg-night-pink-secondary shadow-night-700 text-white',
    heartIcon: themeColor === 'pink' ? 'text-pink-300' : themeColor === 'sky' ? 'text-sky-300' : 'text-night-400',
    step2Icon: themeColor === 'pink' ? 'text-purple-400 bg-purple-50 border-purple-100' : themeColor === 'sky' ? 'text-blue-400 bg-blue-50 border-blue-100' : 'text-white bg-night-pink-primary border-night-600',
    step2Text: themeColor === 'pink' ? 'text-purple-600 bg-purple-100' : themeColor === 'sky' ? 'text-blue-600 bg-blue-100' : 'text-white bg-night-pink-primary',
    step3Heart: themeColor === 'pink' ? 'text-[#FF4E80]' : themeColor === 'sky' ? 'text-sky-500' : 'text-night-pink-primary',
    step3Text: themeColor === 'pink' ? 'text-[#FF4E80]' : themeColor === 'sky' ? 'text-sky-500' : 'text-night-pink-primary',
    scoreText: themeColor === 'pink' ? 'text-[#EC4899]' : themeColor === 'sky' ? 'text-sky-500' : 'text-night-pink-primary',
    scoreShadow: themeColor === 'pink' ? '4px 4px 0px #fff, 8px 8px 0px #fbcfe8' : themeColor === 'sky' ? '4px 4px 0px #fff, 8px 8px 0px #bae6fd' : '4px 4px 0px #fff, 8px 8px 0px #292524',
    badge: themeColor === 'pink' ? 'bg-[#be185d]' : themeColor === 'sky' ? 'bg-sky-600' : 'bg-night-pink-primary text-white',
  };

  // Drawer Container Styles
  const drawerContainerClasses = themeColor === 'pink' 
    ? 'bg-[#F7ECE6] md:border-[#FF9DBE]' 
    : themeColor === 'sky' 
      ? 'bg-[#F3F4F6] md:border-sky-300' 
      : 'bg-night-900 md:border-night-700'; // Night-900 Background

  // Drawer Content Text
  const drawerTextMain = themeColor === 'dark' ? 'text-night-200' : 'text-[#5C4B47]';
  const drawerBgMain = themeColor === 'dark' ? 'bg-night-800 border-white/10' : 'bg-white border-white'; 

  // Label Color for Dark Mode Contrast
  const labelColor = themeColor === 'dark' ? 'text-night-300' : 'text-stone-400';

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-[1900] md:z-[1050] md:bg-transparent pointer-events-auto" onClick={onClose} />

      <div 
        className={`
          fixed z-[2000] shadow-2xl flex flex-col overflow-hidden text-[#5C4B47] overscroll-none
          md:top-16 md:right-6 md:bottom-6 md:w-[800px] md:rounded-[2rem] md:border-4 md:transition-transform md:duration-300 md:ease-out
          bottom-0 left-0 right-0 rounded-t-[2rem] max-h-[85vh] md:max-h-[calc(100vh-6rem)]
          ${drawerContainerClasses}
          ${!isDragging ? 'transition-transform duration-300 ease-out' : ''} 
        `}
        style={{
          transform: window.innerWidth < 768 
            ? `translateY(${project ? Math.max(0, dragTranslateY) : '100%'}px)` 
            : (project ? 'translateX(0)' : 'translateX(120%)')
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* Mobile Handle Bar */}
        <div 
          className={`w-full h-8 flex justify-center items-center md:hidden shrink-0 cursor-grab active:cursor-grabbing touch-none ${themeColor === 'pink' ? 'bg-[#F7ECE6]' : themeColor === 'sky' ? 'bg-[#F3F4F6]' : 'bg-night-900'}`} 
          onClick={() => setIsExpanded(!isExpanded)}
        >
           <div className={`w-12 h-1.5 rounded-full ${themeColor === 'pink' ? 'bg-[#D9A7B5]/50' : themeColor === 'sky' ? 'bg-stone-300' : 'bg-night-700'}`}></div>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 z-20 bg-white/60 p-2 rounded-full hover:bg-white shadow-sm transition-all hidden md:block">
          <X size={20} className="text-[#5C4B47]" />
        </button>

        <div ref={contentRef} className="flex-1 overflow-y-auto rabbit-scroll relative p-6 pb-24 overscroll-contain">
          <div className="flex flex-col md:flex-row gap-6 min-h-full w-full">

             {/* LEFT SIDE */}
             <div className={`flex-1 rounded-3xl p-5 md:p-6 shadow-sm border flex flex-col gap-4 ${drawerBgMain}`}>
                <div>
                   <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${style.bg} ${style.color} border ${style.border} flex items-center gap-1`}>
                         {style.label} {project.verdict === RabbitVerdict.RECOMMEND ? <FluentEmoji emoji="💖" size={16}/> : ''}
                      </span>
                   </div>
                   <h2 className={`text-[28px] font-bold leading-tight mb-2 mt-1 ${drawerTextMain}`}>
                     <TextWithFluentEmojis text={project.name} emojiSize={24} />
                   </h2>
                   
                   {/* 網友投稿徽章 - Submitter Badge */}
                   {project.submitter && (
                      <div className="relative mt-1 mb-2 inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-full text-xs font-bold border border-yellow-200 shadow-sm animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="relative flex items-center justify-center bg-white rounded-full w-5 h-5 shadow-sm border border-yellow-100">
                           <FluentEmoji emoji={project.submitter.emoji} size={14} />
                        </div>
                        <span>感謝 {project.submitter.name} 投稿回報</span>
                      </div>
                   )}

                   <div className={`flex flex-wrap items-center gap-3 text-sm md:text-base font-medium ${themeColor === 'dark' ? 'text-night-300' : 'text-[#7A6E6A]'}`}>
                      <div className="flex items-center gap-1"><MapPin size={16} /> {project.region}</div>
                      {project.nearestMRT && (
                        <div className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-lg text-xs ${themeColor === 'pink' ? 'text-pink-500 bg-pink-50' : themeColor === 'sky' ? 'text-sky-500 bg-sky-50' : 'text-white bg-night-600'}`}>
                            <TrainFront size={14} />
                            <span>{project.nearestMRT.name}站 {project.nearestMRT.distance || ''}</span>
                        </div>
                      )}
                   </div>
                </div>

                <div className={`rounded-2xl p-4 grid grid-cols-2 gap-3 border shadow-inner ${themeColor === 'dark' ? 'bg-night-700 border-night-700' : 'bg-stone-50 border-stone-100'}`}>
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-1.5 mb-1"><FluentEmoji emoji="🏠" size={20} /><span className={`text-xs font-bold ${labelColor}`}>坪數規劃</span></div>
                        <span className={`text-sm font-bold break-words ${themeColor === 'dark' ? 'text-night-200' : 'text-stone-700'}`}>{project.mainSquareFootage || '-'}</span>
                    </div>
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-1.5 mb-1"><FluentEmoji emoji="👥" size={20} /><span className={`text-xs font-bold ${labelColor}`}>住家戶數</span></div>
                        <span className={`text-sm font-bold ${themeColor === 'dark' ? 'text-night-200' : 'text-stone-700'}`}>{project.totalUnits ? `${project.totalUnits}戶` : '-'}</span>
                    </div>
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-1.5 mb-1"><FluentEmoji emoji="📐" size={20} /><span className={`text-xs font-bold ${labelColor}`}>基地面積</span></div>
                        <span className={`text-sm font-bold ${themeColor === 'dark' ? 'text-night-200' : 'text-stone-700'}`}>{project.baseArea ? `${project.baseArea}坪` : '-'}</span>
                    </div>
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-1.5 mb-1"><FluentEmoji emoji="🌳" size={20} /><span className={`text-xs font-bold ${labelColor}`}>公設比</span></div>
                        <span className={`text-sm font-bold ${themeColor === 'dark' ? 'text-night-200' : 'text-stone-700'}`}>{project.publicRatio ? `${project.publicRatio}` : '-'}</span>
                    </div>
                    
                    {/* Management Fee & Floor Height Split */}
                    <div className="flex flex-col justify-center border-t pt-2 border-dashed border-stone-200/50">
                        <div className="flex items-center gap-1.5 mb-1"><Coins size={16} className="text-yellow-500" /><span className={`text-xs font-bold ${labelColor}`}>管理費</span></div>
                        <span className={`text-sm font-bold ${themeColor === 'dark' ? 'text-night-200' : 'text-stone-700'}`}>
                          {getManagementFeeDisplay()}
                        </span>
                    </div>
                    <div className="flex flex-col justify-center border-t pt-2 border-dashed border-stone-200/50">
                        <div className="flex items-center gap-1.5 mb-1"><ArrowUpFromLine size={16} className="text-purple-500" /><span className={`text-xs font-bold ${labelColor}`}>樓高 (米)</span></div>
                        <span className={`text-sm font-bold ${themeColor === 'dark' ? 'text-night-200' : 'text-stone-700'}`}>
                          {getFloorHeightDisplay()}
                        </span>
                    </div>
                </div>

                <div className="mt-auto pt-2">
                   {project.sellingPoint && renderSellingPointTags(project.sellingPoint)}
                </div>
             </div>

             {/* RIGHT SIDE */}
             <div className="flex-1 shrink-0 flex flex-col gap-4 min-w-0">
                <div className={`rounded-3xl p-4 border shadow-sm ${drawerBgMain}`}>
                    <div className={`flex items-center gap-2 text-sm font-bold mb-3 ${drawerTextMain}`}>
                        <div className="p-1 bg-yellow-100 rounded text-yellow-600"><Zap size={14} fill="currentColor"/></div>
                        <span>建材標籤</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {project.materialTags ? project.materialTags.split('|').map((t, i) => (
                              <span key={i} className={`relative text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors cursor-default ${themeColor === 'dark' ? 'bg-night-700 text-night-200 border-night-700' : 'text-[#5C4B47] bg-[#F5EFEA] border-[#E5D8D2] hover:bg-white'}`}>
                                <TextWithFluentEmojis text={t.trim()} emojiSize={14} />
                              </span>
                           )) : <span className="text-xs text-stone-300">暫無標籤</span>}
                    </div>
                </div>

                <div className={`flex-1 min-h-[260px] rounded-3xl border-4 overflow-hidden relative transition-all duration-500 flex flex-col ${scorerStyles.container}`}>
                   <div className="bg-white/50 p-2 rounded-t-[1.25rem] flex flex-col items-center justify-center border-b border-[#D9A7B5]/20 gap-0.5 shrink-0 z-10 backdrop-blur-sm">
                      <h2 className="text-[#5C4B47] font-bold text-base">粉粉兔偽客觀評分器</h2>
                   </div>
                   <div className="p-4 flex-1 flex flex-col items-center justify-center relative z-0">
                      {analysisStep === 0 && (
                         <div className="text-center space-y-4 animate-in fade-in duration-300">
                            <div className={`w-20 h-20 mx-auto flex items-center justify-center rounded-full shadow-sm border-4 ${themeColor === 'pink' ? 'bg-white border-pink-100' : themeColor === 'sky' ? 'bg-white border-sky-100' : 'bg-night-700 border-night-600'} mb-2`}>
                                <Heart className={`w-10 h-10 ${scorerStyles.heartIcon}`} fill="currentColor" />
                            </div>
                            <button onClick={handleRevealScore} className={`${scorerStyles.button} text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg active:scale-95 transition-all flex items-center gap-2 mx-auto text-sm`}>
                               <Sparkles size={16} className="text-yellow-200"/> 查看粉粉心動指數
                            </button>
                         </div>
                      )}
                      {analysisStep === 1 && (
                         <div className="text-center space-y-3 animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center border-4 border-blue-100 mb-2"><FileSearch size={32} className="text-blue-400 animate-bounce" /></div>
                            <div className={`font-black text-base tracking-wider ${drawerTextMain}`}>正在調閱資料庫...</div>
                         </div>
                      )}
                      {analysisStep === 2 && (
                         <div className="text-center space-y-3 animate-in fade-in zoom-in duration-300 w-full">
                            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center border-4 mb-2 ${scorerStyles.step2Icon}`}><Zap size={32} className="animate-pulse" /></div>
                            <div className={`font-black text-base tracking-wider mb-2 ${drawerTextMain}`}>掃描建材規格...</div>
                            <div className="h-6 flex items-center justify-center"><span className={`text-sm font-bold px-3 py-0.5 rounded-full animate-pulse ${scorerStyles.step2Text}`}>{scanText}</span></div>
                         </div>
                      )}
                      {analysisStep === 3 && (
                         <div className="text-center w-full flex flex-col items-center justify-center animate-in fade-in duration-300">
                            <div className="relative w-24 h-24 flex items-center justify-center mb-4"><Heart size={80} className={`${scorerStyles.step3Heart} rabbit-animate-heartbeat-deep drop-shadow-xl`} fill="currentColor"/></div>
                            <div className={`${scorerStyles.step3Text} font-black text-lg tracking-wider animate-pulse`}>注入粉粉心動指數!</div>
                         </div>
                      )}
                      {analysisStep === 4 && (
                         <div className="w-full h-full flex flex-col justify-between py-1 animate-pop-in">
                            <div className="absolute top-2 left-2 text-yellow-300 animate-bounce-slow"><Sparkles size={20} fill="currentColor" /></div>
                            <div className="absolute top-6 right-4 text-yellow-300 animate-bounce-slow" style={{ animationDelay: '1s' }}><Sparkles size={14} fill="currentColor" /></div>
                            <div className="flex-1 flex flex-col items-center justify-center">
                               <div className="relative flex items-center justify-center">
                                  {/* Score Number */}
                                  <div className={`text-[100px] md:text-[120px] font-rounded font-black leading-none tracking-tighter drop-shadow-sm select-none z-10 ${scorerStyles.scoreText}`} style={{ textShadow: scorerStyles.scoreShadow }}>
                                    {project.score || 88}
                                  </div>
                                  
                                  {/* Emoji Badge */}
                                  <div className={`absolute -right-14 md:-right-16 top-1/2 -translate-y-1/2 rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shadow-lg border-4 ${themeColor === 'pink' ? 'bg-white border-pink-100' : themeColor === 'sky' ? 'bg-white border-sky-100' : 'bg-night-700 border-night-600'} animate-bounce-slow z-20`}>
                                     <span className="text-3xl md:text-4xl leading-none">
                                       <FluentEmoji emoji={getScoreEmoji(project.score || 0)} size={40} />
                                     </span>
                                  </div>

                                  <div className="absolute -top-6 -left-6 text-yellow-400 transform -rotate-12"><Sparkles size={36} fill="currentColor" /></div>
                               </div>
                               
                               <div className={`mt-2 ${scorerStyles.badge} text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full rotate-[-3deg] shadow-md border-2 border-white transform scale-110`}>
                                 粉粉認證
                               </div>
                            </div>
                            <div className="flex flex-col gap-2 mt-4 w-full px-1">
                               {/* 特色標籤區 - 改進樣式為大尺寸彩色標籤 */}
                               {getFeatureTags().length > 0 && (
                                 <div className="flex flex-wrap justify-center gap-2 mb-2">
                                    {getFeatureTags().map((tag, idx) => {
                                       const config = getTagStyle(tag);
                                       return (
                                          <span key={idx} className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl border-2 shadow-sm ${config.className}`}>
                                             {config.icon}
                                             {tag}
                                          </span>
                                       );
                                    })}
                                 </div>
                               )}
                               <div className="flex justify-center mt-1">
                                 <div className={`text-[10px] text-center font-bold ${themeColor === 'dark' ? 'text-night-300' : 'text-stone-400'} flex items-center justify-center gap-1 px-3 py-1.5 rounded-full ${themeColor === 'dark' ? 'bg-[#E6DEDC]/80 border-night-400/20' : 'bg-white/60 border-white/40'} border backdrop-blur-sm shadow-sm`}>
                                    <FluentEmoji emoji="🐧" size={14} /> 
                                    <span>分數為建案有感規劃+建材提升+粉粉兔心動指數綜合得分</span>
                                 </div>
                               </div>
                            </div>
                         </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t flex gap-3 z-30 ${themeColor === 'dark' ? 'bg-night-800 border-night-700 shadow-night-900/50' : 'bg-white border-[#D9A7B5]/20 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.1)]'}`}>
           <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${project.lat},${project.lng}`, '_blank')} className={`flex-1 py-3 ${themeColor === 'pink' ? 'bg-[#5C4B47] hover:bg-[#4a3a32]' : themeColor === 'sky' ? 'bg-[#5C4B47] hover:bg-[#4a3a32]' : 'bg-night-pink-primary hover:bg-night-pink-secondary'} text-white rounded-full font-bold flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-md`}>
              <Navigation size={18} /> 導航
           </button>
           <button onClick={() => isInCompare ? onRemoveFromCompare(project.id) : onAddToCompare(project)} className={`flex-1 py-3 rounded-full font-bold flex items-center justify-center gap-2 transition-all active:scale-95 border-2 shadow-sm ${isInCompare ? (themeColor === 'pink' ? 'bg-[#FFE8EE] border-[#FF7BA8] text-[#FF7BA8]' : themeColor === 'sky' ? 'bg-sky-400 border-sky-400 text-sky-500' : 'bg-night-pink-primary border-night-pink-primary text-white') : (themeColor === 'pink' ? 'bg-white border-[#FF7BA8] text-[#FF7BA8] hover:bg-[#FFE8EE]' : themeColor === 'sky' ? 'bg-white border-sky-400 text-sky-500 hover:bg-sky-50' : 'bg-white border-night-pink-primary text-night-pink-primary hover:bg-night-600 hover:text-white')}`}>
              {isInCompare ? <Check size={18} /> : <Swords size={18} />}
              {isInCompare ? '已加入PK' : '加入PK'}
           </button>
        </div>
      </div>
    </>
  );
};

export default ProjectDrawer;
