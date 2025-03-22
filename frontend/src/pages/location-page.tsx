import { useState } from 'react';
import {
  Calendar, CheckCircle, ArrowRight, X, User, Mail, Phone,
  MapPin, CreditCard, FileText, ChevronLeft, ChevronRight, Clock, Building
} from 'lucide-react';
import { Link } from 'react-router-dom';
import taxiCar from '@assets/images/pages/taxi-car.png';
import axios from "axios"; // Assurez-vous que cette image existe ou remplacez-la

const LocationPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [reservationData, setReservationData] = useState({
    name: '',
    firstName: '',
    birthDate: '',
    birthPlace: '',
    address: '',
    postalCode: '',
    city: '',
    phone: '',
    email: '',
    facturation: '',
    examCenter: '',
    formula: '',
    examDate: '',
    examTime: '',
    financing: '',
    paymentMethod: '',
    driverLicenseFront: null as File | null,
    driverLicenseBack: null as File | null,
    observations: '',
  });

  const handleNextStep = () => {
    setStep(prev => prev + 1);
    const modalContent = document.getElementById('modal-content');
    if (modalContent) modalContent.scrollTop = 0;
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
    const modalContent = document.getElementById('modal-content');
    if (modalContent) modalContent.scrollTop = 0;
  };

  const handleReservation = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    // Conversion des dates pour l'API
    const examDateObj = reservationData.examDate ? new Date(reservationData.examDate) : null;
    const birthDateObj = reservationData.birthDate ? new Date(reservationData.birthDate) : null;

    try {
      // Préparation des données pour l'API
      const formData = {
        // Informations de base pour VehicleRental
        rentalType: 'exam',
        status: 'pending',
        notes: reservationData.observations,

        // Dates d'examen (utilisées comme dates de location)
        startDate: examDateObj ? examDateObj.toISOString() : null,
        endDate: examDateObj ? examDateObj.toISOString() : null, // Même jour pour l'examen

        // Lieux
        pickupLocation: reservationData.examCenter,
        returnLocation: reservationData.examCenter,

        // Informations personnelles
        firstName: reservationData.firstName,
        lastName: reservationData.name,
        birthDate: birthDateObj ? birthDateObj.toISOString().split('T')[0] : null,
        birthPlace: reservationData.birthPlace,

        // Adresse
        address: reservationData.address,
        postalCode: reservationData.postalCode,
        city: reservationData.city,
        facturation: reservationData.facturation,

        // Informations d'examen
        examCenter: reservationData.examCenter,
        formula: reservationData.formula,
        examTime: reservationData.examTime,

        // Paiement
        financing: reservationData.financing,
        paymentMethod: reservationData.paymentMethod,
      };

      // Envoi à l'API
      await axios.post('/api/vehicle_rentals', formData);

      // Gestion du succès
      alert('Votre demande de réservation a été envoyée. Nous vous contacterons avec un devis personnalisé.');
      setShowModal(false);
      setStep(1);
    } catch (err) {
      console.error('Erreur lors de l\'envoi de la réservation:', err);
      alert('Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer.');
    }
  };
  // Définition des étapes du formulaire
  const steps = [
    { name: 'Identité', icon: <User className="h-4 w-4" /> },
    { name: 'Adresse', icon: <MapPin className="h-4 w-4" /> },
    { name: 'Examen', icon: <Calendar className="h-4 w-4" /> },
    { name: 'Paiement', icon: <CreditCard className="h-4 w-4" /> }
  ];
  return (

        <div className="min-h-screen bg-gray-50">
          {/* Hero Section */}
          <div className="bg-blue-900 text-white py-16">
            <div className="container mx-auto px-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Location Véhicule « double commande »</h1>
              <p className="text-xl mb-8 text-blue-100">
                Véhicule équipé pour l'examen TAXI & VTC
              </p>
              <button
                  onClick={() => setShowModal(true)}
                  className="bg-yellow-500 text-blue-900 px-8 py-4 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
              >
                Réserver un véhicule
              </button>
            </div>
          </div>

  {/* Section d'information principale */
  }
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

            <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
              <h2 className="text-3xl font-bold mb-6">Comment réserver ?</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-blue-900 text-white w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4">1</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Remplissez le formulaire</h3>
                    <p className="text-gray-700">
                      Pour louer le véhicule rien de plus simple, cliquez sur le bouton "Réserver un véhicule" et remplissez le formulaire de demande.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-900 text-white w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4">2</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Recevez votre devis</h3>
                    <p className="text-gray-700">
                      À réception de votre demande, nous vous enverrons un devis personnalisé par email.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-900 text-white w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4">3</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Confirmation et paiement</h3>
                    <p className="text-gray-700">
                      Après acceptation du devis, vous pourrez confirmer votre réservation et procéder au paiement.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-900 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-800 transition-colors"
                >
                  Réserver maintenant
                </button>
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
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Boîte automatique</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Équipements taxi obligatoires</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Système auto-école (double commande)</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>3 rétroviseurs supplémentaires</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Module électrique</span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-6">
                    Des tarifs différents pour préparer au mieux votre passage d'examen, avec options de location à l'heure ou à la journée.
                  </p>
                  <button
                      onClick={() => setShowModal(true)}
                      className="bg-blue-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors flex items-center"
                  >
                    Réserver ce véhicule <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Formulaire de réservation (modal) */}
        {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
              <div id="modal-content" className="bg-white rounded-xl shadow-2xl max-w-3xl w-full relative overflow-y-auto max-h-[90vh]">
                <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-10"
                    onClick={() => setShowModal(false)}
                >
                  <X size={24} />
                </button>

                <div className="bg-blue-900 text-white px-6 py-8 rounded-t-xl">
                  <h2 className="text-2xl font-bold text-center">Réservation de véhicule pour examen</h2>
                  <p className="text-center text-blue-100 mt-2">Remplissez ce formulaire pour réserver votre véhicule</p>

                  {/* Indicateur de progression amélioré */}
                  <div className="mt-8 pb-4">
                    <div className="flex items-center justify-between">
                      {steps.map((stepItem, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                                step > index + 1
                                    ? 'bg-green-500 border-green-500'
                                    : step === index + 1
                                        ? 'bg-blue-700 border-white'
                                        : 'bg-blue-800 border-blue-700'
                            } mb-2`}>
                              {step > index + 1 ? (
                                  <CheckCircle className="h-5 w-5 text-white" />
                              ) : (
                                  <span className="text-white font-bold">{index + 1}</span>
                              )}
                            </div>
                            <span className={`text-sm ${step === index + 1 ? 'text-white font-medium' : 'text-blue-200'}`}>
                        {stepItem.name}
                      </span>
                          </div>
                      ))}
                    </div>

                    {/* Ligne de progression */}
                    <div className="mt-4 relative">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-blue-700 rounded-full"></div>
                      <div
                          className="absolute top-0 left-0 h-1 bg-white rounded-full transition-all duration-300"
                          style={{ width: `${(step / steps.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleReservation} className="p-8">
                  {step === 1 && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                          <User className="mr-2 text-blue-900" />
                          Vos informations personnelles
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Nom</label>
                            <div className="relative">
                              <input
                                  type="text"
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  required
                                  onChange={(e) => setReservationData({...reservationData, name: e.target.value})}
                              />
                              <User className="absolute left-3 top-3 text-gray-400" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Prénom</label>
                            <div className="relative">
                              <input
                                  type="text"
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  required
                                  onChange={(e) => setReservationData({...reservationData, firstName: e.target.value})}
                              />
                              <User className="absolute left-3 top-3 text-gray-400" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
                            <div className="relative">
                              <input
                                  type="date"
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  required
                                  onChange={(e) => setReservationData({...reservationData, birthDate: e.target.value})}
                              />
                              <Calendar className="absolute left-3 top-3 text-gray-400" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Lieu de naissance</label>
                            <div className="relative">
                              <input
                                  type="text"
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  required
                                  onChange={(e) => setReservationData({...reservationData, birthPlace: e.target.value})}
                              />
                              <MapPin className="absolute left-3 top-3 text-gray-400" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                          <div className="relative">
                            <input
                                type="tel"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                                onChange={(e) => setReservationData({...reservationData, phone: e.target.value})}
                            />
                            <Phone className="absolute left-3 top-3 text-gray-400" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Adresse email</label>
                          <div className="relative">
                            <input
                                type="email"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                                onChange={(e) => setReservationData({...reservationData, email: e.target.value})}
                            />
                            <Mail className="absolute left-3 top-3 text-gray-400" />
                          </div>
                        </div>

                        <div className="pt-6">
                          <button
                              type="button"
                              className="flex items-center justify-center w-full bg-blue-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors"
                              onClick={handleNextStep}
                          >
                            Continuer <ChevronRight className="ml-2" />
                          </button>
                        </div>
                      </div>
                  )}

                  {step === 2 && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                          <MapPin className="mr-2 text-blue-900" />
                          Votre adresse
                        </h3>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Adresse postale</label>
                          <div className="relative">
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                                onChange={(e) => setReservationData({...reservationData, address: e.target.value})}
                            />
                            <MapPin className="absolute left-3 top-3 text-gray-400" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Code postal</label>
                            <div className="relative">
                              <input
                                  type="text"
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  required
                                  onChange={(e) => setReservationData({...reservationData, postalCode: e.target.value})}
                              />
                              <MapPin className="absolute left-3 top-3 text-gray-400" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Ville</label>
                            <div className="relative">
                              <input
                                  type="text"
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  required
                                  onChange={(e) => setReservationData({...reservationData, city: e.target.value})}
                              />
                              <Building className="absolute left-3 top-3 text-gray-400" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Facturation à</label>
                          <div className="relative">
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                                onChange={(e) => setReservationData({...reservationData, facturation: e.target.value})}
                            />
                            <FileText className="absolute left-3 top-3 text-gray-400" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-6">
                          <button
                              type="button"
                              className="flex items-center justify-center bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                              onClick={handlePrevStep}
                          >
                            <ChevronLeft className="mr-2" /> Retour
                          </button>
                          <button
                              type="button"
                              className="flex items-center justify-center bg-blue-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors"
                              onClick={handleNextStep}
                          >
                            Continuer <ChevronRight className="ml-2" />
                          </button>
                        </div>
                      </div>
                  )}

                  {step === 3 && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                          <Calendar className="mr-2 text-blue-900" />
                          Informations d'examen
                        </h3>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Centre d'examen</label>
                          <div className="relative">
                            <select
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                                required
                                onChange={(e) => setReservationData({...reservationData, examCenter: e.target.value})}
                            >
                              <option value="">Sélectionnez un centre</option>
                              <option value="35 Rennes (Bruz)">35 Rennes (Bruz)</option>
                              <option value="22 Saint Brieuc">22 Saint Brieuc</option>
                              <option value="56 Vannes">56 Vannes</option>
                              <option value="44 Nantes">44 Nantes</option>
                            </select>
                            <Building className="absolute left-3 top-3 text-gray-400" />
                            <ChevronRight className="absolute right-3 top-3 text-gray-400" />
                          </div>
                        </div>

                        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700">Type de formule</label>
                          <div className="space-y-4">
                            {reservationData.examCenter === "35 Rennes (Bruz)" ? (
                                <><label
                                    className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                                  <input
                                      type="radio"
                                      name="formula"
                                      value="Centre examen Rennes: Formule simple: ( 120€ TTC) Location Véhicule Taxi-Ecole"
                                      className="mt-1 mr-3"
                                      onChange={(e) => setReservationData({
                                        ...reservationData,
                                        formula: e.target.value
                                      })}/>
                                  <div>
                                    <span
                                        className="font-medium block">Centre examen Rennes: Formule simple (120€ TTC)</span>
                                    <span className="text-sm text-gray-600">Location Véhicule Taxi-Ecole</span>
                                  </div>
                                </label><label
                                    className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                                  <input
                                      type="radio"
                                      name="formula"
                                      value="Centre examen Rennes: Formule intégrale: (240 € TTC) Location Véhicule Taxi-Ecole pour votre passage + 1H30 En individuel de Prise en main du véhicule, Conduite"
                                      className="mt-1 mr-3"
                                      onChange={(e) => setReservationData({
                                        ...reservationData,
                                        formula: e.target.value
                                      })}/>
                                  <div>
                                    <span className="font-medium block">Centre examen Rennes: Formule intégrale (240€ TTC)</span>
                                    <span className="text-sm text-gray-600">Location Véhicule Taxi-Ecole pour votre passage + 1H30 En individuel de Prise en main du véhicule, Conduite</span>
                                  </div>
                                </label></>
                            ) : (
                                <><label
                                    className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                                  <input
                                      type="radio"
                                      name="formula"
                                      value="Centre examen Autres: Formule simple: (nous consulter) Location Véhicule Taxi-Ecole"
                                      className="mt-1 mr-3"
                                      onChange={(e) => setReservationData({
                                        ...reservationData,
                                        formula: e.target.value
                                      })}/>
                                  <div>
                                    <span className="font-medium block">Centre examen Autres: Formule simple (nous consulter)</span>
                                    <span className="text-sm text-gray-600">Location Véhicule Taxi-Ecole</span>
                                  </div>
                                </label><label
                                    className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                                  <input
                                      type="radio"
                                      name="formula"
                                      value="Centre examen autres: Formule intégrale: (nous consulter) Location Véhicule Taxi-Ecole pour votre passage + 1H30 En individuel Prise en main du véhicule, Conduite"
                                      className="mt-1 mr-3"
                                      onChange={(e) => setReservationData({
                                        ...reservationData,
                                        formula: e.target.value
                                      })}/>
                                  <div>
                                    <span className="font-medium block">Centre examen autres: Formule intégrale (nous consulter)</span>
                                    <span className="text-sm text-gray-600">Location Véhicule Taxi-Ecole pour votre passage + 1H30 En individuel Prise en main du véhicule, Conduite</span>
                                  </div>
                                </label></>
                        )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Date et Heure de la convocation par la CMA</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                              <input
                                  type="date"
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  required
                                  onChange={(e) => setReservationData({...reservationData, examDate: e.target.value})}
                              />
                              <Calendar className="absolute left-3 top-3 text-gray-400" />
                            </div>
                            <div className="relative">
                              <input
                                  type="time"
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  required
                                  onChange={(e) => setReservationData({...reservationData, examTime: e.target.value})}
                              />
                              <Clock className="absolute left-3 top-3 text-gray-400" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-6">
                          <button
                              type="button"
                              className="flex items-center justify-center bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                              onClick={handlePrevStep}
                          >
                            <ChevronLeft className="mr-2" /> Retour
                          </button>
                          <button
                              type="button"
                              className="flex items-center justify-center bg-blue-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors"
                              onClick={handleNextStep}
                          >
                            Continuer <ChevronRight className="ml-2" />
                          </button>
                        </div>
                      </div>
                  )}
                  {step === 4 && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                          <CreditCard className="mr-2 text-blue-900" />
                          Paiement et documents
                        </h3>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Financement</label>
                          <div className="relative">
                            <select
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                                required
                                onChange={(e) => setReservationData({...reservationData, financing: e.target.value})}
                            >
                              <option value="">Sélectionnez une option</option>
                              <option value="Personnel">Personnel</option>
                            </select>
                            <CreditCard className="absolute left-3 top-3 text-gray-400" />
                            <ChevronRight className="absolute right-3 top-3 text-gray-400" />
                          </div>
                        </div>

                        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700">Modalités de paiement</label>

                          <div className="space-y-4">
                            <label className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                              <input
                                  type="radio"
                                  name="paymentMethod"
                                  value="Virement bancaire IBAN: FR76 13606 00087 46302523169 63 BIC AGRIFRPP 836"
                                  className="mt-1 mr-3"
                                  onChange={(e) => setReservationData({...reservationData, paymentMethod: e.target.value})}
                              />
                              <div>
                                <span className="font-medium block">Virement bancaire</span>
                                <span className="text-sm text-gray-600">IBAN: FR76 13606 00087 46302523169 63 BIC AGRIFRPP 836</span>
                              </div>
                            </label>

                            <label className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                              <input
                                  type="radio"
                                  name="paymentMethod"
                                  value="Carte bancaire (lien de paiement par sms)"
                                  className="mt-1 mr-3"
                                  onChange={(e) => setReservationData({...reservationData, paymentMethod: e.target.value})}
                              />
                              <div>
                                <span className="font-medium block">Carte bancaire</span>
                                <span className="text-sm text-gray-600">Lien de paiement par SMS</span>
                              </div>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Permis de conduire recto</label>
                            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                              <input
                                  type="file"
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  required
                                  accept="image/*,.pdf"
                                  onChange={(e) => setReservationData({...reservationData,   driverLicenseFront: e.target.files ? e.target.files[0] : null})}
                              />
                              <FileText className="mx-auto h-8 w-8 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-600">Cliquez pour sélectionner un fichier ou glissez-déposez</p>
                              <p className="text-xs text-gray-500">PDF ou image (10 MB max)</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Permis de conduire verso</label>
                            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                              <input
                                  type="file"
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  required
                                  accept="image/*,.pdf"
                                  onChange={(e) => setReservationData({...reservationData,   driverLicenseFront: e.target.files ? e.target.files[0] : null})}
                              />
                              <FileText className="mx-auto h-8 w-8 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-600">Cliquez pour sélectionner un fichier ou glissez-déposez</p>
                              <p className="text-xs text-gray-500">PDF ou image (10 MB max)</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Observations</label>
                          <textarea
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              rows={3}
                              onChange={(e) => setReservationData({...reservationData, observations: e.target.value})}
                              placeholder="Ajoutez vos commentaires ou questions ici..."
                          ></textarea>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-6">
                          <button
                              type="button"
                              className="bg-gray-500 text-white px-6 py-2 rounded-lg w-full"
                              onClick={handlePrevStep}
                          >
                            Retour
                          </button>
                          <button
                              type="submit"
                              className="bg-blue-900 text-white px-6 py-2 rounded-lg w-full"
                          >
                            Envoyer
                          </button>
                        </div>
                      </div>
                  )}
                </form>
              </div>
            </div>
        )}

        {/* CTA Final */}
        <section className="py-16 bg-blue-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Prêt pour votre examen de taxi ?</h2>
            <p className="text-xl mb-8">
              Réservez dès maintenant votre véhicule équipé pour maximiser vos chances de réussite
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                  onClick={() => setShowModal(true)}
                  className="bg-yellow-500 text-blue-900 px-8 py-4 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
              >
                Réserver un véhicule
              </button>
              <Link
                  to="/contact"
                  className="bg-white text-blue-900 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </section>
      </div>
  );
};

export default LocationPage;