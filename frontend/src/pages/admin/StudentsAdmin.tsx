import React, { useState, useCallback, useEffect } from 'react';
import { UserPlus, Trash2, Eye, GraduationCap, Check, X, Users, Archive } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import DeletedUsersTable from '../../components/admin/DeletedUsersTable';
import StudentDetailModal from '../../components/admin/StudentDetailModal';
import { useNotification } from '../../contexts/NotificationContext';
import useDataFetching from '../../hooks/useDataFetching';
import { adminUsersApi } from '../../services/api';
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


const StudentsAdmin: React.FC = () => {
    const { addToast } = useNotification();
    const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
    const [processing, setProcessing] = useState(false);
    

    // États pour la gestion du statut étudiant
    const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
    const [studentToChangeStatus, setStudentToChangeStatus] = useState<User | null>(null);
    const [statusProcessingStudent, setStatusProcessingStudent] = useState(false);

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

    const viewDetails = (user: User) => {
        setSelectedStudent(user);
        setShowDetailsModal(true);
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


    // Fonctions pour la gestion du statut étudiant
    const handleStudentStatusChangeRequest = (student: User) => {
        setStudentToChangeStatus(student);
        setShowStatusChangeModal(true);
    };

    const confirmStudentStatusChange = async () => {
        if (!studentToChangeStatus) return;

        try {
            setStatusProcessingStudent(true);
            const newStatus = !studentToChangeStatus.isActive;
            
            await adminUsersApi.updateStatus(studentToChangeStatus.id, newStatus);
            
            // Mettre à jour la liste locale
            setStudents(students.map(s => 
                s.id === studentToChangeStatus.id 
                    ? { ...s, isActive: newStatus }
                    : s
            ));

            // Mettre à jour l'étudiant sélectionné dans le modal s'il correspond
            if (selectedStudent && selectedStudent.id === studentToChangeStatus.id) {
                setSelectedStudent({ ...selectedStudent, isActive: newStatus });
            }

            addToast(
                `Statut ${newStatus ? 'activé' : 'désactivé'} pour ${studentToChangeStatus.firstName} ${studentToChangeStatus.lastName}`, 
                'success'
            );
            
            setShowStatusChangeModal(false);
            setStudentToChangeStatus(null);
        } catch (err) {
            console.error('Error updating student status:', err);
            addToast('Erreur lors de la mise à jour du statut', 'error');
        } finally {
            setStatusProcessingStudent(false);
        }
    };

    const cancelStudentStatusChange = () => {
        setShowStatusChangeModal(false);
        setStudentToChangeStatus(null);
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
                <button
                    onClick={() => handleStudentStatusChangeRequest(row)}
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 transition-opacity ${
                        row.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                    title={`Cliquer pour ${row.isActive ? 'désactiver' : 'activer'} l'étudiant`}
                >
                    {row.isActive ? 'Actif' : 'Inactif'}
                </button>
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
                title="Voir détails - Toute la gestion se fait dans ce modal"
            >
                <Eye className="h-5 w-5" />
            </button>
            <button
                onClick={() => confirmDelete(student)}
                className="text-red-600 hover:text-red-900"
                title="Supprimer définitivement"
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
        <AdminLayout 
            title="Gestion des élèves"
            breadcrumbItems={[
                { label: 'Admin', path: '/admin' },
                { label: 'Utilisateurs', path: '/admin/users' },
                { label: 'Élèves' }
            ]}
        >
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


            {/* Modal de confirmation de suppression */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Confirmer la suppression définitive"
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
                            Supprimer définitivement
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h4 className="text-sm font-medium text-red-800">
                                    Attention : Suppression définitive
                                </h4>
                                <p className="mt-1 text-sm text-red-700">
                                    Cette action est irréversible et aura des conséquences importantes.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-base font-medium text-gray-900 mb-3">
                            Êtes-vous sûr de vouloir supprimer définitivement l'élève "{userToDelete?.firstName} {userToDelete?.lastName}" ?
                        </p>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                            <h5 className="font-medium text-gray-900">Cette action va :</h5>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>Supprimer définitivement le compte étudiant</li>
                                <li>Archiver toutes ses inscriptions aux sessions de formation</li>
                                <li>Archiver toutes ses réservations de véhicules</li>
                                <li>Conserver les documents pour l'historique</li>
                                <li>Empêcher toute connexion future</li>
                            </ul>
                        </div>
                        
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm text-blue-700">
                                <strong>Alternative :</strong> Si vous souhaitez simplement désactiver temporairement cet étudiant, 
                                utilisez le bouton de statut dans la liste pour le passer en "Inactif".
                            </p>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Modal de détails de l'élève avec composant réutilisable */}
            <StudentDetailModal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                student={selectedStudent}
                activeTab="info"
            />

            {/* Modal de confirmation pour changement de statut étudiant */}
            <Modal
                isOpen={showStatusChangeModal}
                onClose={cancelStudentStatusChange}
                title="Confirmation de changement de statut"
                size="md"
                footer={
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={cancelStudentStatusChange}
                            disabled={statusProcessingStudent}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant={studentToChangeStatus?.isActive ? "danger" : "primary"}
                            onClick={confirmStudentStatusChange}
                            loading={statusProcessingStudent}
                        >
                            {studentToChangeStatus?.isActive ? 'Désactiver' : 'Activer'}
                        </Button>
                    </div>
                }
            >
                {studentToChangeStatus && (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                studentToChangeStatus.isActive ? 'bg-red-100' : 'bg-green-100'
                            }`}>
                                {studentToChangeStatus.isActive ? (
                                    <X className="h-6 w-6 text-red-600" />
                                ) : (
                                    <Check className="h-6 w-6 text-green-600" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    {studentToChangeStatus.isActive ? 'Désactiver' : 'Activer'} l'étudiant
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {studentToChangeStatus.firstName} {studentToChangeStatus.lastName}
                                </p>
                            </div>
                        </div>

                        <div className={`p-4 rounded-lg ${
                            studentToChangeStatus.isActive ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
                        }`}>
                            <p className={`text-sm ${
                                studentToChangeStatus.isActive ? 'text-red-700' : 'text-green-700'
                            }`}>
                                {studentToChangeStatus.isActive ? (
                                    <>
                                        <strong>Attention :</strong> Désactiver cet étudiant l'empêchera de se connecter 
                                        et d'accéder à ses formations. Ses réservations existantes ne seront pas affectées.
                                    </>
                                ) : (
                                    <>
                                        <strong>Activation :</strong> Cet étudiant pourra de nouveau se connecter 
                                        et accéder à toutes ses formations.
                                    </>
                                )}
                            </p>
                        </div>

                        <div className="bg-gray-50 p-3 rounded">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Statut actuel :</span>
                                <span className={`font-medium ${
                                    studentToChangeStatus.isActive ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {studentToChangeStatus.isActive ? 'Actif' : 'Inactif'}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-600">Nouveau statut :</span>
                                <span className={`font-medium ${
                                    !studentToChangeStatus.isActive ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {!studentToChangeStatus.isActive ? 'Actif' : 'Inactif'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
};

export default StudentsAdmin;