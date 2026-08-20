import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle className="w-5 h-5 text-green-600" />,
  error:   <AlertCircle className="w-5 h-5 text-red-600" />,
  info:    <Info className="w-5 h-5 text-blue-600" />,
};

const STYLES = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error:   'bg-red-50   border-red-200   text-red-800',
  info:    'bg-blue-50  border-blue-200  text-blue-800',
};

/**
 * Notification Toast
 */
function Toast({ message, type = 'info', duration = 3500, onClose }) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (duration > 0) {
      timerRef.current = setTimeout(onClose, duration);
    }
    return () => clearTimeout(timerRef.current);
  }, [duration, onClose]);

  return (
    <div className={`flex items-start gap-3 border rounded-xl px-4 py-3 shadow-lg max-w-sm w-full
                     pointer-events-auto animate-fade-in ${STYLES[type]}`}>
      <span className="flex-shrink-0 mt-0.5">{ICONS[type]}</span>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="flex-shrink-0 opacity-60 hover:opacity-100 transition">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState([]);

  // useCallback empêche la fonction d'être recréée à chaque rendu (stoppe la boucle infinie)
  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const ToastContainer = () => (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );

  return { showToast, ToastContainer };
}

export default Toast;
