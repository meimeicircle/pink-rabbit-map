
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
  const [showR2, setShowR2] = useState(true);
  const [showR3, setShowR3] = useState(true);
  
  // State for user inputs (Size, Unit Price, Parking Price)
  const [userInputs, setUserInputs] = useState<CalculatorInputs>({});

  if (!isOpen) return null;

  const maxScore = Math.max(...projects.map(p => p.score || 0));

  // Theme Styles
  const borderColor = themeColor === 'pink' ? 'border-pink-100' : themeColor === 'sky' ? 'border-sky-100' : 'border-night-pink-primary';
  const headerBg = themeColor === 'pink' ? 'bg-pink-50 border-pink-100' : themeColor === 'sky' ? 'bg-sky-50 border-sky-100' : 'bg-night-pink-primary/10 border-night-pink-primary/20';
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
    // 修正：要求數字後面必須有點和空白 (例如 "1. ") 才進行切割，避免切斷小數點
    const items = text.split(/(?:\d+\.\s|[、；;\n]+)/).map(s => s.trim()).filter(s => s.length > 0);
    if (items.length === 0) return '-';
    return (
      <div className="flex flex-wrap gap-1.5 items-start content-start tag-container">
        {items.map((item, i) => (
          <span key={i} className={`tag-item inline-block text-[10px] md:text-xs font-bold border px-2 py-1 rounded-lg leading-snug whitespace-normal ${tagClass}`}>
            <TextWithFluentEmojis text={item} emojiSize={12} />
          </span>
        ))}
      </div>
    );
  };

  const allRows = [
    { id: 'r2', isCalculator: true, label: '2房試算', icon: <Calculator size={16} />, render: (p: EstateProject) => renderCalculatorCell(p, 'r2') },
    { id: 'r3', isCalculator: true, label: '3房試算', icon: <Calculator size={16} />, render: (p: EstateProject) => renderCalculatorCell(p, 'r3') },
    { id: 'base', label: '基地', icon: <Ruler size={16} />, render: (p: EstateProject) => <span className={`font-bold ${textMain}`}>{p.baseArea ? `${p.baseArea}坪` : '-'}</span> },
    { id: 'public', label: '公設', icon: <TreePine size={16} />, render: (p: EstateProject) => p.publicRatio ? `${p.publicRatio}` : '-' },
    { id: 'fee', label: '管理費', icon: <Coins size={16} />, render: (p: EstateProject) => p.managementFee ? (p.managementFee.includes('元') ? p.managementFee : `${p.managementFee}元/坪`) : '-' },
    { id: 'units', label: '戶數', icon: <Users size={16} />, render: (p: EstateProject) => p.totalUnits ? `${p.totalUnits}戶` : '-' },
    { id: 'score', label: '跑分', icon: <ArrowRightLeft size={16} />, render: (p: EstateProject) => (
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-1">
             <span className={`text-2xl font-black ${p.score === maxScore && p.score && p.score > 0 ? highlightText : textMuted}`}>{p.score || '-'}</span>
             <span className={`text-xs ${textMuted} font-bold mt-1`}>分</span>
           </div>
           {p.score === maxScore && p.score && p.score > 0 && (<Crown size={20} className="text-yellow-400 fill-yellow-400 animate-bounce-slow" />)}
        </div>
      )
    },
    { id: 'selling', label: '訴求', icon: <Sparkles size={16} />, render: (p: EstateProject) => renderSellingPointTags(p.sellingPoint || '') },
    { id: 'material', label: '建材', icon: <Zap size={16} />, render: (p: EstateProject) => <div className="flex flex-wrap gap-1.5 tag-container">{p.materialTags ? p.materialTags.split('|').map((t, i) => <span key={i} className={`tag-item text-[10px] md:text-xs px-2 py-1 rounded border bg-stone-100 border-stone-200 text-stone-600 whitespace-normal leading-tight`}>{t.trim()}</span>) : '-'}</div> },
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

      const canvas = await html2canvas(captureRef.current, {
        scale: 2, // 保持清晰度
        useCORS: true, 
        backgroundColor: '#ffffff', 
        logging: false,
        width: 1000, // 用戶指定寬度
        windowWidth: 1000,
        onclone: (clonedDoc) => {
           const element = clonedDoc.querySelector('.rabbit-capture-target') as HTMLElement;
           if (element) {
             // 設定精確的寬度與內距
             element.style.width = '1000px';
             element.style.padding = '30px';
             element.style.backgroundColor = '#ffffff';
             
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
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`${modalBg} rounded-[2rem] w-full max-w-5xl shadow-2xl border-8 ${borderColor} flex flex-col max-h-[90vh] overflow-hidden`}>
        <div className={`flex-1 overflow-auto rabbit-scroll ${modalBg} relative`}>
          <div ref={captureRef} className={`rabbit-capture-target ${modalBg}`}>
            <div className={`p-4 md:p-6 flex justify-between items-center border-b ${headerBg}`}>
              <div className="flex items-center gap-3">
                 <div className={`${modalBg} p-2 rounded-full shadow-sm`}><Trophy className="text-yellow-400 fill-yellow-400" size={24} /></div>
                 <div><h2 className={`text-xl font-bold ${textMain}`}>粉粉兔幫你看</h2><p className={`text-xs ${accentText} font-bold tracking-wider`}>PK SYSTEM</p></div>
              </div>
            </div>
            <div className="inline-block min-w-full align-middle p-2 md:p-4">
              <table className={`min-w-full border-collapse rounded-xl overflow-hidden shadow-sm border ${tableBorder}`}>
                <thead>
                  <tr>
                    <th className={`sticky left-0 z-20 w-20 md:w-28 p-2 md:p-4 text-center ${textMuted} font-medium text-xs md:text-sm ${tableHeaderBg} border-b ${tableBorder}`}><span>項目</span></th>
                    {projects.map(p => (
                      <th key={p.id} className={`w-40 md:w-64 p-2 md:p-4 text-left align-top border-b ${tableBorder} ${tableCellBg} border-l ${stickyBorder}`}>
                        {/* 加入 project-name class 以便截圖時鎖定修正 */}
                        <div className={`text-sm md:text-lg font-bold ${textMain} mb-1 line-clamp-2 project-name`}>
                          <TextWithFluentEmojis text={p.name} emojiSize={20} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row, idx) => (
                    <tr key={idx} className={`hover:bg-stone-50 transition-colors ${row.isCalculator ? 'calculator-row' : ''}`}>
                      <td className={`sticky left-0 z-20 w-20 md:w-28 p-2 md:p-4 border-b ${stickyBorder} ${textMuted} font-bold text-xs md:text-sm ${stickyColBg} border-r ${tableBorder} shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]`}>
                        <div className="flex flex-col items-center justify-center gap-1 text-center">
                          <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full ${modalBg} border ${stickyBorder} flex items-center justify-center ${iconColor} shrink-0`}>{row.icon}</div>
                          <span className="text-[10px] md:text-xs leading-none mt-0.5">{row.label}</span>
                        </div>
                      </td>
                      {projects.map(p => (
                        <td key={p.id} className={`w-40 md:w-64 p-2 md:p-4 border-b ${stickyBorder} text-xs md:text-sm ${textMain} align-middle ${tableCellBg} border-l ${stickyBorder}`}>{row.render(p)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="mt-3 text-center">
                 <p className={`text-[10px] ${textMuted} font-bold ${tableHeaderBg} border ${tableBorder} inline-block px-3 py-1.5 rounded-lg leading-relaxed`}>
                   <FluentEmoji emoji="🐧" size={14} /> 分數不代表絕對，分數偏低但價格也比較便宜=合理
                 </p>
              </div>

              <div className={`mt-2 text-center ${textMuted} text-[10px] font-bold tracking-widest uppercase opacity-50 pb-2`}>POWERED BY RABBIT PINK PINK <FluentEmoji emoji="🐰" size={14} /></div>
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
