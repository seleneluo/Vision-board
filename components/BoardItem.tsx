
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BoardItem as IBoardItem } from '../types';
import { Trash2, Maximize2, ShieldCheck, Edit3 } from 'lucide-react';

interface BoardItemProps {
  item: IBoardItem;
  onDelete: (id: string) => void;
  onClick: (item: IBoardItem) => void;
  onEdit: (item: IBoardItem) => void;
  onAudit: (item: IBoardItem) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
  onUpdate: (id: string, updates: Partial<IBoardItem>) => void;
  zIndex: number;
  onFocus: () => void;
  isLinking: boolean;
  onLink: (id: string) => void;
}

const PIN_COLORS = [
  '#e11d48', // Rose
  '#2563eb', // Blue
  '#059669', // Emerald
  '#d97706', // Amber
  '#7c3aed', // Violet
  '#4b5563', // Stone
  '#000000', // Black
];

export const BoardItem: React.FC<BoardItemProps> = ({ 
  item, onDelete, onClick, onEdit, onAudit, onPositionChange, onUpdate, zIndex, onFocus, isLinking, onLink 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ((e.target as HTMLElement).closest('button')) return;
    
    onFocus();
    if (isLinking) {
      onLink(item.id);
      return;
    }
    
    setIsDragging(true);
    setOffset({ x: e.clientX - item.x, y: e.clientY - item.y });
    e.preventDefault();
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const delta = e.deltaY;
      const scaleFactor = delta > 0 ? 0.94 : 1.06;
      const oldWidth = item.width || 220;
      const newWidth = Math.max(120, Math.min(1800, oldWidth * scaleFactor));
      
      if (newWidth === oldWidth) return;

      const deltaW = oldWidth - newWidth;
      const newX = item.x + deltaW / 2;

      onUpdate(item.id, { 
        width: newWidth,
        x: newX 
      });
    };

    const element = itemRef.current;
    if (element) {
      element.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (element) {
        element.removeEventListener('wheel', handleWheel);
      }
    };
  }, [item.id, item.width, item.x, onUpdate]);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        onPositionChange(item.id, e.clientX - offset.x, e.clientY - offset.y);
      }
    };
    const handleGlobalMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, offset]);

  const currentWidth = item.width || 220;
  const isNote = item.type === 'note';

  const toggleColorPicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowColorPicker(!showColorPicker);
  };

  const selectPinColor = (color: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(item.id, { pinColor: color });
    setShowColorPicker(false);
  };

  return (
    <div 
      ref={itemRef}
      className={`absolute board-item-root group ${isDragging ? 'z-[9000]' : ''}`}
      style={{ 
        left: item.x, top: item.y, width: `${currentWidth}px`, 
        zIndex: isDragging ? 9000 : zIndex,
        pointerEvents: 'auto'
      }}
      onMouseDown={handleMouseDown}
    >
      <div 
        className="paper-curl relative"
        style={{ transform: `rotate(${item.rotation || 0}deg)` }}
      >
        <div 
          className="push-pin shadow-lg cursor-pointer transition-all hover:scale-125 active:scale-95"
          style={{ backgroundColor: item.pinColor || '#e11d48' }}
          onClick={toggleColorPicker}
        ></div>

        {showColorPicker && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] bg-white/95 backdrop-blur-md p-3 rounded-full shadow-2xl border border-stone-200 flex items-center space-x-2 animate-in zoom-in-90 fade-in duration-200">
            {PIN_COLORS.map(color => (
              <button
                key={color}
                onClick={(e) => selectPinColor(color, e)}
                className="w-7 h-7 rounded-full border border-black/5 hover:scale-125 hover:shadow-md transition-all active:scale-90"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}

        {isNote ? (
          <div className="bg-[#feef91] p-8 shadow-md border-b-2 border-r-2 border-black/10 min-h-[160px] flex flex-col justify-center text-center relative">
             <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper.png')]"></div>
             <h3 className="handwriting text-3xl text-stone-700 leading-tight select-none">
               {item.title}
             </h3>
             <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 flex space-x-1.5 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-1.5 hover:text-stone-900 transition-colors"><Edit3 size={16}/></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-1.5 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
             </div>
          </div>
        ) : (
          <div className={`bg-white p-3 pb-14 shadow-2xl border border-black/5 relative transition-all duration-500 ${isLinking ? 'ring-4 ring-rose-600/50 scale-[1.03]' : ''}`}>
            {/* 这里的 aspect 限制已移除，改为自适应内容 */}
            <div className="relative overflow-hidden bg-stone-100 rounded-sm">
              {item.imageUrl && (
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-auto block filter contrast-[1.05] brightness-[0.98] transition-opacity duration-700" 
                />
              )}
              
              {!isLinking && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 space-x-3 z-20">
                  <button onClick={(e) => { e.stopPropagation(); onClick(item); }} className="p-3 bg-white text-stone-950 rounded-full hover:bg-stone-50 shadow-2xl transform hover:scale-110 active:scale-90 transition-all"><Maximize2 size={18} /></button>
                  <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-3 bg-white text-stone-950 rounded-full hover:bg-stone-50 shadow-2xl transform hover:scale-110 active:scale-90 transition-all"><Edit3 size={18} /></button>
                  <button onClick={(e) => { e.stopPropagation(); onAudit(item); }} className="p-3 bg-white text-stone-950 rounded-full hover:bg-stone-50 shadow-2xl transform hover:scale-110 active:scale-90 transition-all"><ShieldCheck size={18} /></button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-3 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-2xl transform hover:scale-110 active:scale-90 transition-all"><Trash2 size={18} /></button>
                </div>
              )}
            </div>
            <div className="mt-6 text-center px-2">
              <h3 className="handwriting text-4xl text-stone-900 line-clamp-1 select-none leading-none">{item.title}</h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
