
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { BoardItem, Category } from '../types';
import { translations } from '../translations';
import { 
  Check, 
  Zap, 
  History, 
  Ghost, 
  ShieldAlert, 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Sun,
  Home,
  Briefcase,
  Heart,
  Smile,
  Activity,
  Plus
} from 'lucide-react';

interface AiGuideProps {
  onAdd: (item: BoardItem) => void;
  lang: 'en' | 'zh';
}

type ToolType = 'legacy' | 'envy' | 'pain' | 'ideal_day' | null;

export const AiGuide: React.FC<AiGuideProps> = ({ onAdd, lang }) => {
  const t = translations[lang];
  const [activeTool, setActiveTool] = useState<ToolType>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [showIdealDayIntro, setShowIdealDayIntro] = useState(true);

  // States for Tool 2, 3, 4
  const [inputText, setInputText] = useState('');

  // States for Ideal Day (Tool 5)
  const [idealDayStep, setIdealDayStep] = useState(0);
  const [idealDayInputs, setIdealDayInputs] = useState({
    environment: '',
    career: '',
    health: '',
    relationship: '',
    emotion: ''
  });

  const reset = () => {
    setActiveTool(null);
    setAnalysis(null);
    setInputText('');
    setIdealDayStep(0);
    setShowIdealDayIntro(true);
    setIdealDayInputs({
      environment: '',
      career: '',
      health: '',
      relationship: '',
      emotion: ''
    });
    setLoading(false);
  };

  const handleTransform = async () => {
    setLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let sysInstruction = `You are a Vision Architect. Transform user disclosure into a positive vision. 
    IMPORTANT: You must output ALL responses in ${lang === 'zh' ? 'Chinese' : 'English'}.`;
    
    let prompt = "";
    let schema: any = {
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
    };

    if (activeTool === 'legacy') prompt = `Legacy wishes: "${inputText}". Reverse engineer a vision node.`;
    if (activeTool === 'envy') prompt = `Jealousy source: "${inputText}". Peel back to the positive need.`;
    if (activeTool === 'pain') prompt = `Pain points: "${inputText}". Generate sacred opposite visual.`;
    
    if (activeTool === 'ideal_day') {
      prompt = `Ideal Day Simulation:
      Environment: ${idealDayInputs.environment}
      Career: ${idealDayInputs.career}
      Health: ${idealDayInputs.health}
      Relationships: ${idealDayInputs.relationship}
      Emotions: ${idealDayInputs.emotion}
      Analyze this future state, extract 3-5 core keywords, and propose 2-3 specific vision items.`;
      
      schema = {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING, description: "Deep psychological summary" },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          proposals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                affirmation: { type: Type.STRING },
                category: { type: Type.STRING }
              }
            }
          }
        }
      };
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          systemInstruction: sysInstruction,
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });
      setAnalysis(JSON.parse(response.text || "{}"));
    } finally {
      setLoading(false);
    }
  };

  const pinToBoard = (prop: any) => {
    const newItem: BoardItem = {
      id: Math.random().toString(36).substr(2, 9),
      imageUrl: `https://picsum.photos/seed/${prop.title + Math.random()}/800/1200`,
      category: prop.category as Category,
      title: prop.title,
      affirmation: prop.affirmation,
      createdAt: Date.now(),
      x: 2400 + (Math.random() - 0.5) * 400,
      y: 2000 + (Math.random() - 0.5) * 400,
      rotation: (Math.random() - 0.5) * 12
    };
    onAdd(newItem);
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
      <div className="p-8 space-y-12 animate-in fade-in duration-700 max-w-4xl mx-auto overflow-y-auto max-h-[70vh]">
        <div className="text-center space-y-6">
          <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-black">{lang === 'zh' ? '深度共鸣分析' : 'RESONANCE ANALYSIS'}</span>
          <p className="text-2xl font-serif italic text-stone-800 leading-relaxed max-w-3xl mx-auto">
            "{analysis.analysis}"
          </p>
        </div>

        {analysis.keywords && (
          <div className="space-y-4 text-center">
            <h5 className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-black">{t.keywords}</h5>
            <div className="flex flex-wrap justify-center gap-3">
              {analysis.keywords.map((kw: string, i: number) => (
                <span key={i} className="px-6 py-2 bg-stone-900 text-white rounded-full text-sm font-serif italic shadow-lg">
                  # {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-8">
          <h5 className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-black text-center">{t.proposals}</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(analysis.proposals || [analysis.proposal]).map((prop: any, i: number) => (
              <div key={i} className="bg-white border border-stone-100 p-8 rounded-[2rem] shadow-xl space-y-4 hover:border-stone-900 transition-all group">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">{prop.category}</span>
                    <h4 className="text-2xl font-serif text-stone-900">{prop.title}</h4>
                  </div>
                  <button 
                    onClick={() => pinToBoard(prop)}
                    className="p-3 bg-stone-50 rounded-full text-stone-300 group-hover:bg-stone-900 group-hover:text-white transition-all active:scale-90"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <p className="text-sm italic text-stone-600 font-serif leading-relaxed">"{prop.affirmation}"</p>
              </div>
            ))}
          </div>
        </div>

        <button onClick={reset} className="w-full text-stone-300 text-[10px] uppercase tracking-widest hover:text-stone-950 flex items-center justify-center space-x-2 pt-10">
           <ArrowLeft size={12} />
           <span>{t.back}</span>
        </button>
      </div>
    );
  }

  if (activeTool === 'ideal_day') {
    if (showIdealDayIntro) {
      return (
        <div className="flex flex-col h-[500px] items-center justify-center p-12 text-center space-y-12 animate-in zoom-in-95 duration-700">
           <div className="w-24 h-24 bg-stone-900 text-white rounded-full flex items-center justify-center shadow-2xl mb-4">
              <Sun size={48} className="animate-pulse" />
           </div>
           <p className="text-3xl font-serif text-stone-800 leading-relaxed max-w-2xl italic">
              {t.idealDayIntro}
           </p>
           <button 
             onClick={() => setShowIdealDayIntro(false)}
             className="px-12 py-5 bg-stone-900 text-white rounded-full flex items-center space-x-3 hover:bg-black transition-all shadow-xl text-xs font-bold uppercase tracking-[0.4em] active:scale-95"
           >
              <span>{lang === 'zh' ? '开启旅程' : 'Start Journey'}</span>
              <ArrowRight size={16} />
           </button>
           <button onClick={reset} className="text-stone-300 hover:text-stone-900 flex items-center space-x-2 text-[10px] uppercase font-black tracking-widest">
            <ArrowLeft size={12} />
            <span>{t.back}</span>
          </button>
        </div>
      );
    }

    const dimensions = [
      { key: 'environment', icon: Home, title: t.dimensions.environment, hint: lang === 'zh' ? "你住在什么样的房子里？窗外是森林还是城市？穿什么样的衣服？" : "What kind of house? Forest or city? What are you wearing?" },
      { key: 'career', icon: Briefcase, title: t.dimensions.career, hint: lang === 'zh' ? "坐在明亮的办公室开会，还是在海边写作？拿到了什么成就？" : "Meetings in a bright office, or writing by the sea? What achievement?" },
      { key: 'health', icon: Activity, title: t.dimensions.health, hint: lang === 'zh' ? "身体状态如何？在做哪种运动（瑜伽、马拉松）？活力感如何？" : "Body status? Which sport (Yoga, Marathon)? How is the vitality?" },
      { key: 'relationship', icon: Heart, title: t.dimensions.relationship, hint: lang === 'zh' ? "谁在你身边？温馨的家庭聚餐，还是和伙伴头脑风暴？" : "Who is with you? Family dinner, or brainstorming with partners?" },
      { key: 'emotion', icon: Smile, title: t.dimensions.emotion, hint: lang === 'zh' ? "那一天的你是什么心情？宁静、激情还是掌控感？" : "How do you feel? Serene, passionate, or in control?" }
    ];
    const current = dimensions[idealDayStep];

    return (
      <div className="flex flex-col h-[600px] p-8 space-y-8 animate-in slide-in-from-right-10 duration-500">
        <div className="flex items-center justify-between">
          <button onClick={() => setShowIdealDayIntro(true)} className="text-stone-300 hover:text-stone-900 flex items-center space-x-2 text-[10px] uppercase font-black tracking-widest">
            <ArrowLeft size={12} />
            <span>{lang === 'zh' ? '回看提示' : 'Intro'}</span>
          </button>
          <div className="flex space-x-2">
            {dimensions.map((_, i) => (
              <div key={i} className={`h-1 w-12 rounded-full transition-all ${i <= idealDayStep ? 'bg-stone-900' : 'bg-stone-100'}`} />
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-8">
          <div className="flex items-center space-x-5">
            <div className="p-4 bg-stone-900 text-white rounded-2xl shadow-xl"><current.icon size={28} /></div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">{lang === 'zh' ? '维度' : 'Dimension'} {idealDayStep + 1} / 5</span>
              <h3 className="text-3xl font-serif text-stone-800">{current.title}</h3>
            </div>
          </div>

          <textarea 
            value={(idealDayInputs as any)[current.key]}
            onChange={e => setIdealDayInputs({ ...idealDayInputs, [current.key]: e.target.value })}
            placeholder={current.hint}
            className="w-full h-64 bg-stone-50/30 border border-stone-100 rounded-[2.5rem] p-10 text-xl font-serif italic text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-400 transition-all resize-none shadow-inner"
          />
        </div>

        <div className="flex space-x-4">
          {idealDayStep > 0 && (
            <button 
              onClick={() => setIdealDayStep(idealDayStep - 1)}
              className="px-10 py-5 rounded-full border border-stone-200 text-stone-400 hover:text-stone-900 transition-all font-bold uppercase tracking-widest text-[10px]"
            >
              {lang === 'zh' ? '上一步' : 'Previous'}
            </button>
          )}
          <button 
            onClick={() => {
              if (idealDayStep < 4) setIdealDayStep(idealDayStep + 1);
              else handleTransform();
            }}
            disabled={!(idealDayInputs as any)[current.key].trim()}
            className="flex-1 bg-stone-900 text-white py-5 rounded-full flex items-center justify-center space-x-3 hover:bg-black disabled:opacity-20 transition-all shadow-xl text-[10px] font-bold uppercase tracking-[0.4em]"
          >
            <span>{idealDayStep < 4 ? (lang === 'zh' ? '继续探索' : 'Continue Journey') : (lang === 'zh' ? '提取共鸣' : 'Extract Resonance')}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (activeTool) {
    const configs = {
      legacy: { title: t.tool2, icon: History, hint: lang === 'zh' ? "想象你在80岁生日派对上，朋友们如何评价你的一生？你最希望被记住的是什么？" : "Imagine your 80th birthday party. What do your closest friends say about your life? What do you most want to be remembered for?" },
      envy: { title: t.tool3, icon: Ghost, hint: lang === 'zh' ? "写下你最近的一次嫉妒。谁拥有了你渴望的东西？那背后其实代表了你什么样的缺失或需求？" : "Describe a recent moment of envy. What does the other person have that you feel you lack? What does that represent?" },
      pain: { title: t.tool4, icon: ShieldAlert, hint: lang === 'zh' ? "列出目前生活中最令你感到‘不对劲’、愤怒或痛苦的事。将它们转化为你的愿景对立面。" : "List things in your current reality that feel deeply misaligned or painful. We will transform them into their visual opposites." }
    };
    const current = (configs as any)[activeTool];

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { id: 'ideal_day', icon: Sun, title: t.tool5, desc: t.tool5Desc, action: () => setActiveTool('ideal_day'), highlight: true },
          { id: 'legacy', icon: History, title: t.tool2, desc: t.tool2Desc, action: () => setActiveTool('legacy') },
          { id: 'envy', icon: Ghost, title: t.tool3, desc: t.tool3Desc, action: () => setActiveTool('envy') },
          { id: 'pain', icon: ShieldAlert, title: t.tool4, desc: t.tool4Desc, action: () => setActiveTool('pain') }
        ].map(tool => (
          <button 
            key={tool.id}
            onClick={tool.action}
            className={`group p-10 bg-white border rounded-[2.5rem] hover:border-stone-900 hover:shadow-2xl transition-all duration-700 text-left flex flex-col space-y-6 ${tool.highlight ? 'border-stone-200 ring-2 ring-stone-50' : 'border-stone-100'}`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-700 ${tool.highlight ? 'bg-stone-900 text-white' : 'bg-stone-50 text-stone-300 group-hover:bg-stone-900 group-hover:text-white'}`}>
              <tool.icon size={32} />
            </div>
            <div className="space-y-3 flex-1">
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
