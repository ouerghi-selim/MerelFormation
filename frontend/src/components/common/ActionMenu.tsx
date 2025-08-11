import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

interface ActionItem {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'danger';
    disabled?: boolean;
}

interface ActionMenuProps {
    actions: ActionItem[];
    className?: string;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ actions, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Fermer le menu quand on clique en dehors
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current && 
                !menuRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleActionClick = (action: ActionItem) => {
        if (!action.disabled) {
            action.onClick();
            setIsOpen(false);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <button
                ref={buttonRef}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                title="Actions"
            >
                <MoreVertical className="h-5 w-5 text-gray-500" />
            </button>

            {isOpen && (
                <div
                    ref={menuRef}
                    className="absolute right-0 top-8 z-50 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1"
                    onClick={(e) => e.stopPropagation()}
                >
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => handleActionClick(action)}
                            disabled={action.disabled}
                            className={`
                                w-full px-4 py-2 text-left text-sm flex items-center space-x-3 transition-colors duration-200
                                ${action.disabled 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : action.variant === 'danger'
                                        ? 'text-red-700 hover:bg-red-50 hover:text-red-900'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }
                            `}
                        >
                            <span className="flex-shrink-0">
                                {action.icon}
                            </span>
                            <span>{action.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActionMenu;