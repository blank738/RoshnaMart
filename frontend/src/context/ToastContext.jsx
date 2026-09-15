import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';

import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(
    (
      message,
      type = 'success',
      duration = 4000
    ) => {
      const id =
        Date.now() + Math.random();

      setToasts((prev) => [
        ...prev,
        {
          id,
          message,
          type,
        },
      ]);

      setTimeout(() => {
        setToasts((prev) =>
          prev.filter(
            (toast) => toast.id !== id
          )
        );
      }, duration);
    },
    []
  );

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.filter(
        (toast) => toast.id !== id
      )
    );
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <CheckCircle2
            className="text-emerald-600"
            size={20}
          />
        );

      case 'error':
        return (
          <AlertCircle
            className="text-red-500"
            size={20}
          />
        );

      case 'warning':
        return (
          <AlertTriangle
            className="text-amber-500"
            size={20}
          />
        );

      default:
        return (
          <Info
            className="text-blue-500"
            size={20}
          />
        );
    }
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        removeToast,
      }}
    >
      {children}

      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            role="alert"
          >
            {getIcon(toast.type)}

            <span className="flex-1 text-sm font-medium">
              {toast.message}
            </span>

            <button
              type="button"
              onClick={() =>
                removeToast(toast.id)
              }
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      'useToast must be used within a ToastProvider'
    );
  }

  return context;
};