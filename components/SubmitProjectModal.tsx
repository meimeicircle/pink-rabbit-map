
import React, { useState } from 'react';
import { X, Send, CheckCircle2, ChevronRight, ChevronLeft, Building2, Hammer, TrainFront, User, Sparkles } from 'lucide-react';
import { FORM_OPTIONS, USER_AVATARS } from '../constants';
import { FluentEmoji } from '../utils/fluentEmoji';
import { ThemeColor } from '../App';
import CertificationCard from './CertificationCard';

interface SubmitProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  themeColor: ThemeColor;
}

const SubmitProjectModal: React.FC<SubmitProjectModalProps> = ({ isOpen, onClose, onSubmit, themeColor }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic
    name: '',
    region: '新北市',
    managementFee: '',
    floorHeight: '',
    // Step 2: Specs
    windowBrand: [] as string[],
    glassType: [] as string[],
    kitchenBrand: [] as string[],
    bathroomBrands: [] as string[],
    hasDishwasher: false,
    hasApplianceCabinet: false,
    hasOven: false,
    hasSmartToilet: false,
    flooring: [] as string[],
    waterSystem: [] as string[],
    // Step 3: Features
    features: [] as string[],
    notes: '',
    // Step 4: User
    userName: '',
    userEmoji: '🐰',
    userEmail: '',
  });

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => {
      const exists = prev.features.includes(feature);
      if (exists) return { ...prev, features: prev.features.filter(f => f !== feature) };
      return { ...prev, features: [...prev.features, feature] };
    });
  };

  const toggleKitchenBrand = (brand: string) => {
    setFormData(prev => {
      const exists = prev.kitchenBrand.includes(brand);
      let newBrands;
      if (exists) {
        newBrands = prev.kitchenBrand.filter(b => b !== brand);
      } else {
        newBrands = [...prev.kitchenBrand, brand];
      }
      
      // Handle "Other" logic
      let newNotes = prev.notes;
      const isOther = brand === '其他' || brand.includes('其他') || brand.includes('補充在備註');
      if (isOther) {
        if (!exists && !newNotes.includes('【廚具其他補充】')) {
          newNotes = newNotes ? `${newNotes}\n【廚具其他補充】：` : '【廚具其他補充】：';
        }
      }
      
      return { ...prev, kitchenBrand: newBrands, notes: newNotes };
    });
  };

  const toggleBathroomBrand = (brand: string) => {
    setFormData(prev => {
      const exists = prev.bathroomBrands.includes(brand);
      let newBrands;
      if (exists) {
        newBrands = prev.bathroomBrands.filter(b => b !== brand);
      } else {
        newBrands = [...prev.bathroomBrands, brand];
      }

      // Handle "Other" logic
      let newNotes = prev.notes;
      const isOther = brand === '其他' || brand.includes('其他') || brand.includes('補充在備註');
      if (isOther) {
        if (!exists && !newNotes.includes('【衛浴其他補充】')) {
          newNotes = newNotes ? `${newNotes}\n【衛浴其他補充】：` : '【衛浴其他補充】：';
        }
      }

      return { ...prev, bathroomBrands: newBrands, notes: newNotes };
    });
  };

  const toggleWindowBrand = (brand: string) => {
    setFormData(prev => {
      const exists = prev.windowBrand.includes(brand);
      let newBrands;
      if (exists) {
        newBrands = prev.windowBrand.filter(b => b !== brand);
      } else {
        newBrands = [...prev.windowBrand, brand];
      }

      // Handle "Other" logic
      let newNotes = prev.notes;
      const isOther = brand === '其他' || brand.includes('其他') || brand.includes('補充在備註');
      if (isOther) {
        if (!exists && !newNotes.includes('【窗戶其他補充】')) {
          newNotes = newNotes ? `${newNotes}\n【窗戶其他補充】：` : '【窗戶其他補充】：';
        }
      }

      return { ...prev, windowBrand: newBrands, notes: newNotes };
    });
  };

  const toggleGlassType = (type: string) => {
    setFormData(prev => {
      const exists = prev.glassType.includes(type);
      let newTypes;
      if (exists) {
        newTypes = prev.glassType.filter(t => t !== type);
      } else {
        newTypes = [...prev.glassType, type];
      }

      // Handle "Other" logic
      let newNotes = prev.notes;
      const isOther = type === '其他' || type.includes('其他') || type.includes('補充在備註');
      if (isOther) {
        if (!exists && !newNotes.includes('【玻璃其他補充】')) {
          newNotes = newNotes ? `${newNotes}\n【玻璃其他補充】：` : '【玻璃其他補充】：';
        }
      }

      return { ...prev, glassType: newTypes, notes: newNotes };
    });
  };

  const toggleFlooring = (type: string) => {
    setFormData(prev => {
      const exists = prev.flooring.includes(type);
      let newTypes;
      if (exists) {
        newTypes = prev.flooring.filter(t => t !== type);
      } else {
        newTypes = [...prev.flooring, type];
      }

      // Handle "Other" logic
      let newNotes = prev.notes;
      const isOther = type === '其他' || type.includes('其他') || type.includes('補充在備註');
      if (isOther) {
        if (!exists && !newNotes.includes('【地板其他補充】')) {
          newNotes = newNotes ? `${newNotes}\n【地板其他補充】：` : '【地板其他補充】：';
        }
      }

      return { ...prev, flooring: newTypes, notes: newNotes };
    });
  };

  const toggleWaterSystem = (system: string) => {
    setFormData(prev => {
      const exists = prev.waterSystem.includes(system);
      let newSystems;
      if (exists) {
        newSystems = prev.waterSystem.filter(s => s !== system);
      } else {
        newSystems = [...prev.waterSystem, system];
      }

      // Handle "Other" logic
      let newNotes = prev.notes;
      const isOther = system === '其他' || system.includes('其他') || system.includes('補充在備註');
      if (isOther) {
        if (!exists && !newNotes.includes('【淨水其他補充】')) {
          newNotes = newNotes ? `${newNotes}\n【淨水其他補充】：` : '【淨水其他補充】：';
        }
      }

      return { ...prev, waterSystem: newSystems, notes: newNotes };
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.userName || !formData.userEmail) {
      alert("請填寫必填欄位 (建案名稱、暱稱、Email) 🐰");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare data for submission: Map to Chinese keys to match Google Sheet headers EXACTLY
      const submissionData = {
        "": new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }), // Column A header is empty in screenshot
        "建案名稱": formData.name,
        "區域": formData.region,
        "管理費": formData.managementFee,
        "樓高": formData.floorHeight,
        "窗戶品牌": formData.windowBrand.join(', '),
        "玻璃厚度": formData.glassType.join(', '),
        "廚具品牌": formData.kitchenBrand.join(', '),
        "洗碗機": formData.hasDishwasher ? "有" : "無",
        "電器櫃": formData.hasApplianceCabinet ? "有" : "無",
        "微烤爐/烤箱": formData.hasOven ? "有" : "無",
        "衛浴品牌": formData.bathroomBrands.join(', '),
        "全自動馬桶": formData.hasSmartToilet ? "有" : "無",
        "地板": formData.flooring.join(', '),
        "淨水": formData.waterSystem.join(', '),
        "特殊條件": formData.features.join(', '),
        "備註": formData.notes,
        "名稱": formData.userName,
        "代表圖案": formData.userEmoji, // Match column S header "代表圖案"
        "email": formData.userEmail     // Match column T header "email" (lowercase)
      };

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      let result;
      try {
        result = await response.json();
      } catch (e) {
        throw new Error('提交失敗，伺服器無回應');
      }

      console.log('Submission result:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || '提交失敗');
      }

      setSubmittedData({ ...formData });
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Notify Parent App (for logging/analytics)
      onSubmit(formData);
    } catch (error) {
      console.error('Error submitting:', error);
      alert(error instanceof Error ? error.message : '提交時發生錯誤，請稍後再試 🐰');
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, title: '基本資料', icon: <Building2 size={18}/> },
    { id: 2, title: '重點建材', icon: <Hammer size={18}/> },
    { id: 3, title: '特色與交通', icon: <TrainFront size={18}/> },
    { id: 4, title: '投稿人', icon: <User size={18}/> },
  ];

  // Theme Styles
  const modalBg = 'bg-white';
  const headerBg = themeColor === 'pink' ? 'bg-pink-50' : themeColor === 'sky' ? 'bg-sky-50' : 'bg-night-pink-primary/10';
  const accentColor = themeColor === 'pink' ? 'text-pink-500' : themeColor === 'sky' ? 'text-sky-500' : 'text-night-pink-primary';
  const btnBg = themeColor === 'pink' ? 'bg-pink-500 hover:bg-pink-600' : themeColor === 'sky' ? 'bg-sky-500 hover:bg-sky-600' : 'bg-night-pink-primary hover:bg-night-pink-secondary';
  const activeStepBg = themeColor === 'pink' ? 'bg-pink-500 text-white' : themeColor === 'sky' ? 'bg-sky-500 text-white' : 'bg-night-pink-primary text-white';
  const inactiveStepBg = 'bg-stone-100 text-stone-400';
  const inputStyle = `w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors ${themeColor === 'dark' ? 'bg-night-800 border-night-600 text-night-200 focus:border-night-pink-primary' : `bg-stone-50 border-stone-200 text-stone-700 focus:bg-white ${themeColor === 'pink' ? 'focus:border-pink-300' : 'focus:border-sky-300'}`}`;
  const labelStyle = `block text-xs font-bold mb-1.5 ${themeColor === 'dark' ? 'text-night-300' : 'text-stone-500'}`;

  const handleCloseSuccess = () => {
    setStep(1);
    setFormData({
        name: '',
        region: '新北市',
        managementFee: '',
        floorHeight: '',
        windowBrand: [],
        glassType: [],
        kitchenBrand: [],
        bathroomBrands: [],
        hasDishwasher: false,
        hasApplianceCabinet: false,
        hasOven: false,
        hasSmartToilet: false,
        flooring: [],
        waterSystem: [],
        features: [],
        notes: '',
        userName: '',
        userEmoji: '🐰',
        userEmail: '',
    });
    setShowSuccess(false);
    setSubmittedData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className={`${modalBg} rounded-[2rem] w-full max-w-xl shadow-2xl border-4 ${themeColor === 'pink' ? 'border-pink-100' : themeColor === 'sky' ? 'border-sky-100' : 'border-night-pink-primary/30'} flex flex-col relative overflow-hidden max-h-[90vh]`}>
        
        {showSuccess ? (
           <div className="flex flex-col items-center justify-start p-4 md:p-8 pb-20 rabbit-scroll overflow-y-auto h-full w-full">
              <div className="text-center mb-6 shrink-0">
                 <h2 className="text-2xl font-black text-stone-700 mb-2">投稿成功！🐰✨</h2>
                 <p className="text-stone-500 font-medium text-sm">這是粉粉兔為您準備的專屬認證卡，快保存下來紀念吧！</p>
              </div>
              
              <div className="w-full flex justify-center origin-top scale-[0.85] sm:scale-100 transition-transform">
                <CertificationCard 
                  data={submittedData} 
                  themeColor={themeColor} 
                  onClose={handleCloseSuccess} 
                />
              </div>
           </div>
        ) : (
          <>
            {/* Header */}
            <div className={`${headerBg} p-4 md:p-6 border-b ${themeColor === 'pink' ? 'border-pink-100' : themeColor === 'sky' ? 'border-sky-100' : 'border-night-pink-primary/20'} flex justify-between items-center`}>
              <div className="flex items-center gap-3">
                 <div className={`p-2 bg-white rounded-full shadow-sm flex items-center justify-center -space-x-1`}>
                    <FluentEmoji emoji="🐰" size={24} />
                    <FluentEmoji emoji="📝" size={24} />
                 </div>
                 <div>
                   <h2 className={`text-xl font-bold text-stone-700`}>網友投稿</h2>
                   <p className={`text-xs ${accentColor} font-bold`}>請填寫建案資料，我們幫你算分！</p>
                 </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 text-stone-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Stepper */}
            <div className="px-6 py-4 flex justify-between items-center relative">
               <div className="absolute left-6 right-6 top-1/2 h-0.5 bg-stone-100 -z-10"></div>
               {steps.map((s) => (
                 <div key={s.id} className="flex flex-col items-center gap-1 bg-white px-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s.id ? activeStepBg : inactiveStepBg}`}>
                       {step > s.id ? <CheckCircle2 size={16}/> : s.id}
                    </div>
                    <span className={`text-[10px] font-bold ${step >= s.id ? 'text-stone-700' : 'text-stone-300'}`}>{s.title}</span>
                 </div>
               ))}
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 rabbit-scroll">
               
               {step === 1 && (
                 <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                    <div>
                       <label className={labelStyle}>建案名稱 <span className="text-red-400">*</span></label>
                       <input type="text" placeholder="例如: 帝寶" className={inputStyle} value={formData.name} onChange={e => handleInputChange('name', e.target.value)} />
                    </div>
                    <div>
                       <label className={labelStyle}>所在區域</label>
                       <select className={inputStyle} value={formData.region} onChange={e => handleInputChange('region', e.target.value)}>
                          {['新北市', '桃園市', '宜蘭縣', '其他'].map(r => <option key={r} value={r}>{r}</option>)}
                       </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div>
                          <label className={labelStyle}>管理費 (元/坪)</label>
                          <input type="number" placeholder="例如: 100" className={inputStyle} value={formData.managementFee} onChange={e => handleInputChange('managementFee', e.target.value)} />
                       </div>
                       <div>
                          <label className={labelStyle}>樓高 (米)</label>
                          <input type="number" placeholder="例如: 3.4" step="0.1" className={inputStyle} value={formData.floorHeight} onChange={e => handleInputChange('floorHeight', e.target.value)} />
                       </div>
                    </div>
                 </div>
               )}

               {step === 2 && (
                 <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                    <div>
                        <label className={labelStyle}>窗戶品牌 (可多選)</label>
                        <div className="grid grid-cols-3 gap-2">
                           {FORM_OPTIONS.windowBrands.map(brand => (
                              <button
                                 key={brand}
                                 onClick={() => toggleWindowBrand(brand)}
                                 className={`px-2 py-2 rounded-lg border text-[10px] font-bold transition-all ${formData.windowBrand.includes(brand) ? 'bg-pink-500 border-transparent text-white' : 'bg-white border-stone-200 text-stone-500'}`}
                              >
                                 {brand}
                              </button>
                           ))}
                        </div>
                    </div>
                    <div>
                        <label className={labelStyle}>玻璃規格 (可多選)</label>
                        <div className="grid grid-cols-3 gap-2">
                           {FORM_OPTIONS.glassTypes.map(type => (
                              <button
                                 key={type}
                                 onClick={() => toggleGlassType(type)}
                                 className={`px-2 py-2 rounded-lg border text-[10px] font-bold transition-all ${formData.glassType.includes(type) ? 'bg-pink-500 border-transparent text-white' : 'bg-white border-stone-200 text-stone-500'}`}
                              >
                                 {type}
                              </button>
                           ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                       <div>
                          <label className={labelStyle}>廚具品牌 (可多選)</label>
                          <div className="grid grid-cols-2 gap-2">
                             {FORM_OPTIONS.kitchenBrands.map(brand => (
                                <button
                                   key={brand}
                                   onClick={() => toggleKitchenBrand(brand)}
                                   className={`px-2 py-2 rounded-lg border text-[10px] font-bold transition-all ${formData.kitchenBrand.includes(brand) ? 'bg-pink-500 border-transparent text-white' : 'bg-white border-stone-200 text-stone-500'}`}
                                >
                                   {brand}
                                </button>
                             ))}
                          </div>
                       </div>
                       <div className="flex flex-col gap-2">
                          <label className={labelStyle}>廚房配備</label>
                          <div className="flex flex-wrap gap-2">
                             <button 
                                onClick={() => handleInputChange('hasDishwasher', !formData.hasDishwasher)}
                                className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${formData.hasDishwasher ? 'bg-pink-500 border-transparent text-white' : 'bg-white border-stone-200 text-stone-500'}`}
                             >
                                洗碗機
                             </button>
                             <button 
                                onClick={() => handleInputChange('hasApplianceCabinet', !formData.hasApplianceCabinet)}
                                className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${formData.hasApplianceCabinet ? 'bg-pink-500 border-transparent text-white' : 'bg-white border-stone-200 text-stone-500'}`}
                             >
                                電器櫃
                             </button>
                             <button 
                                onClick={() => handleInputChange('hasOven', !formData.hasOven)}
                                className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${formData.hasOven ? 'bg-pink-500 border-transparent text-white' : 'bg-white border-stone-200 text-stone-500'}`}
                             >
                                烤箱/微烤爐
                             </button>
                          </div>
                       </div>
                    </div>

                    <div>
                       <label className={labelStyle}>衛浴品牌 (可多選)</label>
                       <div className="grid grid-cols-3 gap-2">
                          {FORM_OPTIONS.bathroomBrands.map(brand => (
                             <button
                                key={brand}
                                onClick={() => toggleBathroomBrand(brand)}
                                className={`px-2 py-2 rounded-lg border text-[10px] font-bold transition-all ${formData.bathroomBrands.includes(brand) ? 'bg-pink-500 border-transparent text-white' : 'bg-white border-stone-200 text-stone-500'}`}
                             >
                                {brand}
                             </button>
                          ))}
                       </div>
                       <div className="mt-2">
                          <button 
                             onClick={() => handleInputChange('hasSmartToilet', !formData.hasSmartToilet)}
                             className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${formData.hasSmartToilet ? 'bg-blue-500 border-transparent text-white' : 'bg-white border-stone-200 text-stone-500'}`}
                          >
                             🚽 全自動馬桶/電腦馬桶
                          </button>
                       </div>
                    </div>
                    <div>
                        <label className={labelStyle}>地板建材 (可多選)</label>
                        <div className="grid grid-cols-3 gap-2">
                           {FORM_OPTIONS.flooringTypes.map(type => (
                              <button
                                 key={type}
                                 onClick={() => toggleFlooring(type)}
                                 className={`px-2 py-2 rounded-lg border text-[10px] font-bold transition-all ${formData.flooring.includes(type) ? 'bg-pink-500 border-transparent text-white' : 'bg-white border-stone-200 text-stone-500'}`}
                              >
                                 {type}
                              </button>
                           ))}
                        </div>
                    </div>
                    <div>
                        <label className={labelStyle}>社區淨水系統 (可多選)</label>
                        <div className="grid grid-cols-3 gap-2">
                           {FORM_OPTIONS.waterSystems.map(system => (
                              <button
                                 key={system}
                                 onClick={() => toggleWaterSystem(system)}
                                 className={`px-2 py-2 rounded-lg border text-[10px] font-bold transition-all ${formData.waterSystem.includes(system) ? 'bg-pink-500 border-transparent text-white' : 'bg-white border-stone-200 text-stone-500'}`}
                              >
                                 {system}
                              </button>
                           ))}
                        </div>
                    </div>
                 </div>
               )}

               {step === 3 && (
                 <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                    <div>
                       <label className={labelStyle}>交通與特殊配備 (可複選)</label>
                       <div className="grid grid-cols-2 gap-2">
                          {FORM_OPTIONS.features.map(feature => (
                             <button
                               key={feature}
                               onClick={() => toggleFeature(feature)}
                               className={`p-3 rounded-xl border-2 text-xs font-bold text-left transition-all ${formData.features.includes(feature) ? `${activeStepBg} border-transparent shadow-md` : 'bg-stone-50 border-stone-100 text-stone-500 hover:bg-white'}`}
                             >
                                {feature}
                             </button>
                          ))}
                       </div>
                    </div>
                    <div>
                       <label className={labelStyle}>備註 (還有沒有其他酷酷的東西是粉粉兔沒列到的？)</label>
                       <textarea 
                          placeholder="例如有送全室XX牌冷氣、有含簡易裝潢、有家電..." 
                          className={`${inputStyle} h-24 resize-none`}
                          value={formData.notes}
                          onChange={e => handleInputChange('notes', e.target.value)}
                       />
                    </div>
                 </div>
               )}

               {step === 4 && (
                 <div className="space-y-5 animate-in slide-in-from-right-8 duration-300">
                    <div>
                       <label className={labelStyle}>您的暱稱 <span className="text-red-400">*</span> (將顯示於地圖上，限 10 字)</label>
                       <input type="text" placeholder="例如: 小美" maxLength={10} className={inputStyle} value={formData.userName} onChange={e => handleInputChange('userName', e.target.value)} />
                    </div>
                    <div>
                       <label className={labelStyle}>選擇您的代表 Emoji</label>
                       <div className="flex flex-wrap gap-2 mt-2">
                          {USER_AVATARS.map(emoji => (
                             <button
                               key={emoji}
                               onClick={() => handleInputChange('userEmoji', emoji)}
                               className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${formData.userEmoji === emoji ? 'border-pink-400 bg-pink-50 scale-110 shadow-sm' : 'border-transparent hover:bg-stone-50'}`}
                             >
                                <FluentEmoji emoji={emoji} size={24} />
                             </button>
                          ))}
                       </div>
                    </div>
                    <div>
                       <label className={labelStyle}>Email <span className="text-red-400">*</span> (用於接收評分結果)</label>
                       <input type="email" placeholder="rabbit@example.com" className={inputStyle} value={formData.userEmail} onChange={e => handleInputChange('userEmail', e.target.value)} />
                    </div>
                 </div>
               )}

            </div>

            {/* Footer Buttons */}
            <div className={`p-4 border-t ${themeColor === 'pink' ? 'border-pink-100 bg-pink-50' : themeColor === 'sky' ? 'border-sky-100 bg-sky-50' : 'border-night-pink-primary/20 bg-night-pink-primary/10'} flex justify-between`}>
               {step > 1 ? (
                 <button onClick={() => setStep(step - 1)} className="px-4 py-2 rounded-xl text-stone-500 font-bold hover:bg-black/5 transition-colors flex items-center gap-1">
                    <ChevronLeft size={18}/> 上一步
                 </button>
               ) : <div></div>}
               
               {step < 4 ? (
                 <button onClick={() => setStep(step + 1)} className={`px-6 py-2.5 rounded-xl text-white font-bold shadow-lg transition-all active:scale-95 flex items-center gap-1 ${btnBg}`}>
                    下一步 <ChevronRight size={18}/>
                 </button>
               ) : (
                 <button onClick={handleSubmit} disabled={isSubmitting} className={`px-8 py-2.5 rounded-xl text-white font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 ${btnBg} ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}>
                    {isSubmitting ? '傳送中...' : <><Send size={18}/> 確認送出</>}
                 </button>
               )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SubmitProjectModal;
