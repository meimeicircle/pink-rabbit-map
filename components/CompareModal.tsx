
import React, { useRef, useState } from 'react';
import { EstateProject } from '../types';
import { X, Trophy, Sparkles, MessageCircle, Calculator, Ruler, TreePine, Users, Zap, Crown, Download, Loader2, Coins, ArrowRightLeft, Car, CheckSquare, Square } from 'lucide-react';
import html2canvas from 'html2canvas';
import { ThemeColor } from '../App';
import { FluentEmoji, TextWithFluentEmojis } from '../utils/fluentEmoji';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: EstateProject[];
  onOpenAsk: () => void;
  themeColor: ThemeColor;
}

type CalculatorInputs = {
  [projectId: string]: {
    r2Size: string;
    r2Price: string;
    r2Parking: string;
    r3Size: string;
    r3Price: string;
    r3Parking: string;
  }
};

const CompareModal: React.FC<CompareModalProps> = ({ isOpen, onClose, projects, onOpenAsk, themeColor }) => {
  const captureRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Row Visibility States
  const [showR2, setShowR2] = useState(false);
  const [showR3, setShowR3] = useState(false);
  
  // State for user inputs (Size, Unit Price, Parking Price)
  const [userInputs, setUserInputs] = useState<CalculatorInputs>({});

  if (!isOpen) return null;

  const maxScore = Math.max(...projects.map(p => p.score || 0));

  // Theme Styles
  const borderColor = themeColor === 'pink' ? 'border-pink-100' : themeColor === 'sky' ? 'border-sky-100' : 'border-night-pink-primary';
  const headerBg = themeColor === 'pink' ? 'bg-gradient-to-b from-pink-100 to-pink-50/20 border-pink-100' : themeColor === 'sky' ? 'bg-gradient-to-b from-sky-100 to-sky-50/20 border-sky-100' : 'bg-gradient-to-b from-stone-800 to-stone-900 border-stone-800';
  const accentText = themeColor === 'pink' ? 'text-pink-400' : themeColor === 'sky' ? 'text-sky-400' : 'text-night-pink-primary';
  const iconColor = themeColor === 'pink' ? 'text-pink-400' : themeColor === 'sky' ? 'text-sky-400' : 'text-night-pink-primary';
  const tagClass = themeColor === 'pink' ? 'text-pink-600 bg-pink-50 border-pink-200' : themeColor === 'sky' ? 'text-sky-600 bg-sky-50 border-sky-200' : 'text-white bg-night-pink-primary border-night-pink-primary';
  const highlightText = themeColor === 'pink' ? 'text-pink-600' : themeColor === 'sky' ? 'text-sky-600' : 'text-night-pink-primary';
  
  const askBtnClass = themeColor === 'pink' ? 'border-pink-100 text-pink-500 hover:bg-pink-50' : themeColor === 'sky' ? 'border-sky-100 text-sky-500 hover:bg-sky-50' : 'border-night-pink-primary text-night-pink-primary hover:bg-night-pink-primary/10';
  const downloadBtnClass = themeColor === 'pink' ? 'bg-pink-500 hover:bg-pink-600 shadow-pink-200' : themeColor === 'sky' ? 'bg-sky-500 hover:bg-sky-600 shadow-sky-200' : 'bg-night-pink-primary hover:bg-night-pink-secondary shadow-stone-300';

  // Modal Background
  const modalBg = 'bg-white';
  const textMain = 'text-stone-700';
  const textMuted = 'text-stone-400';
  const tableHeaderBg = 'bg-stone-50';
  const tableCellBg = 'bg-white';
  const tableBorder = 'border-stone-200';
  const stickyColBg = 'bg-stone-50';
  const stickyBorder = 'border-stone-100';
  const footerBg = 'bg-stone-50 border-stone-100';

  // --- Calculator Logic ---
  const handleInputChange = (projectId: string, field: keyof CalculatorInputs[string], value: string) => {
    setUserInputs(prev => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        [field]: value
      }
    }));
  };

  const calculateTotal = (sizeStr: string, priceStr: string, parkingStr: string) => {
    const size = parseFloat(sizeStr);
    const price = parseFloat(priceStr);
    const parking = parseFloat(parkingStr) || 0; // Default parking to 0 if empty
    
    if (!size || !price || isNaN(size) || isNaN(price)) return null;
    return Math.round((size * price) + parking);
  };

  const renderCalculatorCell = (project: EstateProject, type: 'r2' | 'r3') => {
    const inputs = userInputs[project.id] || { r2Size: '', r2Price: '', r2Parking: '', r3Size: '', r3Price: '', r3Parking: '' };
    const sizeKey = type === 'r2' ? 'r2Size' : 'r3Size';
    const priceKey = type === 'r2' ? 'r2Price' : 'r3Price';
    const parkingKey = type === 'r2' ? 'r2Parking' : 'r3Parking';
    
    const sizeVal = inputs[sizeKey] || '';
    const priceVal = inputs[priceKey] || '';
    const parkingVal = inputs[parkingKey] || '';
    
    const total = calculateTotal(sizeVal, priceVal, parkingVal);

    // Added 'text-right' to align numbers to the right
    const inputClass = `w-full px-2 py-1 text-xs md:text-sm border rounded-lg focus:outline-none transition-colors text-right calculator-input ${themeColor === 'dark' ? 'bg-night-800 border-night-600 text-night-200 focus:border-night-pink-primary' : `bg-stone-50 border-stone-200 text-stone-700 focus:bg-white ${themeColor === 'pink' ? 'focus:border-pink-300' : 'focus:border-sky-300'}`}`;

    return (
      <div className="flex flex-col gap-1.5 p-1">
        {/* Size Input */}
        <div className="flex items-center gap-1">
          <input 
            type="number" 
            placeholder="坪數" 
            className={inputClass}
            value={sizeVal}
            onChange={(e) => handleInputChange(project.id, sizeKey, e.target.value)}
          />
          <span className="text-[10px] text-stone-400 whitespace-nowrap">坪</span>
        </div>
        
        {/* Unit Price Input */}
        <div className="flex items-center gap-1">
          <input 
            type="number" 
            placeholder="單價" 
            className={inputClass}
            value={priceVal}
            onChange={(e) => handleInputChange(project.id, priceKey, e.target.value)}
          />
          <span className="text-[10px] text-stone-400 whitespace-nowrap">萬</span>
        </div>

        {/* Parking Price Input */}
        <div className="flex items-center gap-1">
          <div className="relative w-full">
             <input 
              type="number" 
              placeholder="車位" 
              className={`${inputClass} pl-6`}
              value={parkingVal}
              onChange={(e) => handleInputChange(project.id, parkingKey, e.target.value)}
            />
            <Car size={12} className="absolute left-1.5 top-1/2 -translate-y-1/2 text-stone-400" />
          </div>
          <span className="text-[10px] text-stone-400 whitespace-nowrap">萬</span>
        </div>

        {/* Total Price Display */}
        <div className={`mt-1 pt-2 border-t border-dashed ${themeColor === 'dark' ? 'border-night-600' : 'border-stone-200'} flex justify-between items-center calculated-total-row`}>
           <span className="text-[10px] text-stone-400 font-bold">含車總價</span>
           <span className={`font-black text-sm md:text-base ${total ? highlightText : 'text-stone-300'}`}>
             {total ? `${total.toLocaleString()} 萬` : '-'}
           </span>
        </div>
      </div>
    );
  };

  const renderSellingPointTags = (text: string) => {
    if (!text) return '-';
    // 修正：支援 "1. " 或 "1) " 以及換行符號切割
    const items = text.split(/(?:\d+[\.\)]\s*|[、；;\n]+)/).map(s => s.trim()).filter(s => s.length > 0);
    if (items.length === 0) return '-';
    return (
      <div className="flex flex-wrap gap-1.5 items-start content-start tag-container">
        {items.map((item, i) => (
          <span key={i} className={`tag-item inline-block text-[11px] md:text-sm font-bold border px-3 py-1.5 rounded-xl leading-snug whitespace-normal shadow-sm ${tagClass}`}>
            <TextWithFluentEmojis text={item} emojiSize={16} />
          </span>
        ))}
      </div>
    );
  };

  const allRows = [
    { id: 'r2', isCalculator: true, label: '2房試算', icon: <Calculator size={16} />, render: (p: EstateProject) => renderCalculatorCell(p, 'r2') },
    { id: 'r3', isCalculator: true, label: '3房試算', icon: <Calculator size={16} />, render: (p: EstateProject) => renderCalculatorCell(p, 'r3') },
    { id: 'base', label: '基地', icon: <Ruler size={20} />, render: (p: EstateProject) => <span className={`font-bold ${textMain}`}>{p.baseArea ? `${p.baseArea}坪` : '-'}</span> },
    { id: 'public', label: '公設', icon: <TreePine size={20} />, render: (p: EstateProject) => p.publicRatio ? `${p.publicRatio}` : '-' },
    { id: 'fee', label: '管理費', icon: <Coins size={20} />, render: (p: EstateProject) => p.managementFee ? (p.managementFee.includes('元') ? p.managementFee : `${p.managementFee}元/坪`) : '-' },
    { id: 'units', label: '戶數', icon: <Users size={20} />, render: (p: EstateProject) => p.totalUnits ? `${p.totalUnits}戶` : '-' },
    { id: 'score', label: '跑分', icon: <ArrowRightLeft size={20} />, render: (p: EstateProject) => (
        <div className="flex items-center gap-2">
           <div className="flex items-baseline gap-1">
             <span className={`text-4xl font-black ${p.score === maxScore && p.score && p.score > 0 ? highlightText : textMuted}`}>{p.score || '-'}</span>
             <span className={`text-sm ${textMuted} font-bold`}>分</span>
           </div>
           {p.score === maxScore && p.score && p.score > 0 && (<Crown size={28} className="text-yellow-400 fill-yellow-400 animate-bounce-slow" />)}
        </div>
      )
    },
    { id: 'selling', label: '訴求', icon: <Sparkles size={20} />, render: (p: EstateProject) => renderSellingPointTags(p.sellingPoint || '') },
    { id: 'material', label: '建材', icon: <Zap size={20} />, render: (p: EstateProject) => <div className="flex flex-wrap gap-1.5 tag-container">{p.materialTags ? p.materialTags.split('|').map((t, i) => <span key={i} className={`tag-item text-[11px] md:text-sm px-3 py-1.5 rounded-xl border bg-stone-100 border-stone-200 text-stone-600 whitespace-normal leading-tight shadow-sm`}>{t.trim()}</span>) : '-'}</div> },
  ];

  const visibleRows = allRows.filter(row => {
    if (row.id === 'r2' && !showR2) return false;
    if (row.id === 'r3' && !showR3) return false;
    return true;
  });

  const handleCapture = async () => {
    if (!captureRef.current) return;
    setIsCapturing(true);

    try {
      // 關鍵修正：等待所有字型載入完成，避免 fallback 字型導致高度計算錯誤
      await document.fonts.ready;
      
      // 等待所有圖片載入完成，避免截圖時圖片消失或高度計算錯誤
      const images = captureRef.current.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
      }));

      const canvas = await html2canvas(captureRef.current, {
        scale: 2, // 保持清晰度
        useCORS: true, 
        backgroundColor: '#ffffff', 
        logging: false,
        width: 1000, // 用戶指定寬度
        windowWidth: 1000,
        x: 0,
        y: 0,
        onclone: (clonedDoc) => {
           const element = clonedDoc.querySelector('.rabbit-capture-target') as HTMLElement;
           if (element) {
             // 設定精確的寬度與內距，讓 html2canvas 重新計算高度
             element.style.width = '1000px';
             element.style.padding = '30px';
             element.style.backgroundColor = '#ffffff';
             element.style.height = 'auto';
             element.style.maxHeight = 'none';
             element.style.overflow = 'visible';
             
             // 隱藏不想要出現在截圖裡的元素
             const hiddenElements = element.querySelectorAll('.hide-on-capture');
             hiddenElements.forEach((el) => {
               (el as HTMLElement).style.display = 'none';
             });

             // 確保所有父層級不會剪裁內容
             let current = element.parentElement;
             while (current && current !== clonedDoc.body) {
                 current.style.height = 'auto';
                 current.style.maxHeight = 'none';
                 current.style.overflow = 'visible';
                 current.style.transform = 'none';
                 current = current.parentElement;
             }
             
             // --- Replace Inputs with Text for Screenshot ---
             // Only visible inputs are in the DOM, so this loop works on whatever is visible
             const originalInputs = document.querySelectorAll('.calculator-input');
             const clonedInputs = clonedDoc.querySelectorAll('.calculator-input');
             
             // Sync values and replace with text if needed
             clonedInputs.forEach((clonedInput, index) => {
                 const originalInput = originalInputs[index] as HTMLInputElement;
                 const val = originalInput ? originalInput.value : '';
                 const parent = clonedInput.parentElement;
                 
                 if (val) {
                     // Replace input with a div containing the text to ensure visibility
                     const textDiv = clonedDoc.createElement('div');
                     textDiv.textContent = val;
                     // Copy critical styles
                     textDiv.className = clonedInput.className; 
                     // Override styles to look like plain text but keep alignment
                     textDiv.style.border = 'none';
                     textDiv.style.backgroundColor = 'transparent';
                     textDiv.style.paddingRight = '0'; // Adjust padding if needed
                     textDiv.style.textAlign = 'right';
                     textDiv.style.display = 'block';
                     textDiv.style.width = '100%';
                     textDiv.style.color = '#44403c'; // Force dark color for visibility
                     textDiv.style.fontWeight = 'bold';
                     
                     if (parent) parent.replaceChild(textDiv, clonedInput);
                 } else {
                     // If hidden or empty, clear it visually (e.g. placeholder)
                     (clonedInput as HTMLInputElement).value = '';
                     clonedInput.setAttribute('value', '');
                 }
             });

             // We no longer need to manually hide rows here, because React filtering removed them from the DOM
             // prior to screenshot if they were unchecked.

             // 注入修正 CSS
             const style = clonedDoc.createElement('style');
             style.innerHTML = `
               /* === 表格佈局修正 === */
               table { 
                 width: 100% !important; 
                 table-layout: fixed !important; 
                 border-collapse: collapse !important; 
               }
               
               th:first-child, td:first-child { 
                 width: 100px !important; 
               }
               
               th:not(:first-child), td:not(:first-child) { 
                 width: auto !important;
                 vertical-align: top !important; 
               }
               
               /* === 案名顯示修正 === */
               .project-name {
                  display: block !important;
                  white-space: normal !important;
                  overflow: visible !important;
                  height: auto !important;
                  line-height: 1.5 !important;
                  padding-bottom: 8px !important;
                  -webkit-line-clamp: unset !important;
               }

               /* === 標籤跑偏終極修正 === */
               /* 1. 將容器改為 block，避免 Flexbox 在 Canvas 運算中的垂直對齊誤差 */
               .tag-container {
                  display: block !important;
               }

               /* 2. 強制標籤使用 inline-block 與固定行高，確保垂直置中 */
               .tag-item {
                  display: inline-block !important;
                  width: auto !important;
                  height: auto !important;
                  /* 關鍵：鎖定行高與內距，讓文字乖乖待在中間 */
                  line-height: 1.5 !important; 
                  padding: 4px 8px !important;
                  margin-right: 4px !important;
                  margin-bottom: 4px !important;
                  vertical-align: top !important;
                  white-space: normal !important;
                  /* 確保字型一致 */
                  font-family: 'Noto Sans TC', sans-serif !important;
               }

               /* 一般文字容器修正 */
               div, span, p, td {
                  white-space: normal !important;
                  word-wrap: break-word !important; 
               }
               
               .sticky { position: static !important; }
               
               th, td { 
                 border: 1px solid #e5e7eb !important; 
                 height: auto !important;
               }
               
               ::-webkit-scrollbar { display: none; }
             `;
             clonedDoc.head.appendChild(style);
           }
        }
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `粉粉兔PK結果-${new Date().toISOString().slice(0,10)}.png`;
      link.click();

    } catch (error) { 
      console.error("Capture failed:", error); 
      alert("哎呀！截圖失敗了，請重試看看 🐰💦"); 
    } finally { 
      setIsCapturing(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-sans">
      <div className={`${modalBg} rounded-[2rem] md:rounded-[2.5rem] w-full max-w-5xl shadow-2xl border-8 ${borderColor} flex flex-col max-h-[90vh] overflow-hidden`}>
        <div className={`flex-1 overflow-auto rabbit-scroll ${modalBg} relative`}>
          <div ref={captureRef} className={`rabbit-capture-target ${modalBg} relative`}>
            
            {/* Redesigned Header with Gradient and Characters */}
            <div className={`px-2 py-3 md:py-4 flex flex-col items-center justify-center relative ${headerBg} rounded-t-[1.5rem] border-b-4 ${borderColor}`}>
               <div className="flex items-center justify-center z-10 relative gap-2 md:gap-4 w-full" style={{ minHeight: '80px' }}>
                 
                 {/* Left Images */}
                 <div className="flex items-end justify-end shrink-0" style={{ width: '80px', minWidth: '80px' }}>
                   <img src="/pkp.png" alt="粉粉" className="hide-on-capture w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-md z-10 hover:scale-105 transition-transform" style={{ minWidth: '64px', minHeight: '64px', flexShrink: 0 }} />
                 </div>
                 
                 {/* Center Title Area */}
                 <div className="flex flex-col items-center flex-shrink-0 mx-1 md:mx-4 shrink-0">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                      <div className={`bg-white p-1 md:p-1.5 rounded-full shadow-md ${textMain} shrink-0`}>
                         <Trophy className="text-yellow-400 fill-yellow-400" size={16} />
                      </div>
                      <h2 className={`text-base md:text-2xl font-extrabold ${textMain} tracking-widest drop-shadow-sm`} style={{ whiteSpace: 'nowrap' }}>粉粉兔殘酷擂台</h2>
                    </div>
                    <p className={`text-[9px] md:text-xs ${accentText} font-bold tracking-[0.2em] bg-white/70 px-3 py-0.5 rounded-full shadow-sm`} style={{ whiteSpace: 'nowrap' }}>
                      PK SYSTEM
                    </p>
                 </div>

                 {/* Right Images */}
                 <div className="flex items-end justify-start shrink-0" style={{ width: '80px', minWidth: '80px' }}>
                   <img src="/pkbb.png" alt="冰冰打電腦" className="hide-on-capture w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-md z-10 hover:scale-105 transition-transform" style={{ minWidth: '64px', minHeight: '64px', flexShrink: 0 }} />
                 </div>
               </div>
            </div>

            <div className="inline-block min-w-full align-middle p-2 md:p-6 pb-24 md:pb-28 relative z-20">
              <table className={`min-w-full border-collapse rounded-xl overflow-hidden shadow-sm border ${tableBorder}`}>
                <thead>
                  <tr>
                    <th className={`sticky left-0 z-20 w-20 md:w-28 p-3 md:p-4 text-center ${textMuted} font-bold text-sm md:text-base ${tableHeaderBg} border-b-2 ${tableBorder}`}><span>項目</span></th>
                    {projects.map(p => (
                      <th key={p.id} className={`w-40 md:w-64 p-3 md:p-4 text-left align-top border-b-2 ${tableBorder} ${tableCellBg} border-l ${stickyBorder}`}>
                        {/* 加入 project-name class 以便截圖時鎖定修正 */}
                        <div className={`text-base md:text-xl font-bold ${textMain} mb-1 line-clamp-2 project-name`}>
                          <TextWithFluentEmojis text={p.name} emojiSize={20} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row, idx) => (
                    <tr key={idx} className={`hover:bg-stone-50 transition-colors ${row.isCalculator ? 'calculator-row' : ''}`}>
                      <td className={`sticky left-0 z-20 w-20 md:w-28 p-3 md:p-4 border-b ${stickyBorder} ${textMuted} font-bold text-sm md:text-base ${stickyColBg} border-r ${tableBorder} shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]`}>
                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${modalBg} border-2 ${stickyBorder} flex items-center justify-center ${iconColor} shrink-0 shadow-sm`}>{row.icon}</div>
                          <span className="text-xs md:text-sm leading-none mt-0.5">{row.label}</span>
                        </div>
                      </td>
                      {projects.map(p => (
                        <td key={p.id} className={`w-40 md:w-64 p-3 md:p-4 border-b ${stickyBorder} text-sm md:text-base ${textMain} align-middle ${tableCellBg} border-l ${stickyBorder}`}>{row.render(p)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="mt-4 md:mt-6 flex justify-center z-10 relative pointer-events-none">
                 <div className={`text-xs md:text-sm ${textMuted} font-bold ${tableHeaderBg} border-2 ${tableBorder} flex items-center justify-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl shadow-sm`} style={{ width: 'fit-content' }}>
                   <img src="/pkbb.png" alt="冰冰" className="w-5 h-5 md:w-6 md:h-6 object-contain drop-shadow-sm translate-y-[-2px]" style={{ minWidth: '20px', minHeight: '20px', flexShrink: 0 }} /> 
                   <span className="text-stone-500" style={{ display: 'inline-block' }}>冰冰警語：分數不代表絕對，偏低但價格便宜也很合理喔！</span>
                 </div>
              </div>

              <div className={`mt-4 text-center ${textMuted} text-[10px] md:text-xs font-bold tracking-widest uppercase opacity-60 pb-2 flex items-center justify-center gap-2 z-10 relative`}>
                POWERED BY RABBIT PINK PINK <FluentEmoji emoji="🐰" size={16} />
              </div>

              {/* Background decorative images at the bottom left/right */}
              <img src="/pk2.png" alt="粉粉與冰冰" className="hide-on-capture absolute left-4 md:left-6 bottom-4 w-28 h-28 md:w-36 md:h-36 object-contain opacity-40 z-0 pointer-events-none" style={{ minWidth: '112px', minHeight: '112px' }} />
              <img src="/pkb.png" alt="冰冰地圖" className="hide-on-capture absolute right-4 md:right-6 bottom-4 w-24 h-24 md:w-32 md:h-32 object-contain opacity-40 z-0 pointer-events-none" style={{ minWidth: '96px', minHeight: '96px' }} />
            </div>
          </div>
        </div>
        <button onClick={onClose} className={`absolute top-4 right-4 z-50 p-2 bg-white/50 hover:bg-white text-stone-400 hover:text-stone-600 rounded-full transition-colors shadow-sm`}><X size={24} /></button>
        <div className={`p-4 ${footerBg} border-t flex flex-col md:flex-row items-center gap-3 shrink-0 z-40`}>
           <div className="flex flex-wrap items-center gap-4 mb-2 md:mb-0 mr-auto pl-1">
             <button 
                onClick={() => setShowR2(!showR2)}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${showR2 ? 'text-pink-600' : 'text-stone-400'}`}
             >
                {showR2 ? <CheckSquare size={20} className="text-pink-500" /> : <Square size={20} />}
                <span>顯示2房試算</span>
             </button>
             <button 
                onClick={() => setShowR3(!showR3)}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${showR3 ? 'text-pink-600' : 'text-stone-400'}`}
             >
                {showR3 ? <CheckSquare size={20} className="text-pink-500" /> : <Square size={20} />}
                <span>顯示3房試算</span>
             </button>
           </div>
           
           <button onClick={onOpenAsk} className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl ${modalBg} border-2 ${askBtnClass} text-xs md:text-sm font-bold transition-colors shadow-sm w-full md:w-auto active:scale-95`}>
            <MessageCircle size={16} /> 比完還不知道怎麼辦？問粉粉兔
          </button>
          <button onClick={handleCapture} disabled={isCapturing} className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl ${downloadBtnClass} text-white text-xs md:text-sm font-bold transition-colors shadow-md w-full md:w-auto active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed`}>
            {isCapturing ? <><Loader2 size={16} className="animate-spin" /> 正在截圖中...</> : <><Download size={16} /> 下載 PK 結果圖</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
