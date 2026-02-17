
import React, { useState, useRef } from 'react';
import { CATEGORIES } from '../constants';
import { Category, BoardItem } from '../types';
import { generateAffirmation, suggestImageThemes } from '../services/geminiService';
import { Sparkles, Loader2, Image as ImageIcon, CheckCircle2, Upload } from 'lucide-react';
import { translations } from '../translations';

interface WizardProps {
  onAdd: (item: BoardItem) => void;
  onComplete: () => void;
  lang: 'en' | 'zh';
}

export const GuidanceWizard: React.FC<WizardProps> = ({ onAdd, onComplete, lang }) => {
  const t = translations[lang];
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    theme: '',
    imageUrl: '',
    affirmation: ''
  });

  const currentCategory = CATEGORIES[step];

  const handleFetchSuggestions = async () => {
    setLoading(true);
    try {
      const ideas = await suggestImageThemes(currentCategory.id);
      setSuggestions(ideas);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAffirmation = async () => {
    if (!formData.theme) return;
    setLoading(true);
    try {
      const text = await generateAffirmation(currentCategory.id, formData.theme);
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

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: BoardItem = {
      id: Math.random().toString(36).substr(2, 9),
      imageUrl: formData.imageUrl || `https://picsum.photos/seed/${Math.random()}/800/1200`,
      category: currentCategory.id,
      title: formData.title || currentCategory.id,
      affirmation: formData.affirmation,
      createdAt: Date.now(),
      x: 100 + Math.random() * 500,
      y: 100 + Math.random() * 300,
      width: 220, // 使用新的默认宽度
      rotation: (Math.random() - 0.5) * 8
    };
    onAdd(newItem);
    
    if (step < CATEGORIES.length - 1) {
      setStep(step + 1);
      setFormData({ title: '', theme: '', imageUrl: '', affirmation: '' });
      setSuggestions([]);
    } else {
      onComplete();
    }
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-stone-400">{t.step} {step + 1} {t.of} {CATEGORIES.length}</span>
          <h2 className="text-3xl font-serif text-stone-800 mt-1">{currentCategory.id}</h2>
        </div>
        <div className="h-12 w-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-500 font-serif">
           {step + 1}
        </div>
      </div>

      <p className="text-stone-600 italic leading-relaxed">
        {currentCategory.description}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <button 
            onClick={handleFetchSuggestions}
            disabled={loading}
            className="flex items-center space-x-2 text-sm text-stone-500 hover:text-stone-800 transition-colors"
          >
            <Sparkles size={16} />
            <span>{t.needInspiration}</span>
          </button>

          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 animate-in slide-in-from-left-4">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setFormData(p => ({ ...p, theme: s, title: s }))}
                  className="px-3 py-1 bg-stone-100 text-xs text-stone-600 rounded-full hover:bg-stone-200 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">{t.specificVision}</label>
              <input 
                value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                placeholder={t.placeholderTitle}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400 transition-all text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">{t.coreTheme}</label>
              <input 
                value={formData.theme}
                onChange={e => setFormData(p => ({ ...p, theme: e.target.value }))}
                placeholder={t.placeholderTheme}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">{t.imageUrl}</label>
              <div className="flex space-x-2">
                <input 
                  value={formData.imageUrl}
                  onChange={e => setFormData(p => ({ ...p, imageUrl: e.target.value }))}
                  placeholder={t.placeholderUrl}
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-lg p-3 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400 text-sm"
                />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={triggerFileUpload}
                  className="p-3 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-colors flex items-center justify-center"
                  title={t.uploadImage}
                >
                  <Upload size={20} />
                </button>
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">{t.affirmationLabel}</label>
              <textarea 
                value={formData.affirmation}
                onChange={e => setFormData(p => ({ ...p, affirmation: e.target.value }))}
                placeholder={t.placeholderAffirmation}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400 h-24 resize-none text-sm"
                required
              />
              <button
                type="button"
                onClick={handleGenerateAffirmation}
                disabled={loading || !formData.theme}
                className="absolute right-3 bottom-3 p-2 text-stone-400 hover:text-stone-800 disabled:opacity-30"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-stone-800 text-white py-4 rounded-lg font-medium hover:bg-stone-900 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-stone-200"
            >
              <span>{t.pinToBoard}</span>
              <CheckCircle2 size={18} />
            </button>
          </form>
        </div>

        <div className="hidden md:flex items-center justify-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 p-8">
          {formData.imageUrl || formData.theme ? (
            <div className="w-full h-full relative group">
              <img 
                src={formData.imageUrl || `https://picsum.photos/seed/${formData.theme}/400/500`} 
                className="w-full h-full object-cover rounded-lg shadow-xl" 
                alt="Preview" 
              />
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-stone-900/80 to-transparent rounded-b-lg">
                <p className="text-white text-xs italic">"{formData.affirmation || t.manifesting}"</p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <ImageIcon className="mx-auto text-stone-300" size={48} />
              <p className="text-stone-400 text-sm">{t.previewPrompt}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
