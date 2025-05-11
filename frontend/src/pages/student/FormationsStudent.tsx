import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Filter, ChevronDown, CheckCircle } from 'lucide-react';
import StudentHeader from '../../components/student/StudentHeader';
import { studentFormationsApi } from '@/services/api.ts';
interface Formation {
  id: number;
  title: string;
  type: string;
  progress: number;
  startDate: string;
  endDate: string;
  instructor: string;
  nextSession: string | null;
  status: 'active' | 'completed' | 'pending';
}

const FormationsStudent: React.FC = () => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [filteredFormations, setFilteredFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        setLoading(true);

        // Remplaçons le mock par l'appel API réel
        const response = await studentFormationsApi.getAll();
        setFormations(response.data);
        setFilteredFormations(response.data);
        setLoading(false);

      } catch (err) {
        console.error('Error fetching formations:', err);
        setError('Erreur lors du chargement des formations');
        setLoading(false);
      }
    };

    fetchFormations();
  }, []);

  useEffect(() => {
    // Apply filters when status filter or search query changes
    let filtered = formations;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(formation => formation.status === statusFilter);
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(formation => 
        formation.title.toLowerCase().includes(query) || 
        formation.instructor.toLowerCase().includes(query)
      );
    }
    
    setFilteredFormations(filtered);
  }, [statusFilter, searchQuery, formations]);

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'active': return 'En cours';
      case 'completed': return 'Terminée';
      case 'pending': return 'À venir';
      default: return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFormationType = (type: string): string => {
    switch (type) {
      case 'initial': return 'Formation Initiale';
      case 'continuous': return 'Formation Continue';
      case 'mobility': return 'Formation Mobilité';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <StudentHeader />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
            Mes formations
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une formation..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="relative w-full sm:w-48">
              <Filter className="absolute left-3 top-3 text-gray-400" />
              <select
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white w-full"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="active">En cours</option>
                <option value="completed">Terminées</option>
                <option value="pending">À venir</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {filteredFormations.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Aucune formation trouvée</h2>
            <p className="text-gray-600 mb-4">
              {formations.length > 0
                ? "Aucune formation ne correspond à vos critères de recherche."
                : "Vous n'êtes inscrit à aucune formation pour le moment."}
            </p>
            {formations.length > 0 && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFormations.map((formation) => (
              <div key={formation.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="border-t-4 border-blue-700"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{formation.title}</h2>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(formation.status)}`}>
                      {getStatusLabel(formation.status)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{getFormationType(formation.type)}</p>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-1">Progression</div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-700 h-2.5 rounded-full" 
                        style={{ width: `${formation.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-sm text-gray-600 mt-1">{formation.progress}%</div>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-gray-600">
                      <span>Du {formation.startDate} au {formation.endDate}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span>Formateur: {formation.instructor}</span>
                    </div>
                    {formation.nextSession && (
                      <div className="flex items-center text-gray-600">
                        <span>Prochaine session: {formation.nextSession}</span>
                      </div>
                    )}
                  </div>
                  
                  <Link 
                    to={`/student/formations/${formation.id}`}
                    className="flex items-center justify-center w-full bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    {formation.status === 'completed' ? (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Voir le récapitulatif
                      </>
                    ) : (
                      <>
                        Accéder à la formation
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FormationsStudent;
