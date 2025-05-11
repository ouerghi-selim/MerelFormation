import { useState, useEffect, JSXElementConstructor, ReactElement, ReactNode, ReactPortal} from 'react';
import {Clock, Calendar, Award, CheckCircle, Users, BookOpen, Car, CreditCard} from 'lucide-react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import classroom from '@assets/images/pages/classroom.png';
import practical from '@assets/images/pages/practical.png';
import SessionSelectionModal from '../components/front/modals/SessionSelectionModal';
import RegistrationFormModal from '../components/front/modals/RegistrationFormModal';

interface Formation {
    id: number;
    title: string;
    description: string;
    duration: number;
    price: number;
    type: string;
    prerequisites: string;
    isActive: boolean;
    createdAt: string;
    sessions: Session[];
}

interface Session {
    id: number;
    startDate: string;
    endDate: string;
    maxParticipants: number;
    status: string;
}

const FormationInitialePage = () => {
    const {id} = useParams<{ id: string }>();
    const [formation, setFormation] = useState<Formation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [prerequisites, setPrerequisites] = useState<any[]>([]);
    const [modules, setModules] = useState<any[]>([]);

    // États pour les modaux
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

    useEffect(() => {
        const fetchFormation = async () => {
            try {
                console.log("Attempting to fetch formation with id:", id);
                setLoading(true);
                const response = await axios.get(`/api/formations/${id}`);
                console.log("API response:", response.data);
                setFormation(response.data);

                // Récupérer les prérequis et les modules depuis la réponse API
                if (response.data.prerequisites) {
                    setPrerequisites(response.data.prerequisites);
                }
                if (response.data.modules) {
                    setModules(response.data.modules);
                }

                setError(null);
            } catch (err) {
                console.error('Error fetching formation:', err);
                setError('Erreur lors du chargement de la formation');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchFormation();
        } else {
            console.log("No ID parameter found");
            setError('Aucun identifiant de formation trouvé');
            setLoading(false);
        }
    }, [id]);
    const handleShowSessions = () => {
        setShowSessionModal(true);
    };

    const handleSelectSession = (sessionId: number) => {
        setSelectedSessionId(sessionId);
        setShowSessionModal(false);
        setShowRegistrationForm(true);
    };

    const handleCloseModals = () => {
        setShowSessionModal(false);
        setShowRegistrationForm(false);
    };
    if (loading) {
        return <div className="flex justify-center items-center h-screen">Chargement...</div>;
    }

    if (error || !formation) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error || 'Formation non trouvée'}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-blue-900 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2">
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">{formation.title}</h1>
                            <p className="text-xl mb-8 text-blue-100">{formation.description}</p>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center bg-blue-800 rounded-lg p-3">
                                    <Clock className="h-6 w-6 mr-2"/>
                                    <span>{formation.duration} heures</span>
                                </div>
                                <div className="flex items-center bg-blue-800 rounded-lg p-3">
                                    <Award className="h-6 w-6 mr-2"/>
                                    <span>95% de réussite</span>
                                </div>
                                <div className="flex items-center bg-blue-800 rounded-lg p-3">
                                    <Users className="h-6 w-6 mr-2"/>
                                    <span>8 à 12 élèves</span>
                                </div>
                            </div>
                        </div>
                        <div className="md:w-1/2">
                            <img
                                src={classroom}
                                alt="Formation taxi en salle"
                                className="rounded-lg shadow-xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Prix et CTA */}
            <section className="py-8 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-4">
                            <span className="text-3xl font-bold text-blue-900">{formation.price}€</span>
                            <span className="text-gray-600">(Exonéré de TVA)</span>
                        </div>
                        <button
                            onClick={handleShowSessions}
                            className="bg-yellow-500 text-blue-900 px-8 py-4 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
                            S'inscrire à la formation
                        </button>
                    </div>
                </div>
            </section>

            {/* Prérequis Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-8">Prérequis pour la formation</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {prerequisites.length > 0 ? (
                            prerequisites.map((prereq) => (
                                <div key={prereq.id} className="bg-white p-6 rounded-lg shadow-lg">
                                    <CheckCircle className="h-8 w-8 text-green-500 mb-4"/>
                                    <p className="text-gray-700">{prereq.content}</p>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center text-gray-500">
                                Aucun prérequis spécifié pour cette formation.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Programme Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-12">Programme de formation</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {modules.length > 0 ? (
                            modules.map((module) => (
                                <div key={module.id} className="bg-white p-8 rounded-lg shadow-lg">
                                    <BookOpen className="h-8 w-8 text-blue-900 mb-4"/>
                                    <h3 className="text-xl font-bold mb-4">{module.title}</h3>
                                    <p className="text-blue-900 font-bold mb-4">{module.duration}h</p>
                                    <ul className="space-y-3">
                                        {module.points && module.points.map((point: {
                                            id: any;
                                            content: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined;
                                        }, i: any) => (
                                            <li key={point.id || i} className="flex items-start">
                                                <CheckCircle
                                                    className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0"/>
                                                <span className="text-gray-600">{point.content}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center text-gray-500">
                                Aucun module défini pour cette formation.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Partie Pratique */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2">
                            <h2 className="text-3xl font-bold mb-6">Formation Pratique</h2>
                            <p className="text-gray-600 mb-6">
                                21 heures de formation pratique en conditions réelles avec :
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start">
                                    <Car className="h-5 w-5 text-blue-900 mr-2 mt-1"/>
                                    <span>Véhicule école équipé taxi avec doubles commandes</span>
                                </li>
                                <li className="flex items-start">
                                    <CreditCard className="h-5 w-5 text-blue-900 mr-2 mt-1"/>
                                    <span>Équipements professionnels complets (taximètre, terminal de paiement)</span>
                                </li>
                                <li className="flex items-start">
                                    <Calendar className="h-5 w-5 text-blue-900 mr-2 mt-1"/>
                                    <span>Sessions pratiques en conditions réelles</span>
                                </li>
                            </ul>
                        </div>
                        <div className="md:w-1/2">
                            <img
                                src={practical}
                                alt="Formation pratique taxi"
                                className="rounded-lg shadow-xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Prochaines sessions */}
            {formation.sessions && formation.sessions.length > 0 && (
                <section className="py-16 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold mb-8">Prochaines sessions</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {formation.sessions.map((session) => (
                                <div key={session.id} className="bg-white p-6 rounded-lg shadow-lg">
                                    <div className="flex items-center text-gray-600 mb-4">
                                        <Calendar className="h-5 w-5 mr-2"/>
                                        <span>Du {new Date(session.startDate).toLocaleDateString()} au {new Date(session.endDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600 mb-4">
                                        <Users className="h-5 w-5 mr-2"/>
                                        <span>{session.maxParticipants} places maximum</span>
                                    </div>
                                    <button
                                        onClick={() => handleSelectSession(session.id)}
                                        className="w-full bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800">
                                        Réserver cette session
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Final */}
            <section className="py-16 bg-blue-900 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-6">Prêt à devenir chauffeur de taxi ?</h2>
                    <p className="text-xl mb-8">
                        Rejoignez les 500+ professionnels déjà formés chez MerelFormation
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={handleShowSessions}
                            className="bg-yellow-500 text-blue-900 px-8 py-4 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
                            S'inscrire maintenant
                        </button>
                        <button
                            className="bg-white text-blue-900 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                            Nous contacter
                        </button>
                    </div>
                </div>
            </section>
            <SessionSelectionModal
                isOpen={showSessionModal}
                onClose={handleCloseModals}
                title={formation?.title || 'Formation'}
                sessions={formation?.sessions || []}
                onSelectSession={handleSelectSession}
            />

            <RegistrationFormModal
                isOpen={showRegistrationForm}
                onClose={handleCloseModals}
                sessionId={selectedSessionId}
            />
        </div>
    );
};

export default FormationInitialePage;