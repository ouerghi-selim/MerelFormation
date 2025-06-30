// Types pour les centres de formation et d'examen

export type CenterType = 'formation' | 'exam' | 'both';

export interface Center {
    id: number;
    name: string;
    code: string;
    type: CenterType;
    city: string;
    departmentCode: string;
    address?: string;
    phone?: string;
    email?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CenterFormData {
    name: string;
    code: string;
    type: CenterType;
    city: string;
    departmentCode: string;
    address?: string;
    phone?: string;
    email?: string;
    isActive?: boolean;
}

export interface CenterSelectOption {
    id: number;
    name: string;
    fullAddress: string;
    type: CenterType;
}

// Utilitaires pour les centres
export const CENTER_TYPES: Record<CenterType, string> = {
    formation: 'Formation',
    exam: 'Examen',
    both: 'Formation & Examen'
};

export const formatCenterForSelect = (center: Center): CenterSelectOption => ({
    id: center.id,
    name: center.name,
    fullAddress: center.address ? `${center.address}, ${center.city}` : center.city,
    type: center.type
});

export const getCenterDisplayName = (center: Center): string => {
    return `${center.name} - ${center.city}`;
};

export const getCenterFullAddress = (center: Center): string => {
    const parts = [center.address, center.city, center.departmentCode].filter(Boolean);
    return parts.join(', ');
};