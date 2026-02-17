
import React, { useState, useEffect, useRef } from 'react';
import { BoardItem as IBoardItem, Connection, Category } from './types';
import { MOCK_ITEMS } from './constants';
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
  Menu,
  Focus,
  Edit3,
  X,
  RotateCcw
} from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'zh'>('zh');
  const t = translations[lang];
  
  const [items, setItems] = useState<IBoardItem[]>(() => {
    const saved = localStorage.getItem('vision-board-items-v12');
    if (saved) return JSON.parse(saved);
    return MOCK_ITEMS.map((item, idx) => ({
      ...item,
      x: 2600 + (idx % 3) * 500,
      y: 2200 + Math.floor(idx / 3) * 600,
      width: 220,
      rotation: (Math.random() - 0.5) * 8
    }));
  });

  const [connections, setConnections] = useState<Connection[]>(() => {
    const saved = localStorage.getItem('vision-board-links-v12');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedItem, setSelectedItem] = useState<IBoardItem | null>(null);
  const [editingItem, setEditingItem] = useState<IBoardItem | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isAiGuideOpen, setIsAiGuideOpen] = useState(false);
  const [auditTarget, setAuditTarget] = useState<IBoardItem | 'global' | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [linkStartId, setLinkStartId] = useState<string | null>(null);
  const [isNavVisible, setIsNavVisible] = useState(false);

  const mainRef = useRef<HTMLElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollLeft = 2400;
      mainRef.current.scrollTop = 2000;
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('vision-board-items-v12', JSON.stringify(items));
    localStorage.setItem('vision-board-links-v12', JSON.stringify(connections));
  }, [items, connections]);

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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSpacePressed || e.button === 1) {
      setIsPanning(true);
      const startX = e.pageX - (mainRef.current?.offsetLeft || 0);
      const startY = e.pageY - (mainRef.current?.offsetTop || 0);
      const scrollLeft = mainRef.current?.scrollLeft || 0;
      const scrollTop = mainRef.current?.scrollTop || 0;

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!mainRef.current) return;
        const walkX = (moveEvent.pageX - (mainRef.current.offsetLeft || 0)) - startX;
        const walkY = (moveEvent.pageY - (mainRef.current.offsetTop || 0)) - startY;
        mainRef.current.scrollLeft = scrollLeft - walkX;
        mainRef.current.scrollTop = scrollTop - walkY;
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
        // 检查是否已经存在该连接（无论是哪个方向）
        const existingIdx = connections.findIndex(c => 
          (c.fromId === linkStartId && c.toId === id) || 
          (c.fromId === id && c.toId === linkStartId)
        );

        if (existingIdx > -1) {
          // 如果已存在，则移除（Toggle 逻辑）
          setConnections(prev => prev.filter((_, idx) => idx !== existingIdx));
        } else {
          // 如果不存在，则添加
          setConnections(prev => [...prev, { fromId: linkStartId, toId: id }]);
        }
      }
      setLinkStartId(null);
      setIsLinking(false);
    }
  };

  const deleteConnection = (idx: number) => {
    setConnections(prev => prev.filter((_, i) => i !== idx));
  };

  const clearAllConnections = () => {
    if (window.confirm(lang === 'zh' ? '确定要清除所有连线吗？' : 'Clear all connections?')) {
      setConnections([]);
      setIsLinking(false);
    }
  };

  const addNote = () => {
    const centerX = (mainRef.current?.scrollLeft || 0) + window.innerWidth / 2 - 100;
    const centerY = (mainRef.current?.scrollTop || 0) + window.innerHeight / 2 - 100;
    const newNote: IBoardItem = {
      id: Math.random().toString(36).substr(2, 9),
      imageUrl: '',
      category: Category.SPIRITUAL,
      title: lang === 'zh' ? '新便签' : 'New Note',
      affirmation: '',
      createdAt: Date.now(),
      x: centerX,
      y: centerY,
      width: 200,
      rotation: (Math.random() - 0.5) * 15,
      type: 'note'
    };
    setItems(prev => [newNote, ...prev]);
  };

  const addItem = (item: IBoardItem) => {
    const centerX = (mainRef.current?.scrollLeft || 0) + window.innerWidth / 2 - 150;
    const centerY = (mainRef.current?.scrollTop || 0) + window.innerHeight / 2 - 200;
    setItems(prev => [{ ...item, x: centerX, y: centerY, width: 220, rotation: (Math.random() - 0.5) * 10 }, ...prev]);
  };

  const updateItemPosition = (id: string, x: number, y: number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, x, y } : item));
  };

  const updateItem = (id: string, updates: Partial<IBoardItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setConnections(prev => prev.filter(c => c.fromId !== id && c.toId !== id));
  };

  const resetView = () => {
    if (mainRef.current) {
      mainRef.current.scrollTo({
        left: 2400,
        top: 2000,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden bg-[#2a1e16]">
      {/* 优化后的顶部感应区：增加 padding 范围 */}
      <div 
        onMouseEnter={() => setIsNavVisible(true)}
        className={`fixed top-0 inset-x-0 h-32 z-[4500] pointer-events-auto transition-opacity ${isNavVisible ? 'opacity-0' : 'opacity-100'}`}
      />

      <nav 
        onMouseEnter={() => setIsNavVisible(true)}
        onMouseLeave={() => setIsNavVisible(false)}
        className={`fixed top-8 left-1/2 -translate-x-1/2 z-[5000] flex items-center space-x-2 p-2.5 bg-black/85 backdrop-blur-3xl border border-white/10 rounded-full transition-all duration-700 pointer-events-auto shadow-[0_25px_60px_rgba(0,0,0,0.6)] ${isNavVisible || isLinking ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-20 scale-90'}`}
      >
        <button onClick={() => setIsWizardOpen(true)} className="p-5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all flex items-center justify-center min-w-[72px] min-h-[72px]" title={t.quickAdd}><Plus size={32}/></button>
        <button onClick={addNote} className="p-5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all flex items-center justify-center min-w-[72px] min-h-[72px]" title="Add Sticky Note"><StickyNote size={28}/></button>
        <div className="w-[1px] h-10 bg-white/20 mx-2"></div>
        <button onClick={resetView} className="p-5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all flex items-center justify-center min-w-[72px] min-h-[72px]" title={t.resetView}><Focus size={28}/></button>
        
        <div className="w-[1px] h-10 bg-white/20 mx-2"></div>
        
        <div className="flex items-center bg-white/5 rounded-full px-1">
          <button 
            onClick={() => { setIsLinking(!isLinking); setLinkStartId(null); }} 
            className={`p-5 transition-all rounded-full flex items-center justify-center min-w-[72px] min-h-[72px] ${isLinking ? 'text-rose-500 bg-rose-500/20 scale-110' : 'text-white/70 hover:text-white hover:bg-white/10'}`} 
            title="Connect Vision Nodes"
          >
            <LinkIcon size={28}/>
          </button>
          {isLinking && (
             <button 
              onClick={clearAllConnections} 
              className="p-5 text-white/40 hover:text-rose-400 transition-all rounded-full flex items-center justify-center min-w-[72px] min-h-[72px]" 
              title="Clear All Lines"
             >
               <RotateCcw size={22}/>
             </button>
          )}
        </div>

        <button onClick={() => setIsAiGuideOpen(true)} className="p-5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all flex items-center justify-center min-w-[72px] min-h-[72px]" title={t.aiGuide}><Sparkles size={28}/></button>
        <div className="w-[1px] h-10 bg-white/20 mx-2"></div>
        <button onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} className="p-5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all min-w-[72px] min-h-[72px] text-base font-black tracking-tighter">{lang.toUpperCase()}</button>
      </nav>

      <main 
        ref={mainRef}
        onMouseDown={handleMouseDown}
        className={`flex-1 relative overflow-auto select-none ${isPanning ? 'cursor-grabbing' : isSpacePressed ? 'cursor-grab' : ''} cork-board custom-scrollbar`}
      >
        <div className="relative min-w-[6000px] min-h-[5000px]">
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            {connections.map((conn, idx) => {
              const from = items.find(i => i.id === conn.fromId);
              const to = items.find(i => i.id === conn.toId);
              if (!from || !to) return null;
              
              const startX = from.x + (from.width || 220) / 2;
              const startY = from.y + 12;
              const endX = to.x + (to.width || 220) / 2;
              const endY = to.y + 12;

              // 计算贝塞尔曲线的中点，用于放置删除按钮
              const midX = (startX + endX) / 2;
              const midY = (startY + endY) / 2 + 50;

              return (
                <g key={`${conn.fromId}-${conn.toId}-${idx}`} className="connection-group">
                  {/* 用于提高交互灵敏度的透明加宽路径 */}
                  <path 
                    d={`M ${startX} ${startY} Q ${midX} ${(startY + endY) / 2 + 100} ${endX} ${endY}`}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="20"
                    className="pointer-events-auto cursor-crosshair"
                  />
                  {/* 可见的红线 */}
                  <path 
                    d={`M ${startX} ${startY} Q ${midX} ${(startY + endY) / 2 + 100} ${endX} ${endY}`}
                    className="connection-line"
                    fill="none"
                  />
                  {/* 删除按钮 (仅在某些情况下显示或作为通用交互) */}
                  <g 
                    className="pointer-events-auto cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); deleteConnection(idx); }}
                  >
                    <circle cx={midX} cy={midY} r="12" fill="white" className="shadow-md" />
                    <line x1={midX-4} y1={midY-4} x2={midX+4} y2={midY+4} stroke="#e11d48" strokeWidth="2" />
                    <line x1={midX+4} y1={midY-4} x2={midX-4} y2={midY+4} stroke="#e11d48" strokeWidth="2" />
                  </g>
                </g>
              );
            })}
          </svg>

          {items.map((item, index) => (
            <BoardItem 
              key={item.id} item={item} zIndex={index}
              isLinking={isLinking}
              onLink={handleLink}
              onDelete={deleteItem}
              onClick={setSelectedItem}
              onEdit={setEditingItem}
              onAudit={setAuditTarget}
              onPositionChange={updateItemPosition}
              onUpdate={updateItem}
              onFocus={() => {}}
            />
          ))}
        </div>
      </main>

      <div className={`fixed bottom-8 right-10 pointer-events-none transition-opacity duration-1000 ${isPanning ? 'opacity-0' : 'opacity-20'} flex items-center space-x-4 text-[9px] text-white font-black uppercase tracking-[0.5em]`}>
        <Menu size={12}/>
        <span>Evidence Board Archive</span>
      </div>

      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title={selectedItem?.title}>
        {selectedItem && (
          <div className="max-w-4xl mx-auto p-12 bg-white shadow-2xl rounded-sm">
            <img src={selectedItem.imageUrl} className="w-full h-auto rounded-sm border border-stone-100 shadow-md" />
            <div className="mt-12 text-center handwriting text-6xl text-stone-800 leading-relaxed">
               {selectedItem.affirmation}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title={lang === 'zh' ? "编辑愿景" : "Edit Vision"}>
        {editingItem && (
          <div className="max-w-xl mx-auto p-8 space-y-8">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-stone-400 mb-2">Title / Text</label>
                <input 
                  value={editingItem.title}
                  onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-xl font-serif text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                />
              </div>
              {editingItem.type !== 'note' && (
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-stone-400 mb-2">Image URL</label>
                  <input 
                    value={editingItem.imageUrl}
                    onChange={e => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-sm font-mono text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                  />
                </div>
              )}
              {editingItem.type !== 'note' && (
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-stone-400 mb-2">Affirmation</label>
                  <textarea 
                    value={editingItem.affirmation}
                    onChange={e => setEditingItem({ ...editingItem, affirmation: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 h-32 text-lg handwriting text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                  />
                </div>
              )}
            </div>
            <button 
              onClick={() => { updateItem(editingItem.id, editingItem); setEditingItem(null); }}
              className="w-full bg-stone-900 text-white py-5 rounded-full font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center justify-center space-x-3 active:scale-95"
            >
              <Edit3 size={18} />
              <span>{lang === 'zh' ? '保存更改' : 'Save Changes'}</span>
            </button>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!auditTarget} onClose={() => setAuditTarget(null)} title={t.audit}>
        <VisionAudit item={auditTarget === 'global' ? undefined : auditTarget || undefined} items={items} onUpdate={updateItem} lang={lang} onClose={() => setAuditTarget(null)} />
      </Modal>

      <Modal isOpen={isAiGuideOpen} onClose={() => setIsAiGuideOpen(false)} title={t.aiGuide}>
        <AiGuide onAdd={addItem} lang={lang} />
      </Modal>

      <Modal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} title={t.quickAdd}>
        <GuidanceWizard onAdd={addItem} onComplete={() => setIsWizardOpen(false)} lang={lang} />
      </Modal>
    </div>
  );
};

export default App;
