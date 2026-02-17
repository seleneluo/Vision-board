
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CATEGORIES, CHINESE_FONTS, ENGLISH_FONTS, POPULAR_GOOGLE_FONTS } from '../constants';
import { Category, BoardItem } from '../types';
import { generateAffirmation, suggestImageThemes } from '../services/geminiService';
import { Sparkles, Loader2, Image as ImageIcon, CheckCircle2, Upload, Type as FontIcon, Plus, X, Search, ChevronRight, RefreshCw } from 'lucide-react';
import { translations } from '../translations';

interface WizardProps {
  onAdd: (item: BoardItem) => void;
  onComplete: () => void;
  lang: 'en' | 'zh';
}

export const GuidanceWizard: React.FC<WizardProps> = ({ onAdd, onComplete, lang }) => {
  const t = translations[lang];
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [customFonts, setCustomFonts] = useState<{zh: any[], en: any[]}>(() => {
    const saved = localStorage.getItem('vision-board-custom-fonts-v2');
    return saved ? JSON.parse(saved) : { zh: [], en: [] };
  });
  const [showFontBrowser, setShowFontBrowser] = useState<'zh' | 'en' | null>(null);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    affirmation: '',
    category: CATEGORIES[0].id,
    fontFamily: lang === 'zh' ? CHINESE_FONTS[0].value : ENGLISH_FONTS[0].value
  });

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
    localStorage.setItem('vision-board-custom-fonts-v2', JSON.stringify(customFonts));
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

  const selectFont = (name: string, type: 'zh' | 'en') => {
    const fontValue = `'${name}', cursive`;
    const exists = [...customFonts[type], ... (type === 'zh' ? CHINESE_FONTS : ENGLISH_FONTS)].some(f => f.name === name);
    if (!exists) {
      setCustomFonts(prev => ({ ...prev, [type]: [...prev[type], { name, value: fontValue }] }));
    }
    setFormData(p => ({ ...p, fontFamily: fontValue }));
    setShowFontBrowser(null);
  };

  const handleFetchSuggestions = async () => {
    setLoading(true);
    try {
      const ideas = await suggestImageThemes(formData.category);
      setSuggestions(ideas);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!formData.title) return;
    setLoading(true);
    try {
      const text = await generateAffirmation(formData.category, formData.title);
      setFormData(prev => ({ ...prev, affirmation: text }));
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: BoardItem = {
      id: Math.random().toString(36).substr(2, 9),
      imageUrl: formData.imageUrl || `https://picsum.photos/seed/${Math.random()}/800/1200`,
      category: formData.category,
      title: formData.title || formData.category,
      affirmation: formData.affirmation,
      fontFamily: formData.fontFamily,
      createdAt: Date.now(),
      x: 2500 + (Math.random() - 0.5) * 600,
      y: 2200 + (Math.random() - 0.5) * 400,
      width: window.innerWidth < 640 ? 180 : 220,
      rotation: (Math.random() - 0.5) * 8
    };
    onAdd(newItem);
    onComplete();
  };

  const allZhFonts = [...CHINESE_FONTS, ...customFonts.zh];
  const allEnFonts = [...ENGLISH_FONTS, ...customFonts.en];

  return (
    <div className="space-y-8 py-2 relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8 order-2 lg:order-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-3">{t.field}</label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, category: cat.id }))}
                    className={`px-1 py-3 rounded-xl border text-[10px] font-bold transition-all flex flex-col items-center justify-center space-y-1 ${formData.category === cat.id ? 'bg-stone-900 border-stone-900 text-white shadow-lg' : 'bg-stone-50 border-stone-100 text-stone-400 hover:bg-stone-100'}`}
                  >
                    <span className="truncate w-full px-1">{t.categories[cat.id as keyof typeof t.categories] || cat.id}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-3">{t.fontStyle}</label>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-widest text-stone-600 font-bold">{lang === 'zh' ? '中文' : 'CN'}</p>
                    <button type="button" onClick={() => setShowFontBrowser('zh')} className="text-stone-400 hover:text-stone-950 transition-colors"><Plus size={14} /></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allZhFonts.map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, fontFamily: f.value }))}
                        style={{ fontFamily: f.value }}
                        className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${formData.fontFamily === f.value ? 'bg-stone-900 border-stone-900 text-white shadow-md' : 'bg-stone-50 border-stone-100 text-stone-500'}`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                   <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-widest text-stone-600 font-bold">{lang === 'zh' ? '英文' : 'EN'}</p>
                    <button type="button" onClick={() => setShowFontBrowser('en')} className="text-stone-400 hover:text-stone-950 transition-colors"><Plus size={14} /></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allEnFonts.map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, fontFamily: f.value }))}
                        style={{ fontFamily: f.value }}
                        className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${formData.fontFamily === f.value ? 'bg-stone-900 border-stone-900 text-white shadow-md' : 'bg-stone-50 border-stone-100 text-stone-500'}`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">{t.specificVision}</label>
                <div className="relative">
                  <input 
                    value={formData.title}
                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                    placeholder={t.placeholderTitle}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl p-4 sm:p-5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400 transition-all text-base font-serif shadow-inner"
                    required
                  />
                  <button type="button" onClick={handleFetchSuggestions} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-stone-300 hover:text-stone-900"><Sparkles size={18} /></button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">{t.imageUrl}</label>
                <div className="flex space-x-2">
                  <input 
                    value={formData.imageUrl}
                    onChange={e => setFormData(p => ({ ...p, imageUrl: e.target.value }))}
                    placeholder={t.placeholderUrl}
                    className="flex-1 bg-stone-50 border border-stone-100 rounded-2xl p-4 sm:p-5 text-xs font-mono shadow-inner"
                  />
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-4 sm:p-5 bg-stone-100 text-stone-600 rounded-2xl hover:bg-stone-200 shadow-sm transition-all"><Upload size={20} /></button>
                </div>
              </div>

              <div className="relative">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">{t.affirmationLabel}</label>
                <textarea 
                  value={formData.affirmation}
                  onChange={e => setFormData(p => ({ ...p, affirmation: e.target.value }))}
                  placeholder={t.placeholderAffirmation}
                  className="w-full bg-stone-50 border border-stone-100 rounded-2xl p-4 sm:p-5 text-stone-800 h-32 sm:h-40 resize-none text-base shadow-inner"
                  style={{ fontFamily: formData.fontFamily }}
                  required
                />
                <button type="button" onClick={handleGenerateContent} disabled={loading || !formData.title} className="absolute right-4 bottom-4 p-3 bg-white shadow-lg rounded-full text-stone-400 hover:text-stone-900 disabled:opacity-30 active:scale-90 transition-all">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full bg-stone-900 text-white py-5 sm:py-6 rounded-full font-bold uppercase tracking-[0.3em] hover:bg-black transition-all flex items-center justify-center space-x-3 shadow-2xl active:scale-[0.98] text-xs">
              <span>{t.pinToBoard}</span>
              <CheckCircle2 size={18} />
            </button>
          </form>
        </div>

        {/* Visual Preview */}
        <div className="order-1 lg:order-2 flex flex-col items-center justify-center bg-stone-50/50 rounded-[2.5rem] sm:rounded-[3.5rem] border-2 border-dashed border-stone-100 p-8 sm:p-12 relative overflow-hidden">
          {formData.imageUrl || formData.title ? (
            <div className="w-full h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
              <div className="bg-white p-4 pb-12 sm:p-5 sm:pb-16 shadow-2xl border border-stone-100 rotate-2 max-w-[220px] sm:max-w-[280px]">
                <img src={formData.imageUrl || `https://picsum.photos/seed/${formData.title}/600/800`} className="w-full aspect-[3/4] object-cover rounded-sm mb-4" alt="Preview" />
                <p className="text-center text-lg sm:text-xl text-stone-800 line-clamp-1" style={{ fontFamily: formData.fontFamily }}>{formData.title}</p>
              </div>
              {formData.affirmation && (
                <p className="mt-6 sm:mt-10 text-stone-400 text-xs sm:text-sm italic font-serif leading-relaxed text-center px-4 max-w-sm" style={{ fontFamily: formData.fontFamily }}>
                  "{formData.affirmation}"
                </p>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl">
                 <ImageIcon className="text-stone-100" size={32} />
              </div>
              <p className="text-stone-300 text-[10px] font-black uppercase tracking-widest">{t.previewPrompt}</p>
            </div>
          )}
        </div>
      </div>

      {/* Font Library Overaly for Wizard */}
      {showFontBrowser && (
        <div className="absolute inset-0 z-[100] bg-white rounded-3xl animate-in fade-in zoom-in-95 duration-300 flex flex-col shadow-2xl overflow-hidden border border-stone-100">
          <div className="flex items-center justify-between p-6 sm:p-8 border-b border-stone-50">
             <div>
                <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">{lang === 'zh' ? 'Google 字体库' : 'Font Library'}</span>
                <h3 className="text-xl sm:text-2xl font-serif text-stone-900">{showFontBrowser === 'zh' ? '精选中文字体' : 'English Fonts'}</h3>
             </div>
             <div className="flex items-center space-x-2">
                <button onClick={() => setShuffleSeed(Math.random())} className="p-3 bg-stone-50 text-stone-400 hover:text-stone-900 rounded-full transition-all active:scale-95"><RefreshCw size={16} /></button>
                <button onClick={() => setShowFontBrowser(null)} className="p-3 text-stone-300 hover:text-stone-900 transition-colors"><X size={24} /></button>
             </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleFonts.map((f) => (
                  <button key={f.name} onClick={() => selectFont(f.name, showFontBrowser)} className="p-5 sm:p-6 bg-stone-50 hover:bg-stone-900 text-stone-900 hover:text-white rounded-2xl text-left border border-stone-100 transition-all group flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] uppercase tracking-widest opacity-40 group-hover:opacity-60 mb-1 truncate">{f.name}</p>
                      <p className="text-xl sm:text-2xl truncate" style={{ fontFamily: `'${f.name}', cursive` }}>{showFontBrowser === 'zh' ? f.label : 'Abc Ethereal'}</p>
                    </div>
                    <ChevronRight size={16} className="ml-4 flex-shrink-0" />
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
