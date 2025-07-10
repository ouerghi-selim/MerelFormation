// src/pages/admin/SessionNew.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
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
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <AdminHeader
                    title="Création d'une nouvelle session"
                    breadcrumbItems={[
                        { label: 'Admin', path: '/admin' },
                        { label: 'Sessions', path: '/admin/sessions' },
                        { label: 'Nouvelle session' }
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
                </div>
            </div>
        </div>
    );
};

export default SessionNew;