import { useState, useEffect } from 'react';
import { adminCentersApi } from '../services/api';
import { Center } from '../types/center';

interface UseCentersProps {
    type?: 'formation' | 'exam' | 'all';
}

export const useCenters = ({ type = 'all' }: UseCentersProps = {}) => {
    const [centers, setCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCenters = async () => {
            try {
                setLoading(true);
                setError(null);
                
                let response;
                switch (type) {
                    case 'formation':
                        response = await adminCentersApi.getForFormations();
                        break;
                    case 'exam':
                        response = await adminCentersApi.getForExams();
                        break;
                    default:
                        response = await adminCentersApi.getAll();
                }
                
                setCenters(response.data);
            } catch (err) {
                console.error('Error fetching centers:', err);
                setError('Erreur lors du chargement des centres');
                setCenters([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCenters();
    }, [type]);

    // Fonction pour obtenir les centres formatés pour un select
    const getCentersForSelect = () => {
        return centers.map(center => ({
            value: center.id.toString(),
            label: `${center.name} - ${center.city}`,
            fullAddress: center.address ? `${center.address}, ${center.city}` : center.city
        }));
    };

    // Fonction pour obtenir l'adresse complète d'un centre par son ID
    const getCenterAddress = (centerId: number | string) => {
        const center = centers.find(c => c.id.toString() === centerId.toString());
        if (!center) return '';
        return center.address ? `${center.address}, ${center.city}` : center.city;
    };

    // Fonction pour obtenir un centre par son ID
    const getCenterById = (centerId: number | string) => {
        return centers.find(c => c.id.toString() === centerId.toString());
    };

    return {
        centers,
        loading,
        error,
        getCentersForSelect,
        getCenterAddress,
        getCenterById
    };
};