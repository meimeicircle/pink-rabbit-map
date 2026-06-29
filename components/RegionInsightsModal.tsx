import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BarChart3, Building2, Crown, Layers3, MapPin, Search, Sparkles, Swords, Tags, TrendingUp, Users, X } from 'lucide-react';
import { EstateProject } from '../types';
import type { ThemeColor } from '../App';
import { TextWithFluentEmojis } from '../utils/fluentEmoji';

interface RegionInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: EstateProject[];
  compareList: EstateProject[];
  onSelectRegion: (region: string) => void;
  onSelectProject: (id: string) => void;
  onAddToCompare: (project: EstateProject) => void;
  onRemoveFromCompare: (id: string) => void;
  themeColor: ThemeColor;
}

interface RegionInsight {
  region: string;
  count: number;
  avgScore: number;
  avgPublicRatio: number;
  avgBaseArea: number;
  avgUnits: number;
  topMaterials: string[];
  topSellingPoints: string[];
  projects: EstateProject[];
}

const parseNumber = (value?: string): number | null => {
  if (!value) return null;
  const match = value.replace(/,/g, '').match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
};

const splitTags = (value?: string): string[] => {
  if (!value) return [];
  return value
    .split(/[|,，、\n]/)
    .map(tag => tag.trim())
    .filter(Boolean);
};

const splitSellingPoints = (value?: string): string[] => {
  if (!value) return [];
  return value
    .split(/(?:\d+[\.\)]\s*|[|,，、\n]+)/)
    .map(item => item.trim())
    .filter(item => item.length >= 3);
};

const average = (values: Array<number | null>): number => {
  const valid = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0);
  if (valid.length === 0) return 0;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
};

const topItems = (items: string[], limit = 5): string[] => {
  const counts = new Map<string, number>();
  items.forEach(item => counts.set(item, (counts.get(item) || 0) + 1));
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hant'))
    .slice(0, limit)
    .map(([item]) => item);
};

