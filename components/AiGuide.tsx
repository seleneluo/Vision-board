
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { BoardItem, Category } from '../types';
import { translations } from '../translations';
import { 
  Check, 
  X, 
  Zap, 
  History, 
  Ghost, 
  ShieldAlert, 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Minus
} from 'lucide-react';

interface AiGuideProps {
  onAdd: (item: BoardItem) => void;
  lang: 'en' | 'zh';
}

type ToolType = 'intuition' | 'legacy' | 'envy' | 'pain' | null;

export const AiGuide: React.FC<AiGuideProps> = ({ onAdd, lang }) => {
  const t = translations[lang];
  const [activeTool, setActiveTool] = useState<ToolType>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  // States for Tool 1 (Intuition Flow)
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reactions, setReactions] = useState<boolean[]>([]);

  // States for Tool 2, 3, 4 (Text Entry)
  const [inputText, setInputText] = useState('');

  const reset = () => {
    setActiveTool(null);
    setAnalysis(null);
    setInputText('');
    setImages([]);
    setCurrentIndex(0);
    setReactions([]);
    setLoading(false);
  };

  const startIntuition = async () => {
    setLoading(true);
    setActiveTool('intuition');
    // Aesthetic placeholders for fast reaction
    const seeds = ['solitude', 'luxury', 'nature', 'urban', 'peace', 'movement', 'family', 'minimal', 'vibrant', 'quiet'];
    setImages(seeds.map(s => `https://picsum.photos/seed/${s + Math.random()}/600/800`));
    setLoading(false);
  };

  const handleSwipe = (liked: boolean) => {
    const newReactions = [...reactions, liked];
    setReactions(newReactions);
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finalizeIntuition(newReactions);
    }
  };

  const finalizeIntuition = async (finalReactions: boolean[]) => {
    setLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `I just completed a Visual Elimination (Swipe) experiment. 
        The user reacted to ${images.length} aesthetic scenes. 
        They liked ${finalReactions.filter(r => r).length} images.
        Provide a "Soul Base Analysis" based on this gut-level resonance. 
        Don't define them, but observe the pattern.
        Language: ${lang}.
        Format JSON: { "analysis": string, "proposal": { "title": string, "affirmation": string, "category": string } }`,
        config: { responseMimeType: "application/json" }
      });
      setAnalysis(JSON.parse(response.text || "{}"));
    } finally {
      setLoading(false);
    }
  };

  const handleTransform = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let sysInstruction = "You are a Vision Architect. Transform user disclosure into a positive vision. NEVER define the user. You can say 'I don't know' or 'No clear vision emerged'.";
    let prompt = "";
    
    if (activeTool === 'legacy') prompt = `Legacy wishes: "${inputText}". Reverse engineer a vision block.`;
    if (activeTool === 'envy') prompt = `Jealousy source: "${inputText}". Peel back to the positive need.`;
    if (activeTool === 'pain') prompt = `Pain points: "${inputText}". Generate sacred opposite visual.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          systemInstruction: sysInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysis: { type: Type.STRING },
              proposal: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  affirmation: { type: Type.STRING },
                  category: { type: Type.STRING }
                }
              }
            }
          }
        }
      });
      setAnalysis(JSON.parse(response.text || "{}"));
    } finally {
      setLoading(false);
    }
  };

  const pinToBoard = () => {
    if (!analysis?.proposal) return;
    const newItem: BoardItem = {
      id: Math.random().toString(36).substr(2, 9),
      imageUrl: `https://picsum.photos/seed/${analysis.proposal.title}/800/1200`,
      category: analysis.proposal.category as Category,
      title: analysis.proposal.title,
      affirmation: analysis.proposal.affirmation,
      createdAt: Date.now(),
      x: 400 + Math.random() * 400,
      y: 400 + Math.random() * 400,
      rotation: (Math.random() - 0.5) * 12
    };
    onAdd(newItem);
    reset();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] space-y-6">
        <Loader2 className="animate-spin text-stone-300" size={48} />
        <p className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-bold">{t.aiThinking}</p>
      </div>
    );
  }

  if (analysis) {
    return (
      <div className="p-8 space-y-10 animate-in fade-in duration-700 max-w-2xl mx-auto">
        <div className="text-center space-y-4">
          <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-bold">The Observation</span>
          <p className="text-xl font-serif italic text-stone-700 leading-relaxed border-b border-stone-100 pb-10">
            {analysis.analysis}
          </p>
        </div>

        {analysis.proposal && (
          <div className="bg-white border-2 border-stone-900 p-10 rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
              <Sparkles size={200} className="text-stone-900" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-bold">{analysis.proposal.category}</span>
              <h4 className="text-4xl font-serif text-stone-900 tracking-tight">{analysis.proposal.title}</h4>
            </div>
            <p className="text-lg italic text-stone-600 font-serif border-l-2 border-stone-900 pl-8 py-4">
              "{analysis.proposal.affirmation}"
            </p>
            <button 
              onClick={pinToBoard}
              className="w-full bg-stone-900 text-white py-5 rounded-full flex items-center justify-center space-x-3 hover:bg-black transition-all text-xs font-bold uppercase tracking-[0.2em] shadow-xl active:scale-95"
            >
              <Check size={18} />
              <span>{t.pinToBoard}</span>
            </button>
          </div>
        )}

        <button onClick={reset} className="w-full text-stone-400 text-[10px] uppercase tracking-widest hover:text-stone-900 flex items-center justify-center space-x-2">
           <ArrowLeft size={12} />
           <span>{t.back}</span>
        </button>
      </div>
    );
  }

  if (activeTool === 'intuition') {
    return (
      <div className="flex flex-col h-[600px] items-center justify-center space-y-10 animate-in slide-in-from-bottom-6 duration-500">
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-bold italic">Visual Elimination</span>
          <h3 className="text-2xl font-serif text-stone-800">{currentIndex + 1} / {images.length}</h3>
        </div>

        <div className="relative w-[340px] h-[480px] group">
          <img 
            src={images[currentIndex]} 
            className="w-full h-full object-cover rounded-[2rem] shadow-2xl border border-stone-100 transition-transform duration-500 hover:scale-[1.02]"
            alt="Flash reaction"
          />
          <div className="absolute inset-0 flex items-center justify-between px-8 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <X size={80} className="text-red-400 -rotate-12" />
            <Check size={80} className="text-green-400 rotate-12" />
          </div>
        </div>

        <div className="flex space-x-12">
          <button 
            onClick={() => handleSwipe(false)}
            className="p-10 border border-stone-100 rounded-full hover:bg-stone-50 text-stone-300 hover:text-red-400 transition-all active:scale-90 shadow-sm"
          >
            <X size={36} />
          </button>
          <button 
            onClick={() => handleSwipe(true)}
            className="p-10 bg-stone-900 text-white rounded-full hover:bg-black transition-all shadow-2xl shadow-stone-200 active:scale-90"
          >
            <Check size={36} />
          </button>
        </div>
      </div>
    );
  }

  if (activeTool) {
    const configs = {
      legacy: { title: t.tool2, icon: History, hint: lang === 'zh' ? "想象你在80岁生日派对上，朋友们如何评价你的一生？" : "Imagine your 80th birthday party. What do your closest friends say about your life?" },
      envy: { title: t.tool3, icon: Ghost, hint: lang === 'zh' ? "写下你最近的一次嫉妒。谁拥有了你渴望的东西？那背后其实是什么需求？" : "Describe a recent moment of envy. What does the other person have that you feel you lack?" },
      pain: { title: t.tool4, icon: ShieldAlert, hint: lang === 'zh' ? "列出目前生活中最令你感到‘不对劲’或痛苦的5件事。" : "List 5 things in your current reality that feel deeply misaligned or painful." }
    };
    const current = configs[activeTool as keyof typeof configs];

    return (
      <div className="flex flex-col h-[500px] p-10 space-y-10 animate-in fade-in duration-500">
        <div className="space-y-4">
          <button onClick={reset} className="text-stone-300 hover:text-stone-900 transition-colors flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest">
            <ArrowLeft size={12} />
            <span>{t.back}</span>
          </button>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-stone-900 text-white rounded-xl"><current.icon size={24} /></div>
            <h3 className="text-3xl font-serif text-stone-800">{current.title}</h3>
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <textarea 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={current.hint}
            className="w-full h-56 bg-stone-50/50 border border-stone-100 rounded-[2rem] p-10 text-xl font-serif italic text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-400 transition-all resize-none shadow-inner"
          />
          <button 
            onClick={handleTransform}
            disabled={!inputText.trim()}
            className="w-full bg-stone-900 text-white py-6 rounded-full flex items-center justify-center space-x-3 hover:bg-black disabled:opacity-20 transition-all shadow-xl text-xs font-bold uppercase tracking-[0.3em]"
          >
            <Zap size={20} />
            <span>{lang === 'zh' ? '开始转化' : 'Transform Desire'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-12 space-y-16 animate-in fade-in duration-1000">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h2 className="text-5xl font-serif tracking-tight text-stone-900">{t.labTitle}</h2>
        <p className="text-sm text-stone-400 font-light leading-relaxed px-16">
          {t.labSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { id: 'intuition', icon: Zap, title: t.tool1, desc: t.tool1Desc, action: startIntuition },
          { id: 'legacy', icon: History, title: t.tool2, desc: t.tool2Desc, action: () => setActiveTool('legacy') },
          { id: 'envy', icon: Ghost, title: t.tool3, desc: t.tool3Desc, action: () => setActiveTool('envy') },
          { id: 'pain', icon: ShieldAlert, title: t.tool4, desc: t.tool4Desc, action: () => setActiveTool('pain') }
        ].map(tool => (
          <button 
            key={tool.id}
            onClick={tool.action}
            className="group p-10 bg-white border border-stone-100 rounded-[2.5rem] hover:border-stone-900 hover:shadow-2xl transition-all duration-700 text-left flex flex-col space-y-6"
          >
            <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-300 group-hover:bg-stone-900 group-hover:text-white transition-all duration-700">
              <tool.icon size={32} />
            </div>
            <div className="space-y-3">
              <h4 className="text-2xl font-serif text-stone-800">{tool.title}</h4>
              <p className="text-xs text-stone-400 leading-relaxed font-light group-hover:text-stone-600 transition-colors">
                {tool.desc}
              </p>
            </div>
            <div className="pt-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700 flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-900">
               <span>{t.start}</span>
               <ArrowRight size={14} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
