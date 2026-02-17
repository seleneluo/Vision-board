
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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 sm:p-4 md:p-8 bg-stone-950/20 backdrop-blur-[40px] animate-in fade-in duration-700">
      <div className="bg-[#fffdfc]/98 sm:rounded-[3rem] md:rounded-[4rem] shadow-[0_100px_200px_rgba(0,0,0,0.15)] w-full h-full sm:h-auto sm:max-w-7xl sm:max-h-[94vh] overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-10 sm:slide-in-from-bottom-0 duration-500 border-none sm:border sm:border-white/50">
        <div className="flex items-center justify-between px-6 py-8 sm:px-12 sm:py-10 md:px-16 md:py-12 border-b border-stone-50/50">
          <div className="flex-1">
            <span className="hidden sm:block text-[10px] uppercase tracking-[0.8em] text-stone-400 font-black mb-2">Dimensional Entry</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-stone-950 tracking-tighter leading-tight">{title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-3 sm:p-5 md:p-6 hover:bg-stone-50 rounded-full transition-all text-stone-300 hover:text-stone-950 active:scale-90 group"
          >
            <X size={24} className="sm:w-8 sm:h-8 md:w-10 md:h-10 transition-transform duration-500 group-hover:rotate-90" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-screen-2xl mx-auto px-6 py-8 sm:px-12 sm:py-10 md:px-16">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
