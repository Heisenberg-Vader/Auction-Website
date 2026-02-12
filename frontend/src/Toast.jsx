import React, { useEffect, useState, useRef, useCallback } from 'react';

const Toast = ({ message, type = 'info', onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => setIsVisible(true));

        const timer = setTimeout(() => {
            setIsLeaving(true);
            setTimeout(onClose, 400);
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const typeStyles = {
        success: {
            bg: 'bg-emerald-50 border-emerald-400',
            text: 'text-emerald-800',
            icon: (
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            progress: 'bg-emerald-400',
        },
        error: {
            bg: 'bg-red-50 border-red-400',
            text: 'text-red-800',
            icon: (
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            progress: 'bg-red-400',
        },
        warning: {
            bg: 'bg-amber-50 border-amber-400',
            text: 'text-amber-800',
            icon: (
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86l-8.6 14.86A1 1 0 002.54 20h18.92a1 1 0 00.85-1.28l-8.6-14.86a1 1 0 00-1.71 0z" />
                </svg>
            ),
            progress: 'bg-amber-400',
        },
        info: {
            bg: 'bg-blue-50 border-blue-400',
            text: 'text-blue-800',
            icon: (
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            progress: 'bg-blue-400',
        },
    };

    const style = typeStyles[type] || typeStyles.info;

    return (
        <div
            className={`
        fixed bottom-6 right-6 z-[9999] min-w-[320px] max-w-[420px]
        ${style.bg} border-l-4 rounded-lg shadow-lg
        transition-all duration-400 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
        >
            <div className="flex items-start gap-3 px-4 py-3">
                <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
                <p className={`text-sm font-medium ${style.text} flex-1`}>{message}</p>
                <button
                    onClick={() => {
                        setIsLeaving(true);
                        setTimeout(onClose, 400);
                    }}
                    className={`flex-shrink-0 ${style.text} hover:opacity-70 transition-opacity cursor-pointer`}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            {/* Progress bar */}
            <div className="h-1 w-full bg-transparent rounded-b-lg overflow-hidden">
                <div
                    className={`h-full ${style.progress} rounded-b-lg`}
                    style={{
                        animation: isVisible && !isLeaving ? 'toast-progress 3s linear forwards' : 'none',
                    }}
                />
            </div>
            <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
        </div>
    );
};

export const ToastContainer = ({ toast, removeToast }) => {
    if (!toast) return null;

    return (
        <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={removeToast}
        />
    );
};

export const useToast = () => {
    const [toast, setToast] = useState(null);
    const lastCallTime = useRef(0);
    const currentMessage = useRef(null);
    const dismissTimer = useRef(null);

    const showToast = useCallback((message, type = 'info') => {
        const now = Date.now();

        if (now - lastCallTime.current < 500) return;

        if (currentMessage.current === message) return;

        lastCallTime.current = now;
        currentMessage.current = message;

        if (dismissTimer.current) clearTimeout(dismissTimer.current);

        const id = now;
        setToast({ id, message, type });

        dismissTimer.current = setTimeout(() => {
            currentMessage.current = null;
        }, 3400);
    }, []);

    const removeToast = useCallback(() => {
        setToast(null);
        currentMessage.current = null;
        if (dismissTimer.current) clearTimeout(dismissTimer.current);
    }, []);

    return { toast, showToast, removeToast };
};

export default Toast;
