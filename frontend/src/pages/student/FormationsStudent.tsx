import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Filter, ChevronDown, CheckCircle } from 'lucide-react';
import StudentHeader from '../../components/student/StudentHeader';
import ReservationStatusProgress from '../../components/student/ReservationStatusProgress';
import { studentFormationsApi } from '@/services/api.ts';
interface Formation {
  id: number;
  title: string;
  type: string;
  description?: string;
  duration?: number;
  nextSession?: {
    id: number;
    startDate: string;
    endDate: string;
    location: string;
    reservationStatus: string;
    sessionStartDateTime: string;
  } | null;
  status: 'active' | 'completed' | 'pending' | 'upcoming' | 'scheduled' | 'ongoing' | 'cancelled';
  sessionsCount: number;
  completedSessions: number;
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
        // L'API renvoie {success: true, data: [...]}
        const formationsData = response.data?.data || response.data || [];
        setFormations(formationsData);
        setFilteredFormations(formationsData);
        setLoading(false);

      } catch (err) {
        console.error('Error fetching formations:', err);
        setError('Erreur lors du chargement des formations');
        setLoading(false);
      }
    };

    fetchFormations();
  }, []);

  // Fonction pour obtenir la phase basée sur le statut de réservation
  const getPhaseFromReservationStatus = (reservationStatus: string): string => {
    const phaseMap: { [key: string]: string } = {
      // Phase 1: Demande Initiale
      'submitted': 'phase1',
      'under_review': 'phase1',
      // Phase 2: Vérifications
      'awaiting_documents': 'phase2',
      'documents_pending': 'phase2',
      'documents_rejected': 'phase2',
      'awaiting_prerequisites': 'phase2',
      // Phase 3: Financement
      'awaiting_funding': 'phase3',
      'funding_approved': 'phase3',
      'awaiting_payment': 'phase3',
      'payment_pending': 'phase3',
      // Phase 4: Confirmation
      'confirmed': 'phase4',
      'awaiting_start': 'phase4',
      // Phase 5: Formation
      'in_progress': 'phase5',
      'attendance_issues': 'phase5',
      'suspended': 'phase5',
      // Phase 6: Finalisation
      'completed': 'phase6',
      'failed': 'phase6',
      'cancelled': 'phase6',
      'refunded': 'phase6',
      'user_archived': 'phase6'
    };
    return phaseMap[reservationStatus] || 'phase1';
  };

  useEffect(() => {
    // Apply filters when status filter or search query changes
    let filtered = formations;
    
    // Apply status filter based on reservation phase
    if (statusFilter !== 'all') {
      filtered = filtered.filter(formation => {
        if (!formation.nextSession) return false;
        const phase = getPhaseFromReservationStatus(formation.nextSession.reservationStatus);
        return phase === statusFilter;
      });
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(formation => 
        formation.title.toLowerCase().includes(query) || 
        (formation.description && formation.description.toLowerCase().includes(query))
      );
    }
    
    setFilteredFormations(filtered);
  }, [statusFilter, searchQuery, formations]);


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
                <option value="all">Toutes les phases</option>
                <option value="phase1">📝 Demande initiale</option>
                <option value="phase2">📋 Vérifications</option>
                <option value="phase3">💳 Financement</option>
                <option value="phase4">✅ Confirmation</option>
                <option value="phase5">🎓 Formation</option>
                <option value="phase6">🏁 Finalisation</option>
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
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{formation.title}</h2>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{getFormationType(formation.type)}</p>
                  
                  {/* Status progress component remplace l'ancienne barre de progression */}
                  {formation.nextSession && (
                    <div className="mb-4">
                      <ReservationStatusProgress 
                        reservationStatus={formation.nextSession.reservationStatus}
                        sessionStartDate={formation.nextSession.sessionStartDateTime}
                        showNextSteps={false}
                        compact={true}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <span>Sessions: {formation.completedSessions}/{formation.sessionsCount}</span>
                    </div>
                    {formation.duration && (
                      <div className="flex items-center text-gray-600">
                        <span>Durée: {formation.duration}h</span>
                      </div>
                    )}
                    {formation.nextSession && (
                      <div className="flex items-center text-gray-600">
                        <span>Prochaine session: {formation.nextSession.startDate}</span>
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
