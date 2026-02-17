
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
  Save,
  Info
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
        Evaluate the "Cost Awareness" and "Specificity". 
        IMPORTANT: Output MUST be in ${lang === 'zh' ? 'Chinese' : 'English'}.
        Format JSON: { "score": number, "analysis": string, "suggestion": string }`,
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text || "{}");
      setResult({
        score: data.score,
        analysis: data.analysis,
        value: data.suggestion, // Re-purpose value for suggestion/action plan
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
        Identify the underlying "Value Keyword". 
        IMPORTANT: Output MUST be in ${lang === 'zh' ? 'Chinese' : 'English'}.
        Format JSON: { "value": string, "analysis": string, "isTrueNeed": boolean }`,
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text || "{}");
      setResult({
        value: data.value,
        analysis: data.analysis,
        isTrueNeed: data.isTrueNeed,
        score: data.isTrueNeed ? 85 : 45
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
              <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">{t.categories[item.category as keyof typeof t.categories] || item.category}</span>
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
                <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-2 block">Obstacle ({lang === 'zh' ? '内在障碍' : 'Internal Obstacle'})</label>
                <textarea 
                  className="w-full h-24 bg-white border border-stone-100 rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400 transition-all"
                  placeholder={lang === 'zh' ? "是什么内在恐惧、习惯或缺乏的技能阻碍了你？" : "What inner fears, habits, or missing skills are holding you back?"}
                  id="woop-obstacle"
                />
             </div>
             <div>
                <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-2 block">Plan ({lang === 'zh' ? 'If-Then 计划' : 'If-Then Plan'})</label>
                <textarea 
                  className="w-full h-24 bg-white border border-stone-100 rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400 transition-all"
                  placeholder={lang === 'zh' ? "如果障碍出现，你该怎么办？" : "If the obstacle arises, what will you do?"}
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
                placeholder={lang === 'zh' ? "剥离表面，写下你内心深处的真实追寻..." : "Peel back the layers, write down your deepest pursuit..."}
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
        <div className="animate-in zoom-in-95 duration-700 space-y-8 max-w-3xl mx-auto">
          <div className="bg-white border-2 border-stone-900 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
             
             {/* Header Section */}
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-12 border-b border-stone-100">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-stone-400">
                    <Trophy size={14} />
                    <span className="text-[10px] uppercase tracking-widest font-black">{t.maturityScore}</span>
                  </div>
                  <div className="text-6xl font-serif text-stone-900 leading-none">
                    {result.score}<span className="text-2xl text-stone-300 ml-1">/100</span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                   <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm mb-2 ${result.isTrueNeed ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                     {result.isTrueNeed ? t.trueNeed : t.mimeticDesire}
                   </div>
                   <div className="flex items-center space-x-2 text-stone-400">
                      <Info size={12} />
                      <span className="text-[9px] font-medium italic">{lang === 'zh' ? '基于心理对照与价值一致性评估' : 'Based on Mental Contrasting & Value Alignment'}</span>
                   </div>
                </div>
             </div>

             {/* Content Section */}
             <div className="space-y-10">
                <div className="space-y-4">
                   <h5 className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-black">{lang === 'zh' ? '核心洞察' : 'CORE INSIGHT'}</h5>
                   <p className="text-xl font-serif italic text-stone-800 leading-relaxed indent-8">
                      {result.analysis}
                   </p>
                </div>

                {result.value && (
                  <div className="bg-stone-50 p-8 rounded-3xl border border-stone-100 space-y-4">
                    <h5 className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-black">{lang === 'zh' ? '建议行动 / 价值观关键词' : 'SUGGESTED ACTION / VALUE'}</h5>
                    <div className="text-2xl font-serif text-stone-900">
                      {result.value}
                    </div>
                  </div>
                )}
             </div>

             {/* Footer Actions */}
             <button 
               onClick={saveResults}
               className="mt-12 w-full bg-stone-900 text-white py-6 rounded-full flex items-center justify-center space-x-3 hover:bg-black transition-all text-xs font-bold uppercase tracking-[0.3em] shadow-xl active:scale-95"
             >
               <Save size={18} />
               <span>{t.anchorResults}</span>
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
