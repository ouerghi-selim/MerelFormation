import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Alert from '../common/Alert';

interface ArchivedUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    deletionLevel: string;
    originalFirstName?: string;
    originalLastName?: string;
    originalEmail?: string;
}

interface ForceDeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: ArchivedUser;
    onConfirm: (userId: number) => Promise<void>;
}

const ForceDeleteConfirmModal: React.FC<ForceDeleteConfirmModalProps> = ({
    isOpen,
    onClose,
    user,
    onConfirm
}) => {
    const [confirmName, setConfirmName] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Construire le nom complet pour la confirmation
    const getFullName = (user: ArchivedUser) => {
        // Si anonymisé, utiliser les données originales si disponibles
        if (user.deletionLevel === 'anonymized') {
            const originalFirstName = user.originalFirstName || user.firstName;
            const originalLastName = user.originalLastName || user.lastName;
            return `${originalFirstName} ${originalLastName}`;
        }
        return `${user.firstName} ${user.lastName}`;
    };

    const fullName = getFullName(user);
    const isConfirmValid = confirmName.trim().toLowerCase() === fullName.toLowerCase();

    const handleConfirm = async () => {
        if (!isConfirmValid) return;

        setIsDeleting(true);
        try {
            await onConfirm(user.id);
            onClose();
            setConfirmName(''); // Reset après succès
        } catch (error) {
            console.error('Erreur lors de la suppression forcée:', error);
            // L'erreur sera gérée par le composant parent
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClose = () => {
        if (!isDeleting) {
            setConfirmName('');
            onClose();
        }
    };

    const getDeletionLevelInfo = (level: string) => {
        switch (level) {
            case 'deactivated':
                return {
                    label: 'Désactivé',
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-100',
                    icon: '🟡'
                };
            case 'anonymized':
                return {
                    label: 'Anonymisé',
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-100',
                    icon: '🟠'
                };
            default:
                return {
                    label: 'Inconnu',
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-100',
                    icon: '⚪'
                };
        }
    };

    const levelInfo = getDeletionLevelInfo(user.deletionLevel);

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="⚠️ Suppression Définitive Forcée"
            maxWidth="max-w-lg"
            footer={
                <div className="flex justify-end space-x-3">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isDeleting}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleConfirm}
                        disabled={!isConfirmValid || isDeleting}
                        loading={isDeleting}
                        icon={!isDeleting ? <AlertTriangle className="h-4 w-4" /> : undefined}
                    >
                        {isDeleting ? 'Suppression...' : 'Supprimer Définitivement'}
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Alert principal */}
                <Alert
                    type="warning"
                    message="⚠️ Cette action est IRRÉVERSIBLE et contourne les délais de sécurité RGPD. L'utilisateur sera définitivement supprimé de la base de données."
                />

                {/* Informations utilisateur */}
                <div className={`p-4 rounded-lg ${levelInfo.bgColor}`}>
                    <div className="flex items-center mb-3">
                        <span className="text-lg mr-2">{levelInfo.icon}</span>
                        <span className={`font-medium ${levelInfo.color}`}>
                            Utilisateur {levelInfo.label}
                        </span>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div>
                            <span className="font-medium">Nom:</span> {fullName}
                        </div>
                        <div>
                            <span className="font-medium">Email:</span> {user.originalEmail || user.email}
                        </div>
                        <div>
                            <span className="font-medium">Niveau d'archivage:</span> {levelInfo.label}
                        </div>
                    </div>
                </div>

                {/* Zone de danger */}
                <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-center mb-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                        <h4 className="font-bold text-red-800">Zone de Danger</h4>
                    </div>
                    <p className="text-red-700 text-sm mb-4">
                        Cette suppression supprimera définitivement :
                    </p>
                    <ul className="text-red-700 text-sm space-y-1 list-disc list-inside mb-4">
                        <li>Toutes les données personnelles</li>
                        <li>Toutes les notifications associées</li>
                        <li>L'enregistrement complet de l'utilisateur</li>
                        <li>Aucune possibilité de récupération</li>
                    </ul>
                </div>

                {/* Confirmation par saisie */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                        Pour confirmer, saisissez le nom complet de l'utilisateur :
                    </label>
                    <div className="space-y-2">
                        <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded border">
                            Nom à saisir : <span className="font-mono font-medium">{fullName}</span>
                        </div>
                        <input
                            type="text"
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                            placeholder={`Saisir: ${fullName}`}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            disabled={isDeleting}
                            autoFocus
                        />
                        {confirmName && !isConfirmValid && (
                            <p className="text-sm text-red-600">
                                ❌ Le nom saisi ne correspond pas exactement
                            </p>
                        )}
                        {isConfirmValid && (
                            <p className="text-sm text-green-600">
                                ✅ Nom confirmé, vous pouvez procéder à la suppression
                            </p>
                        )}
                    </div>
                </div>

                {/* Avertissement final */}
                <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="text-sm text-gray-700 text-center font-medium">
                        🔒 Cette action nécessite des privilèges administrateur et sera tracée dans les logs de sécurité.
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default ForceDeleteConfirmModal;