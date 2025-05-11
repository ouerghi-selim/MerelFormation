import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    icon?: React.ReactNode;
    loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
                                           children,
                                           variant = 'primary',
                                           size = 'md',
                                           disabled = false,
                                           onClick,
                                           type = 'button',
                                           className = '',
                                           icon,
                                           loading = false
                                       }) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg focus:outline-none transition-colors';

    const variantClasses = {
        primary: 'bg-blue-700 text-white hover:bg-blue-800',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        success: 'bg-green-600 text-white hover:bg-green-700',
        outline: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg',
    };

    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

    return (
        <button
            type={type}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
            onClick={onClick}
            disabled={disabled || loading}
        >
            {loading && (
                <div className="mr-2 w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                     style={{ borderColor: variant === 'outline' ? '#374151' : 'white', borderTopColor: 'transparent' }}></div>
            )}
            {icon && !loading && <span className="mr-2">{icon}</span>}
            {children}
        </button>
    );
};

export default Button;