import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText, Download, Building2, CheckCircle, XCircle, Clock, User, Briefcase, GraduationCap, ChevronDown, Edit, Save, Upload, Trash2, Plus } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminUsersApi, adminReservationsApi, adminDirectDocumentsApi, documentsApi, adminFormationsApi, adminSessionsApi } from '@/services/api.ts';
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

const SessionReservationDetail: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
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

    // États pour la gestion des statuts
    const [showStatusDropdown, setShowStatusDropdown] = useState<Record<number, boolean>>({});
    const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false);
    const [pendingStatusChange, setPendingStatusChange] = useState<{
        reservationId: number;
        newStatus: string;
        currentStatus: string;
        studentName: string;
    } | null>(null);
    const [customMessage, setCustomMessage] = useState('');
    const [statusProcessing, setStatusProcessing] = useState(false);

    // États pour les modes d'édition
    const [editModes, setEditModes] = useState({
        info: false,
        company: false,
        documents: false
    });
    
    const [editedStudent, setEditedStudent] = useState<User | null>(null);
    const [editedCompany, setEditedCompany] = useState<any>(null);
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
    const [saving, setSaving] = useState(false);
    
    // États pour l'upload de documents
    const [showDocumentUpload, setShowDocumentUpload] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [documentTitle, setDocumentTitle] = useState('');
    const [uploading, setUploading] = useState(false);

    // Charger les données de l'étudiant
    useEffect(() => {
        if (userId) {
            loadStudent();
        }
    }, [userId]);

    const loadStudent = async () => {
        try {
            setLoading(true);
            const response = await adminUsersApi.get(parseInt(userId!));
            setStudent(response.data);
            loadStudentData(response.data);
            
            // Initialiser les données d'édition
            setEditedStudent({...response.data});
            setEditedCompany(response.data.company ? {...response.data.company} : {
                name: '',
                address: '',
                postalCode: '',
                city: '',
                siret: '',
                responsableName: '',
                email: '',
                phone: ''
            });
        } catch (err) {
            console.error('Error loading student:', err);
            setError('Erreur lors du chargement des données de l\'étudiant');
        } finally {
            setLoading(false);
        }
    };

    const loadStudentData = async (studentData: User) => {
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

    // Fonctions pour la gestion des statuts (réutilisées du StudentDetailModal)
    const toggleStatusDropdown = (reservationId: number) => {
        setShowStatusDropdown(prev => ({
            ...prev,
            [reservationId]: !prev[reservationId]
        }));
    };

    const getStatusOptions = () => {
        const formationStatuses = [
            'submitted', 'under_review', 'awaiting_documents', 'documents_pending', 
            'documents_rejected', 'awaiting_prerequisites', 'awaiting_funding', 
            'funding_approved', 'awaiting_payment', 'payment_pending', 'confirmed', 
            'awaiting_start', 'in_progress', 'attendance_issues', 'suspended', 
            'completed', 'failed', 'cancelled', 'refunded'
        ];

        return formationStatuses.map(status => ({
            value: status,
            label: getStatusLabel(status, 'formation')
        }));
    };

    const handleStatusChangeRequest = (reservationId: number, newStatus: string) => {
        const reservation = userReservations.find(r => r.id === reservationId);
        if (!reservation) return;

        setPendingStatusChange({
            reservationId,
            newStatus,
            currentStatus: reservation.status,
            studentName: `${reservation.user.firstName} ${reservation.user.lastName}`
        });
        
        setShowStatusDropdown(prev => ({ ...prev, [reservationId]: false }));
        setShowStatusConfirmModal(true);
    };

    const confirmStatusChange = async () => {
        if (!pendingStatusChange) return;

        try {
            setStatusProcessing(true);
            const { reservationId, newStatus } = pendingStatusChange;
            
            await adminReservationsApi.updateSessionReservationStatus(reservationId, newStatus, customMessage || undefined);
            
            setUserReservations(userReservations.map(r =>
                r.id === reservationId ? { ...r, status: newStatus } : r
            ));

            addToast(`Statut mis à jour vers: ${getStatusLabel(newStatus, 'formation')}`, 'success');
            
            setShowStatusConfirmModal(false);
            setPendingStatusChange(null);
            setCustomMessage('');
        } catch (err) {
            console.error('Error updating status:', err);
            addToast('Erreur lors de la mise à jour du statut', 'error');
        } finally {
            setStatusProcessing(false);
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

    if (loading) {
        return (
            <AdminLayout title="Chargement...">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
                </div>
            </AdminLayout>
        );
    }

    if (error || !student) {
        return (
            <AdminLayout title="Erreur">
                <div className="text-center py-12">
                    <p className="text-red-600 mb-4">{error || 'Étudiant non trouvé'}</p>
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        <ArrowLeft className="inline h-4 w-4 mr-2" />
                        Retour au tableau de bord
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout 
            title={`${student.firstName} ${student.lastName}`}
            breadcrumbItems={[
                { label: 'Admin', path: '/admin' },
                { label: 'Tableau de bord', path: '/admin/dashboard' },
                { label: 'Réservation de session' }
            ]}
        >
            {/* Header avec bouton retour */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour au tableau de bord
                </button>
            </div>

            {/* Contenu principal */}
            <div className="bg-white rounded-lg shadow">
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
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    Informations personnelles
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                    <p className="text-sm text-gray-900">{student.firstName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                    <p className="text-sm text-gray-900">{student.lastName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <p className="text-sm text-gray-900">{student.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                    <p className="text-sm text-gray-900">{student.phone || 'Non renseigné'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        student.role === 'ROLE_ADMIN' ? 'bg-red-100 text-red-800' :
                                        student.role === 'ROLE_INSTRUCTOR' ? 'bg-blue-100 text-blue-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                        {student.role === 'ROLE_ADMIN' ? 'Admin' :
                                         student.role === 'ROLE_INSTRUCTOR' ? 'Instructeur' : 'Étudiant'}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {student.isActive ? 'Actif' : 'Inactif'}
                                    </span>
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

                            {student.company ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
                                        <p className="text-sm text-gray-900">{student.company.name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">SIRET</label>
                                        <p className="text-sm text-gray-900">{student.company.siret}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                                        <p className="text-sm text-gray-900">{student.company.address}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                                        <p className="text-sm text-gray-900">{student.company.postalCode}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                                        <p className="text-sm text-gray-900">{student.company.city}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                                        <p className="text-sm text-gray-900">{student.company.responsableName}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <p className="text-sm text-gray-900">{student.company.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                        <p className="text-sm text-gray-900">{student.company.phone}</p>
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
                                                        <div className="relative">
                                                            <button
                                                                onClick={() => toggleStatusDropdown(reservation.id)}
                                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 ${getStatusBadgeClass(reservation.status)}`}
                                                            >
                                                                {getStatusLabel(reservation.status, 'formation')}
                                                                <ChevronDown className="ml-1 h-3 w-3" />
                                                            </button>
                                                            
                                                            {showStatusDropdown[reservation.id] && (
                                                                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg min-w-64 max-h-80 overflow-y-auto z-50">
                                                                    <div className="p-2">
                                                                        <div className="text-xs text-gray-500 p-2 border-b mb-2">
                                                                            Changer le statut
                                                                        </div>
                                                                        <div className="grid grid-cols-1 gap-1">
                                                                            {getStatusOptions().map((status) => (
                                                                                <button
                                                                                    key={status.value}
                                                                                    onClick={() => handleStatusChangeRequest(reservation.id, status.value)}
                                                                                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors ${
                                                                                        reservation.status === status.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                                                                    }`}
                                                                                    disabled={reservation.status === status.value}
                                                                                >
                                                                                    <div className="flex items-center space-x-2">
                                                                                        <span className={`inline-block w-3 h-3 rounded-full ${getStatusBadgeClass(status.value).split(' ')[0]}`}></span>
                                                                                        <span>{status.label}</span>
                                                                                        {reservation.status === status.value && (
                                                                                            <span className="text-xs">(actuel)</span>
                                                                                        )}
                                                                                    </div>
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
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
            </div>

            {/* Modal de confirmation de changement de statut */}
            {showStatusConfirmModal && pendingStatusChange && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 xl:w-2/5 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Confirmation de changement de statut
                                </h3>
                            </div>

                            <div className="mb-6 space-y-4">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h4 className="text-sm font-medium text-yellow-800">
                                                Attention : Un email sera automatiquement envoyé
                                            </h4>
                                            <p className="mt-1 text-sm text-yellow-700">
                                                Cette action déclenchera l'envoi d'un email automatique à l'étudiant.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Étudiant concerné :</label>
                                        <p className="text-base font-semibold text-gray-900">{pendingStatusChange.studentName}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Statut actuel :</label>
                                            <div className="mt-1">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(pendingStatusChange.currentStatus)}`}>
                                                    {getStatusLabel(pendingStatusChange.currentStatus, 'formation')}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Nouveau statut :</label>
                                            <div className="mt-1">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(pendingStatusChange.newStatus)}`}>
                                                    {getStatusLabel(pendingStatusChange.newStatus, 'formation')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Message personnalisé (optionnel) :</label>
                                        <div className="mt-1">
                                            <textarea
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Ajoutez un message personnalisé qui sera inclus dans l'email..."
                                                value={customMessage}
                                                onChange={(e) => setCustomMessage(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowStatusConfirmModal(false);
                                        setPendingStatusChange(null);
                                        setCustomMessage('');
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmStatusChange}
                                    disabled={statusProcessing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {statusProcessing ? 'Traitement...' : 'Confirmer et envoyer l\'email'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default SessionReservationDetail;