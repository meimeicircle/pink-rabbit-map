
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, PlusCircle, X, Map as MapIcon, List as ListIcon, FileText, TrainFront, BookOpen, ChevronDown, ChevronUp, Tag, Trash2, MapPin, Check, ArrowLeft, ArrowRight, Palette, SlidersHorizontal, Plus, CheckSquare, MessageCircle } from 'lucide-react';
import { EstateProject, FilterState, RabbitVerdict } from './types';
import { fetchProjects } from './services/sheetService';
import RabbitMap from './components/RabbitMap';
import ProjectList from './components/ProjectList';
import ProjectDrawer from './components/ProjectDrawer';
import CompareWidget from './components/CompareWidget';
import CompareModal from './components/CompareModal';
import AskRabbitModal from './components/AskRabbitModal';
import GuideModal from './components/GuideModal';
import SubmitProjectModal from './components/SubmitProjectModal';
import InstallPwaPrompt from './components/InstallPwaPrompt';
import { APP_TITLE, RABBIT_AVATAR_URL, SUNGLASSES_URL, MAP_3D_URL } from './constants';
import { FluentEmoji, TextWithFluentEmojis } from './utils/fluentEmoji';

export type ThemeColor = 'pink' | 'sky' | 'dark';

// Region Keywords Constants
const NTP_KEYWORDS = ['新北', '板橋', '三重', '中和', '永和', '新莊', '土城', '蘆洲', '汐止', '樹林', '鶯歌', '三峽', '淡水', '林口', '泰山', '五股', '八里', '深坑', '新店'];
const TY_KEYWORDS = ['桃園', '中壢', '平鎮', '八德', '楊梅', '蘆竹', '南崁', '大園', '龜山', '龍潭', '觀音', '新屋', '青埔', '大溪', 'A7', 'A8', 'A9', 'A10', 'A17', 'A18', 'A19', 'A20'];
const ILA_KEYWORDS = ['宜蘭', '羅東', '礁溪', '頭城'];

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [allProjects, setAllProjects] = useState<EstateProject[]>([]); 
  const [projects, setProjects] = useState<EstateProject[]>([]); 
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  
  const [compareList, setCompareList] = useState<EstateProject[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Welcome Modal State
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(true);
  const [welcomeCityKey, setWelcomeCityKey] = useState<string | null>(null);
  const [welcomeSelectedRegions, setWelcomeSelectedRegions] = useState<string[]>([]);

  // Sidebar Filter Modal State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterActiveTab, setFilterActiveTab] = useState<string>('新北市');
  const [tempSelectedRegions, setTempSelectedRegions] = useState<string[]>([]);

  const [showMRT, setShowMRT] = useState(false);
  
  // Separate states for expanding sections
  const [isMaterialFilterExpanded, setIsMaterialFilterExpanded] = useState(false);
  const [isAdvancedFilterExpanded, setIsAdvancedFilterExpanded] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<ThemeColor>('pink');

  // Custom Filter Input State
  const [materialInput, setMaterialInput] = useState('');

  const [filters, setFilters] = useState<FilterState>({
    region: '全部',
    search: '',
    selectedMaterials: [],
    publicRatioMax: '',
    totalUnitsMin: '',
    totalUnitsMax: '',
    baseAreaMin: '',
    baseAreaMax: '',
    managementFeeMax: '',
    floorHeightMin: ''
  });

  // 🐰 Favicon & Manifest Generator (Rabbit + Map Composite Icon)
  useEffect(() => {
    const updateIcon = async () => {
      try {
        const rabbitImg = new Image();
        rabbitImg.crossOrigin = 'Anonymous';
        rabbitImg.src = RABBIT_AVATAR_URL;

        const mapImg = new Image();
        mapImg.crossOrigin = 'Anonymous';
        mapImg.src = MAP_3D_URL;

        await Promise.all([
          new Promise(resolve => { rabbitImg.onload = resolve; }),
          new Promise(resolve => { mapImg.onload = resolve; })
        ]);

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 512, 512);
          ctx.drawImage(mapImg, 512/2 - 180, 512 - 320, 360, 360);
          ctx.drawImage(rabbitImg, 512/2 - 150, 20, 300, 300);
          const iconUrl = canvas.toDataURL('image/png');

          const links = document.querySelectorAll("link[rel*='icon']");
          links.forEach((link: any) => { link.href = iconUrl; });

          let manifestElement = document.querySelector("link[rel='manifest']");
          if (!manifestElement) {
            manifestElement = document.createElement('link');
            manifestElement.setAttribute('rel', 'manifest');
            document.head.appendChild(manifestElement);
          }

          const manifest = {
            name: "粉粉兔看房地圖",
            short_name: "粉粉兔",
            description: "可愛又實用的看房地圖，幫你 PK 建案！",
            start_url: "/",
            display: "standalone",
            background_color: "#ffffff",
            theme_color: "#fff0f5",
            orientation: "portrait",
            icons: [
              {
                src: iconUrl,
                sizes: "512x512",
                type: "image/png",
                purpose: "any maskable"
              }
            ]
          };
          const stringManifest = JSON.stringify(manifest);
          const blob = new Blob([stringManifest], {type: 'application/json'});
          const manifestURL = URL.createObjectURL(blob);
          manifestElement.setAttribute('href', manifestURL);
        }
      } catch (e) {
        console.error("Failed to generate composite icon", e);
      }
    };
    updateIcon();
  }, []);

  // Initial Fetch
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const data = await fetchProjects();
      setAllProjects(data);
      // Don't set displayed projects yet, wait for welcome screen
      setLoading(false);
    };
    init();
  }, []);

  // Sync Body Background with Theme
  useEffect(() => {
    let bgColor = '#fff0f5'; // pink
    if (theme === 'sky') bgColor = '#f0f9ff';
    if (theme === 'dark') bgColor = '#2F3832'; // Deep Forest Green

    document.body.style.backgroundColor = bgColor;
    document.body.classList.remove('theme-pink', 'theme-sky', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  // 🔙 Handle Browser Back Button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (selectedId) setSelectedId(null);
      if (isCompareModalOpen) setIsCompareModalOpen(false);
      if (isSubmitOpen) setIsSubmitOpen(false);
      if (isAskModalOpen) setIsAskModalOpen(false);
      if (isGuideOpen) setIsGuideOpen(false);
      if (isFilterModalOpen) setIsFilterModalOpen(false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedId, isCompareModalOpen, isSubmitOpen, isAskModalOpen, isGuideOpen, isFilterModalOpen]);

  // 🏗️ Grouped Regions Logic
  const groupedRegions = useMemo(() => {
    const groups: Record<string, string[]> = {
      '新北市': [],
      '桃園市': [],
      '宜蘭縣': [],
      '其他': []
    };

    const allRegions: string[] = Array.from<string>(new Set(allProjects.map(p => p.region))).sort();

    allRegions.forEach(region => {
      let isMatched = false;
      if (NTP_KEYWORDS.some(k => region.includes(k))) {
        groups['新北市'].push(region);
        isMatched = true;
      } else if (TY_KEYWORDS.some(k => region.includes(k))) {
        groups['桃園市'].push(region);
        isMatched = true;
      } else if (ILA_KEYWORDS.some(k => region.includes(k))) {
        groups['宜蘭縣'].push(region);
        isMatched = true;
      }
      
      if (!isMatched) {
        groups['其他'].push(region);
      }
    });

    return groups;
  }, [allProjects]);

  // 🔍 Main Filter Logic
  const [activeFilterRegions, setActiveFilterRegions] = useState<string[]>([]);

  // Helper to extract numbers from string
  const parseNumber = (str: string | undefined): number => {
    if (!str) return 0;
    const match = str.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[0]) : 0;
  };

  const filteredProjects = useMemo(() => {
    const query = filters.search.toLowerCase();
    
    return projects.filter(p => {
      // 1. Region Filter
      let matchesRegion = true;
      if (filters.region === '自訂選取') {
         matchesRegion = activeFilterRegions.includes(p.region);
      } else if (filters.region !== '全部') {
         matchesRegion = p.region === filters.region;
      }
      
      // 2. Text Search
      const contentToSearch = [
        p.name,
        p.address,
        p.developer,
        p.materialTags,
        p.sellingPoint,
        p.reason,
        p.constructionType,
        p.submitter?.name || '' // Add submitter search
      ].join(' ').toLowerCase();
      const matchesSearch = contentToSearch.includes(query);
      
      // 3. Custom Keyword Filter
      const matchesMaterials = filters.selectedMaterials.length === 0 || filters.selectedMaterials.every(selectedTag => {
        const projectTags = ((p.materialTags || '') + (p.constructionType || '') + (p.sellingPoint || '')).toLowerCase();
        const tagLower = selectedTag.toLowerCase();
        if (selectedTag === 'Panasonic (國際牌)') return projectTags.includes('panasonic') || projectTags.includes('國際牌');
        if (selectedTag === 'Electrolux (伊萊克斯)') return projectTags.includes('electrolux') || projectTags.includes('伊萊克斯');
        return projectTags.includes(tagLower);
      });

      // 4. Advanced Numeric Filters
      let matchesAdvanced = true;

      if (filters.publicRatioMax) {
        const pRatio = parseNumber(p.publicRatio);
        const filterRatio = parseFloat(filters.publicRatioMax);
        if (pRatio > 0 && !isNaN(filterRatio)) {
          if (pRatio > filterRatio) matchesAdvanced = false;
        }
      }

      if (matchesAdvanced) {
        const pUnits = parseNumber(p.totalUnits);
        if (filters.totalUnitsMin) {
           const min = parseFloat(filters.totalUnitsMin);
           if (pUnits > 0 && !isNaN(min) && pUnits < min) matchesAdvanced = false;
        }
        if (matchesAdvanced && filters.totalUnitsMax) {
           const max = parseFloat(filters.totalUnitsMax);
           if (pUnits > 0 && !isNaN(max) && pUnits > max) matchesAdvanced = false;
        }
      }

      if (matchesAdvanced) {
        const pBase = parseNumber(p.baseArea);
        if (filters.baseAreaMin) {
           const min = parseFloat(filters.baseAreaMin);
           if (pBase > 0 && !isNaN(min) && pBase < min) matchesAdvanced = false;
        }
        if (matchesAdvanced && filters.baseAreaMax) {
           const max = parseFloat(filters.baseAreaMax);
           if (pBase > 0 && !isNaN(max) && pBase > max) matchesAdvanced = false;
        }
      }

      if (matchesAdvanced && filters.managementFeeMax) {
        const pFee = parseNumber(p.managementFee);
        const maxFee = parseFloat(filters.managementFeeMax);
        if (pFee > 0 && !isNaN(maxFee) && pFee > maxFee) matchesAdvanced = false;
      }

      if (matchesAdvanced && filters.floorHeightMin) {
        const pHeight = parseNumber(p.floorHeightMeters || p.floorHeight);
        const minHeight = parseFloat(filters.floorHeightMin);
        if (pHeight > 0 && !isNaN(minHeight) && pHeight < minHeight) matchesAdvanced = false;
      }

      return matchesRegion && matchesSearch && matchesMaterials && matchesAdvanced;
    });
  }, [projects, filters, activeFilterRegions]);

  const selectedProject = useMemo(() => 
    projects.find(p => p.id === selectedId) || null
  , [projects, selectedId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleAddMaterial = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!materialInput.trim()) return;
    
    const newTag = materialInput.trim();
    if (!filters.selectedMaterials.includes(newTag)) {
      setFilters(prev => ({
        ...prev,
        selectedMaterials: [...prev.selectedMaterials, newTag]
      }));
    }
    setMaterialInput('');
  };

  const handleRemoveMaterial = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      selectedMaterials: prev.selectedMaterials.filter(t => t !== tag)
    }));
  };

  // 🌟 New Submission Handler
  const handleSubmitProject = (formData: any) => {
    // This handler is called after successful API submission
    // We log it here, but don't add to map until admin reviews Google Sheet
    console.log("New Project Submission received and sent to backend:", formData);
  };

  const handleProjectSelect = (id: string) => {
    setSelectedId(id);
    setMobileView('map');
    try {
      window.history.pushState({ drawer: id }, '', `#project-${id}`);
    } catch (e) {
      console.warn("History API restricted", e);
    }
  };

  const handleCloseDrawer = () => {
    if (window.history.state?.drawer) {
      window.history.back();
    } else {
      setSelectedId(null);
      try {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch (e) { console.warn(e); }
    }
  };

  const handleAddToCompare = (project: EstateProject) => {
    if (compareList.length >= 3) {
      alert("粉粉兔表示：一次最多只能 PK 3 個建案喔！🐰");
      return;
    }
    if (!compareList.some(p => p.id === project.id)) {
      setCompareList(prev => [...prev, project]);
    }
  };

  const handleRemoveFromCompare = (id: string) => {
    setCompareList(prev => prev.filter(p => p.id !== id));
  };

  const handleClearCompare = () => {
    setCompareList([]);
  };

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'pink') return 'sky';
      if (prev === 'sky') return 'dark';
      return 'pink';
    });
  };

  const handleWelcomeSelectCity = (cityKey: string) => {
    if (cityKey === 'ALL') {
      setProjects(allProjects);
      setIsWelcomeOpen(false);
      setIsGuideOpen(true);
    } else {
      setWelcomeCityKey(cityKey);
      setWelcomeSelectedRegions([]); 
    }
  };
  
  const getWelcomeRegions = () => {
     if (!welcomeCityKey) return [];
     let mapKey = '';
     if (welcomeCityKey === 'NTP') mapKey = '新北市';
     else if (welcomeCityKey === 'TY') mapKey = '桃園市';
     else if (welcomeCityKey === 'ILA') mapKey = '宜蘭縣';
     else if (welcomeCityKey === 'OTHER') mapKey = '其他';
     
     return groupedRegions[mapKey] || [];
  };

  const handleWelcomeToggleRegion = (region: string) => {
    setWelcomeSelectedRegions(prev => prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]);
  };

  const handleWelcomeConfirm = () => {
    if (welcomeSelectedRegions.length === 0) return;
    setProjects(allProjects);
    setActiveFilterRegions(welcomeSelectedRegions);
    setFilters(prev => ({ ...prev, region: '自訂選取' }));
    setIsWelcomeOpen(false);
    setIsGuideOpen(true);
  };

  const handleOpenFilterModal = () => {
     setTempSelectedRegions(activeFilterRegions.length > 0 ? activeFilterRegions : []);
     setIsFilterModalOpen(true);
  };

  const handleSidebarToggleRegion = (region: string) => {
    setTempSelectedRegions(prev => prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]);
  };

  const handleSidebarSelectAllInTab = () => {
    const regionsInTab = groupedRegions[filterActiveTab] || [];
    const allSelected = regionsInTab.every(r => tempSelectedRegions.includes(r));
    
    if (allSelected) {
       setTempSelectedRegions(prev => prev.filter(r => !regionsInTab.includes(r)));
    } else {
       setTempSelectedRegions(prev => {
         const newSet = new Set(prev);
         regionsInTab.forEach(r => newSet.add(r));
         return Array.from(newSet);
       });
    }
  };

  const handleSidebarClearAll = () => {
    setTempSelectedRegions([]);
  };

  const handleSidebarSelectAllGlobal = () => {
    const allRegions = Object.values(groupedRegions).flat();
    setTempSelectedRegions(Array.from(new Set(allRegions)));
  };

  const handleSidebarConfirm = () => {
    setProjects(allProjects);
    if (tempSelectedRegions.length === 0) {
      setFilters(prev => ({...prev, region: '全部'}));
      setActiveFilterRegions([]);
    } else {
      setActiveFilterRegions(tempSelectedRegions);
      setFilters(prev => ({...prev, region: '自訂選取'}));
    }
    setIsFilterModalOpen(false);
  };

  const ntpCount = useMemo(() => allProjects.filter(p => NTP_KEYWORDS.some(k => p.region.includes(k))).length, [allProjects]);
  const tyCount = useMemo(() => allProjects.filter(p => TY_KEYWORDS.some(k => p.region.includes(k))).length, [allProjects]);
  const ilaCount = useMemo(() => allProjects.filter(p => ILA_KEYWORDS.some(k => p.region.includes(k))).length, [allProjects]);
  const otherCount = useMemo(() => allProjects.length - ntpCount - tyCount - ilaCount, [allProjects, ntpCount, tyCount, ilaCount]);

  const mainContainerClass = theme === 'pink' ? 'bg-[#FFEFF6]' : theme === 'sky' ? 'bg-[#F0F9FF]' : 'bg-night-900';
  const sidebarClass = theme === 'pink' ? 'bg-[#FFEFF6] border-pink-100' : theme === 'sky' ? 'bg-[#F0F9FF] border-sky-100' : 'bg-night-900 border-white/10';
  const inputStyle = `w-full px-3 py-2 rounded-xl text-sm font-bold border-2 outline-none transition-colors ${theme === 'dark' ? 'bg-night-800 border-night-600 text-night-200 focus:border-night-pink-primary' : `bg-white border-stone-200 text-stone-600 ${theme === 'pink' ? 'focus:border-pink-300' : 'focus:border-sky-300'}`}`;
  const labelStyle = `text-xs font-bold mb-1 block ${theme === 'dark' ? 'text-night-300' : 'text-stone-400'}`;
  const hasAdvancedFilters = !!filters.publicRatioMax || !!filters.totalUnitsMin || !!filters.totalUnitsMax || !!filters.baseAreaMin || !!filters.baseAreaMax || !!filters.managementFeeMax || !!filters.floorHeightMin;

  const sidebarTabs = useMemo(() => {
    const tabs = ['新北市', '桃園市', '宜蘭縣'];
    if (otherCount > 0) tabs.push('其他');
    return tabs;
  }, [otherCount]);

  return (
    <div className={`h-[100dvh] flex flex-col text-[#5A463D] overflow-hidden relative ${mainContainerClass} transition-colors duration-500`}>
      
      {loading && (
        <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-colors duration-500 ${theme === 'pink' ? 'bg-[#fff0f5]' : theme === 'sky' ? 'bg-[#f0f9ff]' : 'bg-[#2F3832]'}`}>
           <div className="w-24 h-24 mb-4 animate-bounce">
              <img src={RABBIT_AVATAR_URL} alt="Loading" className="w-full h-full object-contain" />
           </div>
           <h2 className={`text-xl font-black tracking-widest ${theme === 'pink' ? 'text-pink-500' : theme === 'sky' ? 'text-sky-500' : 'text-white'}`}>
              粉粉兔準備中...
           </h2>
        </div>
      )}

      {isWelcomeOpen && !loading && (
        <div className={`fixed inset-0 z-[6000] ${mainContainerClass} flex flex-col items-center justify-center p-6 animate-in fade-in duration-500 overflow-hidden`}>
           <div className={`transition-all duration-500 ${welcomeCityKey ? 'mt-8 scale-75' : 'mt-0 scale-100'} flex flex-col items-center shrink-0`}>
             <div className={`w-24 h-24 bg-white rounded-full p-4 shadow-xl border-4 ${theme === 'pink' ? 'border-pink-200' : theme === 'sky' ? 'border-sky-200' : 'border-night-pink-primary'} mb-4 animate-bounce`}>
                <img src={RABBIT_AVATAR_URL} className="w-full h-full object-contain" alt="Logo" />
             </div>
             <h1 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : theme === 'pink' ? 'text-pink-500' : 'text-sky-500'} mb-2 tracking-wide text-center`}>粉粉兔看房地圖</h1>
           </div>
           
           {!welcomeCityKey ? (
             <div className="flex flex-col items-center w-full max-w-sm animate-in slide-in-from-bottom-10 duration-500">
               <p className={`font-bold mb-8 text-center ${theme === 'dark' ? 'text-night-200' : 'text-[#7A6E6A]'}`}>
                 <TextWithFluentEmojis text="請先選擇您想探索的縣市 🐰" />
               </p>
               <div className="grid grid-cols-1 gap-4 w-full">
                  <button onClick={() => handleWelcomeSelectCity('NTP')} className={`${theme === 'dark' ? 'bg-night-800 border-night-700 hover:bg-night-700' : 'bg-white hover:bg-pink-50 border-pink-100'} border-4 p-4 rounded-3xl flex items-center justify-between shadow-sm transition-all hover:scale-105 active:scale-95 group`}>
                     <div className="flex items-center gap-3">
                        <div className={`${theme === 'dark' ? 'bg-night-600 text-white' : 'bg-pink-100 text-pink-500 group-hover:bg-pink-500 group-hover:text-white'} p-2.5 rounded-full font-bold transition-colors`}>N</div>
                        <span className={`font-bold text-lg ${theme === 'dark' ? 'text-night-200' : 'text-[#5A463D]'}`}>新北市</span>
                     </div>
                     <span className={`${theme === 'dark' ? 'bg-night-700 text-night-300' : 'bg-stone-100 text-stone-400'} px-3 py-1 rounded-full text-xs font-bold`}>{ntpCount} 案</span>
                  </button>
                  
                  <button onClick={() => handleWelcomeSelectCity('TY')} className={`${theme === 'dark' ? 'bg-night-800 border-night-700 hover:bg-night-700' : 'bg-white hover:bg-green-50 border-green-100'} border-4 p-4 rounded-3xl flex items-center justify-between shadow-sm transition-all hover:scale-105 active:scale-95 group`}>
                     <div className="flex items-center gap-3">
                        <div className={`${theme === 'dark' ? 'bg-night-600 text-white' : 'bg-green-100 text-green-500 group-hover:bg-green-500 group-hover:text-white'} p-2.5 rounded-full font-bold transition-colors`}>T</div>
                        <span className={`font-bold text-lg ${theme === 'dark' ? 'text-night-200' : 'text-[#5A463D]'}`}>桃園市</span>
                     </div>
                     <span className={`${theme === 'dark' ? 'bg-night-700 text-night-300' : 'bg-stone-100 text-stone-400'} px-3 py-1 rounded-full text-xs font-bold`}>{tyCount} 案</span>
                  </button>
                  
                  <button onClick={() => handleWelcomeSelectCity('ILA')} className={`${theme === 'dark' ? 'bg-night-800 border-night-700 hover:bg-night-700' : 'bg-white hover:bg-orange-50 border-orange-100'} border-4 p-4 rounded-3xl flex items-center justify-between shadow-sm transition-all hover:scale-105 active:scale-95 group`}>
                     <div className="flex items-center gap-3">
                        <div className={`${theme === 'dark' ? 'bg-night-600 text-white' : 'bg-orange-100 text-orange-500 group-hover:bg-orange-500 group-hover:text-white'} p-2.5 rounded-full font-bold transition-colors`}>Y</div>
                        <span className={`font-bold text-lg ${theme === 'dark' ? 'text-night-200' : 'text-[#5A463D]'}`}>宜蘭縣</span>
                     </div>
                     <span className={`${theme === 'dark' ? 'bg-night-700 text-night-300' : 'bg-stone-100 text-stone-400'} px-3 py-1 rounded-full text-xs font-bold`}>{ilaCount} 案</span>
                  </button>

                  {otherCount > 0 && (
                    <button onClick={() => handleWelcomeSelectCity('OTHER')} className={`${theme === 'dark' ? 'bg-night-800 border-night-700 hover:bg-night-700' : 'bg-white hover:bg-stone-50 border-stone-100'} border-4 p-4 rounded-3xl flex items-center justify-between shadow-sm transition-all hover:scale-105 active:scale-95 group`}>
                       <div className="flex items-center gap-3">
                          <div className={`${theme === 'dark' ? 'bg-night-600 text-white' : 'bg-stone-100 text-stone-500 group-hover:bg-stone-500 group-hover:text-white'} p-2.5 rounded-full font-bold transition-colors`}>O</div>
                          <span className={`font-bold text-lg ${theme === 'dark' ? 'text-night-200' : 'text-[#5A463D]'}`}>其他縣市</span>
                       </div>
                       <span className={`${theme === 'dark' ? 'bg-night-700 text-night-300' : 'bg-stone-100 text-stone-400'} px-3 py-1 rounded-full text-xs font-bold`}>{otherCount} 案</span>
                    </button>
                  )}

                  <button onClick={() => handleWelcomeSelectCity('ALL')} className={`mt-4 font-bold text-sm ${theme === 'dark' ? 'text-night-300 hover:text-white' : theme === 'pink' ? 'text-stone-400 hover:text-pink-500' : 'text-stone-400 hover:text-sky-500'} transition-colors`}>
                     顯示全部 ({allProjects.length}) <span className="text-xs text-red-300 block font-normal">(地圖可能會卡頓)</span>
                  </button>
               </div>
             </div>
           ) : (
             <div className="w-full max-w-md flex flex-col h-[60vh] animate-in slide-in-from-right-10 duration-300">
                <div className="flex items-center justify-between mb-4 px-2">
                   <button onClick={() => setWelcomeCityKey(null)} className={`flex items-center gap-1 font-bold transition-colors ${theme === 'dark' ? 'text-night-300 hover:text-white' : 'text-stone-400 hover:text-pink-500'}`}>
                      <ArrowLeft size={18} /> 返回
                   </button>
                   <div className={`${theme === 'dark' ? 'text-night-200' : 'text-stone-600'} font-bold`}>
                      已選: <span className={`${theme === 'dark' ? 'text-white' : theme === 'pink' ? 'text-pink-500' : 'text-sky-500'} text-lg`}>{welcomeSelectedRegions.length}</span>
                   </div>
                </div>
                <div className={`flex-1 rounded-3xl border-4 ${theme === 'dark' ? 'bg-night-800 border-night-700' : theme === 'pink' ? 'bg-white border-pink-100' : 'bg-white border-sky-100'} p-4 overflow-y-auto shadow-inner rabbit-scroll`}>
                   <div className="grid grid-cols-2 gap-3">
                      {getWelcomeRegions().map(region => {
                         const isSelected = welcomeSelectedRegions.includes(region);
                         const activeClass = theme === 'pink' ? 'bg-pink-500 text-white border-pink-500' : theme === 'sky' ? 'bg-sky-500 text-white border-sky-500' : 'bg-night-pink-primary text-white border-night-pink-primary';
                         const inactiveClass = theme === 'dark' ? 'bg-night-700 text-night-300 border-night-600 hover:bg-night-600' : 'bg-white text-stone-600 border-stone-100';
                         
                         return (
                            <button key={region} onClick={() => handleWelcomeToggleRegion(region)} className={`py-3 px-2 rounded-2xl font-bold text-sm transition-all border-2 flex items-center justify-center gap-2 ${isSelected ? `${activeClass} shadow-md transform scale-105` : inactiveClass}`}>
                               {region}
                               {isSelected && <Check size={14} strokeWidth={4} />}
                            </button>
                         );
                      })}
                   </div>
                </div>
                <div className="mt-4">
                   <button onClick={handleWelcomeConfirm} disabled={welcomeSelectedRegions.length === 0} className={`w-full py-3.5 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${welcomeSelectedRegions.length > 0 ? `bg-gradient-to-r ${theme === 'pink' ? 'from-pink-500 to-pink-400' : theme === 'sky' ? 'from-sky-500 to-sky-400' : 'from-night-pink-primary to-night-pink-secondary'} text-white hover:scale-[1.02] active:scale-95` : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}>
                      開始探索 <ArrowRight size={20} />
                   </button>
                </div>
             </div>
           )}
        </div>
      )}

      {isFilterModalOpen && (
         <div className="fixed inset-0 z-[7000] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center animate-in fade-in duration-200">
             <div className="absolute inset-0" onClick={() => setIsFilterModalOpen(false)}></div>
             
             <div className={`w-full md:w-[420px] md:rounded-[2rem] rounded-t-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] h-[80vh] md:h-[600px] animate-in slide-in-from-bottom-10 duration-300 relative z-10 border-4 ${theme === 'pink' ? 'bg-white border-pink-100' : theme === 'sky' ? 'bg-white border-sky-100' : 'bg-night-800 border-white/50'}`}>
                
                <div className={`shrink-0 border-b ${theme === 'pink' ? 'bg-pink-50 border-pink-100' : theme === 'sky' ? 'bg-sky-50 border-sky-100' : 'bg-night-800 border-night-700'}`}>
                   <div className="p-4 flex justify-between items-center">
                       <div className="flex items-center gap-2">
                           <div className="w-8 h-8 bg-white rounded-full p-0.5 shadow-sm flex items-center justify-center"><FluentEmoji emoji="🐰" size={20} /></div>
                           <h2 className={`font-bold text-lg flex items-center gap-2 ${theme === 'dark' ? 'text-night-200' : 'text-[#5A463D]'}`}>選擇區域</h2>
                       </div>
                       <button onClick={() => setIsFilterModalOpen(false)} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-night-400 hover:bg-night-700' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'}`}>
                           <X size={20} />
                       </button>
                   </div>
                   
                   <div className="px-4 pb-0 flex items-end justify-between gap-2">
                       <div className="flex gap-4 overflow-x-auto no-scrollbar mask-gradient-right flex-1">
                           {sidebarTabs.map(tab => (
                              <button
                                key={tab}
                                onClick={() => setFilterActiveTab(tab)}
                                className={`pb-3 text-base font-bold whitespace-nowrap transition-all border-b-4 ${filterActiveTab === tab ? (theme === 'pink' ? 'text-pink-600 border-pink-500' : theme === 'sky' ? 'text-sky-600 border-sky-500' : 'text-night-pink-primary border-night-pink-primary') : 'text-stone-400 border-transparent hover:text-stone-500'}`}
                              >
                                 {tab}
                              </button>
                           ))}
                       </div>
                       <button onClick={handleSidebarSelectAllInTab} className={`mb-3 shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-colors shadow-sm ${theme === 'pink' ? 'bg-white text-pink-500 hover:bg-pink-100 border border-pink-200' : theme === 'sky' ? 'bg-white text-sky-500 hover:bg-sky-100 border border-sky-200' : 'bg-night-600 text-white hover:bg-night-600/80 border border-night-500'}`}>
                          {groupedRegions[filterActiveTab]?.every(r => tempSelectedRegions.includes(r)) ? '取消全選' : '全選此頁'}
                       </button>
                   </div>
                </div>

                <div className={`flex-1 overflow-y-auto rabbit-scroll ${theme === 'dark' ? 'bg-night-800' : 'bg-stone-50/50'}`}>
                    <div className="flex flex-col">
                       {(groupedRegions[filterActiveTab] || []).map(region => {
                          const isSelected = tempSelectedRegions.includes(region);
                          return (
                             <button
                               key={region}
                               onClick={() => handleSidebarToggleRegion(region)}
                               className={`w-full flex items-center justify-between p-4 border-b transition-colors ${theme === 'dark' ? 'border-white/10 hover:bg-night-700' : 'border-stone-100 hover:bg-white'} ${isSelected ? (theme === 'dark' ? 'bg-night-700' : 'bg-white') : ''}`}
                             >
                                <span className={`text-base font-bold ${isSelected ? (theme === 'dark' ? 'text-night-200' : 'text-stone-800') : (theme === 'dark' ? 'text-night-300' : 'text-stone-500')}`}>{region}</span>
                                
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? (theme === 'pink' ? 'border-pink-500 bg-pink-500' : theme === 'sky' ? 'border-sky-500 bg-sky-500' : 'border-night-pink-primary bg-night-pink-primary') : (theme === 'dark' ? 'border-night-400 bg-night-800' : 'border-stone-300 bg-white')}`}>
                                   {isSelected && <Check size={14} className={theme === 'dark' ? 'text-white' : 'text-white'} strokeWidth={3} />}
                                </div>
                             </button>
                          );
                       })}
                       
                       {(groupedRegions[filterActiveTab] || []).length === 0 && (
                          <div className="py-12 text-center text-stone-400 font-bold">
                             <TextWithFluentEmojis text="這裡還沒有建案資料喔 🐰" />
                          </div>
                       )}
                    </div>
                </div>

                <div className={`p-4 border-t shrink-0 shadow-lg flex flex-col gap-3 ${theme === 'pink' ? 'bg-pink-50 border-pink-100' : theme === 'sky' ? 'bg-sky-50 border-sky-100' : 'bg-night-800 border-night-700'}`}>
                   {/* Global Select/Clear Actions */}
                   <div className="flex gap-2">
                      <button 
                        onClick={handleSidebarClearAll}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all active:scale-95 flex items-center justify-center gap-1.5 ${theme === 'dark' ? 'bg-night-800 border-night-600 text-night-300 hover:bg-night-700' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'}`}
                      >
                         <Trash2 size={14} /> 清除全部
                      </button>
                      <button 
                        onClick={handleSidebarSelectAllGlobal}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all active:scale-95 flex items-center justify-center gap-1.5 ${theme === 'pink' ? 'bg-white border-pink-200 text-pink-600 hover:bg-pink-50' : theme === 'sky' ? 'bg-white border-sky-200 text-sky-600 hover:bg-sky-50' : 'bg-night-800 border-night-pink-primary text-night-pink-primary hover:bg-night-pink-primary/10'}`}
                      >
                         <CheckSquare size={14} /> 選取所有縣市
                      </button>
                   </div>

                   <button 
                     onClick={handleSidebarConfirm}
                     className={`w-full ${theme === 'dark' ? 'bg-night-pink-primary hover:bg-night-pink-secondary text-white' : 'bg-[#5C4B47] hover:bg-[#4a3a32] text-white'} py-4 rounded-xl font-bold text-lg shadow-md transition-all active:scale-95 flex items-center justify-center gap-2`}
                   >
                      確認 ({tempSelectedRegions.length})
                   </button>
                </div>

             </div>
         </div>
      )}

      <header className={`${theme === 'dark' ? 'bg-night-800 border-night-700' : 'bg-white border-b-4'} shadow-sm px-4 md:px-6 py-3 z-20 flex items-center justify-between gap-4 border-b-4 ${theme === 'pink' ? 'border-pink-100' : theme === 'sky' ? 'border-sky-100' : 'border-white/20'} shrink-0 transition-colors duration-500`}>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsWelcomeOpen(true)}>
          <div className={`w-11 h-11 md:w-14 md:h-14 rounded-full ${theme === 'pink' ? 'bg-pink-50 border-pink-100' : theme === 'sky' ? 'bg-sky-50 border-sky-100' : 'bg-night-600 border-night-400'} flex items-center justify-center p-1 shadow-inner border shrink-0 transition-colors relative overflow-visible`}>
            <img src={RABBIT_AVATAR_URL} alt="Logo" className="w-full h-full object-contain drop-shadow-sm relative z-10" />
            {theme === 'dark' && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 mt-1">
                 <img src={SUNGLASSES_URL} alt="Sunglasses" className="w-full h-full object-contain" />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <h1 className={`text-lg md:text-2xl font-bold ${theme === 'dark' ? 'text-night-200' : theme === 'pink' ? 'text-pink-500' : 'text-sky-500'} truncate leading-none transition-colors`}>
              {APP_TITLE}
            </h1>
            <span className={`text-[10px] md:text-xs font-bold ${theme === 'pink' ? 'text-pink-300' : theme === 'sky' ? 'text-sky-300' : 'text-night-400'} tracking-[0.2em] uppercase mt-1 ml-0.5 transition-colors`}>
              rabbitpinkpink
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 relative">
          <button 
            onClick={() => setIsSubmitOpen(true)}
            className={`flex items-center gap-2 border-2 ${theme === 'pink' ? 'bg-white border-pink-200 text-pink-500 hover:bg-pink-50' : theme === 'sky' ? 'bg-white border-sky-200 text-sky-500 hover:bg-sky-50' : 'bg-white border-[#728A7A] text-[#728A7A] hover:bg-[#728A7A]/10'} px-3 py-1.5 md:px-4 md:py-2 rounded-2xl font-bold text-sm transition-all shadow-sm shrink-0`}
          >
            <PlusCircle size={18} />
            <span className="hidden md:inline">網友投稿</span>
          </button>

          <button 
            onClick={() => setIsGuideOpen(true)}
            className={`flex items-center gap-2 border-2 ${theme === 'pink' ? 'bg-white border-pink-200 text-pink-500 hover:bg-pink-50' : theme === 'sky' ? 'bg-white border-sky-200 text-sky-500 hover:bg-sky-50' : 'bg-white border-[#728A7A] text-[#728A7A] hover:bg-[#728A7A]/10'} px-3 py-1.5 md:px-4 md:py-2 rounded-2xl font-bold text-sm transition-all shadow-sm shrink-0`}
          >
            <BookOpen size={18} />
            <span className="hidden md:inline">教戰手冊</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className={`w-full md:w-[400px] lg:w-[450px] h-full flex-col ${sidebarClass} md:border-r shadow-xl z-10 ${mobileView === 'list' ? 'flex' : 'hidden md:flex'}`}>
          
          <div className="p-4 md:p-6 pb-2 space-y-4 shrink-0 transition-all duration-300 z-20 relative">
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                   <button 
                      onClick={handleOpenFilterModal}
                      className={`w-full px-4 py-3 rounded-2xl border-2 ${theme === 'pink' ? 'bg-white border-pink-100' : theme === 'sky' ? 'bg-white border-sky-100' : 'bg-night-800 border-white/50 text-night-200'} flex items-center justify-between font-bold shadow-sm active:scale-95 transition-all`}
                   >
                      <span className="truncate">
                         {filters.region === '全部' ? '全部區域' : 
                          filters.region === '自訂選取' ? `自訂選取 (${activeFilterRegions.length})` : 
                          filters.region}
                      </span>
                      <ChevronDown size={20} className={theme === 'dark' ? 'text-night-400' : 'text-stone-400'} />
                   </button>
                </div>
              </div>

              <form onSubmit={handleSearch} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="搜尋建案、建材或特色..." 
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                  className={`flex-1 px-4 py-3 rounded-2xl border-2 ${theme === 'pink' ? 'border-pink-100 focus:border-pink-300 placeholder-pink-200' : theme === 'sky' ? 'border-sky-100 focus:border-sky-300 placeholder-sky-200' : 'bg-night-800 border-night-600 focus:border-night-pink-primary placeholder-night-400 text-night-200'} focus:outline-none`}
                />
                <button type="submit" className={`${theme === 'pink' ? 'bg-pink-400 hover:bg-pink-500' : theme === 'sky' ? 'bg-sky-400 hover:bg-sky-500' : 'bg-night-pink-primary hover:bg-night-pink-secondary text-white'} text-white px-6 rounded-2xl font-bold transition-colors shadow-sm active:scale-95`}>
                  <Search className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 md:px-6 rabbit-scroll pb-24 md:pb-0">
            <div className={`rounded-2xl border-2 ${theme === 'pink' ? 'bg-white border-pink-100' : theme === 'sky' ? 'bg-white border-sky-100' : 'bg-night-800 border-white/20'} overflow-hidden shadow-sm mb-4`}>
                <button 
                  onClick={() => setIsMaterialFilterExpanded(!isMaterialFilterExpanded)}
                  className={`w-full flex justify-between items-center p-3 transition-colors ${theme === 'pink' ? 'bg-pink-50/50 hover:bg-pink-50' : theme === 'sky' ? 'bg-sky-50/50 hover:bg-sky-50' : 'bg-night-800 hover:bg-night-700'}`}
                >
                   <div className={`flex items-center gap-2 font-bold ${theme === 'dark' ? 'text-night-200' : 'text-[#5A463D]'}`}>
                      <div className={`${theme === 'pink' ? 'bg-pink-100 text-pink-500' : theme === 'sky' ? 'bg-sky-100 text-sky-500' : 'bg-night-600 text-white'} p-1.5 rounded-full`}><Tag size={16} /></div>
                      <span>自製篩選器 {filters.selectedMaterials.length > 0 && <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${theme === 'pink' ? 'text-pink-500 bg-pink-100' : theme === 'sky' ? 'text-sky-500 bg-sky-100' : 'text-white bg-night-600'}`}>{filters.selectedMaterials.length}</span>}</span>
                   </div>
                   {isMaterialFilterExpanded ? <ChevronUp size={18} className={theme === 'dark' ? 'text-night-400' : 'text-stone-400'}/> : <ChevronDown size={18} className={theme === 'dark' ? 'text-night-400' : 'text-stone-400'}/>}
                </button>
                
                {(isMaterialFilterExpanded || filters.selectedMaterials.length > 0) && (
                   <div className={`p-4 border-t space-y-4 ${isMaterialFilterExpanded ? 'block' : 'hidden'} ${theme === 'pink' ? 'bg-white border-pink-100' : theme === 'sky' ? 'bg-white border-sky-100' : 'bg-night-800 border-white/5'}`}>
                      
                      <form onSubmit={handleAddMaterial} className="flex gap-2">
                         <input 
                           type="text"
                           value={materialInput}
                           onChange={(e) => setMaterialInput(e.target.value)}
                           placeholder="輸入關鍵字 (如: YKK, 林內, GROHE...)"
                           className={inputStyle}
                         />
                         <button 
                           type="submit"
                           disabled={!materialInput.trim()}
                           className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all border-2 active:scale-95 ${theme === 'pink' ? 'bg-pink-100 text-pink-500 border-pink-200 hover:bg-pink-200' : theme === 'sky' ? 'bg-sky-100 text-sky-500 border-sky-200 hover:bg-sky-200' : 'bg-night-600 text-white border-night-600 hover:bg-night-700'}`}
                         >
                            <Plus size={20} />
                         </button>
                      </form>

                      {filters.selectedMaterials.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                           {filters.selectedMaterials.map(tag => (
                              <button
                                 key={tag}
                                 onClick={() => handleRemoveMaterial(tag)}
                                 className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${theme === 'pink' ? 'bg-pink-500 border-pink-500 text-white shadow-pink-200' : theme === 'sky' ? 'bg-sky-500 border-sky-500 text-white shadow-sky-200' : 'bg-night-pink-primary border-night-pink-primary text-white shadow-night-700'}`}
                              >
                                 {tag}
                                 <X size={14} className="opacity-70 group-hover:opacity-100" />
                              </button>
                           ))}
                           <button 
                             onClick={() => setFilters(prev => ({...prev, selectedMaterials: []}))}
                             className={`text-xs flex items-center gap-1 transition-colors px-2 py-1.5 rounded ml-auto ${theme === 'dark' ? 'text-night-300 hover:text-night-pink-primary' : 'text-stone-400 hover:text-red-500'}`}
                           >
                              <Trash2 size={12} /> 清除全部
                           </button>
                        </div>
                      ) : (
                        <div className={`text-xs text-center py-2 ${theme === 'dark' ? 'text-night-400' : 'text-stone-400'}`}>
                           輸入關鍵字並按下「+」來增加篩選條件 (同時符合)
                        </div>
                      )}
                   </div>
                )}
            </div>

            <div className={`rounded-2xl border-2 ${theme === 'pink' ? 'bg-white border-pink-100' : theme === 'sky' ? 'bg-white border-sky-100' : 'bg-night-800 border-white/20'} overflow-hidden shadow-sm mb-4`}>
                <button 
                  onClick={() => setIsAdvancedFilterExpanded(!isAdvancedFilterExpanded)}
                  className={`w-full flex justify-between items-center p-3 transition-colors ${theme === 'pink' ? 'bg-pink-50/50 hover:bg-pink-50' : theme === 'sky' ? 'bg-sky-50/50 hover:bg-sky-50' : 'bg-night-800 hover:bg-night-700'}`}
                >
                   <div className={`flex items-center gap-2 font-bold ${theme === 'dark' ? 'text-night-200' : 'text-[#5A463D]'}`}>
                      <div className={`${theme === 'pink' ? 'bg-pink-100 text-pink-500' : theme === 'sky' ? 'bg-sky-100 text-sky-500' : 'bg-night-600 text-white'} p-1.5 rounded-full`}><SlidersHorizontal size={16} /></div>
                      <span>進階數值篩選 {hasAdvancedFilters && <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${theme === 'pink' ? 'text-pink-500 bg-pink-100' : theme === 'sky' ? 'text-sky-500 bg-sky-100' : 'text-white bg-night-600'}`}>ON</span>}</span>
                   </div>
                   {isAdvancedFilterExpanded ? <ChevronUp size={18} className={theme === 'dark' ? 'text-night-400' : 'text-stone-400'}/> : <ChevronDown size={18} className={theme === 'dark' ? 'text-night-400' : 'text-stone-400'}/>}
                </button>
                
                {(isAdvancedFilterExpanded || hasAdvancedFilters) && (
                   <div className={`p-4 border-t space-y-4 ${isAdvancedFilterExpanded ? 'block' : 'hidden'} ${theme === 'pink' ? 'bg-white border-pink-100' : theme === 'sky' ? 'bg-white border-sky-100' : 'bg-night-800 border-white/5'}`}>
                      {hasAdvancedFilters && (
                        <div className="flex justify-end">
                           <button 
                             onClick={() => setFilters(prev => ({...prev, publicRatioMax: '', totalUnitsMin: '', totalUnitsMax: '', baseAreaMin: '', baseAreaMax: '', managementFeeMax: '', floorHeightMin: ''}))}
                             className={`text-xs flex items-center gap-1 transition-colors px-2 py-1 rounded ${theme === 'dark' ? 'text-night-300 hover:text-night-pink-primary hover:bg-night-700' : 'text-stone-400 hover:text-red-500 hover:bg-stone-50'}`}
                           >
                              <Trash2 size={12} /> 重設數值
                           </button>
                        </div>
                      )}
                      
                      <div>
                         <label className={labelStyle}>公設比 (小於 %)</label>
                         <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              placeholder="例如: 34" 
                              className={inputStyle}
                              value={filters.publicRatioMax}
                              onChange={(e) => setFilters(prev => ({...prev, publicRatioMax: e.target.value}))}
                            />
                            <span className={`font-bold text-sm ${theme === 'dark' ? 'text-night-300' : 'text-stone-400'}`}>% 以下</span>
                         </div>
                      </div>

                      <div>
                         <label className={labelStyle}>管理費 (小於)</label>
                         <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              placeholder="例如: 100" 
                              className={inputStyle}
                              value={filters.managementFeeMax}
                              onChange={(e) => setFilters(prev => ({...prev, managementFeeMax: e.target.value}))}
                            />
                            <span className={`font-bold text-sm ${theme === 'dark' ? 'text-night-300' : 'text-stone-400'}`}>元/坪 以下</span>
                         </div>
                      </div>

                      <div>
                         <label className={labelStyle}>樓高 (大於)</label>
                         <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              placeholder="例如: 3.4" 
                              step="0.1"
                              className={inputStyle}
                              value={filters.floorHeightMin}
                              onChange={(e) => setFilters(prev => ({...prev, floorHeightMin: e.target.value}))}
                            />
                            <span className={`font-bold text-sm ${theme === 'dark' ? 'text-night-300' : 'text-stone-400'}`}>米 以上</span>
                         </div>
                      </div>

                      <div>
                         <label className={labelStyle}>住家戶數 (戶)</label>
                         <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              placeholder="最少" 
                              className={inputStyle}
                              value={filters.totalUnitsMin}
                              onChange={(e) => setFilters(prev => ({...prev, totalUnitsMin: e.target.value}))}
                            />
                            <span className={theme === 'dark' ? 'text-night-400' : 'text-stone-300'}>-</span>
                            <input 
                              type="number" 
                              placeholder="最多" 
                              className={inputStyle}
                              value={filters.totalUnitsMax}
                              onChange={(e) => setFilters(prev => ({...prev, totalUnitsMax: e.target.value}))}
                            />
                         </div>
                      </div>

                      <div>
                         <label className={labelStyle}>基地面積 (坪)</label>
                         <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              placeholder="最少" 
                              className={inputStyle}
                              value={filters.baseAreaMin}
                              onChange={(e) => setFilters(prev => ({...prev, baseAreaMin: e.target.value}))}
                            />
                            <span className={theme === 'dark' ? 'text-night-400' : 'text-stone-300'}>-</span>
                            <input 
                              type="number" 
                              placeholder="最多" 
                              className={inputStyle}
                              value={filters.baseAreaMax}
                              onChange={(e) => setFilters(prev => ({...prev, baseAreaMax: e.target.value}))}
                            />
                         </div>
                      </div>
                   </div>
                )}
            </div>

             <div className="flex justify-between items-center px-1 pb-3">
               {!loading && !isWelcomeOpen && (
                 <div className={`text-xs font-bold ${theme === 'pink' ? 'text-pink-300' : theme === 'sky' ? 'text-sky-300' : 'text-night-400'} tracking-wider flex items-center gap-1`}>
                    <span className={`${theme === 'pink' ? 'bg-pink-100 text-pink-500' : theme === 'sky' ? 'bg-sky-100 text-sky-500' : 'bg-night-600 text-white'} px-2 py-0.5 rounded-md`}>{filteredProjects.length}</span> 個選手存活
                 </div>
               )}
             </div>

            {loading || isWelcomeOpen ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-6"></div>
            ) : (
              <ProjectList 
                projects={filteredProjects} 
                selectedId={selectedId}
                onSelect={handleProjectSelect}
                compareList={compareList}
                onAddToCompare={handleAddToCompare}
                onRemoveFromCompare={handleRemoveFromCompare}
                themeColor={theme}
              />
            )}
          </div>
        </div>

        <div className={`flex-1 relative p-0 h-full ${mainContainerClass} ${mobileView === 'map' ? 'flex' : 'hidden md:flex'}`}>
           <div className="w-full h-full md:p-6">
              {!loading && !isWelcomeOpen && (
                <RabbitMap 
                  projects={filteredProjects} 
                  selectedId={selectedId}
                  onSelect={handleProjectSelect}
                  mobileView={mobileView}
                  compareList={compareList}
                  onAddToCompare={handleAddToCompare}
                  onRemoveFromCompare={handleRemoveFromCompare}
                  showMRT={showMRT}
                  themeColor={theme}
                />
              )}
           </div>
        </div>

        {!isCompareModalOpen && !isSubmitOpen && !isAskModalOpen && !isGuideOpen && !selectedId && !isWelcomeOpen && (
          <div className="md:hidden fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[1000] pb-[env(safe-area-inset-bottom)]">
             <button 
               onClick={() => setMobileView(mobileView === 'list' ? 'map' : 'list')}
               className={`flex items-center gap-2 ${theme === 'pink' ? 'bg-pink-500 border-pink-500' : theme === 'sky' ? 'bg-sky-500 border-sky-500' : 'bg-night-pink-primary border-night-pink-primary text-white'} text-white px-6 py-3 rounded-full shadow-xl border-2 active:scale-95 transition-all`}
             >
                {mobileView === 'list' ? (
                  <><MapIcon size={20} fill="currentColor" /><span className="font-bold text-lg">看地圖</span></>
                ) : (
                  <><ListIcon size={20} /><span className="font-bold text-lg">找列表</span></>
                )}
             </button>
          </div>
        )}

        {!isWelcomeOpen && !selectedId && !isCompareModalOpen && (
          <div className="fixed bottom-24 right-4 md:right-8 z-[1400] flex flex-col gap-3 pb-[env(safe-area-inset-bottom)]">
             <button 
               onClick={toggleTheme}
               className={`w-12 h-12 rounded-full shadow-lg border-2 flex items-center justify-center transition-transform active:scale-95 ${theme === 'dark' ? 'bg-night-800 border-night-700 text-night-200 hover:text-white' : 'bg-white border-stone-100 text-stone-500 hover:text-stone-700'}`}
               title="切換主題色 (Pink -> Sky -> Earth)"
             >
                <Palette size={24} className={theme === 'pink' ? 'text-pink-500' : theme === 'sky' ? 'text-sky-500' : 'text-night-pink-primary'} />
             </button>

             <button 
               onClick={() => setShowMRT(!showMRT)}
               className={`w-12 h-12 rounded-full shadow-lg border-2 flex items-center justify-center transition-transform active:scale-95 ${showMRT ? (theme === 'pink' ? 'bg-pink-500 border-pink-500 text-white' : theme === 'sky' ? 'bg-sky-500 border-sky-500 text-white' : 'bg-night-600 border-night-600 text-white') : (theme === 'dark' ? 'bg-night-800 border-night-700 text-night-400' : 'bg-white border-stone-100 text-stone-500')}`}
               title="顯示捷運"
             >
                <TrainFront size={24} />
             </button>

             <button 
               onClick={handleOpenFilterModal}
               className={`w-12 h-12 rounded-full shadow-lg border-2 flex items-center justify-center transition-transform active:scale-95 ${theme === 'dark' ? 'bg-night-800 border-night-700 text-night-300 hover:text-night-200' : 'bg-white border-stone-100 text-stone-500 hover:text-stone-700'}`}
               title="切換區域"
             >
                <MapPin size={24} />
             </button>
          </div>
        )}

      </main>

      <ProjectDrawer 
        project={selectedProject} 
        onClose={handleCloseDrawer}
        compareList={compareList}
        onAddToCompare={handleAddToCompare}
        onRemoveFromCompare={handleRemoveFromCompare}
        themeColor={theme}
      />

      <CompareWidget 
        compareList={compareList}
        onRemove={handleRemoveFromCompare}
        onClear={handleClearCompare}
        onStart={() => setIsCompareModalOpen(true)}
        themeColor={theme}
        onOpenAsk={() => setIsAskModalOpen(true)}
      />

      <CompareModal 
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        projects={compareList}
        onOpenAsk={() => setIsAskModalOpen(true)}
        themeColor={theme}
      />

      <AskRabbitModal 
        isOpen={isAskModalOpen} 
        onClose={() => setIsAskModalOpen(false)} 
        themeColor={theme}
      />

      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} themeColor={theme} />
      
      <SubmitProjectModal 
        isOpen={isSubmitOpen} 
        onClose={() => setIsSubmitOpen(false)} 
        onSubmit={handleSubmitProject}
        themeColor={theme}
      />

      <InstallPwaPrompt />
    </div>
  );
};

export default App;
