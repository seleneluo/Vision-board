
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { BoardItem, Category, VisionAuditData } from '../types';
import { translations } from '../translations';
import { 
  ShieldCheck, 
  HelpCircle, 
  PieChart, 
  ArrowRight, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Trophy,
  ArrowLeft,
  Save
} from 'lucide-react';

interface VisionAuditProps {
  item?: BoardItem;
  items: BoardItem[];
  onUpdate: (id: string, updates: Partial<BoardItem>) => void;
  lang: 'en' | 'zh';
  onClose: () => void;
}

type AuditMode = 'woop' | '5whys' | 'wheel' | null;

export const VisionAudit: React.FC<VisionAuditProps> = ({ item, items, onUpdate, lang, onClose }) => {
  const t = translations[lang];
  const [mode, setMode] = useState<AuditMode>(item ? 'woop' : 'wheel');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VisionAuditData | null>(null);

  const handleWoop = async (obstacle: string, plan: string) => {
    if (!item) return;
    setLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Audit this vision using WOOP:
        Wish: ${item.title}
        Outcome: ${item.affirmation}
        Obstacle: ${obstacle}
        Plan: ${plan}
        Evaluate the "Cost Awareness" and "Specificity". Give a maturity score (0-100).
        Language: ${lang}.
        Format JSON: { "score": number, "analysis": string, "suggestion": string }`,
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text || "{}");
      setResult({
        score: data.score,
        analysis: data.analysis + "\n\nSuggestion: " + data.suggestion,
        isTrueNeed: data.score > 70
      });
    } finally {
      setLoading(false);
    }
  };

  const handle5Whys = async (finalAnswer: string) => {
    if (!item) return;
    setLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `User wanted ${item.title}. Through 5 whys, they arrived at: ${finalAnswer}.
        Identify the underlying "Value Keyword" (e.g. Freedom, Security, Ego).
        Is the original vision aligned with this value or a mimetic desire?
        Language: ${lang}.
        Format JSON: { "value": string, "analysis": string, "isTrueNeed": boolean }`,
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text || "{}");
      setResult({
        value: data.value,
        analysis: data.analysis,
        isTrueNeed: data.isTrueNeed
      });
    } finally {
      setLoading(false);
    }
  };

  const saveResults = () => {
    if (item && result) {
      onUpdate(item.id, { audit: result });
      onClose();
    }
  };

  const renderAuditOptions = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-700">
      <button onClick={() => setMode('woop')} className="p-8 bg-white border border-stone-100 rounded-3xl hover:border-stone-900 transition-all text-left space-y-4 group shadow-sm">
        <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400 group-hover:bg-stone-900 group-hover:text-white transition-all">
          <ShieldCheck size={24} />
        </div>
        <h4 className="text-xl font-serif text-stone-800">{t.woopTitle}</h4>
        <p className="text-xs text-stone-400 leading-relaxed font-light">{t.woopDesc}</p>
      </button>

      <button onClick={() => setMode('5whys')} className="p-8 bg-white border border-stone-100 rounded-3xl hover:border-stone-900 transition-all text-left space-y-4 group shadow-sm">
        <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400 group-hover:bg-stone-900 group-hover:text-white transition-all">
          <HelpCircle size={24} />
        </div>
        <h4 className="text-xl font-serif text-stone-800">{t.fiveWhysTitle}</h4>
        <p className="text-xs text-stone-400 leading-relaxed font-light">{t.fiveWhysDesc}</p>
      </button>

      <button onClick={() => setMode('wheel')} className="p-8 bg-white border border-stone-100 rounded-3xl hover:border-stone-900 transition-all text-left space-y-4 group shadow-sm">
        <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400 group-hover:bg-stone-900 group-hover:text-white transition-all">
          <PieChart size={24} />
        </div>
        <h4 className="text-xl font-serif text-stone-800">{t.wheelTitle}</h4>
        <p className="text-xs text-stone-400 leading-relaxed font-light">{t.wheelDesc}</p>
      </button>
    </div>
  );

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between border-b border-stone-100 pb-6">
        <div>
          <h2 className="text-3xl font-serif text-stone-900 tracking-tight">{t.auditTitle}</h2>
          <p className="text-sm text-stone-400 font-light mt-1">{t.auditSubtitle}</p>
        </div>
        {item && (
          <div className="flex items-center space-x-4">
            <img src={item.imageUrl} className="w-16 h-16 object-cover rounded-xl border border-stone-200" alt="Audit Target" />
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">{item.category}</span>
              <p className="text-sm font-serif italic text-stone-800">{item.title}</p>
            </div>
          </div>
        )}
      </div>

      {!mode && renderAuditOptions()}

      {mode === 'woop' && !result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 space-y-4">
             <div>
                <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-2 block">Obstacle (内在障碍)</label>
                <textarea 
                  className="w-full h-24 bg-white border border-stone-100 rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400 transition-all"
                  placeholder="是什么内在恐惧、习惯或缺乏的技能阻碍了你？"
                  id="woop-obstacle"
                />
             </div>
             <div>
                <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-2 block">Plan (If-Then 计划)</label>
                <textarea 
                  className="w-full h-24 bg-white border border-stone-100 rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400 transition-all"
                  placeholder="如果障碍出现，你该怎么办？"
                  id="woop-plan"
                />
             </div>
          </div>
          <button 
            onClick={() => handleWoop(
              (document.getElementById('woop-obstacle') as HTMLTextAreaElement).value,
              (document.getElementById('woop-plan') as HTMLTextAreaElement).value
            )}
            className="w-full bg-stone-900 text-white py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : t.start}
          </button>
        </div>
      )}

      {mode === '5whys' && !result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 space-y-4">
             <p className="text-sm text-stone-600 italic">"Why do I want this? What is the feeling beneath the desire?"</p>
             <textarea 
                className="w-full h-32 bg-white border border-stone-100 rounded-xl p-6 text-lg font-serif italic focus:outline-none focus:ring-1 focus:ring-stone-400 transition-all"
                placeholder="剥离表面，写下你内心深处的真实追寻..."
                id="five-whys-input"
             />
          </div>
          <button 
            onClick={() => handle5Whys((document.getElementById('five-whys-input') as HTMLTextAreaElement).value)}
            className="w-full bg-stone-900 text-white py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : t.start}
          </button>
        </div>
      )}

      {result && (
        <div className="animate-in zoom-in-95 duration-700 space-y-8">
          <div className="bg-white border-2 border-stone-900 p-10 rounded-3xl shadow-2xl relative overflow-hidden">
             <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="text-4xl font-serif text-stone-900">{result.score || result.value}</h4>
                  <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mt-1">
                    {result.score ? t.maturityScore : "Core Value Keyword"}
                  </p>
                </div>
                {result.isTrueNeed !== undefined && (
                   <div className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${result.isTrueNeed ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                     {result.isTrueNeed ? 'True Need' : 'Mimetic Desire'}
                   </div>
                )}
             </div>
             <p className="text-lg font-serif italic text-stone-700 leading-relaxed border-l-2 border-stone-100 pl-8 py-2 mb-6 whitespace-pre-wrap">
                {result.analysis}
             </p>
             <button 
               onClick={saveResults}
               className="w-full bg-stone-900 text-white py-4 rounded-full flex items-center justify-center space-x-3 hover:bg-black transition-all text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg"
             >
               <Save size={16} />
               <span>Anchor Results</span>
             </button>
          </div>
        </div>
      )}

      <button onClick={() => setMode(null)} className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-stone-400 font-bold hover:text-stone-900 transition-colors">
         <ArrowLeft size={12} />
         <span>{t.back}</span>
      </button>
    </div>
  );
};
