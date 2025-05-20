// LocationPage.tsx
import { useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import taxiCar from '@assets/images/pages/taxi-car.png';
import LocationForm from './LocationForm/LocationForm';
import Button from '../../components/common/Button';

const LocationPage = () => {
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-blue-900 text-white py-16">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Location Véhicule « double commande »</h1>
                    <p className="text-xl mb-8 text-blue-100">
                        Véhicule équipé pour l'examen TAXI & VTC
                    </p>
                    <Button
                        onClick={() => setShowModal(true)}
                        variant="secondary"
                        className="bg-yellow-500 text-blue-900 hover:bg-yellow-400"
                        size="lg"
                    >
                        Réserver un véhicule
                    </Button>
                </div>
            </div>

            {/* Section d'information principale */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
                        <h2 className="text-3xl font-bold mb-6">Examen TAXI-VTC</h2>
                        <p className="text-gray-700 mb-6">
                            Vous passez l'examen pratique Taxi VTC ? Vous devez vous présenter le jour de l'examen pratique avec un véhicule équipé des doubles commandes.
                        </p>
                        <div className="space-y-4 mb-6">
                            <div className="flex items-start">
                                <CheckCircle className="h-6 w-6 text-green-500 mr-2 mt-1 flex-shrink-0" />
                                <p className="text-gray-700">
                                    <strong>Pour l'examen TAXI :</strong> le véhicule devra obligatoirement être aménagé avec les équipements obligatoires (compteur horo-kilométrique « compteur », lumineux, imprimante)
                                </p>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle className="h-6 w-6 text-green-500 mr-2 mt-1 flex-shrink-0" />
                                <p className="text-gray-700">
                                    <strong>Pour l'examen VTC :</strong> seul l'équipement double commande est obligatoire
                                </p>
                            </div>
                        </div>
                        <p className="text-gray-700 font-medium">
                            Nous vous proposons la location d'un véhicule agrée pour l'examen TAXI VTC à Rennes en Ille et Vilaine
                        </p>
                    </div>

                    {/* Étapes de réservation */}
                    <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
                        <h2 className="text-3xl font-bold mb-6">Comment réserver ?</h2>
                        <div className="space-y-6">
                            <ReservationStep number={1} title="Remplissez le formulaire">
                                Pour louer le véhicule rien de plus simple, cliquez sur le bouton "Réserver un véhicule" et remplissez le formulaire de demande.
                            </ReservationStep>

                            <ReservationStep number={2} title="Recevez votre devis">
                                À réception de votre demande, nous vous enverrons un devis personnalisé par email.
                            </ReservationStep>

                            <ReservationStep number={3} title="Confirmation et paiement">
                                Après acceptation du devis, vous pourrez confirmer votre réservation et procéder au paiement.
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
                    <h2 className="text-3xl font-bold mb-12 text-center">Nos véhicules d'examen</h2>

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
                                <h3 className="text-2xl font-bold mb-4">Volkswagen Touran Taxi Auto-École</h3>
                                <div className="space-y-4 mb-6">
                                    <VehicleFeature>Boîte automatique</VehicleFeature>
                                    <VehicleFeature>Équipements taxi obligatoires</VehicleFeature>
                                    <VehicleFeature>Système auto-école (double commande)</VehicleFeature>
                                    <VehicleFeature>3 rétroviseurs supplémentaires</VehicleFeature>
                                    <VehicleFeature>Module électrique</VehicleFeature>
                                </div>
                                <p className="text-gray-700 mb-6">
                                    Des tarifs différents pour préparer au mieux votre passage d'examen, avec options de location à l'heure ou à la journée.
                                </p>
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
                    <h2 className="text-3xl font-bold mb-6">Prêt pour votre examen de taxi ?</h2>
                    <p className="text-xl mb-8">
                        Réservez dès maintenant votre véhicule équipé pour maximiser vos chances de réussite
                    </p>
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