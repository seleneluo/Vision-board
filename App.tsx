
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BoardItem as IBoardItem, Connection, Category } from './types';
import { MOCK_ITEMS, CATEGORIES, CHINESE_FONTS, ENGLISH_FONTS, POPULAR_GOOGLE_FONTS } from './constants';
import { BoardItem } from './components/BoardItem';
import { Modal } from './components/Modal';
import { GuidanceWizard } from './components/GuidanceWizard';
import { AiGuide } from './components/AiGuide';
import { VisionAudit } from './components/VisionAudit';
import { translations } from './translations';
import { 
  Plus, 
  Sparkles,
  Link as LinkIcon,
  StickyNote,
  Focus,
  Edit3,
  X,
  RotateCcw,
  Image as ImageIcon,
  Upload,
  Zap,
  Filter,
  Briefcase,
  Coins,
  Activity,
  BookOpen,
  Heart,
  Users,
  Globe,
  Palette,
  Key,
  ChevronLeft,
  ExternalLink,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

// Fix: Removed 'readonly' modifier from aistudio to match the internal environment's global declaration.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio: AIStudio;
  }
}

const BACKGROUND_OPTIONS = [
  { id: 'cork', className: 'bg-cork' },
  { id: 'linen', className: 'bg-linen' },
  { id: 'midnight', className: 'bg-midnight' },
  { id: 'slate', className: 'bg-slate' },
  { id: 'sage', className: 'bg-sage' }
];

const CATEGORY_ICONS: Record<string, any> = {
  [Category.CAREER]: Briefcase,
  [Category.WEALTH]: Coins,
  [Category.HEALTH]: Activity,
  [Category.GROWTH]: BookOpen,
  [Category.FAMILY]: Heart,
  [Category.SOCIAL]: Users,
  [Category.PUBLIC_WELFARE]: Globe,
  [Category.INTERESTS]: Palette
};

