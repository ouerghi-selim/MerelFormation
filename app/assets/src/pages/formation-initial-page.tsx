import { useState, useEffect } from 'react';
import { Clock, Calendar, Award, CheckCircle, Users, BookOpen, Car, CreditCard } from 'lucide-react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/config/axios';
import classroom from '@assets/images/pages/classroom.png';
import practical from '@assets/images/pages/practical.png';

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
    const { id } = useParams<{ id: string }>();
    const [formation, setFormation] = useState<Formation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const prerequisites = [
        { id: 1, text: "Permis B en cours de validité (hors période probatoire)" },
        { id: 2, text: "Maîtrise du Français oral et écrit" },
        { id: 3, text: "Notions en anglais écrit" }
    ];

    const modules = [
        {
            title: "Organisation du Transport",
            duration: "21h",
            points: [
                "Réglementation nationale du transport de personnes",
                "Code des transports et textes officiels",
                "Gestion des contrôles et sanctions"
            ]
        },
        {
            title: "Sécurité Routière",
            duration: "28h",
            points: [
                "Règles du code de la route",
                "Éco-conduite et sécurité",
                "Gestion des incidents"
            ]
        },
        {
            title: "Gestion et Réglementation",
            duration: "35h",
            points: [
                "Gestion d'entreprise taxi",
                "Réglementation locale",
                "Obligations comptables et fiscales"
            ]
        }
    ];

    useEffect(() => {
        const fetchFormation = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(`/api/formations/${id}`);
                setFormation(response.data);
                setError(null);
            } catch (err) {
                setError('Erreur lors du chargement de la formation');
                console.error('Error fetching formation:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchFormation();
        }
    }, [id]);

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
                                    <Clock className="h-6 w-6 mr-2" />
                                    <span>{formation.duration} heures</span>
                                </div>
                                <div className="flex items-center bg-blue-800 rounded-lg p-3">
                                    <Award className="h-6 w-6 mr-2" />
                                    <span>95% de réussite</span>
                                </div>
                                <div className="flex items-center bg-blue-800 rounded-lg p-3">
                                    <Users className="h-6 w-6 mr-2" />
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
                        <button className="bg-yellow-500 text-blue-900 px-8 py-4 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
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
                        {prerequisites.map((prereq) => (
                            <div key={prereq.id} className="bg-white p-6 rounded-lg shadow-lg">
                                <CheckCircle className="h-8 w-8 text-green-500 mb-4" />
                                <p className="text-gray-700">{prereq.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Programme Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-12">Programme de formation</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {modules.map((module, index) => (
                            <div key={index} className="bg-white p-8 rounded-lg shadow-lg">
                                <BookOpen className="h-8 w-8 text-blue-900 mb-4" />
                                <h3 className="text-xl font-bold mb-4">{module.title}</h3>
                                <p className="text-blue-900 font-bold mb-4">{module.duration}</p>
                                <ul className="space-y-3">
                                    {module.points.map((point, i) => (
                                        <li key={i} className="flex items-start">
                                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                                            <span className="text-gray-600">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
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
                                    <Car className="h-5 w-5 text-blue-900 mr-2 mt-1" />
                                    <span>Véhicule école équipé taxi avec doubles commandes</span>
                                </li>
                                <li className="flex items-start">
                                    <CreditCard className="h-5 w-5 text-blue-900 mr-2 mt-1" />
                                    <span>Équipements professionnels complets (taximètre, terminal de paiement)</span>
                                </li>
                                <li className="flex items-start">
                                    <Calendar className="h-5 w-5 text-blue-900 mr-2 mt-1" />
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
                                        <Calendar className="h-5 w-5 mr-2" />
                                        <span>Du {new Date(session.startDate).toLocaleDateString()} au {new Date(session.endDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600 mb-4">
                                        <Users className="h-5 w-5 mr-2" />
                                        <span>{session.maxParticipants} places maximum</span>
                                    </div>
                                    <button className="w-full bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800">
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
                        <button className="bg-yellow-500 text-blue-900 px-8 py-4 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
                            S'inscrire maintenant
                        </button>
                        <button className="bg-white text-blue-900 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                            Nous contacter
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FormationInitialePage;