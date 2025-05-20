import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { adminEmailTemplatesApi } from '../../services/api';
import Alert from '../../components/common/Alert';

interface EmailTemplate {
    id: number;
    name: string;
    subject: string;
    content: string;
    type: string;
    variables: string[];
    isSystem: boolean;
    identifier: string;
}

const EmailTemplateEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // État du formulaire
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('notification');
    const [variables, setVariables] = useState('');
    const [isSystem, setIsSystem] = useState(false);
    const [identifier, setIdentifier] = useState('');

    // Erreurs de validation
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

    // Charger les données du template
    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                setLoading(true);
                const response = await adminEmailTemplatesApi.get(parseInt(id || '0'));
                const template = response.data;

                setName(template.name);
                setSubject(template.subject);
                setContent(template.content);
                setType(template.type);
                setVariables(template.variables.join(', '));
                setIsSystem(template.isSystem);
                setIdentifier(template.identifier);
            } catch (err) {
                console.error('Error fetching template:', err);
                setError('Erreur lors du chargement du template');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchTemplate();
        }
    }, [id]);

    // Valider le formulaire
    const validateForm = () => {
        const errors: {[key: string]: string} = {};

        if (!name.trim()) errors.name = 'Le nom est requis';
        if (!subject.trim()) errors.subject = 'Le sujet est requis';
        if (!content.trim()) errors.content = 'Le contenu est requis';
        if (!type) errors.type = 'Le type est requis';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Gérer la soumission du formulaire
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            window.scrollTo(0, 0);
            return;
        }

        try {
            setSaving(true);
            setError(null);

            // Préparer les variables (conversion de la chaîne en tableau)
            const variablesArray = variables
                .split(',')
                .map(v => v.trim())
                .filter(v => v);

            const templateData = {
                name,
                subject,
                content,
                type,
                variables: variablesArray
            };

            await adminEmailTemplatesApi.update(parseInt(id || '0'), templateData);

            setSuccess('Template mis à jour avec succès');
            setTimeout(() => {
                setSuccess(null);
            }, 3000);
        } catch (err) {
            console.error('Error updating template:', err);
            setError('Erreur lors de la mise à jour du template');
            window.scrollTo(0, 0);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <AdminHeader title="Modification du template d'email" />

                <div className="p-6">
                    {error && (
                        <Alert
                            type="error"
                            message={error}
                            onClose={() => setError(null)}
                        />
                    )}

                    {success && (
                        <Alert
                            type="success"
                            message={success}
                            onClose={() => setSuccess(null)}
                        />
                    )}

                    <div className="flex mb-6">
                        <button
                            onClick={() => navigate('/admin/email-templates')}
                            className="flex items-center text-blue-700 hover:text-blue-900"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Retour à la liste
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
                        </div>
                    ) : (
                        <div className="bg-white shadow rounded-lg p-6">
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nom du template*
                                        </label>
                                        <input
                                            type="text"
                                            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                                formErrors.name ? 'border-red-500' : ''
                                            }`}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            disabled={isSystem} // Désactiver si c'est un template système
                                        />
                                        {isSystem && (
                                            <p className="mt-1 text-xs text-gray-500">
                                                Ce template est un template système. Son nom ne peut pas être modifié.
                                            </p>
                                        )}
                                        {formErrors.name && (
                                            <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Type de template*
                                        </label>
                                        <select
                                            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                                formErrors.type ? 'border-red-500' : ''
                                            }`}
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                        >
                                            <option value="notification">Notification</option>
                                            <option value="reservation">Réservation</option>
                                            <option value="invoice">Facturation</option>
                                            <option value="reminder">Rappel</option>
                                            <option value="welcome">Bienvenue</option>
                                        </select>
                                        {formErrors.type && (
                                            <p className="mt-1 text-sm text-red-500">{formErrors.type}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Variables (séparées par des virgules)
                                        </label>
                                        <input
                                            type="text"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            value={variables}
                                            onChange={(e) => setVariables(e.target.value)}
                                            placeholder="nom, email, date, session, etc."
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Utilisez ces variables dans votre template sous la
                                            forme {'{{'}variable{'}}'}
                                        </p>
                                    </div>
                                    <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Identifiant technique
                                        </label>
                                        <input
                                            type="text"
                                            className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
                                            value={identifier}
                                            disabled
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Cet identifiant est utilisé dans le code pour référencer ce template. Il ne
                                            peut pas être modifié.
                                        </p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Sujet*
                                        </label>
                                        <input
                                            type="text"
                                            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                                formErrors.subject ? 'border-red-500' : ''
                                            }`}
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                        />
                                        {formErrors.subject && (
                                            <p className="mt-1 text-sm text-red-500">{formErrors.subject}</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Contenu*
                                        </label>
                                        <div className="mb-2 text-sm text-gray-500">
                                            Utilisez le HTML pour formater le contenu. Les variables sont entourées par
                                            des accolades doubles: {'{{'}variable{'}}'}
                                        </div>
                                        <textarea
                                            rows={15}
                                            className={`block w-full font-mono rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                                formErrors.content ? 'border-red-500' : ''
                                            }`}
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                        />
                                        {formErrors.content && (
                                            <p className="mt-1 text-sm text-red-500">{formErrors.content}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8 border-t border-gray-200 pt-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/admin/email-templates')}
                                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        {saving ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        ) : (
                                            <Save className="h-5 w-5 mr-2" />
                                        )}
                                        Enregistrer
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailTemplateEdit;