import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Mail, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import DataTable from '../../components/common/DataTable';
import { useNotification } from '../../contexts/NotificationContext';
import { adminUsersApi, documentsApi } from '@/services/api.ts';
import { getErrorMessage } from '@/utils/errorUtils.ts';

interface InscriptionDocument {
    id: number;
    title: string;
    type: string;
    category: string;
    uploadedAt: string;
    uploadedAtFormatted: string;
    fileName: string;
    downloadUrl: string;
    validationStatus: 'pending' | 'approved' | 'rejected';
    validatedAt: string | null;
    validatedAtFormatted: string | null;
    rejectionReason: string | null;
    user: {
        id: number | null;
        firstName: string;
        lastName: string;
        email: string;
        fullName: string;
    };
    validatedBy: {
        id: number;
        firstName: string;
        lastName: string;
        fullName: string;
    } | null;
}

interface ApiResponse {
    documents: InscriptionDocument[];
    total: number;
    page: number;
    limit: number | null;
}

const InscriptionDocuments: React.FC = () => {
    const [documents, setDocuments] = useState<InscriptionDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('');
    
    // Modal de validation
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<InscriptionDocument | null>(null);
    const [validationAction, setValidationAction] = useState<'approve' | 'reject'>('approve');
    const [rejectionReason, setRejectionReason] = useState('');
    const [validating, setValidating] = useState(false);
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

    const { addToast } = useNotification();

    useEffect(() => {
        fetchInscriptionDocuments();
    }, [statusFilter]);

    const fetchInscriptionDocuments = async () => {
        try {
            setLoading(true);
            setError(null);
            const queryParams = statusFilter ? `status=${statusFilter}` : '';
            const response = await adminUsersApi.getInscriptionDocuments(queryParams);
            setDocuments(response.data.documents || []);
        } catch (err) {
            console.error('Error fetching inscription documents:', err);
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', text: 'En attente', icon: AlertCircle },
            approved: { color: 'bg-green-100 text-green-800', text: 'Approuvé', icon: CheckCircle },
            rejected: { color: 'bg-red-100 text-red-800', text: 'Rejeté', icon: XCircle }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const IconComponent = config.icon;
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <IconComponent className="h-3 w-3 mr-1" />
                {config.text}
            </span>
        );
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
            default:
                return 'text-gray-600';
        }
    };

    const handleValidationAction = (document: InscriptionDocument, action: 'approve' | 'reject') => {
        setSelectedDocument(document);
        setValidationAction(action);
        setRejectionReason('');
        setFormErrors({});
        setShowValidationModal(true);
    };

    const handleValidation = async () => {
        if (!selectedDocument) return;

        if (validationAction === 'reject' && !rejectionReason.trim()) {
            setFormErrors({ rejectionReason: 'Veuillez indiquer une raison pour le rejet' });
            return;
        }

        try {
            setValidating(true);
            setFormErrors({});

            if (validationAction === 'approve') {
                await documentsApi.validateDocument(selectedDocument.id);
                addToast('Document approuvé avec succès', 'success');
            } else {
                await documentsApi.rejectDocument(selectedDocument.id, rejectionReason.trim());
                addToast('Document rejeté avec succès', 'success');
            }

            // Recharger les documents
            await fetchInscriptionDocuments();
            
            // Fermer le modal
            setShowValidationModal(false);
            setSelectedDocument(null);
            setRejectionReason('');

        } catch (err) {
            console.error('Error validating document:', err);
            const errorMessage = getErrorMessage(err);
            addToast(`Erreur lors de ${validationAction === 'approve' ? 'l\'approbation' : 'du rejet'} : ${errorMessage}`, 'error');
        } finally {
            setValidating(false);
        }
    };

    const handleDownload = (document: InscriptionDocument) => {
        const link = window.document.createElement('a');
        link.href = document.downloadUrl;
        link.download = document.fileName;
        link.click();
    };

    // Configuration des colonnes pour le DataTable
    const columns = [
        {
            title: 'Document',
            field: (row: InscriptionDocument) => (
                <div className="flex items-center">
                    <FileText className={`h-5 w-5 mr-3 ${getFileIcon(row.type)}`} />
                    <div>
                        <div className="font-medium text-gray-900">{row.title}</div>
                        <div className="text-sm text-gray-500">{row.type?.toUpperCase()}</div>
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Étudiant',
            field: (row: InscriptionDocument) => (
                <div>
                    <div className="font-medium text-gray-900">{row.user.fullName}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {row.user.email}
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Catégorie',
            field: (row: InscriptionDocument) => (
                <span className="text-sm font-medium text-gray-900 capitalize">
                    {row.category}
                </span>
            ),
            sortable: true
        },
        {
            title: 'Date d\'upload',
            field: (row: InscriptionDocument) => (
                <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="h-3 w-3 mr-1" />
                    {row.uploadedAtFormatted}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Statut',
            field: (row: InscriptionDocument) => getStatusBadge(row.validationStatus),
            sortable: true
        },
        {
            title: 'Validé par',
            field: (row: InscriptionDocument) => {
                if (!row.validatedBy) return '-';
                return (
                    <div>
                        <div className="text-sm font-medium text-gray-900">{row.validatedBy.fullName}</div>
                        <div className="text-xs text-gray-500">{row.validatedAtFormatted}</div>
                    </div>
                );
            },
            sortable: true
        }
    ];

    const renderActions = (document: InscriptionDocument) => (
        <div className="flex justify-end space-x-2">
            <button
                onClick={() => handleDownload(document)}
                className="text-blue-600 hover:text-blue-900"
                title="Télécharger le document"
            >
                <Download className="h-4 w-4" />
            </button>
            
            {document.validationStatus === 'pending' && (
                <>
                    <button
                        onClick={() => handleValidationAction(document, 'approve')}
                        className="text-green-600 hover:text-green-900"
                        title="Approuver le document"
                    >
                        <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleValidationAction(document, 'reject')}
                        className="text-red-600 hover:text-red-900"
                        title="Rejeter le document"
                    >
                        <XCircle className="h-4 w-4" />
                    </button>
                </>
            )}

            {document.validationStatus === 'rejected' && document.rejectionReason && (
                <span 
                    className="text-xs text-gray-600 cursor-help"
                    title={document.rejectionReason}
                >
                    ⓘ
                </span>
            )}
        </div>
    );

    // Calculer les statistiques
    const pendingCount = documents.filter(doc => doc.validationStatus === 'pending').length;
    const approvedCount = documents.filter(doc => doc.validationStatus === 'approved').length;
    const rejectedCount = documents.filter(doc => doc.validationStatus === 'rejected').length;

    return (
        <AdminLayout
            title="Documents d'inscription"
            breadcrumbItems={[
                { label: 'Admin', path: '/admin' },
                { label: 'Documents d\'inscription' }
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
                    <h1 className="text-2xl font-bold text-gray-900">Documents d'inscription</h1>
                    <p className="text-gray-600 mt-1">
                        Gérez les documents d'inscription soumis par les étudiants
                    </p>
                </div>
                <Button
                    onClick={fetchInscriptionDocuments}
                    variant="outline"
                >
                    Actualiser
                </Button>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Total</dt>
                                <dd className="text-lg font-medium text-gray-900">{documents.length}</dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-8 w-8 text-yellow-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">En attente</dt>
                                <dd className="text-lg font-medium text-gray-900">{pendingCount}</dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <CheckCircle className="h-8 w-8 text-green-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Approuvés</dt>
                                <dd className="text-lg font-medium text-gray-900">{approvedCount}</dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <XCircle className="h-8 w-8 text-red-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Rejetés</dt>
                                <dd className="text-lg font-medium text-gray-900">{rejectedCount}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">Filtrer par statut:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="pending">En attente</option>
                        <option value="approved">Approuvés</option>
                        <option value="rejected">Rejetés</option>
                    </select>
                </div>
            </div>

            {/* Table des documents */}
            <div className="bg-white rounded-lg shadow">
                <DataTable
                    data={documents}
                    columns={columns}
                    keyField="id"
                    loading={loading}
                    actions={renderActions}
                    searchFields={['title', 'user.fullName', 'user.email']}
                    emptyMessage="Aucun document d'inscription trouvé"
                />
            </div>

            {/* Modal de validation */}
            <Modal
                isOpen={showValidationModal}
                onClose={() => {
                    setShowValidationModal(false);
                    setSelectedDocument(null);
                    setRejectionReason('');
                    setFormErrors({});
                }}
                title={`${validationAction === 'approve' ? 'Approuver' : 'Rejeter'} le document`}
                maxWidth="max-w-md"
                footer={
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowValidationModal(false);
                                setSelectedDocument(null);
                                setRejectionReason('');
                                setFormErrors({});
                            }}
                            disabled={validating}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleValidation}
                            loading={validating}
                            disabled={validationAction === 'reject' && !rejectionReason.trim()}
                            variant={validationAction === 'approve' ? 'primary' : 'danger'}
                        >
                            {validationAction === 'approve' ? 'Approuver' : 'Rejeter'}
                        </Button>
                    </div>
                }
            >
                {selectedDocument && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-gray-900">Document:</p>
                            <p className="text-sm text-gray-600">{selectedDocument.title}</p>
                            <p className="text-sm font-medium text-gray-900 mt-2">Étudiant:</p>
                            <p className="text-sm text-gray-600">{selectedDocument.user.fullName}</p>
                        </div>

                        {validationAction === 'approve' ? (
                            <p className="text-sm text-gray-600">
                                Êtes-vous sûr de vouloir approuver ce document ?
                            </p>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Raison du rejet *
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows={3}
                                    className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        formErrors.rejectionReason ? 'border-red-500' : ''
                                    }`}
                                    placeholder="Expliquez pourquoi ce document est rejeté..."
                                />
                                {formErrors.rejectionReason && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.rejectionReason}</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
};

export default InscriptionDocuments;