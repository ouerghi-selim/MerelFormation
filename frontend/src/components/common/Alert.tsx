import React from 'react';
import { CheckCircle, AlertTriangle, Info, AlertCircle, X } from 'lucide-react';

interface AlertProps {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5" />;
            case 'error': return <AlertCircle className="h-5 w-5" />;
            case 'warning': return <AlertTriangle className="h-5 w-5" />;
            case 'info': return <Info className="h-5 w-5" />;
        }
    };

    const getClasses = () => {
        switch (type) {
            case 'success': return 'bg-green-100 border-green-500 text-green-700';
            case 'error': return 'bg-red-100 border-red-500 text-red-700';
            case 'warning': return 'bg-yellow-100 border-yellow-500 text-yellow-700';
            case 'info': return 'bg-blue-100 border-blue-500 text-blue-700';
        }
    };

    return (
        <div className={`border-l-4 p-4 mb-6 ${getClasses()}`}>
            <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                    {getIcon()}
                </div>
                <div className="flex-1">
                    <p>{message}</p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 ml-2 text-current opacity-50 hover:opacity-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Alert;