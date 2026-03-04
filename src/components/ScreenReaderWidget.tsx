import React, { useState, useEffect, useCallback } from 'react';
import { Ear, EarOff } from 'lucide-react';

export default function ScreenReaderWidget() {
  const [isActive, setIsActive] = useState(false);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.1; // Slightly faster for better UX
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    if (!isActive) {
      window.speechSynthesis?.cancel();
      return;
    }

    speak("Leitor de tela ativado. Navegue ou clique nos elementos para ouvi-los.");

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      // Skip if it's the widget itself
      if (target.closest('#screen-reader-widget')) return;
      
      const text = target.getAttribute('aria-label') || target.innerText || target.title;
      if (text) {
        speak(text.trim());
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Skip if it's the widget itself
      if (target.closest('#screen-reader-widget')) return;
      
      const text = target.getAttribute('aria-label') || target.innerText || target.title;
      if (text) {
        speak(text.trim());
      }
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('click', handleClick, { capture: true });

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('click', handleClick, { capture: true });
      window.speechSynthesis?.cancel();
    };
  }, [isActive, speak]);

  return (
    <button
      id="screen-reader-widget"
      onClick={() => setIsActive(!isActive)}
      className={`fixed right-0 top-[35%] -translate-y-1/2 z-[9999] p-2 rounded-l-lg shadow-lg transition-colors flex items-center justify-center ${
        isActive 
          ? 'bg-reflow-emerald text-white' 
          : 'bg-blue-500 text-white hover:bg-blue-600'
      }`}
      aria-label={isActive ? "Desativar leitor de tela" : "Ativar leitor de tela"}
      title={isActive ? "Desativar leitor de tela" : "Ativar leitor de tela"}
      style={{ width: '40px', height: '40px' }}
    >
      {isActive ? <Ear className="w-6 h-6" /> : <EarOff className="w-6 h-6" />}
    </button>
  );
}
