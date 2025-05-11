import api from '../services/api.ts';

export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('token');
};
// Fonction pour récupérer les rôles de l'utilisateur connecté
export const getUserRoles = async (): Promise<string[]> => {
    try {
        const response = await api.get('/profile');
        return response.data.roles || [];
    } catch (error) {
        console.error('Error fetching user roles:', error);
        return [];
    }
};

// Fonction pour déterminer l'URL de redirection en fonction des rôles
export const getRedirectPathForUser = (roles: string[]): string => {
    if (roles.includes('ROLE_ADMIN')) {
        return '/admin/dashboard';
    } else if (roles.includes('ROLE_STUDENT')) {
        return '/student';
    } else if (roles.includes('ROLE_INSTRUCTOR')) {
        return '/instructor/dashboard';
    } else {
        // Redirection par défaut
        return '/';
    }
};


// Fonction combinée qui fait les deux opérations
export const getRedirectPathForCurrentUser = async (): Promise<string> => {
    const roles = await getUserRoles();
    return getRedirectPathForUser(roles);
};

export const redirectAuthenticatedUser = async (navigate: any): Promise<boolean> => {
    if (isAuthenticated()) {
        const roles = await getUserRoles();
        const redirectPath = getRedirectPathForUser(roles);
        navigate(redirectPath);
        return true;
    }
    return false;
};

