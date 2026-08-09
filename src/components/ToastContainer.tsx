import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'info';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '1.75rem',
        right: '1.75rem',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        maxWidth: '360px',
        width: '100%',
        pointerEvents: 'none'
      }}
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className="glass-panel"
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              padding: '0.85rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-main)',
              border: `1px solid ${
                isSuccess
                  ? 'rgba(16, 185, 129, 0.4)'
                  : isWarning
                  ? 'rgba(245, 158, 11, 0.4)'
                  : 'rgba(139, 92, 246, 0.4)'
              }`,
              boxShadow: 'var(--shadow-md)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              fontWeight: 600,
              animation: 'toast-slide 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {isSuccess && <CheckCircle2 size={18} style={{ color: 'var(--success-color)', flexShrink: 0 }} />}
              {isWarning && <AlertCircle size={18} style={{ color: 'var(--warning-color)', flexShrink: 0 }} />}
              {!isSuccess && !isWarning && <Info size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />}
              <span>{toast.message}</span>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
