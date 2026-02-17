
import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-8 bg-stone-950/10 backdrop-blur-[60px] animate-in fade-in duration-1000">
      <div className="bg-[#fffdfc]/95 rounded-[4rem] shadow-[0_100px_200px_rgba(0,0,0,0.15)] w-full max-w-7xl max-h-[94vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-700 border border-white/50">
        <div className="flex items-center justify-between px-16 py-12 border-b border-stone-50/50">
          <div>
            <span className="text-[10px] uppercase tracking-[0.8em] text-stone-400 font-black mb-2 block">Dimensional Entry</span>
            <h2 className="text-4xl font-serif text-stone-950 tracking-tighter leading-none">{title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-6 hover:bg-stone-50 rounded-full transition-all text-stone-300 hover:text-stone-950 active:scale-90 group"
          >
            <X size={40} className="transition-transform duration-500 group-hover:rotate-90" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <div className="max-w-screen-2xl mx-auto h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
