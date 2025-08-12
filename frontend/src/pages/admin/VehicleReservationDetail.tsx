import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    User, 
    Car, 
    MapPin, 
    Calendar, 
    Clock, 
    CreditCard, 
    FileText, 
    MessageSquare,
    CheckCircle,
    XCircle,
    AlertCircle,
    Phone,
    Mail,
    Building,
    X,
    ChevronDown,
    Upload,
    Download,
    Trash2,
    Plus,
    Edit2,
    Check
} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/common/Button';
import { adminReservationsApi, vehicleRentalDocumentsApi, vehicleRentalsApi } from '../../services/api';
import Alert from '../../components/common/Alert';
import { getStatusBadgeClass, getStatusLabel as getReservationStatusLabel } from '../../utils/reservationStatuses';
import { FileDisplay } from '../../components/common/FileDisplay';

// Interface pour les documents
interface VehicleDocument {
    id: number;
    title: string;
    fileName: string;
    fileType: string;
    fileSize: string;
    uploadedAt: string;
    downloadUrl: string;
}

interface VehicleReservationDetail {
    id: number;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    date: string;
    examCenter: string;
    formula: string;
    status: string;
    vehicleAssigned: string | null;
    // Champs supplémentaires que nous espérons avoir dans l'API
    startDate?: string;
    endDate?: string;
    totalPrice?: number;
    pickupLocation?: string;
    returnLocation?: string;
    examTime?: string;
    financing?: string;
    paymentMethod?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    // Documents et facture
    documents?: any[];
    invoice?: any;
    // Informations utilisateur avec documents de permis
    user?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        driverLicenseFrontFile?: string;
        driverLicenseBackFile?: string;
    };
}

const VehicleReservationDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [reservation, setReservation] = useState<VehicleReservationDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [availableVehicles, setAvailableVehicles] = useState<string[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<string>('');
    const [availableTransitions, setAvailableTransitions] = useState<any[]>([]);
    
    // États pour le modal de confirmation de changement de statut
    const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false);
    const [pendingStatusChange, setPendingStatusChange] = useState<{
        newStatus: string;
        currentStatus: string;
        studentName: string;
    } | null>(null);
    const [customMessage, setCustomMessage] = useState('');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    
    // États pour la gestion des documents
    const [documents, setDocuments] = useState<VehicleDocument[]>([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    
    // État pour différencier upload de facture vs document normal
    const [uploadingInvoice, setUploadingInvoice] = useState(false);


    // États pour l'édition des sections
    const [isEditingClient, setIsEditingClient] = useState(false);
    const [isEditingReservation, setIsEditingReservation] = useState(false);
    const [isEditingExam, setIsEditingExam] = useState(false);
    const [isEditingFinance, setIsEditingFinance] = useState(false);
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [sectionUpdateLoading, setSectionUpdateLoading] = useState<string | null>(null);

    // États pour stocker les données éditées
    const [editedData, setEditedData] = useState<any>({});

    // États pour les centres et formules
    const [centersWithFormulas, setCentersWithFormulas] = useState<any[]>([]);
    const [availableFormulas, setAvailableFormulas] = useState<any[]>([]);

    // États pour les listes déroulantes
    const [examCenters, setExamCenters] = useState<any[]>([]);
    const [formulas, setFormulas] = useState<any[]>([]);

    useEffect(() => {
        if (id) {
            fetchReservationDetails();
            fetchAvailableTransitions();
            fetchDocuments();
        }
        // Charger les centres avec formules
        fetchCentersWithFormulas();
    }, [id]);

    // Fonction pour charger les centres avec formules
    const fetchCentersWithFormulas = async () => {
        try {
            const response = await fetch('/api/centers/with-formulas');
            const centers = await response.json();
            setCentersWithFormulas(centers);
        } catch (error) {
            console.error('Erreur lors du chargement des centres avec formules:', error);
        }
    };

    // Fermer le dropdown quand on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showStatusDropdown) {
                const target = event.target as Element;
                if (!target.closest('.relative')) {
                    setShowStatusDropdown(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showStatusDropdown]);

    const fetchAvailableTransitions = async () => {
        // Utiliser la même approche que la liste des réservations : tous les statuts disponibles
        const vehicleStatuses = [
            'submitted', 'under_review', 'awaiting_documents', 'documents_pending', 
            'documents_rejected', 'awaiting_payment', 'payment_pending', 'confirmed', 
            'in_progress', 'completed', 'cancelled', 'refunded'
        ];

        const allStatuses = vehicleStatuses.map(status => ({
            status: status,
            label: getStatusLabel(status),
            color: getStatusBadgeClass(status)
        }));

        // Créer une structure unique pour tous les statuts
        const vehicleTransitions = [{
            fromStatus: 'all', // Utiliser 'all' comme clé universelle
            toStatuses: allStatuses
        }];
        
        setAvailableTransitions(vehicleTransitions);
    };

    const fetchReservationDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await adminReservationsApi.getById(Number(id));
            setReservation(response.data);
            
            if (response.data.vehicleAssigned) {
                setSelectedVehicle(response.data.vehicleAssigned);
            }

            // Charger les véhicules disponibles
            if (response.data.date) {
                const dateParts = response.data.date.split('/');
                if (dateParts.length === 3) {
                    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                    const vehiclesResponse = await adminReservationsApi.getAvailableVehicles(formattedDate);
                    setAvailableVehicles(vehiclesResponse.data.map((v: any) => v.model));
                }
            }
        } catch (err) {
            console.error('Error fetching reservation details:', err);
            setError('Erreur lors du chargement des détails de la réservation');
        } finally {
            setLoading(false);
        }
    };

    const requestStatusChange = (newStatus: string) => {
        if (!reservation) return;

        setPendingStatusChange({
            newStatus,
            currentStatus: reservation.status,
            studentName: reservation.clientName
        });
        
        setShowStatusConfirmModal(true);
    };

    const handleStatusChange = async () => {
        if (!reservation || !pendingStatusChange) return;

        try {
            setLoading(true);
            await adminReservationsApi.updateStatus(reservation.id, pendingStatusChange.newStatus, customMessage);
            setReservation({ ...reservation, status: pendingStatusChange.newStatus });
            setSuccessMessage(`Statut mis à jour avec succès vers "${getReservationStatusLabel(pendingStatusChange.newStatus, 'vehicle')}"`);
            setTimeout(() => setSuccessMessage(null), 3000);
            
            // Fermer le modal de confirmation et nettoyer l'état
            setShowStatusConfirmModal(false);
            setPendingStatusChange(null);
            setCustomMessage('');
        } catch (err) {
            setError('Erreur lors de la mise à jour du statut');
            setShowStatusConfirmModal(false);
            setPendingStatusChange(null);
            setCustomMessage('');
        } finally {
            setLoading(false);
        }
    };

    const cancelStatusChange = () => {
        setShowStatusConfirmModal(false);
        setPendingStatusChange(null);
        setCustomMessage('');
    };

    // Fonction pour obtenir la description de l'email
    const getEmailDescription = (status: string): string => {
        const emailDescriptions: Record<string, string> = {
            'submitted': 'Email de confirmation de demande soumise',
            'confirmed': 'Email de confirmation de réservation',
            'completed': 'Email de confirmation de fin de service',
            'cancelled': 'Email de confirmation d\'annulation'
        };
        
        return emailDescriptions[status] || 'Email de notification de changement de statut';
    };

    const handleAssignVehicle = async () => {
        if (!reservation || !selectedVehicle) return;

        try {
            setLoading(true);
            await adminReservationsApi.assignVehicle(reservation.id, selectedVehicle);
            setReservation({ ...reservation, vehicleAssigned: selectedVehicle });
            setSuccessMessage('Véhicule assigné avec succès');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError('Erreur lors de l\'assignation du véhicule');
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status: string) => {
        return getReservationStatusLabel(status, 'vehicle');
    };

    // Fonctions de gestion des documents
    const fetchDocuments = async () => {
        if (!id) return;
        
        try {
            const response = await vehicleRentalDocumentsApi.getByRental(Number(id));
            const documentsData = response.data.map((doc: any) => ({
                id: doc.id,
                title: doc.title,
                fileName: doc.fileName,
                fileType: doc.fileType,
                fileSize: doc.fileSize,
                uploadedAt: doc.uploadedAt,
                downloadUrl: vehicleRentalDocumentsApi.getDownloadUrl(doc.id)
            }));
            setDocuments(documentsData);
        } catch (err) {
            console.error('Error fetching documents:', err);
            // En cas d'erreur, laisser documents vide
            setDocuments([]);
        }
    };

    const handleDocumentUpload = async (file: File, title: string) => {
        if (!id) return;

        try {
            setUploading(true);
            setUploadError(null);

            // Étape 1: Upload temporaire
            const formData = new FormData();
            formData.append('file', file);
            
            // Préfixer le titre pour les factures pour les distinguer
            const documentTitle = uploadingInvoice ? `[FACTURE] ${title}` : title;
            formData.append('title', documentTitle);
            formData.append('vehicleRentalId', id);

            const tempResponse = await vehicleRentalDocumentsApi.tempUpload(formData);
            const tempId = tempResponse.data.tempId;

            // Étape 2: Finaliser immédiatement
            await vehicleRentalDocumentsApi.finalizeDocuments({
                tempIds: [tempId],
                vehicleRentalId: Number(id)
            });

            // Recharger la liste des documents et les détails de la réservation
            await fetchDocuments();
            await fetchReservationDetails();
            
            const successMessage = uploadingInvoice ? 'Facture uploadée avec succès !' : 'Document uploadé avec succès !';
            setUploadSuccess(successMessage);
            setShowUploadModal(false);
            setUploadingInvoice(false);
            
            // Masquer le message de succès après 3 secondes
            setTimeout(() => setUploadSuccess(null), 3000);
            
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de l\'upload';
            setUploadError(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    const handleDocumentDelete = async (documentId: number) => {
        try {
            await vehicleRentalDocumentsApi.deleteDocument(documentId);
            setDocuments(prev => prev.filter(doc => doc.id !== documentId));
            setUploadSuccess('Document supprimé avec succès !');
            setTimeout(() => setUploadSuccess(null), 3000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la suppression du document';
            setUploadError(errorMessage);
            setTimeout(() => setUploadError(null), 5000);
        }
    };


    // Fonctions pour la gestion de l'édition par section
    const handleEditSection = (section: string) => {
        if (!reservation) return;

        // Initialiser editedData avec les données actuelles
        const currentData = {
            // Informations client - Utiliser uniquement les données de l'objet user
            clientName: reservation.user?.fullName || `${reservation.user?.firstName || ''} ${reservation.user?.lastName || ''}`.trim(),
            firstName: reservation.user?.firstName || '',
            lastName: reservation.user?.lastName || '',
            clientEmail: reservation.user?.email || '', 
            clientPhone: reservation.user?.phone || '',
            birthDate: reservation.user?.birthDate ? reservation.user.birthDate.split('T')[0] : '',
            birthPlace: reservation.user?.birthPlace || '',
            
            // Réservation - Convertir DD/MM/YYYY vers YYYY-MM-DD pour les inputs date
            startDate: reservation.startDate ? reservation.startDate.split('/').reverse().join('-') : '',
            endDate: reservation.endDate ? reservation.endDate.split('/').reverse().join('-') : '',
            pickupLocation: reservation.pickupLocation,
            returnLocation: reservation.returnLocation,
            
            // Examen
            examCenter: reservation.examCenter,
            formula: reservation.formula,
            date: reservation.date,
            examTime: reservation.examTime,
            
            // Finance
            totalPrice: reservation.totalPrice,
            financing: reservation.financing,
            paymentMethod: reservation.paymentMethod,
            
            // Notes
            notes: reservation.notes
        };
        
        setEditedData(currentData);

        // Si on édite la section examen, initialiser les formules disponibles
        if (section === 'exam') {
            const selectedCenter = centersWithFormulas.find(center => center.name === reservation.examCenter);
            setAvailableFormulas(selectedCenter?.formulas || []);
        }

        // Activer l'édition pour la section spécifiée
        switch (section) {
            case 'client': setIsEditingClient(true); break;
            case 'reservation': setIsEditingReservation(true); break;
            case 'exam': setIsEditingExam(true); break;
            case 'finance': setIsEditingFinance(true); break;
            case 'notes': setIsEditingNotes(true); break;
        }
    };

    const handleCancelEditSection = (section: string) => {
        switch (section) {
            case 'client': setIsEditingClient(false); break;
            case 'reservation': setIsEditingReservation(false); break;
            case 'exam': setIsEditingExam(false); break;
            case 'finance': setIsEditingFinance(false); break;
            case 'notes': setIsEditingNotes(false); break;
        }
        setEditedData({});
    };

    const handleSaveSection = async (section: string) => {
        if (!reservation) return;

        try {
            setSectionUpdateLoading(section);
            const response = await vehicleRentalsApi.update(reservation.id, editedData);
            
            // Merger les données mises à jour avec les données existantes
            const updatedReservation = {
                ...reservation,
                ...editedData,
                // Garder les données retournées par l'API pour les champs système
                id: response.data.id || reservation.id,
                updatedAt: response.data.updatedAt || reservation.updatedAt,
                totalPrice: response.data.totalPrice || editedData.totalPrice || reservation.totalPrice,
                notes: response.data.notes !== undefined ? response.data.notes : (editedData.notes !== undefined ? editedData.notes : reservation.notes)
            };
            
            setReservation(updatedReservation);
            handleCancelEditSection(section);
            setSuccessMessage(`${getSectionLabel(section)} mis à jour avec succès`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || `Erreur lors de la mise à jour des ${getSectionLabel(section)}`;
            setError(errorMessage);
            setTimeout(() => setError(null), 5000);
        } finally {
            setSectionUpdateLoading(null);
        }
    };

    const getSectionLabel = (section: string) => {
        switch (section) {
            case 'client': return 'informations client';
            case 'reservation': return 'informations de réservation';
            case 'exam': return 'informations d\'examen';
            case 'finance': return 'informations financières';
            case 'notes': return 'notes';
            default: return 'informations';
        }
    };

    const updateEditedData = (field: string, value: any) => {
        setEditedData(prev => {
            const updatedData = { ...prev, [field]: value };
            
            // Si le centre d'examen change, mettre à jour les formules disponibles
            if (field === 'examCenter') {
                const selectedCenter = centersWithFormulas.find(center => center.name === value);
                setAvailableFormulas(selectedCenter?.formulas || []);
                // Réinitialiser la formule sélectionnée si elle n'est plus disponible
                if (selectedCenter) {
                    const currentFormula = prev.formula;
                    const formulaStillAvailable = selectedCenter.formulas.some((f: any) => f.fullText === currentFormula);
                    if (!formulaStillAvailable) {
                        updatedData.formula = '';
                    }
                }
            }
            
            return updatedData;
        });
    };

    const getStatusColor = (status: string) => {
        return getStatusBadgeClass(status) + ' border';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'submitted': return <AlertCircle className="w-4 h-4" />;
            case 'under_review': return <Clock className="w-4 h-4" />;
            case 'awaiting_documents': return <FileText className="w-4 h-4" />;
            case 'documents_pending': return <FileText className="w-4 h-4" />;
            case 'documents_rejected': return <XCircle className="w-4 h-4" />;
            case 'awaiting_payment': return <CreditCard className="w-4 h-4" />;
            case 'payment_pending': return <CreditCard className="w-4 h-4" />;
            case 'confirmed': return <CheckCircle className="w-4 h-4" />;
            case 'in_progress': return <Car className="w-4 h-4" />;
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'cancelled': return <XCircle className="w-4 h-4" />;
            case 'refunded': return <CreditCard className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    const getButtonVariant = (status: string): 'primary' | 'success' | 'danger' | 'outline' => {
        switch (status) {
            case 'confirmed': return 'success';
            case 'completed': return 'primary';
            case 'cancelled': return 'danger';
            case 'refunded': return 'outline';
            default: return 'outline';
        }
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return 'Non renseigné';
        
        // Si la date est déjà au format DD/MM/YYYY, la retourner directement
        if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            return dateString;
        }
        
        // Sinon, essayer de la parser comme ISO date
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Date invalide';
        }
        
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString: string): string => {
        if (!dateString) return 'Non renseigné';
        
        // Si c'est déjà un format français DD/MM/YYYY, ne pas ajouter l'heure
        if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            return dateString;
        }
        
        // Sinon, essayer de la parser comme ISO date
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Date invalide';
        }
        
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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

    if (error) {
        return (
            <AdminLayout title="Erreur">
                        <Alert type="error" message={error} />
                        <div className="mt-4">
                            <Button onClick={() => navigate('/admin/reservations')} variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour aux réservations
                            </Button>
                        </div>
            </AdminLayout>
        );
    }

    if (!reservation) {
        return (
            <AdminLayout title="Réservation introuvable">
                        <Alert type="error" message="Cette réservation n'existe pas ou a été supprimée." />
                        <div className="mt-4">
                            <Button onClick={() => navigate('/admin/reservations')} variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour aux réservations
                            </Button>
                        </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={`Réservation véhicule #${reservation.id}`}>
                    {/* Messages de succès et d'erreur */}
                    {successMessage && (
                        <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
                    )}
                    {error && (
                        <Alert type="error" message={error} onClose={() => setError(null)} />
                    )}

                    {/* En-tête avec navigation et statut */}
                    <div className="flex justify-between items-start mb-6">
                        <Button onClick={() => navigate('/admin/reservations')} variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Retour aux réservations
                        </Button>
                        
                        <div className={`flex items-center px-4 py-2 rounded-lg border ${getStatusColor(reservation.status)}`}>
                            {getStatusIcon(reservation.status)}
                            <span className="ml-2 font-medium">{getStatusLabel(reservation.status)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Colonne principale */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Section Client */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <User className="w-5 h-5 text-blue-600 mr-2" />
                                            <h2 className="text-lg font-semibold text-gray-900">Informations Client</h2>
                                        </div>
                                        {!isEditingClient && (
                                            <button
                                                onClick={() => handleEditSection('client')}
                                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                                            >
                                                <Edit2 className="w-3 h-3 mr-1" />
                                                Modifier
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="p-6">
                                    {isEditingClient ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500 mb-2 block">Nom *</label>
                                                    <input
                                                        type="text"
                                                        value={editedData.lastName || ''}
                                                        onChange={(e) => updateEditedData('lastName', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Nom de famille"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500 mb-2 block">Prénom *</label>
                                                    <input
                                                        type="text"
                                                        value={editedData.firstName || ''}
                                                        onChange={(e) => updateEditedData('firstName', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Prénom"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500 mb-2 block">Email *</label>
                                                    <input
                                                        type="email"
                                                        value={editedData.clientEmail || ''}
                                                        onChange={(e) => updateEditedData('clientEmail', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="email@exemple.com"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500 mb-2 block">Téléphone *</label>
                                                    <input
                                                        type="tel"
                                                        value={editedData.clientPhone || ''}
                                                        onChange={(e) => updateEditedData('clientPhone', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="06 XX XX XX XX"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500 mb-2 block">Date de naissance</label>
                                                    <input
                                                        type="date"
                                                        value={editedData.birthDate || ''}
                                                        onChange={(e) => updateEditedData('birthDate', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500 mb-2 block">Lieu de naissance</label>
                                                    <input
                                                        type="text"
                                                        value={editedData.birthPlace || ''}
                                                        onChange={(e) => updateEditedData('birthPlace', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Ville de naissance"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end space-x-2 pt-4 border-t">
                                                <button
                                                    onClick={() => handleCancelEditSection('client')}
                                                    disabled={sectionUpdateLoading === 'client'}
                                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 flex items-center"
                                                >
                                                    <X className="w-3 h-3 mr-1" />
                                                    Annuler
                                                </button>
                                                <button
                                                    onClick={() => handleSaveSection('client')}
                                                    disabled={sectionUpdateLoading === 'client'}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                                                >
                                                    {sectionUpdateLoading === 'client' ? (
                                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                                    ) : (
                                                        <Check className="w-3 h-3 mr-1" />
                                                    )}
                                                    Valider
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Nom complet</label>
                                                <p className="mt-1 text-sm text-gray-900">{reservation.user?.fullName || `${reservation.user?.firstName || ''} ${reservation.user?.lastName || ''}`.trim() || 'Non renseigné'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Email</label>
                                                <div className="mt-1 flex items-center">
                                                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                                    <p className="text-sm text-gray-900">{reservation.user?.email || 'Non renseigné'}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Téléphone</label>
                                                <div className="mt-1 flex items-center">
                                                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                                    <p className="text-sm text-gray-900">{reservation.user?.phone || 'Non renseigné'}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Date de naissance</label>
                                                <div className="mt-1 flex items-center">
                                                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                    <p className="text-sm text-gray-900">
                                                        {reservation.user?.birthDate ? new Date(reservation.user.birthDate).toLocaleDateString('fr-FR') : 'Non renseigné'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Lieu de naissance</label>
                                                <div className="mt-1 flex items-center">
                                                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                                    <p className="text-sm text-gray-900">{reservation.user?.birthPlace || 'Non renseigné'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section Réservation */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Car className="w-5 h-5 text-blue-600 mr-2" />
                                            <h2 className="text-lg font-semibold text-gray-900">Détails de la Réservation</h2>
                                        </div>
                                        {!isEditingReservation && (
                                            <button
                                                onClick={() => handleEditSection('reservation')}
                                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                                            >
                                                <Edit2 className="w-3 h-3 mr-1" />
                                                Modifier
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="p-6">
                                    {isEditingReservation ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500 mb-2 block">Date de début</label>
                                                    <input
                                                        type="date"
                                                        value={editedData.startDate || ''}
                                                        onChange={(e) => updateEditedData('startDate', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500 mb-2 block">Date de fin</label>
                                                    <input
                                                        type="date"
                                                        value={editedData.endDate || ''}
                                                        onChange={(e) => updateEditedData('endDate', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500 mb-2 block">Lieu de prise en charge</label>
                                                    <input
                                                        type="text"
                                                        value={editedData.pickupLocation || ''}
                                                        onChange={(e) => updateEditedData('pickupLocation', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Lieu de prise en charge"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500 mb-2 block">Lieu de retour</label>
                                                    <input
                                                        type="text"
                                                        value={editedData.returnLocation || ''}
                                                        onChange={(e) => updateEditedData('returnLocation', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Lieu de retour"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end space-x-2 pt-4 border-t">
                                                <button
                                                    onClick={() => handleCancelEditSection('reservation')}
                                                    disabled={sectionUpdateLoading === 'reservation'}
                                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 flex items-center"
                                                >
                                                    <X className="w-3 h-3 mr-1" />
                                                    Annuler
                                                </button>
                                                <button
                                                    onClick={() => handleSaveSection('reservation')}
                                                    disabled={sectionUpdateLoading === 'reservation'}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                                                >
                                                    {sectionUpdateLoading === 'reservation' ? (
                                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                                    ) : (
                                                        <Check className="w-3 h-3 mr-1" />
                                                    )}
                                                    Valider
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Date de début</label>
                                                <div className="mt-1 flex items-center">
                                                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                    <p className="text-sm text-gray-900">{reservation.startDate ? formatDate(reservation.startDate) : reservation.date}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Date de fin</label>
                                                <div className="mt-1 flex items-center">
                                                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                    <p className="text-sm text-gray-900">{reservation.endDate ? formatDate(reservation.endDate) : reservation.date}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Lieu de prise en charge</label>
                                                <div className="mt-1 flex items-center">
                                                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                                    <p className="text-sm text-gray-900">{reservation.pickupLocation || 'Non renseigné'}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Lieu de retour</label>
                                                <div className="mt-1 flex items-center">
                                                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                                    <p className="text-sm text-gray-900">{reservation.returnLocation || 'Non renseigné'}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Véhicule assigné</label>
                                                <p className="text-sm text-gray-900">{reservation.vehicleAssigned || 'Aucun véhicule assigné'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section Examen */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Building className="w-5 h-5 text-blue-600 mr-2" />
                                            <h2 className="text-lg font-semibold text-gray-900">Détails de l'Examen</h2>
                                        </div>
                                        {!isEditingExam && (
                                            <button
                                                onClick={() => handleEditSection('exam')}
                                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                                            >
                                                <Edit2 className="w-3 h-3 mr-1" />
                                                Modifier
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="p-6">
                                    {isEditingExam ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500 mb-2 block">Centre d'examen *</label>
                                                    <select
                                                        value={editedData.examCenter || ''}
                                                        onChange={(e) => updateEditedData('examCenter', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="">Sélectionner un centre...</option>
                                                        {centersWithFormulas.map(center => (
                                                            <option key={center.id} value={center.name}>
                                                                {center.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500 mb-2 block">Date d'examen *</label>
                                                    <input
                                                        type="date"
                                                        value={editedData.date ? editedData.date.split('/').reverse().join('-') : ''}
                                                        onChange={(e) => {
                                                            // Convertir de YYYY-MM-DD vers DD/MM/YYYY
                                                            const dateParts = e.target.value.split('-');
                                                            const formattedDate = dateParts.reverse().join('/');
                                                            updateEditedData('date', formattedDate);
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500 mb-2 block">Heure d'examen</label>
                                                    <input
                                                        type="time"
                                                        value={editedData.examTime || ''}
                                                        onChange={(e) => updateEditedData('examTime', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500 mb-2 block">Formule</label>
                                                    <select
                                                        value={editedData.formula || ''}
                                                        onChange={(e) => updateEditedData('formula', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        disabled={!editedData.examCenter}
                                                    >
                                                        <option value="">
                                                            {editedData.examCenter ? 'Sélectionner une formule...' : 'Sélectionnez d\'abord un centre d\'examen'}
                                                        </option>
                                                        {availableFormulas.map(formula => (
                                                            <option key={formula.id} value={formula.fullText}>
                                                                {formula.name} ({formula.formattedPrice})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="flex justify-end space-x-2 pt-4 border-t">
                                                <button
                                                    onClick={() => handleCancelEditSection('exam')}
                                                    disabled={sectionUpdateLoading === 'exam'}
                                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 flex items-center"
                                                >
                                                    <X className="w-3 h-3 mr-1" />
                                                    Annuler
                                                </button>
                                                <button
                                                    onClick={() => handleSaveSection('exam')}
                                                    disabled={sectionUpdateLoading === 'exam'}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                                                >
                                                    {sectionUpdateLoading === 'exam' ? (
                                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                                    ) : (
                                                        <Check className="w-3 h-3 mr-1" />
                                                    )}
                                                    Valider
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Centre d'examen</label>
                                                <p className="mt-1 text-sm text-gray-900">{reservation.examCenter}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Date d'examen</label>
                                                <div className="mt-1 flex items-center">
                                                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                    <p className="text-sm text-gray-900">{reservation.date}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Heure d'examen</label>
                                                <div className="mt-1 flex items-center">
                                                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                                                    <p className="text-sm text-gray-900">{reservation.examTime || 'Non renseigné'}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Formule</label>
                                                <p className="mt-1 text-sm text-gray-900">{reservation.formula}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section Financière */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                                            <h2 className="text-lg font-semibold text-gray-900">Informations Financières</h2>
                                        </div>
                                        {!isEditingFinance && (
                                            <button
                                                onClick={() => handleEditSection('finance')}
                                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                                            >
                                                <Edit2 className="w-3 h-3 mr-1" />
                                                Modifier
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="p-6">
                                    {isEditingFinance ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500 mb-2 block">Prix total *</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={editedData.totalPrice || ''}
                                                            onChange={(e) => updateEditedData('totalPrice', e.target.value)}
                                                            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="0.00"
                                                        />
                                                        <span className="absolute right-3 top-2 text-gray-500">€</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500 mb-2 block">Financement</label>
                                                    <select
                                                        value={editedData.financing || ''}
                                                        onChange={(e) => updateEditedData('financing', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="">Sélectionner...</option>
                                                        <option value="Personnel">Personnel</option>
                                                        <option value="CPF">CPF</option>
                                                        <option value="Pôle Emploi">Pôle Emploi</option>
                                                        <option value="Entreprise">Entreprise</option>
                                                        <option value="Autre">Autre</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 mb-2 block">Mode de paiement</label>
                                                <textarea
                                                    rows={3}
                                                    value={editedData.paymentMethod || ''}
                                                    onChange={(e) => updateEditedData('paymentMethod', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Ex: Virement bancaire IBAN: ... BIC: ..."
                                                />
                                            </div>
                                            <div className="flex justify-end space-x-2 pt-4 border-t">
                                                <button
                                                    onClick={() => handleCancelEditSection('finance')}
                                                    disabled={sectionUpdateLoading === 'finance'}
                                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 flex items-center"
                                                >
                                                    <X className="w-3 h-3 mr-1" />
                                                    Annuler
                                                </button>
                                                <button
                                                    onClick={() => handleSaveSection('finance')}
                                                    disabled={sectionUpdateLoading === 'finance'}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                                                >
                                                    {sectionUpdateLoading === 'finance' ? (
                                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                                    ) : (
                                                        <Check className="w-3 h-3 mr-1" />
                                                    )}
                                                    Valider
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Prix total</label>
                                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                                    {reservation.totalPrice ? `${reservation.totalPrice}€` : 'Non renseigné'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Financement</label>
                                                <p className="mt-1 text-sm text-gray-900">{reservation.financing || 'Non renseigné'}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-sm font-medium text-gray-500">Mode de paiement</label>
                                                <p className="mt-1 text-sm text-gray-900">{reservation.paymentMethod || 'Non renseigné'}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-medium text-gray-500">Facture</label>
                                                    <button
                                                        onClick={() => {
                                                            setUploadingInvoice(true);
                                                            setShowUploadModal(true);
                                                        }}
                                                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3 mr-1" />
                                                        {documents.some(doc => doc.title.startsWith('INVOICE_') || doc.title.startsWith('[FACTURE]')) ? 'Remplacer' : 'Ajouter'}
                                                    </button>
                                                </div>
                                                {(() => {
                                                    // Trouver la facture dans les documents
                                                    const invoice = documents.find(doc => 
                                                        doc.title.startsWith('INVOICE_') || doc.title.startsWith('[FACTURE]')
                                                    );
                                                    
                                                    return invoice ? (
                                                        <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center">
                                                                    <FileText className="w-4 h-4 text-blue-600 mr-2" />
                                                                    <div>
                                                                        <span className="text-sm font-medium text-gray-900">{invoice.title}</span>
                                                                        <p className="text-xs text-gray-500">
                                                                            {invoice.fileType.toUpperCase()} • {invoice.fileSize} • 
                                                                            Uploadé le {new Date(invoice.uploadedAt).toLocaleDateString('fr-FR')}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <a
                                                                        href={invoice.downloadUrl}
                                                                        className="text-blue-600 hover:text-blue-700 text-sm"
                                                                        title="Télécharger"
                                                                    >
                                                                        <Download className="w-4 h-4" />
                                                                    </a>
                                                                    <button 
                                                                        className="text-red-600 hover:text-red-700 text-sm"
                                                                        title="Supprimer"
                                                                        onClick={() => handleDocumentDelete(invoice.id)}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="mt-2 text-sm text-gray-500">Aucune facture uploadée</p>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section Notes */}
                            {reservation.notes && (
                                <div className="bg-white rounded-lg shadow">
                                    <div className="p-6 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
                                                <h2 className="text-lg font-semibold text-gray-900">Notes et Commentaires</h2>
                                            </div>
                                            {!isEditingNotes && (
                                                <button
                                                    onClick={() => handleEditSection('notes')}
                                                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                                                >
                                                    <Edit2 className="w-3 h-3 mr-1" />
                                                    Modifier
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        {isEditingNotes ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500 mb-2 block">Notes et commentaires</label>
                                                    <textarea
                                                        rows={5}
                                                        value={editedData.notes || ''}
                                                        onChange={(e) => updateEditedData('notes', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Ajoutez vos notes et commentaires..."
                                                    />
                                                </div>
                                                <div className="flex justify-end space-x-2 pt-4 border-t">
                                                    <button
                                                        onClick={() => handleCancelEditSection('notes')}
                                                        disabled={sectionUpdateLoading === 'notes'}
                                                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 flex items-center"
                                                    >
                                                        <X className="w-3 h-3 mr-1" />
                                                        Annuler
                                                    </button>
                                                    <button
                                                        onClick={() => handleSaveSection('notes')}
                                                        disabled={sectionUpdateLoading === 'notes'}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                                                    >
                                                        {sectionUpdateLoading === 'notes' ? (
                                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                                        ) : (
                                                            <Check className="w-3 h-3 mr-1" />
                                                        )}
                                                        Valider
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{reservation.notes}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Section Documents */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <FileText className="w-5 h-5 text-blue-600 mr-2" />
                                            <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setUploadingInvoice(false);
                                                setShowUploadModal(true);
                                            }}
                                            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Ajouter un document
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6">
                                    {/* Messages de succès/erreur */}
                                    {uploadSuccess && (
                                        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
                                            <p className="flex items-center">
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                {uploadSuccess}
                                            </p>
                                        </div>
                                    )}

                                    {uploadError && (
                                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                                            <p className="flex items-center">
                                                <XCircle className="mr-2 h-4 w-4" />
                                                {uploadError}
                                            </p>
                                        </div>
                                    )}

                                    {/* Documents de permis de conduire */}
                                    {(reservation.user?.driverLicenseFrontFile || reservation.user?.driverLicenseBackFile) && (
                                        <div className="mb-6">
                                            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                                                Documents de permis de conduire
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {reservation.user.driverLicenseFrontFile && (
                                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                        <div className="p-3 bg-gray-50 border-b">
                                                            <h4 className="text-sm font-medium text-gray-900">Permis - Recto</h4>
                                                        </div>
                                                        <div className="p-3">
                                                            <FileDisplay
                                                                fileName={reservation.user.driverLicenseFrontFile}
                                                                baseUrl="/uploads/licenses"
                                                                title="Permis de conduire - Recto"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                {reservation.user.driverLicenseBackFile && (
                                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                        <div className="p-3 bg-gray-50 border-b">
                                                            <h4 className="text-sm font-medium text-gray-900">Permis - Verso</h4>
                                                        </div>
                                                        <div className="p-3">
                                                            <FileDisplay
                                                                fileName={reservation.user.driverLicenseBackFile}
                                                                baseUrl="/uploads/licenses"
                                                                title="Permis de conduire - Verso"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Autres documents */}
                                    <div className="mb-4">
                                        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                            <FileText className="w-4 h-4 mr-2 text-green-600" />
                                            Autres documents
                                        </h3>
                                    </div>

                                    {/* Liste des documents (exclure les factures) */}
                                    {documents.filter(doc => !doc.title.startsWith('INVOICE_') && !doc.title.startsWith('[FACTURE]')).length > 0 ? (
                                        <div className="space-y-3">
                                            {documents.filter(doc => !doc.title.startsWith('INVOICE_') && !doc.title.startsWith('[FACTURE]')).map((document) => (
                                                <div key={document.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                                    <div className="flex items-center">
                                                        <FileText className="h-8 w-8 text-gray-400 mr-3" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{document.title}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {document.fileType.toUpperCase()} • {document.fileSize} • 
                                                                Uploadé le {new Date(document.uploadedAt).toLocaleDateString('fr-FR')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <a
                                                            href={document.downloadUrl}
                                                            download
                                                            className="inline-flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                                        >
                                                            <Download className="h-3 w-3 mr-1" />
                                                            Télécharger
                                                        </a>
                                                        <button
                                                            onClick={() => handleDocumentDelete(document.id)}
                                                            className="inline-flex items-center px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                                        >
                                                            <Trash2 className="h-3 w-3 mr-1" />
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun document</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Aucun document n'a encore été uploadé pour cette réservation.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Colonne latérale */}
                        <div className="space-y-6">
                            {/* Actions rapides */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
                                </div>
                                <div className="p-6 space-y-3">
                                    {/* Bouton dropdown pour changer le statut */}
                                    <div className="relative">
                                        <button 
                                            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                            className={`w-full px-4 py-2 inline-flex items-center justify-center text-sm leading-5 font-semibold rounded-lg cursor-pointer hover:opacity-80 border ${getStatusColor(reservation.status)}`}
                                        >
                                            {getStatusIcon(reservation.status)}
                                            <span className="ml-2">{getStatusLabel(reservation.status)}</span>
                                            <ChevronDown className="ml-2 h-4 w-4" />
                                        </button>
                                        
                                        {/* Dropdown menu */}
                                        {showStatusDropdown && (
                                            <div className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg z-50 border border-gray-200">
                                                <div className="py-1">
                                                    {Array.isArray(availableTransitions) && availableTransitions.length > 0 ? (
                                                        <>
                                                            {availableTransitions[0]?.toStatuses
                                                                ?.filter((transition: any) => transition.status !== reservation.status)
                                                                ?.map((transition: any) => (
                                                                    <button
                                                                        key={transition.status}
                                                                        onClick={() => {
                                                                            requestStatusChange(transition.status);
                                                                            setShowStatusDropdown(false);
                                                                        }}
                                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                                                    >
                                                                        <div className="flex items-center">
                                                                            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${transition.color}`}></span>
                                                                            {transition.label}
                                                                        </div>
                                                                    </button>
                                                                )) 
                                                            }
                                                            {(!availableTransitions[0]?.toStatuses?.length) && (
                                                                <div className="px-4 py-2 text-sm text-gray-500 italic">
                                                                    Aucune action disponible
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="px-4 py-2 text-sm text-gray-500 italic">
                                                            Chargement des statuts...
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Message informatif */}
                                    {Array.isArray(availableTransitions) && availableTransitions.length > 0 ? (
                                        <div className="text-center text-gray-500 text-xs py-2">
                                            Cliquez sur le bouton ci-dessus pour changer le statut
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500 text-sm py-4">
                                            Chargement des actions disponibles...
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Assignation de véhicule */}
                            {(['submitted', 'under_review', 'confirmed', 'awaiting_payment', 'payment_pending'].includes(reservation.status)) && (
                                <div className="bg-white rounded-lg shadow">
                                    <div className="p-6 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900">Assignation Véhicule</h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            <select
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                value={selectedVehicle}
                                                onChange={(e) => setSelectedVehicle(e.target.value)}
                                            >
                                                <option value="">Sélectionner un véhicule</option>
                                                {availableVehicles.map((vehicle, index) => (
                                                    <option key={index} value={vehicle}>{vehicle}</option>
                                                ))}
                                            </select>
                                            <Button
                                                onClick={handleAssignVehicle}
                                                disabled={!selectedVehicle || selectedVehicle === reservation.vehicleAssigned}
                                                className="w-full"
                                            >
                                                <Car className="w-4 h-4 mr-2" />
                                                {reservation.vehicleAssigned ? 'Changer le véhicule' : 'Assigner le véhicule'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Informations système */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Informations Système</h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">ID Réservation</label>
                                        <p className="mt-1 text-sm text-gray-900">#{reservation.id}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Créée le</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {reservation.createdAt ? formatDateTime(reservation.createdAt) : 'Non renseigné'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Dernière modification</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {reservation.updatedAt ? formatDateTime(reservation.updatedAt) : 'Non renseigné'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

            {/* Modal de confirmation pour changement de statut */}
            {showStatusConfirmModal && pendingStatusChange && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 xl:w-2/5 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            {/* Header */}
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
                                                Cette action déclenchera l'envoi d'un email automatique à l'utilisateur.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Utilisateur concerné :</label>
                                        <p className="text-base font-semibold text-gray-900">{pendingStatusChange.studentName}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Statut actuel :</label>
                                            <div className="mt-1">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(pendingStatusChange.currentStatus)}`}>
                                                    {getReservationStatusLabel(pendingStatusChange.currentStatus, 'vehicle')}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Nouveau statut :</label>
                                            <div className="mt-1">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(pendingStatusChange.newStatus)}`}>
                                                    {getReservationStatusLabel(pendingStatusChange.newStatus, 'vehicle')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Email qui sera envoyé :</label>
                                        <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-center">
                                                <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-sm text-blue-800 font-medium">
                                                    {getEmailDescription(pendingStatusChange.newStatus)}
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

                            {/* Boutons */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={cancelStatusChange}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleStatusChange}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {loading ? 'Traitement...' : 'Confirmer et envoyer l\'email'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal d'upload de documents */}
            {showUploadModal && (
                <DocumentUploadModal
                    isOpen={showUploadModal}
                    onClose={() => {
                        setShowUploadModal(false);
                        setUploadError(null);
                        setUploadingInvoice(false);
                    }}
                    onUpload={handleDocumentUpload}
                    uploading={uploading}
                    isInvoice={uploadingInvoice}
                />
            )}
        </AdminLayout>
    );
};

// Composant Modal d'Upload de Documents pour Admin
interface DocumentUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File, title: string) => void;
    uploading: boolean;
    isInvoice?: boolean;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
    isOpen,
    onClose,
    onUpload,
    uploading,
    isInvoice = false
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [title, setTitle] = useState<string>('');
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (file: File) => {
        setSelectedFile(file);
        if (!title) {
            // Auto-générer le titre basé sur le nom du fichier
            const fileName = file.name.replace(/\.[^/.]+$/, ""); // Enlever l'extension
            setTitle(fileName);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedFile || !title.trim()) {
            return;
        }

        onUpload(selectedFile, title.trim());
    };

    const resetForm = () => {
        setSelectedFile(null);
        setTitle('');
        setDragActive(false);
    };

    const handleClose = () => {
        if (!uploading) {
            resetForm();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
                if (e.target === e.currentTarget && !uploading) {
                    handleClose();
                }
            }}
        >
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full"
                 onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {isInvoice ? 'Ajouter une facture' : 'Ajouter un document'}
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={uploading}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        {/* Titre du document */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {isInvoice ? 'Titre de la facture *' : 'Titre du document *'}
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={isInvoice ? "Ex: Facture formation taxi VTC..." : "Ex: Justificatif, Document administratif..."}
                                required
                                disabled={uploading}
                            />
                        </div>

                        {/* Zone de drop de fichier */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fichier *
                            </label>
                            
                            <div
                                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                                    dragActive 
                                        ? 'border-blue-400 bg-blue-50' 
                                        : selectedFile 
                                            ? 'border-green-400 bg-green-50' 
                                            : 'border-gray-300 hover:border-gray-400'
                                }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                {selectedFile ? (
                                    <div className="text-center">
                                        <FileText className="mx-auto h-12 w-12 text-green-500" />
                                        <p className="mt-2 text-sm font-medium text-green-900">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-xs text-green-600 mt-1">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedFile(null)}
                                            className="mt-2 text-xs text-red-600 hover:text-red-800"
                                            disabled={uploading}
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="admin-file-upload"
                                        className="cursor-pointer block"
                                    >
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-600">
                                            <span className="font-medium">Cliquez pour choisir</span> ou glissez-déposez
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            PDF, DOC, DOCX, JPG, PNG (max 10MB)
                                        </p>
                                    </label>
                                )}
                                
                                <input
                                    type="file"
                                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    className="hidden"
                                    id="admin-file-upload"
                                    disabled={uploading}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                            disabled={uploading}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedFile || !title.trim() || uploading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Upload en cours...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4" />
                                    Uploader
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VehicleReservationDetail;