import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, CheckCircle, ChevronDown, BookOpen } from 'lucide-react';
import StudentHeader from '../../components/student/StudentHeader';
import { studentFormationsApi } from '@/services/api.ts';

interface FormationDetail {
  id: number;
  title: string;
  description: string;
  type: string;
  duration?: number;
  progress: number;
  prerequisites: Prerequisite[];
  modules: Module[];
  documents: DocumentItem[];
  sessions: SessionItem[];
  totalSessions: number;
  completedSessions: number;
}

interface Module {
  id: number;
  title: string;
  duration?: number;
  position?: number;
  points: ModulePoint[];
}

interface ModulePoint {
  id: number;
  content: string;
}

interface Prerequisite {
  id: number;
  content: string;
}

interface DocumentItem {
  id: number;
  title: string;
  type: string;
  fileName: string;
  updatedAt: string | null;
  downloadUrl: string;
}

interface SessionItem {
  id: number;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
  reservationStatus: string;
  instructors: string[];
}

// @ts-ignore
const FormationDetailStudent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [formation, setFormation] = useState<FormationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  useEffect(() => {
    const fetchFormationDetail = async () => {
      try {
        setLoading(true);

        // Remplaçons le mock par l'appel API réel
        const response = await studentFormationsApi.getById(parseInt(id || '0'));
        // L'API renvoie {success: true, data: {...}}
        const formationData = response.data?.data || response.data;
        setFormation(formationData);
        setLoading(false);

      } catch (err) {
        console.error('Error fetching formation details:', err);
        setError('Erreur lors du chargement des détails de la formation');
        setLoading(false);
      }
    };

    if (id) {
      fetchFormationDetail();
    }
  }, [id]);

  const toggleModule = (moduleId: number) => {
    if (expandedModule === moduleId) {
      setExpandedModule(null);
    } else {
      setExpandedModule(moduleId);
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'completed': return 'Complété';
      case 'in_progress': return 'En cours';
      case 'pending': return 'À venir';
      default: return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
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

  if (error || !formation) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <StudentHeader />
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-6">
          <p>{error || "Formation non trouvée"}</p>
        </div>
        <div className="mt-4">
          <Link to="/student/formations" className="inline-flex items-center text-blue-700 hover:text-blue-900">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour aux formations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/student/formations" className="inline-flex items-center text-blue-700 hover:text-blue-900">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour aux formations
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-blue-700 px-6 py-4 text-white">
            <h1 className="text-2xl font-bold">{formation.title}</h1>
            <div className="text-blue-100 mt-1">{getFormationType(formation.type)}</div>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="mb-4">
                  <h2 className="text-gray-500 text-sm font-medium mb-1">Progression</h2>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-blue-700 h-4 rounded-full flex items-center justify-center text-xs text-white font-medium" 
                      style={{ width: `${formation.progress}%` }}
                    >
                      {formation.progress}%
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-700 mr-2" />
                    <div>
                      <div className="text-sm text-gray-500">Période de formation</div>
                      <div>Durée: {formation.duration ? formation.duration + 'h' : 'Non définie'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-blue-700 mr-2" />
                    <div>
                      <div className="text-sm text-gray-500">Progression</div>
                      <div>Sessions: {formation.completedSessions}/{formation.totalSessions}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-gray-700">{formation.description}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {/* Section Prérequis */}
            {formation.prerequisites && formation.prerequisites.length > 0 && (
              <div className="bg-white rounded-lg shadow mb-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">Prérequis</h2>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {formation.prerequisites.map((prerequisite) => (
                      <li key={prerequisite.id} className="flex items-start">
                        <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-gray-700">{prerequisite.content}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Modules de formation</h2>
              </div>
              
              <div className="p-6">
                {formation.modules && formation.modules.length > 0 ? (
                  <div className="space-y-4">
                    {formation.modules.map(module => (
                      <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div 
                          className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                          onClick={() => toggleModule(module.id)}
                        >
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full flex items-center justify-center mr-4 bg-blue-100">
                              <BookOpen className="h-6 w-6 text-blue-700" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{module.title}</div>
                              <div className="text-sm text-gray-500">
                                {module.duration ? `Durée: ${module.duration}h` : 'Module de formation'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full mr-3 bg-blue-100 text-blue-800">
                              Module
                            </span>
                            <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                              expandedModule === module.id ? 'transform rotate-180' : ''
                            }`} />
                          </div>
                        </div>
                        
                        {expandedModule === module.id && (
                          <div className="p-4 border-t border-gray-200 bg-gray-50">
                            <p className="text-gray-700 mb-4">
                              Durée: {module.duration ? module.duration + 'h' : 'Non définie'} 
                              {module.position && ` • Position: ${module.position}`}
                            </p>
                            {module.points && module.points.length > 0 && (
                              <div className="mt-4">
                                <h4 className="font-medium text-gray-900 mb-2">Points du module :</h4>
                                <ul className="space-y-2">
                                  {module.points.map((point) => (
                                    <li key={point.id} className="flex items-start">
                                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                      <span className="text-gray-700">{point.content}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Aucun module disponible pour cette formation
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Prochaines sessions</h2>
              </div>
              
              <div className="p-6">
                {formation.sessions && formation.sessions.length > 0 ? (
                  <div className="space-y-4">
                    {formation.sessions.map(session => (
                      <div key={session.id} className="flex items-start p-4 border border-gray-200 rounded-lg">
                        <div className="bg-blue-100 p-3 rounded-lg mr-4">
                          <Calendar className="h-5 w-5 text-blue-700" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Session de formation</div>
                          <div className="text-sm text-gray-600 mt-1">
                            Du {session.startDate} au {session.endDate}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Lieu: {session.location || 'Non défini'}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Statut: {session.reservationStatus}
                          </div>
                          {session.instructors && session.instructors.length > 0 && (
                            <div className="text-sm text-gray-500 mt-1">
                              Instructeurs: {session.instructors.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Aucune session programmée
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>)}
          {/*<div>*/}
          {/*  <div className="bg-white rounded-lg shadow">*/}
          {/*    <div className="px-6 py-4 border-b border-gray-200">*/}
          {/*      <h2 className="text-xl font-bold text-gray-800">Documents</h2>*/}
          {/*    </div>*/}
          {/*    */}
          {/*    <div className="p-6">*/}
          {/*      {formation.documents && formation.documents.length > 0 ? (*/}
          {/*        <div className="space-y-4">*/}
          {/*          {formation.documents.map(document => (*/}
          {/*            <div key={document.id} className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-blue-400 transition-colors">*/}
          {/*              <div className="bg-blue-100 p-3 rounded-lg mr<response clipped><NOTE>To save on context only part of this file has been shown to you. You should retry this tool after you have searched inside the file with `grep -n` in order to find the line numbers of what you are looking for.</NOTE>*/}
export default FormationDetailStudent;