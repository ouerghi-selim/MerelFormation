import React, { useState, useCallback, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Eye, GraduationCap, Check, X, Users, Archive, FileText, Download, Building2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import DeletedUsersTable from '../../components/admin/DeletedUsersTable';
import { useNotification } from '../../contexts/NotificationContext';
import useDataFetching from '../../hooks/useDataFetching';
import { adminUsersApi, studentDocumentsApi, documentsApi } from '../../services/api';
import { useLocation } from 'react-router-dom';


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

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive: boolean;
    lastLogin: string | null;
    phone?: string;
    company?: Company;
}

interface Formation {
    id: number;
    title: string;
    type: string;
    status: string;
    startDate: string;
    endDate: string;
}

interface Document {
    id: number;
    title: string;
    type: string;
    category: string;
    source: string;
    sourceTitle: string;
    date: string;
    uploadedAt: string;
    fileName: string;
    downloadUrl: string;
    validationStatus?: string;
    validatedAt?: string;
    validatedBy?: {
        firstName: string;
        lastName: string;
    };
    rejectionReason?: string;
}

const StudentsAdmin: React.FC = () => {
    const { addToast } = useNotification();
    const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
    const [userFormations, setUserFormations] = useState<Formation[]>([]);
    const [loadingFormations, setLoadingFormations] = useState(false);
    const [userDocuments, setUserDocuments] = useState<Document[]>([]);
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
    const [processing, setProcessing] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState<User | null>(null);
    
    // States pour la validation des documents
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [documentToValidate, setDocumentToValidate] = useState<Document | null>(null);
    const [validationAction, setValidationAction] = useState<'validate' | 'reject' | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [validationProcessing, setValidationProcessing] = useState(false);

    // Nouvel étudiant form state
    const [newStudent, setNewStudent] = useState<Omit<User, 'id'>>({
        firstName: '',
        lastName: '',
        email: '',
        role: 'ROLE_STUDENT',
        isActive: true,
        lastLogin: null,
        phone: ''
    });
    const fetchStudents = useCallback(() => {
        return adminUsersApi.getStudents()
            .then(response => response.data);
    }, []); // tableau vide = fonction stable
    // Utiliser le hook personnalisé pour charger les données
    const {
        data: students = [],
        loading,
        error,
        setData: setStudents,
        setError,
        refetch
    } = useDataFetching<User[]>({
        fetchFn: fetchStudents
    });

    const location = useLocation();
    useEffect(() => {
        // Vérifie si le paramètre showAddModal est présent dans l'URL
        const params = new URLSearchParams(location.search);
        if (params.get('showAddModal') === 'true') {
            setShowAddModal(true);
        }
    }, [location]);
    // Validation du formulaire (ajout et édition)
    const validateStudentForm = (student: Omit<User, 'id'> | User) => {
        const errors: {[key: string]: string} = {};

        if (!student.firstName.trim())
            errors.firstName = 'Le prénom est requis';
        if (!student.lastName.trim())
            errors.lastName = 'Le nom est requis';
        if (!student.email.trim())
            errors.email = 'L\'email est requis';
        else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(student.email))
            errors.email = 'Format d\'email invalide';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const confirmDelete = (user: User) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const viewDetails = async (user: User) => {
        setSelectedStudent(user);
        setShowDetailsModal(true);

        // Charger les formations de l'étudiant
        try {
            setLoadingFormations(true);
            const response = await adminUsersApi.getSessions(user.id);
            setUserFormations(response.data);
        } catch (err) {
            console.error('Error fetching user formations:', err);
            addToast('Erreur lors du chargement des formations de l\'élève', 'error');
        } finally {
            setLoadingFormations(false);
        }

        // Charger les documents d'inscription de l'étudiant
        try {
            setLoadingDocuments(true);
            const documentsResponse = await adminUsersApi.getDocuments(user.id);
            setUserDocuments(documentsResponse.data);
        } catch (err) {
            console.error('Error fetching user documents:', err);
            addToast('Erreur lors du chargement des documents d\'inscription', 'error');
        } finally {
            setLoadingDocuments(false);
        }
    };

    const openEditModal = (student: User) => {
        setStudentToEdit({...student});
        setFormErrors({});
        setShowEditModal(true);
    };

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStudentForm(newStudent)) {
            return;
        }

        try {
            setProcessing(true);
            const response = await adminUsersApi.create(newStudent);

            // Ajouter le nouvel étudiant à la liste
            setStudents([...students, response.data]);
            addToast('Élève ajouté avec succès', 'success');

            // Réinitialiser le formulaire
            setNewStudent({
                firstName: '',
                lastName: '',
                email: '',
                role: 'ROLE_STUDENT',
                isActive: true,
                lastLogin: null,
                phone: ''
            });

            setShowAddModal(false);
        } catch (err) {
            console.error('Error adding student:', err);
            addToast('Erreur lors de l\'ajout de l\'élève', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleEditStudent = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!studentToEdit) return;

        if (!validateStudentForm(studentToEdit)) {
            return;
        }

        try {
            setProcessing(true);
            await adminUsersApi.update(studentToEdit.id, studentToEdit);

            // Mettre à jour la liste
            setStudents(students.map(s => s.id === studentToEdit.id ? studentToEdit : s));
            addToast('Élève mis à jour avec succès', 'success');

            setShowEditModal(false);
        } catch (err) {
            console.error('Error updating student:', err);
            addToast('Erreur lors de la mise à jour de l\'élève', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!userToDelete) return;

        try {
            setProcessing(true);
            await adminUsersApi.delete(userToDelete.id);

            // Mettre à jour la liste
            setStudents(students.filter(s => s.id !== userToDelete.id));
            addToast('Élève supprimé avec succès', 'success');

            setShowDeleteModal(false);
            setUserToDelete(null);
        } catch (err) {
            console.error('Error deleting student:', err);
            addToast('Erreur lors de la suppression de l\'élève', 'error');
        } finally {
            setProcessing(false);
        }
    };

    // Fonctions de validation des documents
    const handleValidateDocument = (document: Document) => {
        setDocumentToValidate(document);
        setValidationAction('validate');
        setShowValidationModal(true);
    };

    const handleRejectDocument = (document: Document) => {
        setDocumentToValidate(document);
        setValidationAction('reject');
        setRejectionReason('');
        setShowValidationModal(true);
    };

    const handleValidationSubmit = async () => {
        if (!documentToValidate || !validationAction) return;

        try {
            setValidationProcessing(true);

            if (validationAction === 'validate') {
                await documentsApi.validateDocument(documentToValidate.id);
                addToast('Document validé avec succès', 'success');
            } else {
                if (!rejectionReason.trim()) {
                    addToast('La raison du rejet est obligatoire', 'error');
                    return;
                }
                await documentsApi.rejectDocument(documentToValidate.id, rejectionReason);
                addToast('Document rejeté avec succès', 'success');
            }

            // Rafraîchir les documents de l'étudiant
            if (selectedStudent) {
                await fetchUserDocuments(selectedStudent.id);
            }

            setShowValidationModal(false);
            setDocumentToValidate(null);
            setValidationAction(null);
            setRejectionReason('');

        } catch (err) {
            console.error('Error processing document validation:', err);
            addToast('Erreur lors du traitement du document', 'error');
        } finally {
            setValidationProcessing(false);
        }
    };

    const getValidationStatusBadge = (document: Document) => {
        const status = document.validationStatus || 'en_attente';
        
        switch (status) {
            case 'valide':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Validé
                    </span>
                );
            case 'rejete':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Rejeté
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        En attente
                    </span>
                );
        }
    };

    // Fonction pour rafraîchir les documents d'un utilisateur
    const fetchUserDocuments = async (userId: number) => {
        try {
            setLoadingDocuments(true);
            const documentsResponse = await adminUsersApi.getDocuments(userId);
            setUserDocuments(documentsResponse.data);
        } catch (err) {
            console.error('Error fetching user documents:', err);
            addToast('Erreur lors du chargement des documents', 'error');
        } finally {
            setLoadingDocuments(false);
        }
    };

    // Configuration des colonnes pour le DataTable
    const columns = [
        {
            title: 'Nom',
            field: (row: User) => (
                <div className="flex items-center">
                    <GraduationCap className="h-5 w-5 text-blue-600 mr-3" />
                    <div className="text-sm font-medium text-gray-900">
                        {row.firstName} {row.lastName}
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Email',
            field: 'email' as keyof User,
            sortable: true
        },
        {
            title: 'Téléphone',
            field: (row: User) => row.phone || '-',
            sortable: false
        },
        {
            title: 'Statut',
            field: (row: User) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    row.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {row.isActive ? 'Actif' : 'Inactif'}
                </span>
            ),
            sortable: false
        },
        {
            title: 'Dernière connexion',
            field: (row: User) => row.lastLogin || 'Jamais',
            sortable: true
        }
    ];

    // Rendu des actions pour chaque ligne
    const renderActions = (student: User) => (
        <div className="flex justify-end space-x-2">
            <button
                onClick={() => viewDetails(student)}
                className="text-blue-600 hover:text-blue-900"
                title="Voir détails"
            >
                <Eye className="h-5 w-5" />
            </button>
            <button
                onClick={() => openEditModal(student)}
                className="text-indigo-600 hover:text-indigo-900"
                title="Modifier"
            >
                <Edit className="h-5 w-5" />
            </button>
            <button
                onClick={() => confirmDelete(student)}
                className="text-red-600 hover:text-red-900"
                title="Supprimer"
            >
                <Trash2 className="h-5 w-5" />
            </button>
        </div>
    );

    // Rendu du formulaire d'étudiant (utilisé dans les modals d'ajout et d'édition)
    const renderStudentForm = (student: Omit<User, 'id'> | User, setStudent: React.Dispatch<React.SetStateAction<any>>) => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom*
                </label>
                <input
                    type="text"
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.firstName ? 'border-red-500' : ''
                    }`}
                    value={student.firstName}
                    onChange={(e) => setStudent({...student, firstName: e.target.value})}
                />
                {formErrors.firstName && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.firstName}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom*
                </label>
                <input
                    type="text"
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.lastName ? 'border-red-500' : ''
                    }`}
                    value={student.lastName}
                    onChange={(e) => setStudent({...student, lastName: e.target.value})}
                />
                {formErrors.lastName && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.lastName}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email*
                </label>
                <input
                    type="email"
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.email ? 'border-red-500' : ''
                    }`}
                    value={student.email}
                    onChange={(e) => setStudent({...student, email: e.target.value})}
                />
                {formErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                </label>
                <input
                    type="tel"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={student.phone || ''}
                    onChange={(e) => setStudent({...student, phone: e.target.value})}
                    placeholder="06 12 34 56 78"
                />
            </div>

            <div className="flex items-center mt-2">
                <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={student.isActive}
                    onChange={(e) => setStudent({...student, isActive: e.target.checked})}
                />
                <span className="ml-2 text-sm text-gray-700">
                    Compte actif
                </span>
            </div>
        </div>
    );

    // Calcul des statistiques
    const activeStudents = students ? students.filter(s => s.isActive).length : 0;
    const inactiveStudents = students ? students.filter(s => !s.isActive).length : 0;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <AdminHeader
                    title="Gestion des élèves"
                    breadcrumbItems={[
                        { label: 'Admin', path: '/admin' },
                        { label: 'Utilisateurs', path: '/admin/users' },
                        { label: 'Élèves' }
                    ]}
                />

                <div className="p-6">
                    {error && (
                        <Alert
                            type="error"
                            message={error}
                            onClose={() => setError(null)}
                        />
                    )}

                    {/* Onglets */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('active')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'active'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Users className="w-5 h-5 inline mr-2" />
                                Élèves actifs
                            </button>
                            <button
                                onClick={() => setActiveTab('deleted')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'deleted'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Archive className="w-5 h-5 inline mr-2" />
                                Élèves supprimés
                            </button>
                        </nav>
                    </div>

                    {/* Contenu selon l'onglet actif */}
                    {activeTab === 'active' && (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <Button
                                    onClick={() => setShowAddModal(true)}
                                    icon={<UserPlus className="h-5 w-5" />}
                                >
                                    Nouvel élève
                                </Button>
                            </div>
                        </>
                    )}

                    {activeTab === 'active' && (
                        <DataTable<User>
                            data={students || []}
                            columns={columns}
                            keyField="id"
                            loading={loading}
                            actions={renderActions}
                            searchFields={['firstName', 'lastName', 'email']}
                            emptyMessage="Aucun élève trouvé"
                        />
                    )}

                    {activeTab === 'deleted' && <DeletedUsersTable />}

                    {/* Statistiques des élèves */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <GraduationCap className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-gray-500 text-sm">Total élèves</h3>
                                    <p className="text-2xl font-semibold">{students.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <Check className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-gray-500 text-sm">Élèves actifs</h3>
                                    <p className="text-2xl font-semibold">{activeStudents}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center">
                                <div className="bg-red-100 p-3 rounded-full">
                                    <X className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-gray-500 text-sm">Élèves inactifs</h3>
                                    <p className="text-2xl font-semibold">{inactiveStudents}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal d'ajout d'élève */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Ajouter un élève"
                footer={
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowAddModal(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            loading={processing}
                            onClick={handleAddStudent}
                        >
                            Ajouter
                        </Button>
                    </div>
                }
            >
                <form onSubmit={handleAddStudent}>
                    {renderStudentForm(newStudent, setNewStudent)}
                </form>
            </Modal>

            {/* Modal d'édition d'élève */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Modifier l'élève"
                footer={
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowEditModal(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            loading={processing}
                            onClick={handleEditStudent}
                        >
                            Enregistrer
                        </Button>
                    </div>
                }
            >
                {studentToEdit && (
                    <form onSubmit={handleEditStudent}>
                        {renderStudentForm(studentToEdit, setStudentToEdit)}
                    </form>
                )}
            </Modal>

            {/* Modal de confirmation de suppression */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Confirmer la suppression"
                footer={
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="danger"
                            loading={processing}
                            onClick={handleDelete}
                        >
                            Supprimer
                        </Button>
                    </div>
                }
            >
                <p>
                    Êtes-vous sûr de vouloir supprimer l'élève "{userToDelete?.firstName} {userToDelete?.lastName}" ?
                    Cette action est irréversible.
                </p>
            </Modal>

            {/* Modal de détails de l'élève */}
            <Modal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                title="Détails de l'élève"
                maxWidth="max-w-2xl"
                footer={
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowDetailsModal(false)}
                        >
                            Fermer
                        </Button>
                        {selectedStudent && (
                            <Button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    openEditModal(selectedStudent);
                                }}
                            >
                                Modifier
                            </Button>
                        )}
                    </div>
                }
            >
                {selectedStudent && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Nom complet</h4>
                                <p className="text-base font-medium">{selectedStudent.firstName} {selectedStudent.lastName}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                                <p className="text-base">{selectedStudent.email}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Téléphone</h4>
                                <p className="text-base">{selectedStudent.phone || '-'}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Statut</h4>
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    selectedStudent.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {selectedStudent.isActive ? 'Actif' : 'Inactif'}
                                </span>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Dernière connexion</h4>
                                <p className="text-base">{selectedStudent.lastLogin || 'Jamais'}</p>
                            </div>
                        </div>

                        {/* Section Entreprise */}
                        {selectedStudent.company && (
                            <div className="border-t border-gray-200 mt-6 pt-6">
                                <h4 className="font-medium mb-4 flex items-center">
                                    <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                                    Entreprise / Employeur
                                </h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h5 className="text-sm font-medium text-gray-500 mb-1">Nom de l'entreprise</h5>
                                            <p className="text-base font-medium">{selectedStudent.company.name}</p>
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-medium text-gray-500 mb-1">SIRET</h5>
                                            <p className="text-base font-mono">{selectedStudent.company.siret}</p>
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-medium text-gray-500 mb-1">Adresse</h5>
                                            <p className="text-base">
                                                {selectedStudent.company.address}<br />
                                                {selectedStudent.company.postalCode} {selectedStudent.company.city}
                                            </p>
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-medium text-gray-500 mb-1">Responsable</h5>
                                            <p className="text-base">{selectedStudent.company.responsableName}</p>
                                            <p className="text-sm text-gray-600">{selectedStudent.company.email}</p>
                                            <p className="text-sm text-gray-600">{selectedStudent.company.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="border-t border-gray-200 mt-6 pt-6">
                            <h4 className="font-medium mb-4">Formations inscrites</h4>
                            {loadingFormations ? (
                                <div className="flex justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-900"></div>
                                    <span className="ml-2">Chargement...</span>
                                </div>
                            ) : userFormations && userFormations.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Formation
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Statut
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Dates
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {userFormations.map((formation, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {formation.title}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formation.type}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        formation.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            formation.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {formation.status === 'completed' ? 'Terminée' :
                                                            formation.status === 'ongoing' ? 'En cours' :
                                                                formation.status === 'scheduled' ? 'Programmée' : formation.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formation.startDate && formation.endDate
                                                        ? `${new Date(formation.startDate).toLocaleDateString('fr-FR')} - ${new Date(formation.endDate).toLocaleDateString('fr-FR')}`
                                                        : 'Dates non définies'}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">Aucune formation trouvée</p>
                            )}
                        </div>

                        {/* Section Documents d'inscription */}
                        <div className="border-t border-gray-200 mt-6 pt-6">
                            <h4 className="font-medium mb-4 flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                                Documents d'inscription
                            </h4>
                            {loadingDocuments ? (
                                <div className="flex justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-900"></div>
                                    <span className="ml-2">Chargement des documents...</span>
                                </div>
                            ) : userDocuments && userDocuments.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {userDocuments.map((document) => (
                                        <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h5 className="font-medium text-gray-900">{document.title}</h5>
                                                        {getValidationStatusBadge(document)}
                                                    </div>
                                                    <p className="text-sm text-gray-500 mb-2">
                                                        Uploadé le {document.date}
                                                    </p>
                                                    
                                                    {/* Informations de validation */}
                                                    {document.validatedAt && document.validatedBy && (
                                                        <p className="text-xs text-gray-500 mb-2">
                                                            {document.validationStatus === 'valide' ? 'Validé' : 'Rejeté'} le {new Date(document.validatedAt).toLocaleDateString('fr-FR')} par {document.validatedBy.firstName} {document.validatedBy.lastName}
                                                        </p>
                                                    )}
                                                    
                                                    {/* Raison du rejet */}
                                                    {document.validationStatus === 'rejete' && document.rejectionReason && (
                                                        <div className="bg-red-50 border border-red-200 rounded p-2 mb-2">
                                                            <p className="text-xs text-red-700 flex items-start">
                                                                <AlertTriangle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                                                                <span><strong>Raison du rejet:</strong> {document.rejectionReason}</span>
                                                            </p>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex items-center text-xs text-gray-400">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            document.type === 'pdf' ? 'bg-red-100 text-red-700' :
                                                            document.type === 'doc' || document.type === 'docx' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {document.type.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="ml-3 flex flex-col space-y-1">
                                                    <a
                                                        href={document.downloadUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                        title="Télécharger le document"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                    
                                                    {/* Boutons de validation seulement pour les documents d'inscription en attente */}
                                                    {(document.category === 'attestation' && (document.validationStatus === 'en_attente' || !document.validationStatus)) && (
                                                        <div className="flex flex-col space-y-1">
                                                            <button
                                                                onClick={() => handleValidateDocument(document)}
                                                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                                                                title="Valider le document"
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectDocument(document)}
                                                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                                                title="Rejeter le document"
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 italic">Aucun document d'inscription uploadé</p>
                                    <p className="text-sm text-gray-400 mt-1">L'élève n'a pas encore fourni de documents lors de sa finalisation d'inscription</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </Modal>

            {/* Modal de validation/rejet de document */}
            <Modal
                isOpen={showValidationModal}
                onClose={() => {
                    setShowValidationModal(false);
                    setDocumentToValidate(null);
                    setValidationAction(null);
                    setRejectionReason('');
                }}
                title={validationAction === 'validate' ? 'Valider le document' : 'Rejeter le document'}
                size="md"
            >
                {documentToValidate && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">{documentToValidate.title}</h4>
                            <p className="text-sm text-gray-600">
                                Étudiant: {selectedStudent?.firstName} {selectedStudent?.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                                Uploadé le: {documentToValidate.date}
                            </p>
                        </div>

                        {validationAction === 'validate' ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                    <p className="text-green-800">
                                        Êtes-vous sûr de vouloir valider ce document ? L'étudiant sera notifié par email.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center mb-3">
                                        <XCircle className="h-5 w-5 text-red-600 mr-2" />
                                        <p className="text-red-800">
                                            Veuillez préciser la raison du rejet. L'étudiant sera notifié par email.
                                        </p>
                                    </div>
                                </div>
                                
                                <div>
                                    <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                                        Raison du rejet *
                                    </label>
                                    <textarea
                                        id="rejectionReason"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        rows={4}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Exemple: Le document n'est pas lisible, il manque la signature, etc."
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowValidationModal(false);
                                    setDocumentToValidate(null);
                                    setValidationAction(null);
                                    setRejectionReason('');
                                }}
                                disabled={validationProcessing}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant={validationAction === 'validate' ? 'primary' : 'danger'}
                                onClick={handleValidationSubmit}
                                disabled={validationProcessing || (validationAction === 'reject' && !rejectionReason.trim())}
                                loading={validationProcessing}
                            >
                                {validationAction === 'validate' ? 'Valider le document' : 'Rejeter le document'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default StudentsAdmin;