const App: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'zh'>('zh');
  const t = translations[lang];
  
  const [items, setItems] = useState<IBoardItem[]>(() => {
    const saved = localStorage.getItem('vision-board-items-final');
    if (saved) return JSON.parse(saved);
    return MOCK_ITEMS.map((item, idx) => ({
      ...item,
      x: 2600 + (idx % 3) * 500,
      y: 2200 + Math.floor(idx / 3) * 600,
      width: 220,
      rotation: (Math.random() - 0.5) * 8,
      fontFamily: item.fontFamily || (lang === 'zh' ? CHINESE_FONTS[0].value : ENGLISH_FONTS[0].value)
    }));
  });

  const [connections, setConnections] = useState<Connection[]>(() => {
    const saved = localStorage.getItem('vision-board-links-final');
    return saved ? JSON.parse(saved) : [];
  });

  const [background, setBackground] = useState<string>(() => {
    return localStorage.getItem('vision-board-bg-final') || 'cork';
  });

  const [customBgs, setCustomBgs] = useState<string[]>(() => {
    const saved = localStorage.getItem('vision-board-custom-bgs-final');
    return saved ? JSON.parse(saved) : [];
  });

  const [customFonts, setCustomFonts] = useState<{zh: any[], en: any[]}>(() => {
    const saved = localStorage.getItem('vision-board-custom-fonts-final');
    return saved ? JSON.parse(saved) : { zh: [], en: [] };
  });

  const [activeFilters, setActiveFilters] = useState<Category[]>([]);
  const [showFontBrowser, setShowFontBrowser] = useState<'zh' | 'en' | null>(null);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  const [editingItem, setEditingItem] = useState<IBoardItem | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isAiGuideOpen, setIsAiGuideOpen] = useState(false);
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);
  const [auditTarget, setAuditTarget] = useState<IBoardItem | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [linkStartId, setLinkStartId] = useState<string | null>(null);
  const [isNavVisible, setIsNavVisible] = useState(false);
  const [isKeySettingsOpen, setIsKeySettingsOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  const mainRef = useRef<HTMLElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollLeft = 2400;
      mainRef.current.scrollTop = 2000;
    }
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    if (window.aistudio?.hasSelectedApiKey) {
      const active = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(active);
    }
  };

  useEffect(() => {
    localStorage.setItem('vision-board-items-final', JSON.stringify(items));
    localStorage.setItem('vision-board-links-final', JSON.stringify(connections));
    localStorage.setItem('vision-board-bg-final', background);
    localStorage.setItem('vision-board-custom-bgs-final', JSON.stringify(customBgs));
    localStorage.setItem('vision-board-custom-fonts-final', JSON.stringify(customFonts));
  }, [items, connections, background, customBgs, customFonts]);

  const visibleFonts = useMemo(() => {
    if (!showFontBrowser) return [];
    const pool = [...POPULAR_GOOGLE_FONTS[showFontBrowser]];
    
    // Fisher-Yates shuffle for truly random feel
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    
    return pool.slice(0, 8);
  }, [showFontBrowser, shuffleSeed]);

  useEffect(() => {
    const fontsToLoad = [...visibleFonts, ...customFonts.zh, ...customFonts.en];
    fontsToLoad.forEach(f => {
      const id = `font-link-${f.name}`;
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${f.name.replace(/\s+/g, '+')}&display=swap`;
        document.head.appendChild(link);
      }
    });
  }, [customFonts, visibleFonts]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setIsSpacePressed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const selectFontFromBrowser = (name: string, type: 'zh' | 'en') => {
    const fontValue = `'${name}', cursive`;
    const exists = [...customFonts[type], ...(type === 'zh' ? CHINESE_FONTS : ENGLISH_FONTS)].some(f => f.name === name);
    if (!exists) {
      setCustomFonts(prev => ({ ...prev, [type]: [...prev[type], { name, value: fontValue }] }));
    }
    if (editingItem) setEditingItem({ ...editingItem, fontFamily: fontValue });
    setShowFontBrowser(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSpacePressed || e.button === 1) {
      setIsPanning(true);
      const startX = e.pageX - (mainRef.current?.offsetLeft || 0);
      const startY = e.pageY - (mainRef.current?.offsetTop || 0);
      const scrollLeft = mainRef.current?.scrollLeft || 0;
      const scrollTop = mainRef.current?.scrollTop || 0;
      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!mainRef.current) return;
        mainRef.current.scrollLeft = scrollLeft - (moveEvent.pageX - (mainRef.current.offsetLeft || 0) - startX);
        mainRef.current.scrollTop = scrollTop - (moveEvent.pageY - (mainRef.current.offsetTop || 0) - startY);
      };
      const onMouseUp = () => {
        setIsPanning(false);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
  };

  const handleLink = (id: string) => {
    if (!linkStartId) {
      setLinkStartId(id);
    } else {
      if (linkStartId !== id) {
        const existingIdx = connections.findIndex(c => 
          (c.fromId === linkStartId && c.toId === id) || (c.fromId === id && c.toId === linkStartId)
        );
        if (existingIdx > -1) {
          setConnections(prev => prev.filter((_, idx) => idx !== existingIdx));
        } else {
          setConnections(prev => [...prev, { fromId: linkStartId, toId: id }]);
        }
      }
      setLinkStartId(null);
      setIsLinking(false);
    }
  };

  const addNote = () => {
    const centerX = (mainRef.current?.scrollLeft || 0) + window.innerWidth / 2 - 100;
    const centerY = (mainRef.current?.scrollTop || 0) + window.innerHeight / 2 - 100;
    const newNote: IBoardItem = {
      id: Math.random().toString(36).substr(2, 9),
      imageUrl: '',
      category: Category.INTERESTS,
      title: lang === 'zh' ? '新便签' : 'New Note',
      affirmation: '',
      createdAt: Date.now(),
      x: centerX,
      y: centerY,
      width: 200,
      rotation: (Math.random() - 0.5) * 15,
      type: 'note',
      color: '#feef91',
      fontFamily: lang === 'zh' ? CHINESE_FONTS[0].value : ENGLISH_FONTS[0].value
    };
    setItems(prev => [...prev, newNote]);
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCustomBgs(prev => [result, ...prev]);
        setBackground(result);
        setIsBackgroundModalOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredItems = items.filter(item => activeFilters.length === 0 || activeFilters.includes(item.category));
  const currentBgClass = BACKGROUND_OPTIONS.find(o => o.id === background)?.className || '';
  const isCustomBg = background.startsWith('data:image') || background.startsWith('http');
  const allZhFonts = [...CHINESE_FONTS, ...customFonts.zh];
  const allEnFonts = [...ENGLISH_FONTS, ...customFonts.en];

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden bg-[#1a1a1a]">
      {/* Invisible Hover Area to Reveal Nav */}
      <div onMouseEnter={() => setIsNavVisible(true)} className={`fixed top-0 inset-x-0 h-32 z-[4500] pointer-events-auto transition-opacity ${isNavVisible ? 'opacity-0' : 'opacity-100'}`} />

      {/* Navigation */}
      <nav 
        onMouseLeave={() => !isLinking && setIsNavVisible(false)}
        className={`fixed top-8 left-1/2 -translate-x-1/2 z-[5000] flex flex-col items-center space-y-4 transition-all duration-700 ${isNavVisible || isLinking || isKeySettingsOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-24 pointer-events-none'}`}
      >
        <div className="flex items-center space-x-2 p-2.5 bg-black/85 backdrop-blur-3xl border border-white/10 rounded-full shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
          {!isKeySettingsOpen && (
            <>
              <button onClick={() => setIsWizardOpen(true)} className="p-5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all min-w-[72px] min-h-[72px]" title={t.quickAdd}><Plus size={32}/></button>
              <button onClick={addNote} className="p-5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all min-w-[72px] min-h-[72px]" title="Add Sticky Note"><StickyNote size={28}/></button>
              <div className="w-[1px] h-10 bg-white/20 mx-2"></div>
              <button onClick={() => mainRef.current?.scrollTo({ left: 2400, top: 2000, behavior: 'smooth' })} className="p-5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all min-w-[72px] min-h-[72px]" title={t.resetView}><Focus size={28}/></button>
              <button onClick={() => setIsBackgroundModalOpen(true)} className="p-5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all min-w-[72px] min-h-[72px]" title={t.changeBackground}><ImageIcon size={28}/></button>
              <div className="w-[1px] h-10 bg-white/20 mx-2"></div>
              <div className="flex items-center bg-white/5 rounded-full px-1">
                <button onClick={() => { setIsLinking(!isLinking); setLinkStartId(null); }} className={`p-5 transition-all rounded-full flex items-center justify-center min-w-[72px] min-h-[72px] ${isLinking ? 'text-rose-500 bg-rose-500/20 scale-110' : 'text-white/70 hover:text-white hover:bg-white/10'}`} title="Connect Vision Nodes"><LinkIcon size={28}/></button>
                {isLinking && <button onClick={() => { if(window.confirm(lang === 'zh' ? '清空连线？' : 'Clear all lines?')) setConnections([]); setIsLinking(false); }} className="p-5 text-white/40 hover:text-rose-400 transition-all rounded-full min-w-[72px] min-h-[72px]"><RotateCcw size={22}/></button>}
              </div>
              <button onClick={() => setIsAiGuideOpen(true)} className="p-5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all min-w-[72px] min-h-[72px]" title={t.aiGuide}><Sparkles size={28}/></button>
              <div className="w-[1px] h-10 bg-white/20 mx-2"></div>
            </>
          )}
          <button onClick={() => setIsKeySettingsOpen(!isKeySettingsOpen)} className={`p-5 rounded-full transition-all min-w-[72px] min-h-[72px] flex items-center justify-center ${isKeySettingsOpen ? 'bg-white text-stone-900 shadow-xl' : 'text-white/70 hover:text-white hover:bg-white/10'}`} title={t.apiSettings}>{isKeySettingsOpen ? <X size={28}/> : <Key size={28}/>}</button>
          <div className="w-[1px] h-10 bg-white/20 mx-2"></div>
          <button onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} className="p-5 text-white/70 hover:text-white hover:bg-white/10 rounded-full min-w-[72px] min-h-[72px] text-base font-black tracking-tighter">{lang.toUpperCase()}</button>
        </div>

        {!isKeySettingsOpen && (
          <div className="flex items-center space-x-1.5 p-1.5 bg-white/5 backdrop-blur-xl border border-white/5 rounded-full shadow-2xl scale-90">
            <div className="p-3 text-white/30 border-r border-white/5 mr-1"><Filter size={16} /></div>
            {CATEGORIES.map(cat => {
              const Icon = CATEGORY_ICONS[cat.id];
              const isActive = activeFilters.includes(cat.id);
              return (
                <button key={cat.id} onClick={() => setActiveFilters(prev => isActive ? prev.filter(c => c !== cat.id) : [...prev, cat.id])} className={`p-3 rounded-full transition-all flex items-center justify-center group ${isActive ? 'bg-stone-100 text-stone-900 shadow-lg scale-110' : 'text-white/40 hover:text-white hover:bg-white/10'}`} title={t.categories[cat.id as keyof typeof t.categories] || cat.id}><Icon size={18} /></button>
              );
            })}
          </div>
        )}
      </nav>

      {isKeySettingsOpen ? (
        <div className="flex-1 bg-stone-950 flex flex-col items-center justify-center p-12 animate-in fade-in duration-1000 text-center space-y-12">
           <div className="w-24 h-24 bg-stone-900 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl border border-white/10"><Key size={40} className="text-white" /></div>
           <div className="space-y-4"><h1 className="text-5xl font-serif text-white">{t.apiSettings}</h1><p className="text-stone-400 font-light max-w-md mx-auto">{t.settingsDesc}</p></div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
              <button onClick={async () => { await window.aistudio.openSelectKey(); checkApiKey(); }} className="flex flex-col items-center justify-center p-10 bg-white rounded-[2.5rem] hover:bg-stone-50 transition-all group space-y-4 shadow-2xl"><Zap size={20} className="text-stone-900" /><span className="text-xs font-black uppercase tracking-widest text-stone-900">{t.configureKey}</span></button>
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="flex flex-col items-center justify-center p-10 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all group space-y-4"><ExternalLink size={20} className="text-white/70" /><span className="text-xs font-black uppercase tracking-widest text-white/70">{t.billingDocs}</span></a>
           </div>
           <button onClick={() => setIsKeySettingsOpen(false)} className="text-stone-600 hover:text-white transition-colors flex items-center space-x-2 text-[10px] uppercase tracking-widest font-black"><ChevronLeft size={16} /><span>{t.backToBoard}</span></button>
        </div>
      ) : (
        <main 
          ref={mainRef} onMouseDown={handleMouseDown} 
          className={`flex-1 relative overflow-auto select-none ${isPanning ? 'cursor-grabbing' : isSpacePressed ? 'cursor-grab' : ''} ${currentBgClass} transition-all duration-1000`} 
          style={isCustomBg ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url(${background})`, backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center' } : undefined}
        >
          <div className="relative min-w-[6000px] min-h-[5000px]">
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              {connections.map((conn, idx) => {
                const from = filteredItems.find(i => i.id === conn.fromId);
                const to = filteredItems.find(i => i.id === conn.toId);
                if (!from || !to) return null;
                const startX = from.x + (from.width || 220) / 2;
                const startY = from.y + 12;
                const endX = to.x + (to.width || 220) / 2;
                const endY = to.y + 12;
                return <path key={`${conn.fromId}-${conn.toId}`} d={`M ${startX} ${startY} Q ${(startX+endX)/2} ${(startY+endY)/2 + 100} ${endX} ${endY}`} className="connection-line" fill="none" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="4 2" />;
              })}
            </svg>
            {filteredItems.map((item, index) => (
              <BoardItem 
                key={item.id} item={item} zIndex={index} isLinking={isLinking} onLink={handleLink}
                onDelete={(id) => setItems(p => p.filter(i => i.id !== id))}
                onClick={(i) => {}} onEdit={setEditingItem} onAudit={setAuditTarget}
                onPositionChange={(id, x, y) => setItems(p => p.map(i => i.id === id ? { ...i, x, y } : i))}
                onUpdate={(id, up) => setItems(p => p.map(i => i.id === id ? { ...i, ...up } : i))}
                onReorder={(id, action) => setItems(prev => {
                  const idx = prev.findIndex(i => i.id === id); if (idx === -1) return prev;
                  const news = [...prev]; const item = news.splice(idx, 1)[0];
                  if (action === 'front') news.push(item); else if (action === 'back') news.unshift(item);
                  else if (action === 'forward') news.splice(Math.min(idx + 1, news.length), 0, item);
                  else if (action === 'backward') news.splice(Math.max(idx - 1, 0), 0, item);
                  return news;
                })}
                onFocus={() => {}} 
              />
            ))}
          </div>
        </main>
      )}

      {/* MODALS */}
      <Modal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title={lang === 'zh' ? "编辑愿景" : "Edit Vision"}>
        {editingItem && (
          <div className="max-w-xl mx-auto p-8 space-y-8 relative">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">{t.fontStyle}</label>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">{lang === 'zh' ? '中文字体' : 'Chinese Styles'}</p>
                      <button type="button" onClick={() => setShowFontBrowser('zh')} className="text-stone-400 hover:text-stone-900"><Plus size={10} /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {allZhFonts.map(f => (
                        <button key={f.value} onClick={() => setEditingItem({ ...editingItem, fontFamily: f.value })} style={{ fontFamily: f.value }} className={`px-3 py-1.5 rounded-lg border text-xs ${editingItem.fontFamily === f.value ? 'bg-stone-900 text-white' : 'bg-stone-50'}`}>{f.name}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">{lang === 'zh' ? '英文字体' : 'English Styles'}</p>
                      <button type="button" onClick={() => setShowFontBrowser('en')} className="text-stone-400 hover:text-stone-900"><Plus size={10} /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {allEnFonts.map(f => (
                        <button key={f.value} onClick={() => setEditingItem({ ...editingItem, fontFamily: f.value })} style={{ fontFamily: f.value }} className={`px-3 py-1.5 rounded-lg border text-xs ${editingItem.fontFamily === f.value ? 'bg-stone-900 text-white' : 'bg-stone-50'}`}>{f.name}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <input value={editingItem.title} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} className="w-full bg-stone-50 border p-4 text-xl" style={{ fontFamily: editingItem.fontFamily }} />
              <textarea value={editingItem.affirmation} onChange={e => setEditingItem({ ...editingItem, affirmation: e.target.value })} className="w-full bg-stone-50 border p-4 h-32" style={{ fontFamily: editingItem.fontFamily }} />
            </div>
            <button onClick={() => { setItems(prev => prev.map(i => i.id === editingItem.id ? editingItem : i)); setEditingItem(null); }} className="w-full bg-stone-900 text-white py-5 rounded-full font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl text-xs"><span>{lang === 'zh' ? '保存更改' : 'Save Changes'}</span></button>

            {showFontBrowser && (
              <div className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-md rounded-3xl animate-in fade-in zoom-in-95 duration-300 flex flex-col">
                <div className="flex items-center justify-between p-8 border-b">
                   <h3 className="text-2xl font-serif text-stone-900">{showFontBrowser === 'zh' ? '中文字体库' : 'English Fonts'}</h3>
                   <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => setShuffleSeed(Math.random())} 
                        className="group flex items-center space-x-2 px-6 py-3 bg-stone-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
                      >
                        <RefreshCw size={14} className="group-active:rotate-180 transition-transform duration-500" />
                        <span>{t.shuffleFonts}</span>
                      </button>
                      <button onClick={() => setShowFontBrowser(null)}><X size={24} /></button>
                   </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {visibleFonts.map(f => (
                        <button key={f.name} onClick={() => selectFontFromBrowser(f.name, showFontBrowser)} className="p-6 bg-stone-50 hover:bg-stone-900 text-stone-900 hover:text-white rounded-2xl border flex items-center justify-between group transition-all">
                          <div><p className="text-[9px] uppercase opacity-40 mb-2">{f.name}</p><p className="text-2xl" style={{ fontFamily: `'${f.name}', cursive` }}>{showFontBrowser === 'zh' ? f.label : 'Ethereal Vision'}</p></div><ChevronRight size={16} />
                        </button>
                      ))}
                   </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={isAiGuideOpen} onClose={() => setIsAiGuideOpen(false)} title={t.aiGuide}><AiGuide onAdd={(i) => setItems(p => [...p, i])} lang={lang} /></Modal>
      <Modal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} title={t.quickAdd}><GuidanceWizard onAdd={(i) => setItems(p => [...p, i])} onComplete={() => setIsWizardOpen(false)} lang={lang} /></Modal>
      <Modal isOpen={!!auditTarget} onClose={() => setAuditTarget(null)} title={t.audit}><VisionAudit item={auditTarget!} items={items} onUpdate={(id, up) => setItems(p => p.map(i => i.id === id ? {...i, ...up} : i))} lang={lang} onClose={() => setAuditTarget(null)} /></Modal>
      
      <Modal isOpen={isBackgroundModalOpen} onClose={() => setIsBackgroundModalOpen(false)} title={t.changeBackground}>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button onClick={() => bgInputRef.current?.click()} className="h-48 rounded-[2rem] border-4 border-dashed border-stone-200 flex flex-col items-center justify-center space-y-3 hover:border-stone-900 transition-all"><Upload size={24} /><span className="text-[10px] font-black uppercase">{t.uploadBg}</span><input type="file" ref={bgInputRef} className="hidden" accept="image/*" onChange={handleBgUpload}/></button>
          {BACKGROUND_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => { setBackground(opt.id); setIsBackgroundModalOpen(false); }} className={`relative h-48 rounded-[2rem] overflow-hidden border-4 ${background === opt.id ? 'border-stone-900' : 'border-transparent'}`}><div className={`absolute inset-0 ${opt.className}`}></div><div className="absolute bottom-4 left-6 text-xs font-black uppercase tracking-widest text-white">{(t.bgOptions as any)[opt.id]}</div></button>
          ))}
          {customBgs.map((url, idx) => (
            <button key={`custom-${idx}`} onClick={() => { setBackground(url); setIsBackgroundModalOpen(false); }} className={`relative h-48 rounded-[2rem] overflow-hidden border-4 ${background === url ? 'border-stone-900' : 'border-transparent'}`}><div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: `url(${url})` }}></div></button>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default App;
