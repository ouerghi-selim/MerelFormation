// LocationPage.tsx
import { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import taxiCar from '@assets/images/pages/taxi-car.png';
import LocationForm from './LocationForm/LocationForm';
import Button from '../../components/common/Button';
import { adminContentTextApi } from '../../services/api';

interface CMSContent {
  [key: string]: string;
}

const LocationPage = () => {
    const [showModal, setShowModal] = useState(false);
    const [cmsContent, setCmsContent] = useState<CMSContent>({});
    const [loading, setLoading] = useState(true);

    // Fonction pour récupérer le contenu CMS
    const fetchCMSContent = async () => {
        try {
            // Récupérer tous les contenus de la page location
            const contentResponse = await adminContentTextApi.getAll({
                section: ['location_hero', 'location_info', 'location_booking', 'location_vehicles', 'location_cta'].join(',')
            });
            
            // Transformer en objet avec identifiants comme clés
            const contentMap: CMSContent = {};
            if (contentResponse.data?.data) {
                contentResponse.data.data.forEach((item: any) => {
                    contentMap[item.identifier] = item.content;
                });
            }
            setCmsContent(contentMap);
            
        } catch (err) {
            console.error('Erreur lors du chargement du contenu CMS:', err);
            // En cas d'erreur, on peut continuer avec les valeurs par défaut
        }
    };

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                await fetchCMSContent();
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // Fonction helper pour récupérer du contenu CMS avec fallback
    const getContent = (identifier: string, fallback: string) => {
        return cmsContent[identifier] || fallback;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-blue-900 text-white py-16">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6"
                        dangerouslySetInnerHTML={{__html: getContent('location_hero_title', 'Location Véhicule « double commande »')}} />
                    <p className="text-xl mb-8 text-blue-100"
                        dangerouslySetInnerHTML={{__html: getContent('location_hero_subtitle', 'Véhicule équipé pour l\'examen TAXI & VTC')}} />
                    <Button
                        onClick={() => setShowModal(true)}
                        variant="secondary"
                        className="bg-yellow-500 text-blue-900 hover:bg-yellow-400"
                        size="lg"
                    >
                       <p dangerouslySetInnerHTML={{__html: getContent('location_hero_cta', 'Réserver un véhicule')}} />
                    </Button>
                </div>
            </div>

            {/* Section d'information principale */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
                        <h2 className="text-3xl font-bold mb-6"
                            dangerouslySetInnerHTML={{__html: getContent('location_info_title', 'Examen TAXI-VTC')}} />

                        <p className="text-gray-700 mb-6"
                           dangerouslySetInnerHTML={{__html: getContent('location_info_description', 'Vous passez l\'examen pratique Taxi VTC ? Vous devez vous présenter le jour de l\'examen pratique avec un véhicule équipé des doubles commandes.')}} />
                        <div className="space-y-4 mb-6">
                            <div className="flex items-start">
                                <CheckCircle className="h-6 w-6 text-green-500 mr-2 mt-1 flex-shrink-0" />
                                <p className="text-gray-700"
                                    dangerouslySetInnerHTML={{__html: getContent('location_info_taxi_requirements', 'Pour l\'examen TAXI : le véhicule devra obligatoirement être aménagé avec les équipements obligatoires (compteur horo-kilométrique « compteur », lumineux, imprimante)')}} />
                            </div>
                            <div className="flex items-start">
                                <CheckCircle className="h-6 w-6 text-green-500 mr-2 mt-1 flex-shrink-0" />
                                <p className="text-gray-700"
                                    dangerouslySetInnerHTML={{__html: getContent('location_info_vtc_requirements', 'Pour l\'examen VTC : seul l\'équipement double commande est obligatoire')}}/>
                            </div>
                        </div>
                        <p className="text-gray-700 font-medium"
                            dangerouslySetInnerHTML={{__html: getContent('location_info_footer', 'Nous vous proposons la location d\'un véhicule agréé pour l\'examen TAXI VTC à Rennes en Ille et Vilaine')}}/>
                    </div>

                    {/* Étapes de réservation */}
                    <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
                        <h2 className="text-3xl font-bold mb-6"
                            dangerouslySetInnerHTML={{__html: getContent('location_booking_title', 'Comment réserver ?')}}/>
                        <div className="space-y-6">
                            <ReservationStep 
                                number={1} 
                                title={getContent('location_booking_step1_title', 'Choisissez votre date')}
                            >
                                <p dangerouslySetInnerHTML={{__html: getContent('location_booking_step1_description', 'Sélectionnez la date et l\'heure de votre examen dans notre calendrier en ligne')}}/>
                            </ReservationStep>

                            <ReservationStep 
                                number={2} 
                                title={getContent('location_booking_step2_title', 'Confirmez votre réservation')}
                            >
                                <p dangerouslySetInnerHTML={{__html: getContent('location_booking_step2_description', 'Remplissez le formulaire avec vos informations et validez votre demande')}}/>
                            </ReservationStep>

                            <ReservationStep 
                                number={3} 
                                title={getContent('location_booking_step3_title', 'Recevez la confirmation')}
                            >
                                <p dangerouslySetInnerHTML={{__html: getContent('location_booking_step3_description', 'Nous vous contactons sous 24h pour confirmer et finaliser votre réservation')}} />
                            </ReservationStep>
                        </div>

                        <div className="mt-8 text-center">
                            <Button
                                onClick={() => setShowModal(true)}
                                variant="primary"
                                size="lg"
                            >
                                Réserver maintenant
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section de détails du véhicule */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-12 text-center"
                        dangerouslySetInnerHTML={{__html: getContent('location_vehicles_title', 'Nos véhicules d\'examen')}}/>
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="md:flex">
                            <div className="md:w-1/2">
                                <img
                                    src={taxiCar}
                                    alt="Volkswagen Touran équipé taxi"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="md:w-1/2 p-8">
                                <h3 className="text-2xl font-bold mb-4"
                                    dangerouslySetInnerHTML={{__html: getContent('location_vehicles_model', 'Volkswagen Touran Taxi Auto-École')}}/>
                                <div className="space-y-4 mb-6">
                                    <VehicleFeature>Boîte automatique</VehicleFeature>
                                    <VehicleFeature>Équipements taxi obligatoires</VehicleFeature>
                                    <VehicleFeature>Système auto-école (double commande)</VehicleFeature>
                                    <VehicleFeature>3 rétroviseurs supplémentaires</VehicleFeature>
                                    <VehicleFeature>Module électrique</VehicleFeature>
                                </div>
                                <p className="text-gray-700 mb-6"
                                    dangerouslySetInnerHTML={{__html: getContent('location_vehicles_pricing', 'Des tarifs différents pour préparer au mieux votre passage d\'examen, avec options de location à l\'heure ou à la journée.')}}/>
                                <Button
                                    onClick={() => setShowModal(true)}
                                    variant="primary"
                                    icon={<ArrowRight className="ml-2 h-4 w-4" />}
                                >
                                    Réserver ce véhicule
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-16 bg-blue-900 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-6"
                        dangerouslySetInnerHTML={{__html: getContent('location_cta_title', 'Prêt pour votre examen de taxi ?')}}/>
                    <p className="text-xl mb-8"
                        dangerouslySetInnerHTML={{__html: getContent('location_cta_description', 'Réservez dès maintenant votre véhicule équipé pour maximiser vos chances de réussite')}}/>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button
                            onClick={() => setShowModal(true)}
                            variant="secondary"
                            className="bg-yellow-500 text-blue-900 hover:bg-yellow-400"
                            size="lg"
                        >
                            Réserver un véhicule
                        </Button>
                        <Link
                            to="/contact"
                            className="bg-white text-blue-900 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                        >
                            Nous contacter
                        </Link>
                    </div>
                </div>
            </section>

            {/* Formulaire modal */}
            <LocationForm isOpen={showModal} onClose={() => setShowModal(false)} />
        </div>
    );
};

// Composants auxiliaires
const ReservationStep = ({ number, title, children }) => (
    <div className="flex items-start">
        <div className="bg-blue-900 text-white w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4">{number}</div>
        <div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-700">{children}</p>
        </div>
    </div>
);

const VehicleFeature = ({ children }) => (
    <div className="flex items-center">
        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
        <span>{children}</span>
    </div>
);

export default LocationPage;