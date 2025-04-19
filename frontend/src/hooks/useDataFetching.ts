import { useState, useEffect, useCallback } from 'react';

interface UseDataFetchingProps<T> {
    fetchFn: () => Promise<T[]>;
    dependencies?: any[];
}

const useDataFetching = <T,>({ fetchFn, dependencies = [] }: UseDataFetchingProps<T>) => {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetchFn();
            setData(response);
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    }, [fetchFn, ...dependencies]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData, setData };
};

export default useDataFetching;