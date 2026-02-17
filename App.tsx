
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
  RefreshCw,
  Menu,
  ChevronUp
} from 'lucide-react';

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
      x: 2700 + (idx % 3) * 500,
      y: 2300 + Math.floor(idx / 3) * 600,
      width: window.innerWidth < 640 ? 180 : 220,
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
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isManuallyHidden, setIsManuallyHidden] = useState(false); // 新增：手动隐藏锁定
  const [isKeySettingsOpen, setIsKeySettingsOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const mainRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const hideTimerRef = useRef<number | null>(null);
  const isMouseOverNavRef = useRef(false);

  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const centerCanvas = () => {
    if (mainRef.current) {
      const boardWidth = 6000;
      const boardHeight = 5000;
      const scrollX = (boardWidth - window.innerWidth) / 2;
      const scrollY = (boardHeight - window.innerHeight) / 2;
      mainRef.current.scrollTo({
        left: scrollX,
        top: scrollY,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(centerCanvas, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const startHideTimer = () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      const isAnyModalOpen = editingItem || isWizardOpen || isAiGuideOpen || isBackgroundModalOpen || auditTarget;
      // 如果已经手动隐藏，或者正在连线/设置，则不启动自动显示计时逻辑
      if (!isLinking && !isKeySettingsOpen && !isAnyModalOpen && !isManuallyHidden) {
        hideTimerRef.current = window.setTimeout(() => {
          if (!isMouseOverNavRef.current) {
            setIsNavVisible(false);
          }
        }, 5000);
      }
    };

    const handleGlobalActivity = () => {
      // 关键：如果用户手动点击了“X”隐藏，普通的移动不再唤醒
      if (isManuallyHidden) return;
      
      setIsNavVisible(true);
      startHideTimer();
    };

    window.addEventListener('mousemove', handleGlobalActivity);
    window.addEventListener('mousedown', handleGlobalActivity);
    window.addEventListener('touchstart', handleGlobalActivity);
    window.addEventListener('scroll', handleGlobalActivity, true);

    startHideTimer();

    return () => {
      window.removeEventListener('mousemove', handleGlobalActivity);
      window.removeEventListener('mousedown', handleGlobalActivity);
      window.removeEventListener('touchstart', handleGlobalActivity);
      window.removeEventListener('scroll', handleGlobalActivity, true);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, [isLinking, isKeySettingsOpen, editingItem, isWizardOpen, isAiGuideOpen, isBackgroundModalOpen, auditTarget, isManuallyHidden]);

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
      width: window.innerWidth < 640 ? 160 : 200,
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
      {/* 顶部唤醒感应区：缩小为 h-2 (8px)，且能重置锁定状态 */}
      {!isNavVisible && (
        <div 
          onMouseEnter={() => {
            setIsNavVisible(true);
            setIsManuallyHidden(false); // 关键：鼠标碰顶才解除手动隐藏锁定
          }} 
          className="fixed top-0 inset-x-0 h-2 z-[4000] cursor-ns-resize" 
        />
      )}

      {/* Desktop Top Dock */}
      <nav 
        ref={navRef}
        onMouseEnter={() => { isMouseOverNavRef.current = true; }}
        onMouseLeave={() => { isMouseOverNavRef.current = false; }}
        className={`hidden sm:flex fixed top-8 left-1/2 -translate-x-1/2 z-[5000] flex-col items-center space-y-4 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isNavVisible || isLinking || isKeySettingsOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-32 pointer-events-none'}`}
      >
        <div className="flex items-center space-x-2 p-2 bg-black/85 backdrop-blur-3xl border border-white/10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {!isKeySettingsOpen && (
            <>
              <button onClick={() => { setIsWizardOpen(true); setIsManuallyHidden(false); }} className="p-4 md:p-5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-90" title={t.quickAdd}><Plus size={28}/></button>
              <button onClick={() => { addNote(); setIsManuallyHidden(false); }} className="p-4 md:p-5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-90" title="Add Sticky Note"><StickyNote size={24}/></button>
              <div className="w-[1px] h-8 bg-white/20 mx-1"></div>
              <button onClick={centerCanvas} className="p-4 md:p-5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-90" title={t.resetView}><Focus size={24}/></button>
              <button onClick={() => { setIsBackgroundModalOpen(true); setIsManuallyHidden(false); }} className="p-4 md:p-5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-90" title={t.changeBackground}><ImageIcon size={24}/></button>
              <button onClick={() => { setIsLinking(!isLinking); setLinkStartId(null); setIsManuallyHidden(false); }} className={`p-4 md:p-5 transition-all rounded-full flex items-center justify-center active:scale-90 ${isLinking ? 'text-rose-500 bg-rose-500/20 shadow-[0_0_20px_rgba(225,29,72,0.3)] scale-110' : 'text-white/70 hover:text-white hover:bg-white/10'}`} title="Connect Vision Nodes"><LinkIcon size={24}/></button>
              <button onClick={() => { setIsAiGuideOpen(true); setIsManuallyHidden(false); }} className="p-4 md:p-5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-90" title={t.aiGuide}><Sparkles size={24}/></button>
              <div className="w-[1px] h-8 bg-white/20 mx-1"></div>
            </>
          )}
          <button onClick={() => { setIsKeySettingsOpen(!isKeySettingsOpen); setIsManuallyHidden(false); }} className={`p-4 md:p-5 rounded-full transition-all flex items-center justify-center active:scale-90 ${isKeySettingsOpen ? 'bg-white text-stone-900 shadow-xl' : 'text-white/70 hover:text-white hover:bg-white/10'}`} title={t.apiSettings}>{isKeySettingsOpen ? <X size={24}/> : <Key size={24}/>}</button>
          <button onClick={() => { setLang(lang === 'en' ? 'zh' : 'en'); setIsManuallyHidden(false); }} className="p-4 md:p-5 text-white/70 hover:text-white hover:bg-white/10 rounded-full text-sm font-black tracking-tighter active:scale-90">{lang.toUpperCase()}</button>
          
          {/* 优化后的手动隐藏：设置 isManuallyHidden = true */}
          {!isKeySettingsOpen && (
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setIsNavVisible(false); 
                setIsManuallyHidden(true); 
              }} 
              className="p-4 md:p-5 text-white/30 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all active:scale-90 group" 
              title={lang === 'zh' ? "进入沉浸模式" : "Enter Immersive Mode"}
            >
              <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
          )}
        </div>

        {!isKeySettingsOpen && (
          <div className="flex items-center space-x-1 p-1.5 bg-white/5 backdrop-blur-xl border border-white/5 rounded-full shadow-2xl scale-90">
            {CATEGORIES.map(cat => {
              const Icon = CATEGORY_ICONS[cat.id];
              const isActive = activeFilters.includes(cat.id);
              return (
                <button key={cat.id} onClick={() => { setActiveFilters(prev => isActive ? prev.filter(c => c !== cat.id) : [...prev, cat.id]); setIsManuallyHidden(false); }} className={`p-2.5 rounded-full transition-all flex items-center justify-center group active:scale-90 ${isActive ? 'bg-stone-100 text-stone-900 shadow-lg scale-110' : 'text-white/40 hover:text-white hover:bg-white/10'}`} title={t.categories[cat.id as keyof typeof t.categories] || cat.id}><Icon size={16} /></button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Mobile Bottom Dock (不受手动锁定影响) */}
      <nav className={`sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[5000] w-[90%] max-w-[400px] transition-all duration-700 ${isNavVisible || isKeySettingsOpen || showMobileMenu ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
        <div className="flex items-center justify-around p-2.5 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
          <button onClick={() => setIsWizardOpen(true)} className="p-4 bg-stone-100 text-stone-900 rounded-[1.25rem] shadow-lg active:scale-90 transition-all"><Plus size={24}/></button>
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className={`p-4 rounded-[1.25rem] transition-all active:scale-90 ${showMobileMenu ? 'bg-white/20 text-white' : 'text-white/60'}`}><Menu size={24}/></button>
          <button onClick={() => setIsAiGuideOpen(true)} className="p-4 text-white/60 active:text-white active:scale-90"><Sparkles size={24}/></button>
          <button onClick={centerCanvas} className="p-4 text-white/60 active:text-white active:scale-90"><Focus size={24}/></button>
        </div>

        {showMobileMenu && (
          <div className="absolute bottom-full left-0 right-0 mb-4 bg-black/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom-5 duration-500">
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button onClick={() => { addNote(); setShowMobileMenu(false); }} className="flex flex-col items-center justify-center p-5 bg-white/5 rounded-2xl text-white/70 space-y-2 active:bg-white/10"><StickyNote size={20}/><span className="text-[10px] font-bold uppercase tracking-widest">Note</span></button>
              <button onClick={() => { setIsBackgroundModalOpen(true); setShowMobileMenu(false); }} className="flex flex-col items-center justify-center p-5 bg-white/5 rounded-2xl text-white/70 space-y-2 active:bg-white/10"><ImageIcon size={20}/><span className="text-[10px] font-bold uppercase tracking-widest">Canvas</span></button>
              <button onClick={() => { setIsLinking(!isLinking); setShowMobileMenu(false); }} className={`flex flex-col items-center justify-center p-5 rounded-2xl space-y-2 active:bg-rose-500/30 ${isLinking ? 'bg-rose-500/20 text-rose-500' : 'bg-white/5 text-white/70'}`}><LinkIcon size={20}/><span className="text-[10px] font-bold uppercase tracking-widest">Link</span></button>
              <button onClick={() => { setIsKeySettingsOpen(!isKeySettingsOpen); setShowMobileMenu(false); }} className="flex flex-col items-center justify-center p-5 bg-white/5 rounded-2xl text-white/70 space-y-2 active:bg-white/10"><Key size={20}/><span className="text-[10px] font-bold uppercase tracking-widest">API</span></button>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-5 px-2">
               <button onClick={() => { setLang(lang === 'en' ? 'zh' : 'en'); setShowMobileMenu(false); }} className="text-white/40 text-xs font-black tracking-widest active:text-white">{lang.toUpperCase()}</button>
               <button onClick={() => setShowMobileMenu(false)} className="p-2 text-white/20 hover:text-white transition-colors"><X size={20}/></button>
            </div>
          </div>
        )}
      </nav>

      {isKeySettingsOpen ? (
        <div className="flex-1 bg-stone-950 flex flex-col items-center justify-center p-6 sm:p-12 animate-in fade-in duration-1000 text-center space-y-8 sm:space-y-12 overflow-y-auto">
           <div className="w-16 h-16 sm:w-24 sm:h-24 bg-stone-900 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl border border-white/10"><Key size={32} className="text-white sm:w-10 sm:h-10" /></div>
           <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl font-serif text-white">{t.apiSettings}</h1>
              <p className="text-stone-400 text-sm sm:text-base font-light max-w-md mx-auto">{t.settingsDesc}</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-2xl w-full">
              <button onClick={async () => { await (window as any).aistudio.openSelectKey(); setIsKeySettingsOpen(false); }} className="flex flex-col items-center justify-center p-8 sm:p-10 bg-white rounded-3xl sm:rounded-[2.5rem] hover:bg-stone-50 transition-all group space-y-4 shadow-2xl active:scale-95"><Zap size={20} className="text-stone-900" /><span className="text-[10px] font-black uppercase tracking-widest text-stone-900">{t.configureKey}</span></button>
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="flex flex-col items-center justify-center p-8 sm:p-10 bg-white/5 border border-white/10 rounded-3xl sm:rounded-[2.5rem] hover:bg-white/10 transition-all group space-y-4 active:scale-95"><ExternalLink size={20} className="text-white/70" /><span className="text-[10px] font-black uppercase tracking-widest text-white/70">{t.billingDocs}</span></a>
           </div>
           <button onClick={() => setIsKeySettingsOpen(false)} className="text-stone-600 hover:text-white transition-colors flex items-center space-x-2 text-[10px] uppercase tracking-widest font-black active:scale-90"><ChevronLeft size={16} /><span>{t.backToBoard}</span></button>
        </div>
      ) : (
        <main 
          ref={mainRef} onMouseDown={handleMouseDown} 
          className={`flex-1 relative overflow-auto select-none ${isPanning ? 'cursor-grabbing' : isSpacePressed ? 'cursor-grab' : ''} ${currentBgClass} transition-all duration-1000 scroll-smooth`} 
          style={isCustomBg ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url(${background})`, backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center' } : undefined}
        >
          <div className="relative min-w-[6000px] min-h-[5000px]">
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              {connections.map((conn) => {
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
          <div className="max-w-xl mx-auto space-y-8 relative">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">{t.fontStyle}</label>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-widest text-stone-600 font-bold">{lang === 'zh' ? '中文字体' : 'Chinese Styles'}</p>
                      <button type="button" onClick={() => setShowFontBrowser('zh')} className="text-stone-400 hover:text-stone-900 transition-colors active:scale-90"><Plus size={14} /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {allZhFonts.map(f => (
                        <button key={f.value} onClick={() => setEditingItem({ ...editingItem, fontFamily: f.value })} style={{ fontFamily: f.value }} className={`px-4 py-2 rounded-xl border text-sm transition-all active:scale-95 ${editingItem.fontFamily === f.value ? 'bg-stone-900 border-stone-900 text-white shadow-lg' : 'bg-stone-50 hover:bg-stone-100'}`}>{f.name}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-widest text-stone-600 font-bold">{lang === 'zh' ? '英文字体' : 'English Styles'}</p>
                      <button type="button" onClick={() => setShowFontBrowser('en')} className="text-stone-400 hover:text-stone-900 transition-colors active:scale-90"><Plus size={14} /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {allEnFonts.map(f => (
                        <button key={f.value} onClick={() => setEditingItem({ ...editingItem, fontFamily: f.value })} style={{ fontFamily: f.value }} className={`px-4 py-2 rounded-xl border text-sm transition-all active:scale-95 ${editingItem.fontFamily === f.value ? 'bg-stone-900 border-stone-900 text-white shadow-lg' : 'bg-stone-50 hover:bg-stone-100'}`}>{f.name}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <input value={editingItem.title} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} className="w-full bg-stone-50 border-stone-100 border p-5 rounded-2xl text-xl focus:ring-1 focus:ring-stone-400 transition-all shadow-inner" style={{ fontFamily: editingItem.fontFamily }} />
                <textarea value={editingItem.affirmation} onChange={e => setEditingItem({ ...editingItem, affirmation: e.target.value })} className="w-full bg-stone-50 border-stone-100 border p-5 rounded-2xl h-32 focus:ring-1 focus:ring-stone-400 transition-all text-base shadow-inner" style={{ fontFamily: editingItem.fontFamily }} />
              </div>
            </div>
            <button onClick={() => { setItems(prev => prev.map(i => i.id === editingItem.id ? editingItem : i)); setEditingItem(null); }} className="w-full bg-stone-900 text-white py-5 rounded-full font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl text-xs active:scale-95"><span>{lang === 'zh' ? '保存更改' : 'Save Changes'}</span></button>

            {showFontBrowser && (
              <div className="absolute inset-0 z-[100] bg-white rounded-3xl animate-in fade-in zoom-in-95 duration-300 flex flex-col shadow-2xl">
                <div className="flex items-center justify-between p-6 sm:p-8 border-b border-stone-50">
                   <h3 className="text-xl sm:text-2xl font-serif text-stone-900">{showFontBrowser === 'zh' ? '中文字体库' : 'English Fonts'}</h3>
                   <div className="flex items-center space-x-2 sm:space-x-4">
                      <button 
                        onClick={() => setShuffleSeed(Math.random())} 
                        className="p-3 bg-stone-100 text-stone-900 rounded-full hover:bg-stone-200 transition-all active:scale-90"
                        title={t.shuffleFonts}
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button onClick={() => setShowFontBrowser(null)} className="p-3 text-stone-300 hover:text-stone-900 active:scale-90"><X size={24} /></button>
                   </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {visibleFonts.map(f => (
                        <button key={f.name} onClick={() => selectFontFromBrowser(f.name, showFontBrowser)} className="p-5 sm:p-6 bg-stone-50 hover:bg-stone-900 text-stone-900 hover:text-white rounded-2xl border border-stone-100 flex items-center justify-between group transition-all text-left active:scale-[0.98]">
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] uppercase opacity-40 mb-1 truncate">{f.name}</p>
                            <p className="text-xl sm:text-2xl truncate" style={{ fontFamily: `'${f.name}', cursive` }}>{showFontBrowser === 'zh' ? f.label : 'Ethereal Vision'}</p>
                          </div>
                          <ChevronRight size={16} className="ml-4 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
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
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <button onClick={() => bgInputRef.current?.click()} className="h-40 sm:h-48 rounded-[1.5rem] sm:rounded-[2rem] border-4 border-dashed border-stone-200 flex flex-col items-center justify-center space-y-3 hover:border-stone-900 transition-all group active:scale-95">
            <Upload size={24} className="text-stone-300 group-hover:text-stone-900 transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 group-hover:text-stone-900">{t.uploadBg}</span>
            <input type="file" ref={bgInputRef} className="hidden" accept="image/*" onChange={handleBgUpload}/>
          </button>
          {BACKGROUND_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => { setBackground(opt.id); setIsBackgroundModalOpen(false); }} className={`relative h-40 sm:h-48 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border-4 transition-all active:scale-95 ${background === opt.id ? 'border-stone-900 shadow-xl scale-105 z-10' : 'border-transparent'}`}><div className={`absolute inset-0 ${opt.className}`}></div><div className="absolute bottom-4 left-6 text-xs font-black uppercase tracking-widest text-white drop-shadow-md">{(t.bgOptions as any)[opt.id]}</div></button>
          ))}
          {customBgs.map((url, idx) => (
            <button key={`custom-${idx}`} onClick={() => { setBackground(url); setIsBackgroundModalOpen(false); }} className={`relative h-40 sm:h-48 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border-4 transition-all active:scale-95 ${background === url ? 'border-stone-900 shadow-xl scale-105 z-10' : 'border-transparent'}`}><div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: `url(${url})` }}></div></button>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default App;