const formatNumber = (value: number, digits = 0): string => {
  if (!value) return '-';
  return value.toLocaleString('zh-TW', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
};

const getThemeClasses = (themeColor: ThemeColor) => {
  if (themeColor === 'dark') {
    return {
      overlay: 'bg-black/55',
      panel: 'bg-night-900 border-night-600 text-night-200',
      header: 'bg-night-800 border-night-700',
      card: 'bg-night-800 border-night-700',
      softCard: 'bg-night-700 border-night-600',
      text: 'text-night-200',
      muted: 'text-night-400',
      accent: 'text-night-pink-primary',
      accentBg: 'bg-night-pink-primary text-white',
      chip: 'bg-night-700 border-night-600 text-night-200',
      button: 'bg-night-pink-primary text-white hover:bg-night-pink-secondary',
      ghostButton: 'bg-night-700 text-night-200 border-night-600 hover:bg-night-600',
      bar: 'from-night-pink-primary to-night-pink-secondary',
    };
  }

  if (themeColor === 'sky') {
    return {
      overlay: 'bg-sky-950/35',
      panel: 'bg-white border-sky-100 text-stone-700',
      header: 'bg-sky-50 border-sky-100',
      card: 'bg-white border-sky-100',
      softCard: 'bg-sky-50 border-sky-100',
      text: 'text-stone-800',
      muted: 'text-stone-400',
      accent: 'text-sky-500',
      accentBg: 'bg-sky-500 text-white',
      chip: 'bg-sky-50 border-sky-100 text-sky-600',
      button: 'bg-sky-500 text-white hover:bg-sky-600',
      ghostButton: 'bg-white text-sky-600 border-sky-100 hover:bg-sky-50',
      bar: 'from-sky-400 to-sky-500',
    };
  }

  return {
    overlay: 'bg-pink-950/25',
    panel: 'bg-white border-pink-100 text-stone-700',
    header: 'bg-pink-50 border-pink-100',
    card: 'bg-white border-pink-100',
    softCard: 'bg-pink-50 border-pink-100',
    text: 'text-stone-800',
    muted: 'text-stone-400',
    accent: 'text-pink-500',
    accentBg: 'bg-pink-500 text-white',
    chip: 'bg-pink-50 border-pink-100 text-pink-600',
    button: 'bg-pink-500 text-white hover:bg-pink-600',
    ghostButton: 'bg-white text-pink-600 border-pink-100 hover:bg-pink-50',
    bar: 'from-pink-300 to-pink-500',
  };
};

const RegionInsightsModal: React.FC<RegionInsightsModalProps> = ({
  isOpen,
  onClose,
  projects,
  compareList,
  onSelectRegion,
  onSelectProject,
  onAddToCompare,
  onRemoveFromCompare,
  themeColor,
}) => {
  const [query, setQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const theme = getThemeClasses(themeColor);

  useEffect(() => {
    if (!isOpen) {
      setActiveRegion(null);
      setQuery('');
    }
  }, [isOpen]);

  const insights = useMemo<RegionInsight[]>(() => {
    const groups = new Map<string, EstateProject[]>();
    projects.forEach(project => {
      const region = project.region || '未分類';
      groups.set(region, [...(groups.get(region) || []), project]);
    });

    return Array.from(groups.entries())
      .map(([region, regionProjects]) => {
        const sortedProjects = [...regionProjects].sort((a, b) => (b.score || 0) - (a.score || 0));

        return {
          region,
          count: regionProjects.length,
          avgScore: average(regionProjects.map(project => project.score || null)),
          avgPublicRatio: average(regionProjects.map(project => parseNumber(project.publicRatio))),
          avgBaseArea: average(regionProjects.map(project => parseNumber(project.baseArea))),
          avgUnits: average(regionProjects.map(project => parseNumber(project.totalUnits))),
          topMaterials: topItems(regionProjects.flatMap(project => splitTags(project.materialTags)), 6),
          topSellingPoints: topItems(regionProjects.flatMap(project => splitSellingPoints(project.sellingPoint)), 4),
          projects: sortedProjects,
        };
      })
      .sort((a, b) => b.count - a.count || b.avgScore - a.avgScore);
  }, [projects]);

  const filteredInsights = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return insights;

    return insights.filter(item => [
      item.region,
      ...item.topMaterials,
      ...item.topSellingPoints,
      ...item.projects.map(project => project.name),
    ].join(' ').toLowerCase().includes(normalizedQuery));
  }, [insights, query]);

  const selectedInsight = useMemo(() => {
    if (!activeRegion) return null;
    return insights.find(item => item.region === activeRegion) || null;
  }, [activeRegion, insights]);

  const overall = useMemo(() => ({
    regions: insights.length,
    projects: projects.length,
    avgScore: average(projects.map(project => project.score || null)),
    avgPublicRatio: average(projects.map(project => parseNumber(project.publicRatio))),
  }), [insights.length, projects]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[7200] ${theme.overlay} backdrop-blur-sm flex items-end md:items-center justify-center animate-in fade-in duration-200`}>
      <div className="absolute inset-0" onClick={onClose}></div>

      <section className={`relative z-10 w-full md:w-[980px] max-w-[calc(100vw-24px)] h-[88dvh] md:h-[82vh] rounded-t-[2rem] md:rounded-[2rem] border-4 shadow-2xl overflow-hidden flex flex-col ${theme.panel}`}>
        <header className={`shrink-0 border-b ${theme.header}`}>
          <div className="p-4 md:p-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-black mb-2 ${theme.chip}`}>
                <BarChart3 size={15} />
                區域情報
              </div>
              <h2 className={`text-2xl md:text-3xl font-black ${theme.text}`}>
                {selectedInsight ? `${selectedInsight.region} 分數分布` : '粉粉兔區域情報站'}
              </h2>
              <p className={`text-sm font-bold mt-1 ${theme.muted}`}>
                {selectedInsight ? '點柱狀圖可以直接開建案，也可以把建案加進 PK。' : '先選區域，再看這區建案的分數柱狀圖。'}
              </p>
            </div>
            <button onClick={onClose} className={`p-2 rounded-full transition-colors ${themeColor === 'dark' ? 'hover:bg-night-700 text-night-300' : 'hover:bg-white text-stone-400 hover:text-stone-600'}`}>
              <X size={22} />
            </button>
          </div>

          {!selectedInsight && (
            <div className="px-4 md:px-5 pb-4 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              <SummaryCard label="區域數" value={overall.regions} theme={theme} />
              <SummaryCard label="建案數" value={overall.projects} theme={theme} />
              <SummaryCard label="平均評分" value={formatNumber(overall.avgScore, 1)} theme={theme} />
              <SummaryCard label="平均公設" value={`${formatNumber(overall.avgPublicRatio, 1)}%`} theme={theme} />
            </div>
          )}
        </header>

        {!selectedInsight && (
          <div className={`shrink-0 p-4 md:px-5 md:py-4 border-b ${themeColor === 'dark' ? 'border-night-700 bg-night-900' : 'border-stone-100 bg-white'}`}>
            <label className={`flex items-center gap-2 rounded-2xl border-2 px-3 py-2 ${themeColor === 'dark' ? 'bg-night-800 border-night-600' : 'bg-stone-50 border-stone-100'}`}>
              <Search size={18} className={theme.accent} />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="搜尋區域、建材、訴求..."
                className={`w-full bg-transparent outline-none text-sm font-bold ${theme.text} placeholder:text-stone-300`}
              />
            </label>
          </div>
        )}

        <div className={`flex-1 overflow-y-auto rabbit-scroll p-4 md:p-5 ${themeColor === 'dark' ? 'bg-night-900' : 'bg-stone-50/60'}`}>
          {selectedInsight ? (
            <RegionDetail
              insight={selectedInsight}
              compareList={compareList}
              onBack={() => setActiveRegion(null)}
              onSelectRegion={onSelectRegion}
              onSelectProject={onSelectProject}
              onAddToCompare={onAddToCompare}
              onRemoveFromCompare={onRemoveFromCompare}
              theme={theme}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredInsights.map(insight => (
                  <RegionCard key={insight.region} insight={insight} onOpen={() => setActiveRegion(insight.region)} theme={theme} />
                ))}
              </div>

              {filteredInsights.length === 0 && (
                <div className={`h-full min-h-[240px] flex flex-col items-center justify-center text-center ${theme.muted}`}>
                  <MapPin size={42} className="mb-3 opacity-50" />
                  <div className="font-black">找不到符合的區域情報</div>
                  <div className="text-sm mt-1">換個關鍵字試試看</div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

const SummaryCard: React.FC<{ label: string; value: string | number; theme: ReturnType<typeof getThemeClasses> }> = ({ label, value, theme }) => (
  <div className={`rounded-2xl border p-3 ${theme.card}`}>
    <div className={`text-xs font-bold ${theme.muted}`}>{label}</div>
    <div className={`text-2xl font-black ${theme.accent}`}>{value}</div>
  </div>
);

const RegionCard: React.FC<{ insight: RegionInsight; onOpen: () => void; theme: ReturnType<typeof getThemeClasses> }> = ({ insight, onOpen, theme }) => (
  <article className={`rounded-[1.5rem] border-2 p-4 shadow-sm ${theme.card}`}>
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="min-w-0">
        <h3 className={`text-xl font-black ${theme.text} truncate`}>{insight.region}</h3>
        <div className={`text-xs font-bold mt-1 ${theme.muted}`}>{insight.count} 個建案資料</div>
      </div>
      <button
        onClick={onOpen}
        className={`shrink-0 rounded-2xl px-3 py-2 text-xs font-black shadow-sm transition-all active:scale-95 ${theme.button}`}
      >
        看分析
      </button>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
      <Metric icon={<Crown size={16} />} label="均分" value={formatNumber(insight.avgScore, 1)} theme={theme} />
      <Metric icon={<Layers3 size={16} />} label="公設" value={`${formatNumber(insight.avgPublicRatio, 1)}%`} theme={theme} />
      <Metric icon={<Building2 size={16} />} label="基地" value={`${formatNumber(insight.avgBaseArea)}坪`} theme={theme} />
      <Metric icon={<Users size={16} />} label="戶數" value={`${formatNumber(insight.avgUnits)}戶`} theme={theme} />
    </div>

    {insight.projects.length > 0 && (
      <div className={`rounded-2xl border p-3 mb-3 ${theme.softCard}`}>
        <div className={`flex items-center gap-1.5 text-xs font-black mb-2 ${theme.accent}`}>
          <TrendingUp size={14} />
          區域高分案
        </div>
        <div className="flex flex-wrap gap-1.5">
          {insight.projects.slice(0, 3).map(project => (
            <span key={project.id} className={`rounded-full border px-2.5 py-1 text-xs font-bold ${theme.chip}`}>
              {project.name} {project.score ? `${project.score}分` : ''}
            </span>
          ))}
        </div>
      </div>
    )}

    {insight.topSellingPoints.length > 0 && (
      <TagSection icon={<Sparkles size={14} />} title="常見訴求" items={insight.topSellingPoints} theme={theme} />
    )}

    {insight.topMaterials.length > 0 && (
      <TagSection icon={<Tags size={14} />} title="常見建材" items={insight.topMaterials} theme={theme} />
    )}
  </article>
);

const RegionDetail: React.FC<{
  insight: RegionInsight;
  compareList: EstateProject[];
  onBack: () => void;
  onSelectRegion: (region: string) => void;
  onSelectProject: (id: string) => void;
  onAddToCompare: (project: EstateProject) => void;
  onRemoveFromCompare: (id: string) => void;
  theme: ReturnType<typeof getThemeClasses>;
}> = ({ insight, compareList, onBack, onSelectRegion, onSelectProject, onAddToCompare, onRemoveFromCompare, theme }) => {
  const maxScore = Math.max(...insight.projects.map(project => project.score || 0), 100);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className={`inline-flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-2 text-sm font-black transition-all active:scale-95 ${theme.ghostButton}`}
        >
          <ArrowLeft size={18} />
          回區域列表
        </button>
        <button
          onClick={() => onSelectRegion(insight.region)}
          className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-black transition-all active:scale-95 ${theme.button}`}
        >
          <MapPin size={18} />
          在地圖看這區
        </button>
      </div>

      <div className={`rounded-[1.5rem] border-2 p-4 md:p-5 ${theme.card}`}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className={`text-xl font-black ${theme.text}`}>{insight.region} 建案分數圖</h3>
            <p className={`text-xs font-bold mt-1 ${theme.muted}`}>點柱狀圖或建案名稱可直接開啟建案詳情</p>
          </div>
          <div className={`rounded-2xl px-3 py-2 text-sm font-black ${theme.chip}`}>{insight.count} 案</div>
        </div>

        <div className="space-y-3">
          {insight.projects.map(project => {
            const score = project.score || 0;
            const isInCompare = compareList.some(item => item.id === project.id);
            const width = `${Math.max(8, Math.min(100, (score / maxScore) * 100))}%`;

            return (
              <div key={project.id} className={`rounded-2xl border p-3 ${theme.softCard}`}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <button
                    onClick={() => onSelectProject(project.id)}
                    className={`min-w-0 text-left font-black ${theme.text} hover:underline`}
                  >
                    <TextWithFluentEmojis text={project.name} emojiSize={16} />
                  </button>
                  <div className={`shrink-0 text-lg font-black ${score >= 90 ? theme.accent : theme.muted}`}>{score || '-'}分</div>
                </div>

                <button
                  onClick={() => onSelectProject(project.id)}
                  className={`relative h-8 w-full overflow-hidden rounded-full border ${themeColorBorder(theme)} bg-white/70 text-left`}
                  title={`開啟 ${project.name}`}
                >
                  <span className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${theme.bar}`} style={{ width }}></span>
                  <span className={`relative z-10 flex h-full items-center px-3 text-xs font-black ${score >= 70 ? 'text-white' : theme.text}`}>
                    {project.region} · {project.publicRatio || '公設未填'} · {project.baseArea ? `${project.baseArea}坪` : '基地未填'}
                  </span>
                </button>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => onSelectProject(project.id)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-black transition-all active:scale-95 ${theme.ghostButton}`}
                  >
                    開啟建案
                  </button>
                  <button
                    onClick={() => isInCompare ? onRemoveFromCompare(project.id) : onAddToCompare(project)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition-all active:scale-95 ${isInCompare ? theme.ghostButton : theme.button}`}
                  >
                    <Swords size={14} />
                    {isInCompare ? '已加入PK' : '加入PK'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const themeColorBorder = (theme: ReturnType<typeof getThemeClasses>) => {
  if (theme.accent.includes('sky')) return 'border-sky-100';
  if (theme.accent.includes('night')) return 'border-night-600';
  return 'border-pink-100';
};

const Metric: React.FC<{ icon: React.ReactNode; label: string; value: string; theme: ReturnType<typeof getThemeClasses> }> = ({ icon, label, value, theme }) => (
  <div className={`rounded-2xl border p-3 ${theme.softCard}`}>
    <div className={`flex items-center gap-1 text-[11px] font-black ${theme.muted}`}>
      {icon}
      {label}
    </div>
    <div className={`text-lg font-black mt-1 ${theme.text}`}>{value}</div>
  </div>
);

const TagSection: React.FC<{ icon: React.ReactNode; title: string; items: string[]; theme: ReturnType<typeof getThemeClasses> }> = ({ icon, title, items, theme }) => (
  <div className="mb-3 last:mb-0">
    <div className={`flex items-center gap-1.5 text-xs font-black mb-2 ${theme.muted}`}>
      {icon}
      {title}
    </div>
    <div className="flex flex-wrap gap-1.5">
      {items.map(item => (
        <span key={item} className={`rounded-xl border px-2.5 py-1 text-xs font-bold leading-snug ${theme.chip}`}>
          <TextWithFluentEmojis text={item} emojiSize={13} />
        </span>
      ))}
    </div>
  </div>
);

export default RegionInsightsModal;
