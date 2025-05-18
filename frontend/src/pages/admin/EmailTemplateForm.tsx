import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import api from '../../services/api';
import { Editor } from '@tinymce/tinymce-react'; // Vous devrez installer cette dépendance

const EmailTemplateForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = id !== 'new';

    const [loading, setLoading] = useState(isEditMode);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        content: '',
        type: 'notification', // Par défaut
        variables: []
    });

    const [testData, setTestData] = useState({});

    useEffect(() => {
        if (isEditMode) {
            fetchTemplate();
        }
    }, [id]);

    const fetchTemplate = async () => {
        try {
            const response = await api.get(`/admin/email-templates/${id}`);
            setFormData(response.data);

            // Préparer les données de test pour la prévisualisation
            const testValues = {};
            response.data.variables.forEach(variable => {
                testValues[variable] = `[Valeur de test pour ${variable}]`;
            });
            setTestData(testValues);
        } catch (error) {
            setError("Erreur lors du chargement du template");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditorChange = (content) => {
        setFormData(prev => ({ ...prev, content }));
    };

    const handleVariableChange = (e) => {
        // Gérer les variables sous forme de liste
        const variables = e.target.value.split(',').map(v => v.trim()).filter(v => v);
        setFormData(prev => ({ ...prev, variables }));

        // Mettre à jour les données de test
        const testValues = {};
        variables.forEach(variable => {
            testValues[variable] = testData[variable] || `[Valeur de test pour ${variable}]`;
        });
        setTestData(testValues);
    };

    const handleTestDataChange = (variable, value) => {
        setTestData(prev => ({ ...prev, [variable]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (isEditMode) {
                await api.put(`/admin/email-templates/${id}`, formData);
                setSuccess('Template mis à jour avec succès');
            } else {
                await api.post('/admin/email-templates', formData);
                setSuccess('Template créé avec succès');
                setTimeout(() => {
                    navigate('/admin/email-templates');
                }, 2000);
            }
        } catch (error) {
            setError('Erreur lors de l\'enregistrement du template');
        }
    };

    const generatePreview = async () => {
        try {
            const response = await api.post(`/admin/email-templates/${id}/preview`, testData);
            setPreviewData(response.data);
            setShowPreview(true);
        } catch (error) {
            setError('Erreur lors de la génération de l\'aperçu');
        }
    };

    if (loading) {
        return <div className="text-center py-8">Chargement...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-6">
                {isEditMode ? 'Modifier le template' : 'Nouveau template'}
            </h1>

            {error && <Alert type="error" message={error} className="mb-4" />}
            {success && <Alert type="success" message={success} className="mb-4" />}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-1">Nom du template</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                    >
                        <option value="notification">Notification</option>
                        <option value="reservation">Réservation</option>
                        <option value="invoice">Facturation</option>
                        <option value="reminder">Rappel</option>
                        <option value="welcome">Bienvenue</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Sujet</label>
                    <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Variables (séparées par des virgules)</label>
                    <input
                        type="text"
                        name="variables"
                        value={formData.variables.join(', ')}
                        onChange={handleVariableChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="nom, prenom, date, etc."
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        Utilisez ces variables dans votre template sous la forme {{variable}}
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Contenu</label>
                    <Editor
                        initialValue={formData.content}
                        onEditorChange={handleEditorChange}
                        init={{
                            height: 400,
                            menubar: true,
                            plugins: [
                                'advlist autolink lists link image charmap print preview anchor',
                                'searchreplace visualblocks code fullscreen',
                                'insertdatetime media table paste code help wordcount'
                            ],
                            toolbar:
                                'undo redo | formatselect | bold italic backcolor | \
                                alignleft aligncenter alignright alignjustify | \
                                bullist numlist outdent indent | removeformat | help'
                        }}
                    />
                </div>

                {isEditMode && (
                    <div className="border p-4 rounded-md bg-gray-50">
                        <h3 className="font-medium mb-2">Données de test pour prévisualisation</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {formData.variables.map(variable => (
                                <div key={variable}>
                                    <label className="block text-sm font-medium mb-1">{{variable}}</label>
                                    <input
                                        type="text"
                                        value={testData[variable] || ''}
                                        onChange={(e) => handleTestDataChange(variable, e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-4">
                            <Button
                                type="button"
                                onClick={generatePreview}
                                variant="secondary"
                            >
                                Prévisualiser
                            </Button>
                        </div>
                    </div>
                )}

                <div className="flex justify-between">
                    <Button
                        type="button"
                        onClick={() => navigate('/admin/email-templates')}
                        variant="secondary"
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                    >
                        {isEditMode ? 'Mettre à jour' : 'Créer le template'}
                    </Button>
                </div>
            </form>

            {showPreview && previewData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-screen overflow-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Prévisualisation de l'email</h2>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="border-b pb-2 mb-4">
                            <span className="font-medium">Sujet: </span>
                            {previewData.subject}
                        </div>

                        <div className="border p-4 rounded bg-gray-50">
                            <div dangerouslySetInnerHTML={{ __html: previewData.content }} />
                        </div>

                        <div className="mt-4 text-right">
                            <Button
                                onClick={() => setShowPreview(false)}
                                variant="secondary"
                            >
                                Fermer
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailTemplateForm;