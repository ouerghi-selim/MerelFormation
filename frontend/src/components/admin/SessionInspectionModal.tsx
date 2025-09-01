import React, { useState, useEffect } from 'react';
import { X, Calendar, FileText, Download, Building2, User, Briefcase, GraduationCap } from 'lucide-react';
import { adminUsersApi, adminReservationsApi } from '@/services/api.ts';
import { getStatusBadgeClass, getStatusLabel } from '@/utils/reservationStatuses';
import { useNotification } from '../../contexts/NotificationContext';

interface SessionReservation {
    id: number;
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    session: {
        id: number;
        startDate: string;
        formation: {
            id: number;
            title: string;
        }
    };
    status: string;
    createdAt: string;
}

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive: boolean;
    lastLogin: string | null;
    phone?: string;
    birthDate?: string;
    birthPlace?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    specialization?: string;
    createdAt?: string;
    company?: {
        id: number;
        name: string;
        address: string;
        postalCode: string;
        city: string;
        siret: string;
        responsableName: string;
        email: string;
        phone: string;
    };
}

interface Formation {
    id: number;
    title: string;
    type: string;
    status: string;
    startDate?: string;
    endDate?: string;
}

interface Document {
    id: number;
    title: string;
    type: string;
    source: string;
    sourceTitle: string;
    sourceId: number | null;
    date: string;
    uploadedAt: string;
    fileName: string;
    fileSize?: string;
    fileType?: string;
    downloadUrl: string;
    senderRole?: string;
    validationStatus?: string;
    validatedAt?: string;
    validatedBy?: {
        firstName: string;
        lastName: string;
    };
    rejectionReason?: string;
}

interface SessionInspectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
}

const SessionInspectionModal: React.FC<SessionInspectionModalProps> = ({ isOpen, onClose, userId }) => {
    const { addToast } = useNotification();
    
    // États pour les données
    const [student, setStudent] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'company' | 'reservations' | 'documents'>('reservations');
    
    // États pour les données de l'étudiant
    const [userFormations, setUserFormations] = useState<Formation[]>([]);
    const [loadingFormations, setLoadingFormations] = useState(false);
    const [userDocuments, setUserDocuments] = useState<Document[]>([]);
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    const [userReservations, setUserReservations] = useState<SessionReservation[]>([]);
    const [loadingReservations, setLoadingReservations] = useState(false);
    const [fullUserInfo, setFullUserInfo] = useState<any>(null);
    const [loadingUserInfo, setLoadingUserInfo] = useState(false);

    // Charger les données de l'étudiant
    useEffect(() => {
        if (isOpen && userId) {
            loadStudent();
        }
    }, [isOpen, userId]);

    const loadStudent = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminUsersApi.get(userId);
            setStudent(response.data);
            await loadStudentData(response.data);
        } catch (err) {
            console.error('Error loading student:', err);
            setError('Erreur lors du chargement des données de l\'étudiant');
        } finally {
            setLoading(false);
        }
    };

    const fetchFullUserInfo = async (userId: number) => {
        try {
            setLoadingUserInfo(true);
            const userResponse = await adminUsersApi.get(userId);
            let userData = userResponse.data;
            
            // Récupérer séparément les données d'entreprise
            try {
                const companyResponse = await adminUsersApi.getCompany(userId);
                userData.company = companyResponse.data;
            } catch (companyErr) {
                console.log('No company found for user:', userId);
                // Pas d'erreur si pas d'entreprise trouvée
            }
            
            setFullUserInfo(userData);
        } catch (err) {
            console.error('Error fetching full user info:', err);
        } finally {
            setLoadingUserInfo(false);
        }
    };

    const loadStudentData = async (studentData: User) => {
        // Charger les informations complètes de l'utilisateur
        await fetchFullUserInfo(studentData.id);
        
        await Promise.all([
            loadFormations(studentData.id),
            loadDocuments(studentData.id),
            loadReservations(studentData.id)
        ]);
    };

    const loadFormations = async (studentId: number) => {
        try {
            setLoadingFormations(true);
            const response = await adminUsersApi.getFormations(studentId);
            setUserFormations(response.data || []);
        } catch (err) {
            console.error('Error loading formations:', err);
        } finally {
            setLoadingFormations(false);
        }
    };

    const loadDocuments = async (studentId: number) => {
        try {
            setLoadingDocuments(true);
            const response = await adminUsersApi.getDocuments(studentId);
            setUserDocuments(response.data || []);
        } catch (err) {
            console.error('Error loading documents:', err);
        } finally {
            setLoadingDocuments(false);
        }
    };

    const loadReservations = async (studentId: number) => {
        try {
            setLoadingReservations(true);
            const response = await adminReservationsApi.getSessionReservations(`userId=${studentId}`);
            setUserReservations(response.data || []);
        } catch (err) {
            console.error('Error loading reservations:', err);
        } finally {
            setLoadingReservations(false);
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-8 mx-auto border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {student ? `${student.firstName} ${student.lastName}` : 'Chargement...'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-screen-75 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
                        </div>
                    ) : error || !student ? (
                        <div className="text-center py-12">
                            <p className="text-red-600 mb-4">{error || 'Étudiant non trouvé'}</p>
                        </div>
                    ) : (
                        <>
                            {/* Tabs */}
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex space-x-8 px-6">
                                    {[
                                        { key: 'info', label: 'Informations', icon: <User className="h-4 w-4" /> },
                                        { key: 'company', label: 'Entreprise', icon: <Building2 className="h-4 w-4" /> },
                                        { key: 'reservations', label: 'Réservations', icon: <GraduationCap className="h-4 w-4" /> },
                                        { key: 'documents', label: 'Documents', icon: <FileText className="h-4 w-4" /> }
                                    ].map((tab) => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key as any)}
                                            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                                                activeTab === tab.key
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            {tab.icon}
                                            <span>{tab.label}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                {/* Onglet Informations */}
                                {activeTab === 'info' && (
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                            <User className="h-5 w-5 mr-2" />
                                            Informations personnelles
                                        </h3>

                                        {/* Format organisé avec tous les champs */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h5 className="font-medium text-gray-900 mb-3">Informations personnelles</h5>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Nom complet</label>
                                                        <p className="text-sm text-gray-900">
                                                            {fullUserInfo?.firstName || student.firstName} {fullUserInfo?.lastName || student.lastName}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Email</label>
                                                        <p className="text-sm text-gray-900">{fullUserInfo?.email || student.email}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Téléphone</label>
                                                        <p className="text-sm text-gray-900">{fullUserInfo?.phone || student.phone || 'Non renseigné'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Date de naissance</label>
                                                        <p className="text-sm text-gray-900">
                                                            {fullUserInfo?.birthDate ? new Date(fullUserInfo.birthDate).toLocaleDateString('fr-FR') : 'Non renseigné'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Lieu de naissance</label>
                                                        <p className="text-sm text-gray-900">{fullUserInfo?.birthPlace || 'Non renseigné'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h5 className="font-medium text-gray-900 mb-3">Adresse</h5>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Adresse</label>
                                                        <p className="text-sm text-gray-900">{fullUserInfo?.address || 'Non renseigné'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Code postal</label>
                                                        <p className="text-sm text-gray-900">{fullUserInfo?.postalCode || 'Non renseigné'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Ville</label>
                                                        <p className="text-sm text-gray-900">{fullUserInfo?.city || 'Non renseigné'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h5 className="font-medium text-gray-900 mb-3">Informations du compte</h5>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Rôle</label>
                                                        <p className="text-sm text-gray-900">
                                                            {fullUserInfo?.role === 'ROLE_ADMIN' ? 'Administrateur' : 
                                                             fullUserInfo?.role === 'ROLE_INSTRUCTOR' ? 'Instructeur' : 'Étudiant'}
                                                        </p>
                                                    </div>
                                                    {fullUserInfo?.specialization && (
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-500">Spécialisation</label>
                                                            <p className="text-sm text-gray-900">{fullUserInfo.specialization}</p>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Date d'inscription</label>
                                                        <p className="text-sm text-gray-900">
                                                            {fullUserInfo?.createdAt || 'Non disponible'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h5 className="font-medium text-gray-900 mb-3">Statut du compte</h5>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Statut</label>
                                                        <div className="mt-1">
                                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                (fullUserInfo?.isActive ?? student.isActive) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {(fullUserInfo?.isActive ?? student.isActive) ? 'Actif' : 'Inactif'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Dernière connexion</label>
                                                        <p className="text-sm text-gray-900">{fullUserInfo?.lastLogin || 'Jamais connecté'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Onglet Entreprise */}
                                {activeTab === 'company' && (
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                            <Building2 className="h-5 w-5 mr-2" />
                                            Informations entreprise
                                        </h3>

                                        {(fullUserInfo?.company || student.company) ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
                                                    <p className="text-sm text-gray-900">{fullUserInfo?.company?.name || student.company?.name}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">SIRET</label>
                                                    <p className="text-sm text-gray-900">{fullUserInfo?.company?.siret || student.company?.siret}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                                                    <p className="text-sm text-gray-900">{fullUserInfo?.company?.address || student.company?.address}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                                                    <p className="text-sm text-gray-900">{fullUserInfo?.company?.postalCode || student.company?.postalCode}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                                                    <p className="text-sm text-gray-900">{fullUserInfo?.company?.city || student.company?.city}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                                                    <p className="text-sm text-gray-900">{fullUserInfo?.company?.responsableName || student.company?.responsableName}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                    <p className="text-sm text-gray-900">{fullUserInfo?.company?.email || student.company?.email}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                                    <p className="text-sm text-gray-900">{fullUserInfo?.company?.phone || student.company?.phone}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-center py-8">Aucune entreprise associée</p>
                                        )}
                                    </div>
                                )}

                                {/* Onglet Réservations */}
                                {activeTab === 'reservations' && (
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                            <GraduationCap className="h-5 w-5 mr-2" />
                                            Réservations de sessions
                                        </h3>

                                        {loadingReservations ? (
                                            <div className="text-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900 mx-auto"></div>
                                            </div>
                                        ) : userReservations.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Formation</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date début</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Demande</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {userReservations.map((reservation) => (
                                                            <tr key={reservation.id}>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    {reservation.session.formation.title}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {formatDate(reservation.session.startDate)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {formatDate(reservation.createdAt)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(reservation.status)}`}>
                                                                        {getStatusLabel(reservation.status, 'formation')}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-center py-8">Aucune réservation trouvée</p>
                                        )}
                                    </div>
                                )}

                                {/* Onglet Documents */}
                                {activeTab === 'documents' && (
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                            <FileText className="h-5 w-5 mr-2" />
                                            Documents
                                        </h3>

                                        {loadingDocuments ? (
                                            <div className="text-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900 mx-auto"></div>
                                            </div>
                                        ) : userDocuments.length > 0 ? (
                                            <div className="space-y-3">
                                                {userDocuments.map((document) => (
                                                    <div key={document.id} className="border border-gray-200 rounded-lg p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h4 className="font-medium text-gray-900">{document.title}</h4>
                                                                <p className="text-sm text-gray-500">
                                                                    {document.source} - {document.sourceTitle}
                                                                </p>
                                                                <p className="text-xs text-gray-400">
                                                                    Téléversé le {formatDate(document.uploadedAt)}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {document.validationStatus && (
                                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                                        document.validationStatus === 'validated' 
                                                                            ? 'bg-green-100 text-green-800' 
                                                                            : document.validationStatus === 'rejected'
                                                                            ? 'bg-red-100 text-red-800'
                                                                            : 'bg-yellow-100 text-yellow-800'
                                                                    }`}>
                                                                        {document.validationStatus === 'validated' ? 'Validé' :
                                                                         document.validationStatus === 'rejected' ? 'Rejeté' : 'En attente'}
                                                                    </span>
                                                                )}
                                                                <a
                                                                    href={document.downloadUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:text-blue-800"
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-center py-8">Aucun document trouvé</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionInspectionModal;