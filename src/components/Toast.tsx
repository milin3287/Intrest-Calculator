import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toastMessage, triggerToast } = useApp();

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      triggerToast('');
    }, 2800);
    return () => clearTimeout(timer);
  }, [toastMessage, triggerToast]);

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 transition-all duration-300 pointer-events-none animate-in fade-in slide-in-from-bottom-5">
      <div className="bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-xl shadow-xl flex items-center gap-space-xs font-label-md text-label-md border border-outline-variant/30">
        <span className="material-symbols-outlined text-[18px] text-primary-fixed">info</span>
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
