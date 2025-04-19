import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({
                                         message,
                                         type,
                                         onClose,
                                         duration = 5000
                                     }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5" />;
            case 'error': return <AlertCircle className="h-5 w-5" />;
            case 'warning': return <AlertTriangle className="h-5 w-5" />;
            case 'info': return <Info className="h-5 w-5" />;
        }
    };

    const getColorClass = () => {
        switch (type) {
            case 'success': return 'bg-green-50 border-l-green-500 text-green-800';
            case 'error': return 'bg-red-50 border-l-red-500 text-red-800';
            case 'warning': return 'bg-yellow-50 border-l-yellow-500 text-yellow-800';
            case 'info': return 'bg-blue-50 border-l-blue-500 text-blue-800';
        }
    };

    return (
        <div className={`max-w-sm w-full rounded-lg shadow-lg border-l-4 ${getColorClass()} p-4 flex items-start animate-fadeIn`}>
            <div className="flex-shrink-0">
                {getIcon()}
            </div>
            <div className="ml-3 flex-1">
                <p className="text-sm">{message}</p>
            </div>
            <button
                className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-500"
                onClick={onClose}
            >
                <X className="h-5 w-5" />
            </button>
        </div>
    );
};

export default Toast;