import React, { useState, useEffect } from 'react';
import { Send, Plus, FileText, Trash2, Users, Mail, Calendar } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import DataTable from '../../components/common/DataTable';
import { useNotification } from '../../contexts/NotificationContext';
import { adminDirectDocumentsApi } from '@/services/api.ts';
import { getErrorMessage } from '@/utils/errorUtils.ts';

interface Student {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    fullName: string;
}

interface SentDocument {
    id: number;
    title: string;
    fileName: string;
    type: string;
    uploadedAt: string;
    uploadedAtFormatted: string;
    student: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        fullName: string;
    };
    uploadedBy: {
        firstName: string;
        lastName: string;
        fullName: string;
    };
}

const DirectDocuments: React.FC = () => {
    const { addToast } = useNotification();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [sentDocuments, setSentDocuments] = useState<SentDocument[]>([]);
    const [showSendModal, setShowSendModal] = useState(false);
    const [sending, setSending] = useState(false);

    // Form state
    const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [studentsResponse, documentsResponse] = await Promise.all([
                adminDirectDocumentsApi.getStudents(),
                adminDirectDocumentsApi.getSentDocuments()
            ]);
            
            setStudents(studentsResponse.data);
            setSentDocuments(documentsResponse.data);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Erreur lors du chargement des données');
            addToast('Erreur lors du chargement des données', 'error');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const errors: {[key: string]: string} = {};

        if (!selectedStudent) errors.student = 'Veuillez sélectionner un étudiant';
        if (!title.trim()) errors.title = 'Le titre est requis';
        if (!file) errors.file = 'Veuillez sélectionner un fichier';
        
        if (title.trim().length < 3) errors.title = 'Le titre doit contenir au moins 3 caractères';
        if (title.trim().length > 255) errors.title = 'Le titre ne peut pas dépasser 255 caractères';

        if (file) {
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                errors.file = 'Le fichier ne peut pas dépasser 10MB';
            }

            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'text/plain',
                'image/jpeg',
                'image/png',
                'image/gif'
            ];

            if (!allowedTypes.includes(file.type)) {
                errors.file = 'Type de fichier non autorisé. Types acceptés : PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG, GIF';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSendDocument = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSending(true);

            const formData = new FormData();
            formData.append('file', file!);
            formData.append('title', title.trim());
            formData.append('studentId', selectedStudent!.toString());
            if (message.trim()) {
                formData.append('message', message.trim());
            }

            const response = await adminDirectDocumentsApi.sendDocument(formData);
            
            addToast(response.data.message, 'success');
            
            // Reset form
            setSelectedStudent(null);
            setTitle('');
            setMessage('');
            setFile(null);
            setFormErrors({});
            setShowSendModal(false);

            // Refresh documents list
            fetchData();

        } catch (err) {
            console.error('Error sending document:', err);
            addToast(getErrorMessage(err, 'Erreur lors de l\'envoi du document'), 'error');
        } finally {
            setSending(false);
        }
    };

    const handleDeleteDocument = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
            return;
        }

        try {
            await adminDirectDocumentsApi.delete(id);
            addToast('Document supprimé avec succès', 'success');
            fetchData();
        } catch (err) {
            console.error('Error deleting document:', err);
            addToast(getErrorMessage(err, 'Erreur lors de la suppression'), 'error');
        }
    };

    const openSendModal = () => {
        setSelectedStudent(null);
        setTitle('');
        setMessage('');
        setFile(null);
        setFormErrors({});
        setShowSendModal(true);
    };

    const getFileIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'pdf':
                return 'text-red-600';
            case 'doc':
            case 'docx':
                return 'text-blue-600';
            case 'xls':
            case 'xlsx':
                return 'text-green-600';
            case 'ppt':
            case 'pptx':
                return 'text-orange-600';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return 'text-purple-600';
            default:
                return 'text-gray-600';
        }
    };

    // Configuration des colonnes pour le DataTable
    const columns = [
        {
            title: 'Document',
            field: (row: SentDocument) => (
                <div className="flex items-center">
                    <FileText className={`h-5 w-5 mr-3 ${getFileIcon(row.type)}`} />
                    <div>
                        <div className="font-medium text-gray-900">{row.title}</div>
                        <div className="text-sm text-gray-500">{row.fileName}</div>
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Étudiant',
            field: (row: SentDocument) => (
                <div>
                    <div className="font-medium text-gray-900">{row.student.fullName}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {row.student.email}
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Envoyé par',
            field: (row: SentDocument) => row.uploadedBy.fullName,
            sortable: true
        },
        {
            title: 'Date d\'envoi',
            field: (row: SentDocument) => (
                <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="h-3 w-3 mr-1" />
                    {row.uploadedAtFormatted}
                </div>
            ),
            sortable: true
        }
    ];

    const renderActions = (document: SentDocument) => (
        <div className="flex justify-end">
            <button
                onClick={() => handleDeleteDocument(document.id)}
                className="text-red-600 hover:text-red-900"
                title="Supprimer"
            >
                <Trash2 className="h-5 w-5" />
            </button>
        </div>
    );


    return (
        <AdminLayout
            title="Documents directs"
            breadcrumbItems={[
                { label: 'Admin', path: '/admin' },
                { label: 'Documents directs' }
            ]}
        >
                    {error && (
                        <Alert
                            type="error"
                            message={error}
                            onClose={() => setError(null)}
                        />
                    )}

                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Documents directs</h1>
                            <p className="text-gray-600 mt-1">
                                Envoyez des documents directement aux étudiants
                            </p>
                        </div>
                        <Button
                            onClick={openSendModal}
                            icon={<Send className="h-4 w-4" />}
                        >
                            Envoyer un document
                        </Button>
                    </div>

                    {/* Statistiques */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <FileText className="h-6 w-6 text-blue-700" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-gray-500">Documents envoyés</h3>
                                    <p className="text-2xl font-semibold text-gray-900">{sentDocuments.length}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <Users className="h-6 w-6 text-green-700" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-gray-500">Étudiants actifs</h3>
                                    <p className="text-2xl font-semibold text-gray-900">{students.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="bg-purple-100 p-3 rounded-full">
                                    <Mail className="h-6 w-6 text-purple-700" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-gray-500">Derniers envois</h3>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {sentDocuments.filter(doc => {
                                            const sentDate = new Date(doc.uploadedAt);
                                            const weekAgo = new Date();
                                            weekAgo.setDate(weekAgo.getDate() - 7);
                                            return sentDate > weekAgo;
                                        }).length}
                                    </p>
                                    <p className="text-xs text-gray-500">Cette semaine</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table des documents envoyés */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b">
                            <h2 className="text-lg font-medium text-gray-900">Documents envoyés</h2>
                        </div>
                        
                        <DataTable<SentDocument>
                            data={sentDocuments}
                            columns={columns}
                            keyField="id"
                            loading={false}
                            actions={renderActions}
                            searchFields={['title', 'student.fullName', 'uploadedBy.fullName']}
                            emptyMessage="Aucun document envoyé"
                        />
                    </div>

            {/* Modal d'envoi de document */}
            <Modal
                isOpen={showSendModal}
                onClose={() => setShowSendModal(false)}
                title="Envoyer un document"
                maxWidth="max-w-2xl"
                footer={
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowSendModal(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSendDocument}
                            loading={sending}
                            icon={!sending && <Send className="h-4 w-4" />}
                        >
                            Envoyer
                        </Button>
                    </div>
                }
            >
                <form onSubmit={handleSendDocument} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Étudiant destinataire*
                        </label>
                        <select
                            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                formErrors.student ? 'border-red-500' : ''
                            }`}
                            value={selectedStudent || ''}
                            onChange={(e) => setSelectedStudent(e.target.value ? parseInt(e.target.value) : null)}
                        >
                            <option value="">Sélectionner un étudiant</option>
                            {students.map(student => (
                                <option key={student.id} value={student.id}>
                                    {student.fullName} ({student.email})
                                </option>
                            ))}
                        </select>
                        {formErrors.student && (
                            <p className="mt-1 text-sm text-red-500">{formErrors.student}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Titre du document*
                        </label>
                        <input
                            type="text"
                            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                formErrors.title ? 'border-red-500' : ''
                            }`}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Convocation examen, Certificat médical..."
                        />
                        {formErrors.title && (
                            <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fichier*
                        </label>
                        <input
                            type="file"
                            className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                                formErrors.file ? 'border-red-500' : ''
                            }`}
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Formats acceptés : PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG, GIF (max 10MB)
                        </p>
                        {formErrors.file && (
                            <p className="mt-1 text-sm text-red-500">{formErrors.file}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Message (optionnel)
                        </label>
                        <textarea
                            rows={3}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Message personnalisé à joindre à l'envoi..."
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Ce message sera inclus dans l'email de notification envoyé à l'étudiant
                        </p>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
};

export default DirectDocuments;