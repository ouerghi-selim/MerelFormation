import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {BookOpen, FileText, Bell, Calendar, CreditCard, Download, Building2, User} from 'lucide-react';
import StudentLayout from '../../components/layout/StudentLayout';
import { studentDashboardApi, studentDocumentsApi } from '@/services/api.ts';

interface Company {
  id: number;
  name: string;
  address: string;
  postalCode: string;
  city: string;
  siret: string;
  responsableName: string;
  email: string;
  phone: string;
}

interface DashboardData {
  activeFormations: number;
  documentsCount: number;
  pendingPayments: number;
  upcomingSessions: Session[];
  recentDocuments: Document[];
  user: {
    firstName: string;
    lastName: string;
    email: string;
    company?: Company;
  };
}

interface Session {
  id: number;
  formationTitle: string;
  date: string;
  time: string;
  location: string;
}

interface Document {
  body: any;
  fileName: string;
  id: number;
  title: string;
  type: string;
  date: string;
  downloadUrl: string;

}

const handleDownload = async (doc: Document) => {
  try {
    const response = await studentDocumentsApi.download(doc.id);

    // Créer un blob et déclencher le téléchargement
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.title || doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erreur de téléchargement:', error);
    // Afficher un message d'erreur à l'utilisateur
  }
};

const DashboardStudent: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch user profile and dashboard data
        const [profileResponse, dashboardResponse] = await Promise.all([
          studentDashboardApi.getProfile(),
          studentDashboardApi.getIndex()
        ]);

        setUserName(`${profileResponse.data.firstName} ${profileResponse.data.lastName}`);
        setDashboardData(dashboardResponse.data);
        setLoading(false);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Erreur lors du chargement des données');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-6">
          <p>{error}</p>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title={`Bienvenue, ${userName}`}>
        <div className="text-center mb-12">
          <p className="text-gray-600 mt-2">
            Votre espace de formation personnel
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link to="/student/formations" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-700" />
              </div>
              <span className="text-2xl font-bold text-blue-700">{dashboardData?.activeFormations || 0}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Mes formations</h3>
            <p className="text-gray-600 text-sm mt-1">
              {dashboardData?.activeFormations === 1 
                ? '1 formation en cours' 
                : `${dashboardData?.activeFormations || 0} formations en cours`}
            </p>
          </Link>
          
          <Link to="/student/documents" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-green-700" />
              </div>
              <span className="text-2xl font-bold text-green-700">{dashboardData?.documentsCount || 0}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Documents</h3>
            <p className="text-gray-600 text-sm mt-1">
              {dashboardData?.documentsCount === 1 
                ? '1 document disponible' 
                : `${dashboardData?.documentsCount || 0} documents disponibles`}
            </p>
          </Link>
          
          <Link to="/student/notifications" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Bell className="h-6 w-6 text-yellow-700" />
              </div>
              <span className="text-2xl font-bold text-yellow-700">0</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            <p className="text-gray-600 text-sm mt-1">
              Aucune notification non lue
            </p>
          </Link>
          
          <Link to="/student/payments" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-red-700" />
              </div>
              <span className="text-2xl font-bold text-red-700">{dashboardData?.pendingPayments || 0}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Paiements</h3>
            <p className="text-gray-600 text-sm mt-1">
              {dashboardData?.pendingPayments === 1 
                ? '1 paiement en attente' 
                : `${dashboardData?.pendingPayments || 0} paiements en attente`}
            </p>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Prochaines sessions</h2>
              <Link to="/student/formations" className="text-blue-700 hover:text-blue-900 text-sm font-medium">
                Voir tout
              </Link>
            </div>
            
            {dashboardData?.upcomingSessions && dashboardData.upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-blue-400 transition-colors">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <Calendar className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{session.formationTitle}</h3>
                      <p className="text-gray-600 text-sm mt-1">{session.date} à {session.time}</p>
                      <p className="text-gray-500 text-sm mt-1">Lieu: {session.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucune session programmée
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Documents récents</h2>
              <Link to="/student/documents" className="text-blue-700 hover:text-blue-900 text-sm font-medium">
                Voir tout
              </Link>
            </div>
            
            {dashboardData?.recentDocuments && dashboardData.recentDocuments.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentDocuments.map((document) => (
                    <div key={document.id}
                         className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-green-400 transition-colors">
                      <div className="bg-green-100 p-3 rounded-full mr-4">
                        <FileText className="h-5 w-5 text-green-700"/>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{document.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">Type: {document.type}</p>
                        <p className="text-gray-500 text-sm mt-1">Ajouté le {document.date}</p>
                      </div>
                      <button
                          onClick={() => handleDownload(document)}
                          className="inline-flex items-center px-3 py-1 border border-blue-700 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-700 hover:text-white transition-colors"
                      >
                        <Download className="h-4 w-4 mr-1"/>
                        Télécharger
                      </button>
                    </div>
                ))}
              </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucun document récent
                </div>
            )}
          </div>
        </div>

        {/* Section Entreprise */}
        {dashboardData?.user?.company && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Building2 className="h-6 w-6 mr-2 text-blue-600" />
              Mon entreprise
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Informations générales</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Nom de l'entreprise</span>
                    <p className="text-base font-medium text-gray-900">{dashboardData.user.company.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">SIRET</span>
                    <p className="text-base font-mono text-gray-900">{dashboardData.user.company.siret}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Adresse</span>
                    <p className="text-base text-gray-900">
                      {dashboardData.user.company.address}<br />
                      {dashboardData.user.company.postalCode} {dashboardData.user.company.city}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Contact responsable</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Nom du responsable</span>
                    <p className="text-base text-gray-900">{dashboardData.user.company.responsableName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email</span>
                    <p className="text-base text-gray-900">{dashboardData.user.company.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Téléphone</span>
                    <p className="text-base text-gray-900">{dashboardData.user.company.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

    </StudentLayout>
  );
};

export default DashboardStudent;
