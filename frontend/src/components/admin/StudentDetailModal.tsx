import React, { useState, useEffect } from 'react';
import { Calendar, X, FileText, Download, Building2, CheckCircle, XCircle, Clock, User, Briefcase, GraduationCap, ChevronDown, Edit, Save, Upload, Trash2, Plus } from 'lucide-react';
import Modal from '../common/Modal';
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
    source: string; // 'formation' | 'session' | 'inscription' | 'direct'
    sourceTitle: string;
    sourceId: number | null;
    date: string; // Format d/m/Y
    uploadedAt: string; // Format Y-m-d H:i:s
    fileName: string;
    fileSize: string; // Formaté (ex: "1.2 MB")
    fileType: string;
    downloadUrl: string;
    senderRole?: string; // Pour les documents directs
    validationStatus?: string;
    validatedAt?: string;
    validatedBy?: {
        firstName: string;
        lastName: string;
    };
    rejectionReason?: string;
}

interface StudentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: User | null;
    activeTab?: 'info' | 'company' | 'reservations' | 'documents';
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
    isOpen,
    onClose,
    student,
    activeTab = 'info'
}) => {
    const { addToast } = useNotification();
    
    // États pour les onglets
    const [activeDetailTab, setActiveDetailTab] = useState<'info' | 'company' | 'reservations' | 'documents'>(activeTab);
    
    // États pour les données de l'étudiant
    const [userFormations, setUserFormations] = useState<Formation[]>([]);
    const [loadingFormations, setLoadingFormations] = useState(false);
    const [userDocuments, setUserDocuments] = useState<Document[]>([]);
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    const [userReservations, setUserReservations] = useState<SessionReservation[]>([]);
    const [loadingReservations, setLoadingReservations] = useState(false);

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

    // Réinitialiser l'onglet actif quand le modal s'ouvre
    useEffect(() => {
        if (isOpen && student) {
            setActiveDetailTab(activeTab);
            loadStudentData(student);
            // Initialiser les données d'édition
            setEditedStudent({...student});
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
            // Réinitialiser les modes d'édition
            setEditModes({
                info: false,
                company: false,
                documents: false
            });
            setFormErrors({});
        }
    }, [isOpen, student, activeTab]);

    // Effet pour fermer les dropdowns de statut quand on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.status-dropdown-container')) {
                setShowStatusDropdown({});
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // Fonction pour récupérer tous les documents d'un utilisateur (incluant documents directs)
    const fetchAllUserDocuments = async (userId: number) => {
        try {
            setLoadingDocuments(true);
            
            // Récupérer les documents utilisateur standards
            const [userDocsResponse, allDirectDocsResponse] = await Promise.all([
                adminUsersApi.getDocuments(userId),
                adminDirectDocumentsApi.getSentDocuments()
            ]);
            
            // Filtrer les documents directs pour cet utilisateur
            const directDocuments = allDirectDocsResponse.data.filter((doc: any) => 
                doc.student && doc.student.id === userId
            ).map((doc: any) => ({
                id: doc.id,
                title: doc.title,
                type: doc.type || 'document',
                source: 'direct',
                sourceTitle: 'Document direct',
                sourceId: null,
                date: new Date(doc.uploadedAt).toLocaleDateString('fr-FR'),
                uploadedAt: doc.uploadedAt,
                fileName: doc.fileName,
                fileSize: '', // Pas disponible dans les documents directs
                fileType: doc.fileName?.split('.').pop() || '',
                downloadUrl: '', // À construire côté backend
                senderRole: doc.uploadedBy?.firstName + ' ' + doc.uploadedBy?.lastName,
                validationStatus: undefined,
                validatedAt: undefined,
                validatedBy: undefined,
                rejectionReason: undefined
            }));
            
            // Combiner tous les documents
            const allDocuments = [
                ...userDocsResponse.data,
                ...directDocuments
            ];
            
            setUserDocuments(allDocuments);
        } catch (err) {
            console.error('Error fetching user documents:', err);
            addToast('Erreur lors du chargement des documents de l\'élève', 'error');
        } finally {
            setLoadingDocuments(false);
        }
    };

    // Fonction pour charger toutes les données de l'étudiant
    const loadStudentData = async (user: User) => {
        // Charger les formations de l'étudiant
        try {
            setLoadingFormations(true);
            const formationsResponse = await adminUsersApi.getSessions(user.id);
            setUserFormations(formationsResponse.data);
        } catch (err) {
            console.error('Error fetching user formations:', err);
            addToast('Erreur lors du chargement des formations de l\'élève', 'error');
        } finally {
            setLoadingFormations(false);
        }

        // Charger les documents de l'étudiant - récupérer tous les documents incluant les documents directs
        await fetchAllUserDocuments(user.id);

        // Charger les réservations de l'étudiant
        try {
            setLoadingReservations(true);
            const reservationsResponse = await adminReservationsApi.getSessionReservations(`userId=${user.id}`);
            setUserReservations(reservationsResponse.data);
        } catch (err) {
            console.error('Error fetching user reservations:', err);
            addToast('Erreur lors du chargement des réservations de l\'élève', 'error');
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

    // Fonctions pour la gestion des statuts de réservations
    const toggleStatusDropdown = (reservationId: number) => {
        setShowStatusDropdown(prev => ({
            ...prev,
            [reservationId]: !prev[reservationId]
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
            
            // Mettre à jour la liste des réservations
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

    const cancelStatusChange = () => {
        setShowStatusConfirmModal(false);
        setPendingStatusChange(null);
        setCustomMessage('');
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

    // Fonctions de gestion des modes d'édition
    const toggleEditMode = (section: 'info' | 'company' | 'documents') => {
        setEditModes(prev => ({ ...prev, [section]: !prev[section] }));
        if (editModes[section]) {
            // Si on sort du mode édition, réinitialiser les données
            if (section === 'info' && student) {
                setEditedStudent({...student});
            } else if (section === 'company' && student) {
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
            setFormErrors({});
        }
    };

    // Validation des formulaires
    const validateStudentForm = () => {
        const errors: {[key: string]: string} = {};
        if (!editedStudent?.firstName?.trim()) errors.firstName = 'Le prénom est requis';
        if (!editedStudent?.lastName?.trim()) errors.lastName = 'Le nom est requis';
        if (!editedStudent?.email?.trim()) errors.email = 'L\'email est requis';
        else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(editedStudent.email))
            errors.email = 'Format d\'email invalide';
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateCompanyForm = () => {
        const errors: {[key: string]: string} = {};
        if (!editedCompany?.name?.trim()) errors.companyName = 'Le nom de l\'entreprise est requis';
        if (!editedCompany?.siret?.trim()) errors.siret = 'Le SIRET est requis';
        if (!editedCompany?.responsableName?.trim()) errors.responsableName = 'Le nom du responsable est requis';
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Fonctions de sauvegarde
    const saveStudentInfo = async () => {
        if (!validateStudentForm() || !editedStudent || !student) return;

        try {
            setSaving(true);
            await adminUsersApi.update(student.id, editedStudent);
            
            // Mettre à jour les données locales
            Object.assign(student, editedStudent);
            
            addToast('Informations de l\'étudiant mises à jour avec succès', 'success');
            setEditModes(prev => ({ ...prev, info: false }));
        } catch (err) {
            console.error('Error updating student:', err);
            addToast('Erreur lors de la mise à jour des informations', 'error');
        } finally {
            setSaving(false);
        }
    };

    const saveCompanyInfo = async () => {
        if (!validateCompanyForm() || !editedCompany || !student) return;

        try {
            setSaving(true);
            
            // Créer ou mettre à jour l'entreprise
            if (student.company) {
                // Mettre à jour l'entreprise existante
                const response = await adminUsersApi.updateCompany(student.id, editedCompany);
                student.company = response.data;
            } else {
                // Créer une nouvelle entreprise
                const response = await adminUsersApi.createCompany(student.id, editedCompany);
                student.company = response.data;
            }
            
            addToast('Informations de l\'entreprise mises à jour avec succès', 'success');
            setEditModes(prev => ({ ...prev, company: false }));
        } catch (err) {
            console.error('Error updating company:', err);
            addToast('Erreur lors de la mise à jour de l\'entreprise', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Fonctions de gestion des documents
    const handleDocumentUpload = async () => {
        if (!uploadFile || !documentTitle.trim() || !student) return;

        try {
            setUploading(true);
            
            const formData = new FormData();
            formData.append('file', uploadFile);
            formData.append('title', documentTitle.trim());
            formData.append('studentId', student.id.toString());
            
            await adminUsersApi.uploadDocument(formData);
            
            // Recharger les documents
            await fetchAllUserDocuments(student.id);
            
            addToast('Document uploadé avec succès', 'success');
            setShowDocumentUpload(false);
            setUploadFile(null);
            setDocumentTitle('');
        } catch (err) {
            console.error('Error uploading document:', err);
            addToast('Erreur lors de l\'upload du document', 'error');
        } finally {
            setUploading(false);
        }
    };

    const deleteDocument = async (documentId: number) => {
        if (!student) return;
        
        try {
            // Trouver le document pour déterminer son type
            const document = userDocuments.find(doc => doc.id === documentId);
            
            if (!document) {
                addToast('Document introuvable', 'error');
                return;
            }
            
            // Gérer la suppression selon le type de document
            switch (document.source) {
                case 'direct':
                    // Documents directs - utiliser l'API des documents directs
                    await adminDirectDocumentsApi.delete(documentId);
                    break;
                    
                case 'inscription':
                    // Documents d'inscription - ne peuvent pas être supprimés, seulement validés/rejetés
                    addToast('Les documents d\'inscription ne peuvent pas être supprimés. Utilisez les boutons Approuver/Rejeter.', 'warning');
                    return;
                    
                case 'formation':
                    // Documents de formation - nécessitent l'ID de formation
                    if (document.sourceId) {
                        await adminFormationsApi.deleteDocument(document.sourceId, documentId);
                    } else {
                        addToast('Impossible de supprimer ce document : ID de formation manquant', 'error');
                        return;
                    }
                    break;
                    
                case 'session':
                    // Documents de session - nécessitent l'ID de session
                    if (document.sourceId) {
                        await adminSessionsApi.deleteDocument(document.sourceId, documentId);
                    } else {
                        addToast('Impossible de supprimer ce document : ID de session manquant', 'error');
                        return;
                    }
                    break;
                    
                default:
                    addToast('Type de document non pris en charge pour la suppression', 'error');
                    return;
            }
            
            // Recharger les documents
            await fetchAllUserDocuments(student.id);
            
            addToast('Document supprimé avec succès', 'success');
        } catch (err) {
            console.error('Error deleting document:', err);
            addToast('Erreur lors de la suppression du document', 'error');
        }
    };

    // Fonctions pour la validation des documents
    const requestDocumentValidation = (documentId: number, documentTitle: string, action: 'validate' | 'reject') => {
        setPendingDocumentValidation({
            documentId,
            documentTitle,
            action
        });
        
        if (action === 'validate') {
            // Validation directe sans modal
            handleDocumentValidation();
        } else {
            // Rejet avec modal pour la raison
            setShowDocumentValidationModal(true);
        }
    };

    const handleDocumentValidation = async () => {
        if (!pendingDocumentValidation || !student) return;

        try {
            setValidatingDocument(true);
            
            if (pendingDocumentValidation.action === 'validate') {
                await documentsApi.validateDocument(pendingDocumentValidation.documentId);
                addToast('Document validé avec succès', 'success');
            } else {
                if (!rejectionReason.trim()) {
                    addToast('Veuillez indiquer une raison pour le rejet', 'error');
                    return;
                }
                await documentsApi.rejectDocument(pendingDocumentValidation.documentId, rejectionReason.trim());
                addToast('Document rejeté avec succès', 'success');
            }
            
            // Recharger les documents
            await fetchAllUserDocuments(student.id);
            
            // Nettoyer les états
            setShowDocumentValidationModal(false);
            setPendingDocumentValidation(null);
            setRejectionReason('');
            
        } catch (err) {
            console.error('Error validating/rejecting document:', err);
            addToast(`Erreur lors de ${pendingDocumentValidation.action === 'validate' ? 'la validation' : 'du rejet'} du document`, 'error');
        } finally {
            setValidatingDocument(false);
        }
    };

    const cancelDocumentValidation = () => {
        setShowDocumentValidationModal(false);
        setPendingDocumentValidation(null);
        setRejectionReason('');
    };

    if (!student) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            maxWidth="max-w-7xl"
        >
            <div className="w-full max-w-7xl mx-auto">
                {/* Header avec nom et bouton fermer */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <User className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">
                                {student.firstName} {student.lastName}
                            </h2>
                            <p className="text-blue-100">{student.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    student.isActive 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {student.isActive ? 'Actif' : 'Inactif'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation par onglets */}
                <div className="bg-white border-b">
                    <div className="px-6">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setActiveDetailTab('info')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                    activeDetailTab === 'info'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <User className="h-4 w-4 inline-block mr-2" />
                                Informations
                            </button>
                            
                            <button
                                onClick={() => setActiveDetailTab('company')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                    activeDetailTab === 'company'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Briefcase className="h-4 w-4 inline-block mr-2" />
                                Entreprise
                            </button>
                            
                            <button
                                onClick={() => setActiveDetailTab('reservations')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                    activeDetailTab === 'reservations'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Calendar className="h-4 w-4 inline-block mr-2" />
                                Réservations ({userReservations.length})
                            </button>
                            
                            <button
                                onClick={() => setActiveDetailTab('documents')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                    activeDetailTab === 'documents'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <FileText className="h-4 w-4 inline-block mr-2" />
                                Documents ({userDocuments.length})
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Contenu des onglets */}
                <div className="p-6">
                    {/* Onglet Informations */}
                    {activeDetailTab === 'info' && (
                        <div className="animate-fadeIn space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium text-gray-900 flex items-center">
                                    <User className="h-5 w-5 mr-2 text-blue-600" />
                                    Informations personnelles
                                </h4>
                                <button
                                    onClick={() => toggleEditMode('info')}
                                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        editModes.info 
                                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    {editModes.info ? (
                                        <>
                                            <X className="h-4 w-4 mr-2" />
                                            Annuler
                                        </>
                                    ) : (
                                        <>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Modifier
                                        </>
                                    )}
                                </button>
                            </div>

                            {editModes.info ? (
                                /* Mode édition */
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Prénom *
                                            </label>
                                            <input
                                                type="text"
                                                value={editedStudent?.firstName || ''}
                                                onChange={(e) => setEditedStudent(prev => prev ? {...prev, firstName: e.target.value} : null)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                    formErrors.firstName ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="Entrez le prénom"
                                            />
                                            {formErrors.firstName && (
                                                <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nom *
                                            </label>
                                            <input
                                                type="text"
                                                value={editedStudent?.lastName || ''}
                                                onChange={(e) => setEditedStudent(prev => prev ? {...prev, lastName: e.target.value} : null)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                    formErrors.lastName ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="Entrez le nom"
                                            />
                                            {formErrors.lastName && (
                                                <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                value={editedStudent?.email || ''}
                                                onChange={(e) => setEditedStudent(prev => prev ? {...prev, email: e.target.value} : null)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                    formErrors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="Entrez l'email"
                                            />
                                            {formErrors.email && (
                                                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Téléphone
                                            </label>
                                            <input
                                                type="tel"
                                                value={editedStudent?.phone || ''}
                                                onChange={(e) => setEditedStudent(prev => prev ? {...prev, phone: e.target.value} : null)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Entrez le téléphone"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Statut du compte
                                            </label>
                                            <select
                                                value={editedStudent?.isActive ? 'true' : 'false'}
                                                onChange={(e) => setEditedStudent(prev => prev ? {...prev, isActive: e.target.value === 'true'} : null)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="true">Actif</option>
                                                <option value="false">Inactif</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                                        <button
                                            onClick={() => toggleEditMode('info')}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                            disabled={saving}
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={saveStudentInfo}
                                            disabled={saving}
                                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                                    Sauvegarde...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Sauvegarder
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Mode lecture */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h5 className="font-medium text-gray-900 mb-3">Informations personnelles</h5>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Nom complet</label>
                                                <p className="text-sm text-gray-900">{student.firstName} {student.lastName}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Email</label>
                                                <p className="text-sm text-gray-900">{student.email}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Téléphone</label>
                                                <p className="text-sm text-gray-900">{student.phone || 'Non renseigné'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Rôle</label>
                                                <p className="text-sm text-gray-900">Étudiant</p>
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
                                                        student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {student.isActive ? 'Actif' : 'Inactif'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Dernière connexion</label>
                                                <p className="text-sm text-gray-900">{student.lastLogin || 'Jamais connecté'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Onglet Entreprise */}
                    {activeDetailTab === 'company' && (
                        <div className="animate-fadeIn space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium text-gray-900 flex items-center">
                                    <Building2 className="h-5 w-5 mr-2 text-indigo-600" />
                                    Informations entreprise
                                </h4>
                                <button
                                    onClick={() => toggleEditMode('company')}
                                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        editModes.company 
                                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}
                                >
                                    {editModes.company ? (
                                        <>
                                            <X className="h-4 w-4 mr-2" />
                                            Annuler
                                        </>
                                    ) : (
                                        <>
                                            <Edit className="h-4 w-4 mr-2" />
                                            {student.company ? 'Modifier' : 'Créer'}
                                        </>
                                    )}
                                </button>
                            </div>

                            {editModes.company ? (
                                /* Mode édition */
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nom de l'entreprise *
                                            </label>
                                            <input
                                                type="text"
                                                value={editedCompany?.name || ''}
                                                onChange={(e) => setEditedCompany(prev => ({...prev, name: e.target.value}))}
                                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                    formErrors.companyName ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="Entrez le nom de l'entreprise"
                                            />
                                            {formErrors.companyName && (
                                                <p className="mt-1 text-sm text-red-600">{formErrors.companyName}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                SIRET *
                                            </label>
                                            <input
                                                type="text"
                                                value={editedCompany?.siret || ''}
                                                onChange={(e) => setEditedCompany(prev => ({...prev, siret: e.target.value}))}
                                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                    formErrors.siret ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="Entrez le SIRET"
                                            />
                                            {formErrors.siret && (
                                                <p className="mt-1 text-sm text-red-600">{formErrors.siret}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Responsable *
                                            </label>
                                            <input
                                                type="text"
                                                value={editedCompany?.responsableName || ''}
                                                onChange={(e) => setEditedCompany(prev => ({...prev, responsableName: e.target.value}))}
                                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                    formErrors.responsableName ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="Nom du responsable"
                                            />
                                            {formErrors.responsableName && (
                                                <p className="mt-1 text-sm text-red-600">{formErrors.responsableName}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email entreprise
                                            </label>
                                            <input
                                                type="email"
                                                value={editedCompany?.email || ''}
                                                onChange={(e) => setEditedCompany(prev => ({...prev, email: e.target.value}))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="email@entreprise.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Téléphone
                                            </label>
                                            <input
                                                type="tel"
                                                value={editedCompany?.phone || ''}
                                                onChange={(e) => setEditedCompany(prev => ({...prev, phone: e.target.value}))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Téléphone de l'entreprise"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Adresse
                                            </label>
                                            <input
                                                type="text"
                                                value={editedCompany?.address || ''}
                                                onChange={(e) => setEditedCompany(prev => ({...prev, address: e.target.value}))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Adresse de l'entreprise"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Code postal
                                            </label>
                                            <input
                                                type="text"
                                                value={editedCompany?.postalCode || ''}
                                                onChange={(e) => setEditedCompany(prev => ({...prev, postalCode: e.target.value}))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Code postal"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Ville
                                            </label>
                                            <input
                                                type="text"
                                                value={editedCompany?.city || ''}
                                                onChange={(e) => setEditedCompany(prev => ({...prev, city: e.target.value}))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Ville"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                                        <button
                                            onClick={() => toggleEditMode('company')}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                            disabled={saving}
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={saveCompanyInfo}
                                            disabled={saving}
                                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                                    Sauvegarde...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Sauvegarder
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Mode lecture */
                                student.company ? (
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Nom de l'entreprise</label>
                                                <p className="text-sm text-gray-900">{student.company.name}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">SIRET</label>
                                                <p className="text-sm text-gray-900">{student.company.siret}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Responsable</label>
                                                <p className="text-sm text-gray-900">{student.company.responsableName}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Email entreprise</label>
                                                <p className="text-sm text-gray-900">{student.company.email}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Téléphone</label>
                                                <p className="text-sm text-gray-900">{student.company.phone}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Adresse</label>
                                                <p className="text-sm text-gray-900">
                                                    {student.company.address}<br />
                                                    {student.company.postalCode} {student.company.city}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 italic">Aucune entreprise associée</p>
                                        <p className="text-xs text-gray-400 mt-2">Cliquez sur "Créer" pour ajouter une entreprise</p>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {/* Onglet Réservations */}
                    {activeDetailTab === 'reservations' && (
                        <div className="animate-fadeIn space-y-6">
                            <div>
                                <h4 className="font-medium mb-4 flex items-center">
                                    <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
                                    Réservations de formations
                                </h4>
                                {loadingReservations ? (
                                    <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-900"></div>
                                        <span className="ml-2">Chargement des réservations...</span>
                                    </div>
                                ) : userReservations && userReservations.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Formation
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Date début
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Demande
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Statut
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {userReservations.map((reservation) => (
                                                    <tr key={reservation.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {reservation.session.formation.title}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDate(reservation.session.startDate)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDate(reservation.createdAt)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="absolute status-dropdown-container">
                                                                <button
                                                                    onClick={() => toggleStatusDropdown(reservation.id)}
                                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 ${getStatusBadgeClass(reservation.status)}`}
                                                                >
                                                                    {getStatusLabel(reservation.status, 'formation')}
                                                                    <ChevronDown className="ml-1 h-3 w-3" />
                                                                </button>
                                                                
                                                                {showStatusDropdown[reservation.id] && (
                                                                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg min-w-64 max-h-80 overflow-y-auto"
                                                                         style={{ zIndex: 9999 }}>
                                                                        <div className="p-2">
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
                                    <div className="text-center py-6">
                                        <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 italic">Aucune réservation trouvée</p>
                                        <p className="text-sm text-gray-400 mt-1">L'élève n'a pas encore effectué de réservation de formation</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Onglet Documents */}
                    {activeDetailTab === 'documents' && (
                        <div className="animate-fadeIn space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium text-gray-900 flex items-center">
                                    <FileText className="h-5 w-5 mr-2 text-purple-600" />
                                    Documents d'inscription ({userDocuments.length})
                                </h4>
                                <button
                                    onClick={() => setShowDocumentUpload(true)}
                                    className="flex items-center px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Ajouter un document
                                </button>
                            </div>

                            {/* Modal d'upload de document */}
                            {showDocumentUpload && (
                                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h5 className="font-medium text-gray-900">Uploader un nouveau document</h5>
                                        <button
                                            onClick={() => {
                                                setShowDocumentUpload(false);
                                                setUploadFile(null);
                                                setDocumentTitle('');
                                            }}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Titre du document *
                                            </label>
                                            <input
                                                type="text"
                                                value={documentTitle}
                                                onChange={(e) => setDocumentTitle(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                placeholder="Ex: Pièce d'identité, Attestation..."
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Fichier *
                                            </label>
                                            <input
                                                type="file"
                                                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                Formats acceptés: PDF, JPG, PNG, DOC, DOCX (max 10MB)
                                            </p>
                                        </div>
                                        
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() => {
                                                    setShowDocumentUpload(false);
                                                    setUploadFile(null);
                                                    setDocumentTitle('');
                                                }}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                                disabled={uploading}
                                            >
                                                Annuler
                                            </button>
                                            <button
                                                onClick={handleDocumentUpload}
                                                disabled={uploading || !uploadFile || !documentTitle.trim()}
                                                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                            >
                                                {uploading ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                                        Upload en cours...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        Uploader
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Liste des documents */}
                            {loadingDocuments ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-900"></div>
                                    <span className="ml-2">Chargement des documents...</span>
                                </div>
                            ) : userDocuments && userDocuments.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {userDocuments.map((document) => (
                                        <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h5 className="font-medium text-gray-900 mb-1">{document.title}</h5>
                                                    <p className="text-sm text-gray-500 mb-1">{document.fileName}</p>
                                                    <p className="text-xs text-gray-500 mb-1">
                                                        Source: {document.sourceTitle || document.source}
                                                        {document.senderRole && <span className="ml-1">({document.senderRole})</span>}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        Ajouté le {document.date || new Date(document.uploadedAt).toLocaleDateString('fr-FR')}
                                                    </p>
                                                    <div className="mt-2">
                                                        {document.validationStatus === 'valide' && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                                Validé
                                                            </span>
                                                        )}
                                                        {(document.validationStatus === 'en_attente' || (!document.validationStatus && document.source === 'inscription')) && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                En attente
                                                            </span>
                                                        )}
                                                        {document.validationStatus === 'rejete' && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                <XCircle className="h-3 w-3 mr-1" />
                                                                Refusé
                                                            </span>
                                                        )}
                                                        {document.source === 'direct' && !document.validationStatus && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                Document direct
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="ml-4 flex flex-col space-y-2">
                                                    {document.downloadUrl ? (
                                                        <a
                                                            href={document.downloadUrl}
                                                            download
                                                            className="text-blue-600 hover:text-blue-800"
                                                            title="Télécharger"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    ) : (
                                                        <button
                                                            className="text-gray-400 cursor-not-allowed"
                                                            title="Téléchargement non disponible"
                                                            disabled
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    
                                                    {/* Boutons de validation pour les documents d'inscription en attente */}
                                                    {document.source === 'inscription' && 
                                                     (document.validationStatus === 'en_attente' || !document.validationStatus) && (
                                                        <div className="flex flex-col space-y-1">
                                                            <button
                                                                onClick={() => requestDocumentValidation(document.id, document.title, 'validate')}
                                                                className="text-green-600 hover:text-green-800 text-xs px-2 py-1 border border-green-600 rounded hover:bg-green-50"
                                                                title="Approuver le document"
                                                                disabled={validatingDocument}
                                                            >
                                                                <CheckCircle className="h-3 w-3 inline mr-1" />
                                                                Approuver
                                                            </button>
                                                            <button
                                                                onClick={() => requestDocumentValidation(document.id, document.title, 'reject')}
                                                                className="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-600 rounded hover:bg-red-50"
                                                                title="Rejeter le document"
                                                                disabled={validatingDocument}
                                                            >
                                                                <XCircle className="h-3 w-3 inline mr-1" />
                                                                Rejeter
                                                            </button>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Bouton de suppression - pas pour les documents d'inscription */}
                                                    {document.source !== 'inscription' && (
                                                        <button
                                                            onClick={() => deleteDocument(document.id)}
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 italic">Aucun document trouvé</p>
                                    <p className="text-sm text-gray-400 mt-1">Cliquez sur "Ajouter un document" pour uploader un fichier</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {/* Modal de confirmation pour changement de statut */}
            {showStatusConfirmModal && pendingStatusChange && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 xl:w-2/5 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Confirmation de changement de statut
                                </h3>
                                <button
                                    onClick={cancelStatusChange}
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
                                    onClick={cancelStatusChange}
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

            {/* Modal de confirmation pour rejet de document */}
            {showDocumentValidationModal && pendingDocumentValidation && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 xl:w-2/5 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Confirmation de rejet du document
                                </h3>
                                <button
                                    onClick={cancelDocumentValidation}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Contenu */}
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
                                                Cette action déclenchera l'envoi d'un email automatique à l'étudiant pour l'informer du rejet.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Document concerné :</label>
                                        <p className="text-base font-semibold text-gray-900">{pendingDocumentValidation.documentTitle}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Étudiant :</label>
                                        <p className="text-base font-semibold text-gray-900">{student?.firstName} {student?.lastName}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Raison du rejet (obligatoire) :</label>
                                        <div className="mt-1">
                                            <textarea
                                                rows={4}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                                placeholder="Veuillez expliquer pourquoi ce document est rejeté (ex: document illisible, format incorrect, informations manquantes...)"
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Cette raison sera incluse dans l'email envoyé à l'étudiant
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Boutons */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={cancelDocumentValidation}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDocumentValidation}
                                    disabled={validatingDocument || !rejectionReason.trim()}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                >
                                    {validatingDocument ? 'Rejet en cours...' : 'Confirmer le rejet'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default StudentDetailModal;