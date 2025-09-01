import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, X, FileText, Download, Building2, CheckCircle, XCircle, Clock, User, Briefcase, GraduationCap, ChevronDown, Edit, Save, Upload, Trash2, Plus } from 'lucide-react';
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
    birthDate?: string;
    birthPlace?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    country?: string;
    specialization?: string;
    createdAt?: string;
    driverLicenseNumber?: string;
    driverLicenseValidUntil?: string;
    driverLicenseFrontFile?: string;
    driverLicenseBackFile?: string;
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

const SessionReservationEdit: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { addToast } = useNotification();
    
    // États pour les données
    const [student, setStudent] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'company' | 'reservations' | 'documents'>('reservations');
    
    // États pour les données de l'étudiant (copiés du StudentDetailModal)
    const [userFormations, setUserFormations] = useState<Formation[]>([]);
    const [loadingFormations, setLoadingFormations] = useState(false);
    const [userDocuments, setUserDocuments] = useState<Document[]>([]);
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    const [userReservations, setUserReservations] = useState<SessionReservation[]>([]);
    const [loadingReservations, setLoadingReservations] = useState(false);
    const [fullUserInfo, setFullUserInfo] = useState<any>(null);
    const [loadingUserInfo, setLoadingUserInfo] = useState(false);

    // États pour la gestion des statuts de réservations
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
    
    // États pour les formulaires d'édition
    const [editedStudent, setEditedStudent] = useState<User | null>(null);
    const [editedCompany, setEditedCompany] = useState<any>(null);
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
    const [saving, setSaving] = useState(false);
    
    // États pour l'upload de documents
    const [showDocumentUpload, setShowDocumentUpload] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [documentTitle, setDocumentTitle] = useState('');
    const [uploading, setUploading] = useState(false);

    // États pour la validation des documents
    const [showDocumentValidationModal, setShowDocumentValidationModal] = useState(false);
    const [pendingDocumentValidation, setPendingDocumentValidation] = useState<{
        documentId: number;
        documentTitle: string;
        action: 'validate' | 'reject';
    } | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [validatingDocument, setValidatingDocument] = useState(false);

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
            let studentData = response.data;
            
            // Récupérer séparément les données d'entreprise
            try {
                const companyResponse = await adminUsersApi.getCompany(parseInt(userId!));
                studentData.company = companyResponse.data;
            } catch (companyErr) {
                console.log('No company found for student:', userId);
                // Pas d'erreur si pas d'entreprise trouvée
            }
            
            setStudent(studentData);
            loadStudentData(studentData);
            
            // Initialiser les données d'édition
            setEditedStudent({...studentData});
            setEditedCompany(studentData.company ? {...studentData.company} : {
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
            loadReservations(studentData.id),
            loadFullUserInfo(studentData.id)
        ]);
    };

    const loadFullUserInfo = async (studentId: number) => {
        try {
            setLoadingUserInfo(true);
            const userResponse = await adminUsersApi.get(studentId);
            let userData = userResponse.data;
            
            // Récupérer séparément les données d'entreprise
            try {
                const companyResponse = await adminUsersApi.getCompany(studentId);
                userData.company = companyResponse.data;
            } catch (companyErr) {
                console.log('No company found for user:', studentId);
                // Pas d'erreur si pas d'entreprise trouvée
            }
            
            setFullUserInfo(userData);
        } catch (err) {
            console.error('Error loading full user info:', err);
        } finally {
            setLoadingUserInfo(false);
        }
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

    // Fonctions d'édition
    const toggleEditMode = (section: 'info' | 'company' | 'documents') => {
        const isEnteringEditMode = !editModes[section];
        
        setEditModes(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
        
        if (isEnteringEditMode) {
            // Si on active le mode édition et qu'on n'a pas encore les informations complètes
            if (section === 'info' && student && !fullUserInfo) {
                loadFullUserInfo(student.id);
            } else if (section === 'company' && student) {
                // Réinitialiser editedCompany avec les données actuelles de l'entreprise
                setEditedCompany(student.company ? {...student.company} : {
                    name: '',
                    address: '',
                    postalCode: '',
                    city: '',
                    siret: '',
                    responsableName: '',
                    email: '',
                    phone: ''
                });
            }
        }
        
        // Réinitialiser les erreurs
        setFormErrors({});
    };

    const handleSave = async (section: 'info' | 'company') => {
        if (!editedStudent) return;
        
        try {
            setSaving(true);
            setFormErrors({});
            
            if (section === 'info') {
                await adminUsersApi.update(editedStudent.id, {
                    firstName: editedStudent.firstName,
                    lastName: editedStudent.lastName,
                    email: editedStudent.email,
                    phone: editedStudent.phone,
                    birthDate: (editedStudent as any).birthDate,
                    address: (editedStudent as any).address,
                    postalCode: (editedStudent as any).postalCode,
                    city: (editedStudent as any).city,
                    country: (editedStudent as any).country,
                    driverLicenseNumber: (editedStudent as any).driverLicenseNumber,
                    driverLicenseValidUntil: (editedStudent as any).driverLicenseValidUntil,
                });
                
                // Mettre à jour l'état local
                setStudent(editedStudent);
                addToast('Informations personnelles mises à jour', 'success');
                
            } else if (section === 'company') {
                if (editedCompany && editedCompany.name) {
                    // Créer ou mettre à jour l'entreprise selon qu'elle existe déjà ou non
                    if (student.company) {
                        // Mettre à jour l'entreprise existante
                        const response = await adminUsersApi.updateCompany(editedStudent.id, editedCompany);
                        setStudent(prev => prev ? {...prev, company: response.data} : prev);
                    } else {
                        // Créer une nouvelle entreprise
                        const response = await adminUsersApi.createCompany(editedStudent.id, editedCompany);
                        setStudent(prev => prev ? {...prev, company: response.data} : prev);
                    }
                    
                    // Mettre à jour fullUserInfo avec les informations de l'entreprise
                    setFullUserInfo(prev => prev ? { ...prev, company: student.company } : null);
                    
                    addToast('Informations entreprise mises à jour', 'success');
                }
            }
            
            // Sortir du mode édition
            setEditModes(prev => ({ ...prev, [section]: false }));
            
        } catch (err: any) {
            console.error('Error saving:', err);
            addToast('Erreur lors de la sauvegarde', 'error');
            
            // Traiter les erreurs de validation
            if (err.response?.data?.violations) {
                const errors: {[key: string]: string} = {};
                err.response.data.violations.forEach((violation: any) => {
                    errors[violation.propertyPath] = violation.message;
                });
                setFormErrors(errors);
            }
        } finally {
            setSaving(false);
        }
    };

    // Fonctions pour la gestion des statuts (identiques au modal original)
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

    // Fonctions utilitaires
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const handleDocumentUpload = async () => {
        if (!uploadFile || !documentTitle || !student) return;

        try {
            setUploading(true);
            
            // Upload vers l'utilisateur spécifique
            const formData = new FormData();
            formData.append('file', uploadFile);
            formData.append('title', documentTitle);
            
            await adminDirectDocumentsApi.uploadToUser(student.id, formData);
            
            addToast('Document uploadé avec succès', 'success');
            
            // Recharger les documents
            await loadDocuments(student.id);
            
            // Réinitialiser le formulaire
            setUploadFile(null);
            setDocumentTitle('');
            setShowDocumentUpload(false);
            
        } catch (err) {
            console.error('Error uploading document:', err);
            addToast('Erreur lors de l\'upload du document', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDocumentValidation = async (documentId: number, action: 'validate' | 'reject', reason?: string) => {
        try {
            setValidatingDocument(true);
            
            if (action === 'validate') {
                await adminDirectDocumentsApi.validate(documentId);
                addToast('Document validé', 'success');
            } else {
                await adminDirectDocumentsApi.reject(documentId, reason || '');
                addToast('Document rejeté', 'success');
            }
            
            // Recharger les documents
            if (student) {
                await loadDocuments(student.id);
            }
            
        } catch (err) {
            console.error('Error validating document:', err);
            addToast('Erreur lors de la validation', 'error');
        } finally {
            setValidatingDocument(false);
        }
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
                        onClick={() => navigate('/admin/reservations/formations')}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        <ArrowLeft className="inline h-4 w-4 mr-2" />
                        Retour aux réservations
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout 
            title={`Modifier - ${student.firstName} ${student.lastName}`}
            breadcrumbItems={[
                { label: 'Admin', path: '/admin' },
                { label: 'Réservations', path: '/admin/reservations' },
                { label: 'Formations', path: '/admin/reservations/formations' },
                { label: 'Modifier réservation' }
            ]}
        >
            {/* Header avec bouton retour */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/admin/reservations/formations')}
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour aux réservations
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
                    {/* Onglet Informations avec mode édition */}
                    {activeTab === 'info' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    Informations personnelles
                                </h3>
                                <button
                                    onClick={() => editModes.info ? handleSave('info') : toggleEditMode('info')}
                                    disabled={saving}
                                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                                        editModes.info
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    } transition-colors`}
                                >
                                    {editModes.info ? (
                                        saving ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Sauvegarde...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Sauvegarder
                                            </>
                                        )
                                    ) : (
                                        <>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Modifier
                                        </>
                                    )}
                                </button>
                            </div>

                            {editModes.info && editedStudent ? (
                                /* Mode édition des informations */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                                        <input
                                            type="text"
                                            value={editedStudent.firstName || ''}
                                            onChange={(e) => setEditedStudent({...editedStudent, firstName: e.target.value})}
                                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
                                                formErrors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                            }`}
                                        />
                                        {formErrors.firstName && <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                                        <input
                                            type="text"
                                            value={editedStudent.lastName || ''}
                                            onChange={(e) => setEditedStudent({...editedStudent, lastName: e.target.value})}
                                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
                                                formErrors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                            }`}
                                        />
                                        {formErrors.lastName && <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                        <input
                                            type="email"
                                            value={editedStudent.email || ''}
                                            onChange={(e) => setEditedStudent({...editedStudent, email: e.target.value})}
                                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
                                                formErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                            }`}
                                        />
                                        {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                        <input
                                            type="tel"
                                            value={editedStudent.phone || ''}
                                            onChange={(e) => setEditedStudent({...editedStudent, phone: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                                        <input
                                            type="date"
                                            value={editedStudent.birthDate || ''}
                                            onChange={(e) => setEditedStudent({...editedStudent, birthDate: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de naissance</label>
                                        <input
                                            type="text"
                                            value={editedStudent.birthPlace || ''}
                                            onChange={(e) => setEditedStudent({...editedStudent, birthPlace: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                                        <input
                                            type="text"
                                            value={editedStudent.address || ''}
                                            onChange={(e) => setEditedStudent({...editedStudent, address: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                                        <input
                                            type="text"
                                            value={editedStudent.postalCode || ''}
                                            onChange={(e) => setEditedStudent({...editedStudent, postalCode: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                                        <input
                                            type="text"
                                            value={editedStudent.city || ''}
                                            onChange={(e) => setEditedStudent({...editedStudent, city: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Spécialisation pour les instructeurs */}
                                    {editedStudent.role === 'ROLE_INSTRUCTOR' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Spécialisation</label>
                                            <input
                                                type="text"
                                                value={editedStudent.specialization || ''}
                                                onChange={(e) => setEditedStudent({...editedStudent, specialization: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Mode lecture - Format inspiré de StudentDetailModal */
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
                            )}
                        </div>
                    )}

                    {/* Onglet Entreprise avec mode édition */}
                    {activeTab === 'company' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <Building2 className="h-5 w-5 mr-2" />
                                    Informations entreprise
                                </h3>
                                <button
                                    onClick={() => editModes.company ? handleSave('company') : toggleEditMode('company')}
                                    disabled={saving}
                                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                                        editModes.company
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    } transition-colors`}
                                >
                                    {editModes.company ? (
                                        saving ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Sauvegarde...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Sauvegarder
                                            </>
                                        )
                                    ) : (
                                        <>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Modifier
                                        </>
                                    )}
                                </button>
                            </div>

                            {editModes.company && editedCompany ? (
                                /* Mode édition entreprise */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise *</label>
                                        <input
                                            type="text"
                                            value={editedCompany.name || ''}
                                            onChange={(e) => setEditedCompany({...editedCompany, name: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">SIRET *</label>
                                        <input
                                            type="text"
                                            value={editedCompany.siret || ''}
                                            onChange={(e) => setEditedCompany({...editedCompany, siret: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                                        <input
                                            type="text"
                                            value={editedCompany.address || ''}
                                            onChange={(e) => setEditedCompany({...editedCompany, address: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                                        <input
                                            type="text"
                                            value={editedCompany.postalCode || ''}
                                            onChange={(e) => setEditedCompany({...editedCompany, postalCode: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                                        <input
                                            type="text"
                                            value={editedCompany.city || ''}
                                            onChange={(e) => setEditedCompany({...editedCompany, city: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                                        <input
                                            type="text"
                                            value={editedCompany.responsableName || ''}
                                            onChange={(e) => setEditedCompany({...editedCompany, responsableName: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={editedCompany.email || ''}
                                            onChange={(e) => setEditedCompany({...editedCompany, email: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                        <input
                                            type="tel"
                                            value={editedCompany.phone || ''}
                                            onChange={(e) => setEditedCompany({...editedCompany, phone: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            ) : (
                                /* Mode lecture entreprise */
                                student.company ? (
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
                                )
                            )}
                        </div>
                    )}

                    {/* Onglet Réservations avec gestion des statuts */}
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

                    {/* Onglet Documents avec upload et validation */}
                    {activeTab === 'documents' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <FileText className="h-5 w-5 mr-2" />
                                    Documents
                                </h3>
                                <button
                                    onClick={() => setShowDocumentUpload(true)}
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajouter un document
                                </button>
                            </div>

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
                                                    
                                                    {/* Boutons de validation pour les documents en attente */}
                                                    {document.validationStatus === 'pending' && (
                                                        <div className="flex items-center space-x-1">
                                                            <button
                                                                onClick={() => handleDocumentValidation(document.id, 'validate')}
                                                                className="text-green-600 hover:text-green-800 p-1"
                                                                title="Valider"
                                                                disabled={validatingDocument}
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setPendingDocumentValidation({
                                                                        documentId: document.id,
                                                                        documentTitle: document.title,
                                                                        action: 'reject'
                                                                    });
                                                                    setShowDocumentValidationModal(true);
                                                                }}
                                                                className="text-red-600 hover:text-red-800 p-1"
                                                                title="Rejeter"
                                                                disabled={validatingDocument}
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                    
                                                    <a
                                                        href={document.downloadUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 p-1"
                                                        title="Télécharger"
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

                            {/* Modal d'upload de document */}
                            {showDocumentUpload && (
                                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-medium text-gray-900">Ajouter un document</h3>
                                                <button
                                                    onClick={() => {
                                                        setShowDocumentUpload(false);
                                                        setUploadFile(null);
                                                        setDocumentTitle('');
                                                    }}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <X className="h-6 w-6" />
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Titre du document *</label>
                                                    <input
                                                        type="text"
                                                        value={documentTitle}
                                                        onChange={(e) => setDocumentTitle(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        placeholder="Ex: Pièce d'identité, Attestation..."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fichier *</label>
                                                    <input
                                                        type="file"
                                                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Formats acceptés: PDF, JPG, PNG, DOC, DOCX (max. 10MB)
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex justify-end space-x-3 mt-6">
                                                <button
                                                    onClick={() => {
                                                        setShowDocumentUpload(false);
                                                        setUploadFile(null);
                                                        setDocumentTitle('');
                                                    }}
                                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                                    disabled={uploading}
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    onClick={handleDocumentUpload}
                                                    disabled={!uploadFile || !documentTitle || uploading}
                                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    {uploading ? 'Upload en cours...' : 'Ajouter le document'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Modal de rejet de document */}
                            {showDocumentValidationModal && pendingDocumentValidation?.action === 'reject' && (
                                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-medium text-gray-900">Rejeter le document</h3>
                                                <button
                                                    onClick={() => {
                                                        setShowDocumentValidationModal(false);
                                                        setPendingDocumentValidation(null);
                                                        setRejectionReason('');
                                                    }}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <X className="h-6 w-6" />
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-sm text-gray-700 mb-2">
                                                        Document: <strong>{pendingDocumentValidation.documentTitle}</strong>
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Raison du rejet *</label>
                                                    <textarea
                                                        rows={4}
                                                        value={rejectionReason}
                                                        onChange={(e) => setRejectionReason(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        placeholder="Expliquez pourquoi ce document est rejeté..."
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end space-x-3 mt-6">
                                                <button
                                                    onClick={() => {
                                                        setShowDocumentValidationModal(false);
                                                        setPendingDocumentValidation(null);
                                                        setRejectionReason('');
                                                    }}
                                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                                    disabled={validatingDocument}
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleDocumentValidation(pendingDocumentValidation.documentId, 'reject', rejectionReason);
                                                        setShowDocumentValidationModal(false);
                                                        setPendingDocumentValidation(null);
                                                        setRejectionReason('');
                                                    }}
                                                    disabled={!rejectionReason || validatingDocument}
                                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                                                >
                                                    {validatingDocument ? 'Rejet en cours...' : 'Rejeter le document'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
                                <button
                                    onClick={() => {
                                        setShowStatusConfirmModal(false);
                                        setPendingStatusChange(null);
                                        setCustomMessage('');
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-6 w-6" />
                                </button>
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

export default SessionReservationEdit;