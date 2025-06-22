import React, { useState, useEffect } from 'react';
import { RotateCcw, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import DataTable from '../common/DataTable';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useNotification } from '../../contexts/NotificationContext';
import { adminUsersApi } from '../../services/api';

interface DeletedUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  originalEmail?: string;
  originalFirstName?: string;
  originalLastName?: string;
  deletedAt: string;
  anonymizedAt?: string;
  deletionLevel: 'deactivated' | 'anonymized' | 'permanent';
  anonymizationDeadline?: string;
  deletionDeadline?: string;
  daysUntilAnonymization?: number;
  daysUntilDeletion?: number;
  canRestore: boolean;
  isOverdue: boolean;
}

const DeletedUsersTable: React.FC = () => {
  const { addToast } = useNotification();
  const [deletedUsers, setDeletedUsers] = useState<DeletedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [userToRestore, setUserToRestore] = useState<DeletedUser | null>(null);
  const [restoring, setRestoring] = useState(false);

  const loadDeletedUsers = async () => {
    try {
      setLoading(true);
      const response = await adminUsersApi.getDeleted();
      setDeletedUsers(response.data);
    } catch (error) {
      console.error('Error loading deleted users:', error);
      addToast('Erreur lors du chargement des utilisateurs supprimés', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeletedUsers();
  }, []);

  const formatDeletionLevel = (level: string): React.ReactNode => {
    const badges = {
      deactivated: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Niveau 1 - Désactivé
        </span>
      ),
      anonymized: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Niveau 2 - Anonymisé
        </span>
      ),
      permanent: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Niveau 3 - Supprimé
        </span>
      )
    };
    return badges[level as keyof typeof badges] || level;
  };

  const formatDeadline = (user: DeletedUser): React.ReactNode => {
    if (user.deletionLevel === 'deactivated') {
      const days = user.daysUntilAnonymization;
      if (days === null || days === undefined) return '-';
      
      const isOverdue = days < 0;
      const color = isOverdue ? 'text-red-600' : days <= 7 ? 'text-orange-600' : 'text-green-600';
      
      return (
        <div className={`font-medium ${color}`}>
          {isOverdue ? (
            <>
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              En retard de {Math.abs(days)} jour(s)
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 inline mr-1" />
              {days} jour(s) restant(s)
            </>
          )}
          <div className="text-xs text-gray-500">
            Anonymisation: {user.anonymizationDeadline}
          </div>
        </div>
      );
    } else if (user.deletionLevel === 'anonymized') {
      const days = user.daysUntilDeletion;
      if (days === null || days === undefined) return '-';
      
      const isOverdue = days < 0;
      const color = isOverdue ? 'text-red-600' : days <= 30 ? 'text-orange-600' : 'text-green-600';
      
      return (
        <div className={`font-medium ${color}`}>
          {isOverdue ? (
            <>
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              En retard de {Math.abs(days)} jour(s)
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 inline mr-1" />
              {days} jour(s) restant(s)
            </>
          )}
          <div className="text-xs text-gray-500">
            Suppression: {user.deletionDeadline}
          </div>
        </div>
      );
    }
    return <span className="text-gray-500">Supprimé définitivement</span>;
  };

  const formatUserInfo = (user: DeletedUser): React.ReactNode => {
    const original = user.originalFirstName && user.originalLastName;
    return (
      <div>
        <div className="font-medium">
          {user.firstName} {user.lastName}
        </div>
        <div className="text-sm text-gray-500">{user.email}</div>
        {original && (
          <div className="text-xs text-blue-600 mt-1">
            Original: {user.originalFirstName} {user.originalLastName}
            <br />
            {user.originalEmail}
          </div>
        )}
      </div>
    );
  };

  const handleRestore = async () => {
    if (!userToRestore) return;

    try {
      setRestoring(true);
      await adminUsersApi.restore(userToRestore.id);
      addToast('Utilisateur restauré avec succès', 'success');
      setShowRestoreModal(false);
      setUserToRestore(null);
      loadDeletedUsers(); // Recharger la liste
    } catch (error: any) {
      console.error('Error restoring user:', error);
      const message = error.response?.data?.message || 'Erreur lors de la restauration';
      addToast(message, 'error');
    } finally {
      setRestoring(false);
    }
  };

  const openRestoreModal = (user: DeletedUser) => {
    setUserToRestore(user);
    setShowRestoreModal(true);
  };

  const columns = [
    {
      title: 'Utilisateur',
      field: (row: DeletedUser) => formatUserInfo(row),
      sortable: false
    },
    {
      title: 'Date de suppression',
      field: 'deletedAt' as keyof DeletedUser,
      sortable: true
    },
    {
      title: 'Niveau de suppression',
      field: (row: DeletedUser) => formatDeletionLevel(row.deletionLevel),
      sortable: false
    },
    {
      title: 'Deadline / Temps restant',
      field: (row: DeletedUser) => formatDeadline(row),
      sortable: false
    }
  ];

  const renderActions = (user: DeletedUser) => (
    <div className="flex justify-end space-x-2">
      {user.canRestore && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => openRestoreModal(user)}
          className="text-green-600 border-green-600 hover:bg-green-50"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Restaurer
        </Button>
      )}
      {user.isOverdue && (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          En retard
        </span>
      )}
    </div>
  );

  const restoreModalFooter = (
    <div className="flex justify-end space-x-3">
      <Button
        variant="outline"
        onClick={() => setShowRestoreModal(false)}
        disabled={restoring}
      >
        Annuler
      </Button>
      <Button
        onClick={handleRestore}
        loading={restoring}
        disabled={restoring}
        className="bg-green-600 hover:bg-green-700"
      >
        Restaurer l'utilisateur
      </Button>
    </div>
  );

  return (
    <>
      <div className="mb-4">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Système de suppression à 3 niveaux :</strong>
                <br />
                • <strong>Niveau 1 (Désactivé)</strong> : Récupérable pendant 30 jours
                <br />
                • <strong>Niveau 2 (Anonymisé)</strong> : Données anonymisées, suppression définitive dans 1 an
                <br />
                • <strong>Niveau 3 (Supprimé)</strong> : Suppression définitive effectuée
              </p>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        data={deletedUsers}
        columns={columns}
        keyField="id"
        loading={loading}
        actions={renderActions}
        emptyMessage="Aucun utilisateur supprimé"
      />

      {/* Modal de confirmation de restauration */}
      <Modal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        title="Restaurer l'utilisateur"
        footer={restoreModalFooter}
      >
        {userToRestore && (
          <div>
            <p>
              Êtes-vous sûr de vouloir restaurer l'utilisateur suivant ?
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="font-medium">
                {userToRestore.originalFirstName || userToRestore.firstName}{' '}
                {userToRestore.originalLastName || userToRestore.lastName}
              </div>
              <div className="text-sm text-gray-600">
                {userToRestore.originalEmail || userToRestore.email}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Supprimé le : {userToRestore.deletedAt}
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              L'utilisateur retrouvera l'accès à son compte et ses données originales seront restaurées.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
};

export default DeletedUsersTable;