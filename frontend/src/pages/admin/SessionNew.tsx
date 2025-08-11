// src/pages/admin/SessionNew.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { useNotification } from '../../contexts/NotificationContext';
import SessionForm from '../../components/admin/SessionForm';

const SessionNew: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useNotification();
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(true);

    const handleSave = async (sessionData: any) => {
        try {
            const response = await fetch('/api/admin/sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(sessionData)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la création de la session');
            }

            const result = await response.json();
            addToast('Session créée avec succès', 'success');
            
            setTimeout(() => {
                navigate('/admin/sessions');
            }, 1500);
            
            return result;
        } catch (err) {
            console.error('Error creating session:', err);
            setError('Erreur lors de la création de la session');
            addToast('Erreur lors de la création de la session', 'error');
            throw err;
        }
    };

    const handleCancel = () => {
        navigate('/admin/sessions');
    };

    return (
        <AdminLayout
            title="Création d'une nouvelle session"
            breadcrumbItems={[
                { label: 'Admin', path: '/admin' },
                { label: 'Sessions', path: '/admin/sessions' },
                { label: 'Nouvelle session' }
            ]}
        >
                    {error && (
                        <Alert
                            type="error"
                            message={error}
                            onClose={() => setError(null)}
                        />
                    )}

                    <div className="flex mb-6">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/admin/sessions')}
                            icon={<ArrowLeft className="h-4 w-4" />}
                        >
                            Retour à la liste
                        </Button>
                    </div>

                    <SessionForm
                        mode="create"
                        onSave={handleSave}
                        onCancel={handleCancel}
                        isOpen={showForm}
                    />
        </AdminLayout>
    );
};

export default SessionNew;