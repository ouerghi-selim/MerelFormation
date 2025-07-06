import { useState, useCallback, useEffect } from 'react';
import { Phone, MapPin, Clock, AlertCircle, Info, Send, User, Mail, Smartphone, MessageSquare, Building, MapPinned } from 'lucide-react';
import { GoogleMap, useJsApiLoader, InfoWindow } from '@react-google-maps/api';
import { MarkerF } from '@react-google-maps/api';  // Utiliser MarkerF au lieu de Marker
import { contactApi, adminContentTextApi } from '../services/api';

interface CMSContent {
  [key: string]: string;
}

// Centre de la carte (coordonnées pour Rennes)
const center = { lat: 48.12876519256196, lng: -1.7044696431394817 };

const ContactPage = () => {
    // État pour le formulaire
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        adresse: '',
        codePostal: '',
        ville: '',
        telephone: '',
        email: '',
        subject: '',
        message: ''
    });

    // États pour la gestion du formulaire
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [showInfoWindow, setShowInfoWindow] = useState(true);
    
    // États pour le contenu CMS
    const [cmsContent, setCmsContent] = useState<CMSContent>({});
    const [loading, setLoading] = useState(true);

    // Chargement de l'API Google Maps
    const { isLoaded } = useJsApiLoader({
        id: 'Maps Platform API Key',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    // Options de la carte
    const mapOptions = {
        disableDefaultUI: false,
        zoomControl: true,
        styles: [
            {
                "featureType": "all",
                "elementType": "geometry.fill",
                "stylers": [{"weight": "2.00"}]
            },
            {
                "featureType": "administrative",
                "elementType": "all",
                "stylers": [{"color": "#f2f2f2"}]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text",
                "stylers": [{"visibility": "off"}]
            },
            {
                "featureType": "water",
                "elementType": "all",
                "stylers": [{"color": "#2c5282"}, {"visibility": "on"}]
            }
        ]
    };

    // Fonction pour récupérer le contenu CMS
    const fetchCMSContent = async () => {
        try {
            // Récupérer tous les contenus de la page contact
            const contentResponse = await adminContentTextApi.getAll({
                section: ['contact_hero', 'contact_info', 'contact_map', 'contact_form', 'contact_legal'].join(',')
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

    // Valider le formulaire
    const validateForm = useCallback(() => {
        const newErrors: Record<string, string> = {};

        if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
        if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis";
        if (!formData.email.trim()) newErrors.email = "L'email est requis";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            newErrors.email = "Format d'email invalide";

        if (!formData.telephone.trim()) newErrors.telephone = "Le téléphone est requis";
        else if (!/^[0-9\s\+\-\.]{10,15}$/.test(formData.telephone))
            newErrors.telephone = "Format de téléphone invalide";

        if (!formData.subject.trim()) newErrors.subject = "Le sujet est requis";
        if (!formData.message.trim()) newErrors.message = "Le message est requis";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    // Gérer la soumission du formulaire
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (validateForm()) {
            try {
                // Préparer les données pour l'API
                const contactData = {
                    name: `${formData.prenom} ${formData.nom}`.trim(),
                    email: formData.email,
                    phone: formData.telephone,
                    subject: formData.subject,
                    message: formData.message
                };

                // Envoyer la demande de contact
                await contactApi.submit(contactData);

                setIsSubmitting(false);
                setSubmitSuccess(true);

                // Réinitialiser le formulaire après quelques secondes
                setTimeout(() => {
                    setFormData({
                        nom: '',
                        prenom: '',
                        adresse: '',
                        codePostal: '',
                        ville: '',
                        telephone: '',
                        email: '',
                        subject: '',
                        message: ''
                    });
                    setSubmitSuccess(false);
                }, 5000);

            } catch (error) {
                console.error('Erreur lors de l\'envoi du formulaire:', error);
                setIsSubmitting(false);
                // Afficher une erreur à l'utilisateur
                alert('Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.');
            }
        } else {
            setIsSubmitting(false);
        }
    };

    // Gérer les changements de champs du formulaire
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Effacer l'erreur lorsque l'utilisateur commence à corriger le champ
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Fonction pour gérer le clic sur le marqueur
    const handleMarkerClick = () => {
        setShowInfoWindow(true);
    };

    // Fonction pour fermer l'InfoWindow
    const handleInfoWindowClose = () => {
        setShowInfoWindow(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-blue-900 text-white py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
                        {getContent('contact_hero_title', 'Contactez-nous')}
                    </h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto text-center mb-8">
                        {getContent('contact_hero_description', 'Une question sur nos formations ? Besoin d\'informations ? Notre équipe est à votre écoute pour vous accompagner dans votre projet professionnel.')}
                    </p>
                    <div className="flex flex-wrap justify-center gap-6 mt-10">

                            <a href="tel:0760861109"
                            className="bg-white text-blue-900 px-6 py-3 rounded-lg flex items-center hover:bg-blue-100 transition-all duration-300"
                            >
                            <Phone className="h-5 w-5 mr-2" />
                            <span className="font-semibold">07 60 86 11 09</span>
                        </a>

                        <a href="mailto:contact@merelformation.fr"
                        className="bg-transparent text-white border border-white px-6 py-3 rounded-lg flex items-center hover:bg-white hover:text-blue-900 transition-all duration-300"
                        >
                        <Mail className="h-5 w-5 mr-2" />
                        <span className="font-semibold">contact@merelformation.fr</span>
                        </a>
                    </div>
                </div>
        </section>

    {/* Contact Info Cards */}
    <section className="py-12 -mt-10">
        <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6 transform hover:-translate-y-1 transition-all duration-300">
                    <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-5 mx-auto">
                        <Phone className="h-6 w-6 text-blue-900" />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-center">
                        {getContent('contact_info_phone_label', 'Téléphone')}
                    </h3>
                    <p className="text-gray-600 text-center mb-2">
                        {getContent('contact_info_director_name', 'Jean-Louis MEREL')}
                    </p>
                    <p className="text-blue-900 font-bold text-center text-lg">
                        <a href="tel:0760861109" className="hover:underline">07 60 86 11 09</a>
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 transform hover:-translate-y-1 transition-all duration-300">
                    <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-5 mx-auto">
                        <MapPin className="h-6 w-6 text-blue-900" />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-center">
                        {getContent('contact_info_address_label', 'Adresse')}
                    </h3>
                    <address className="text-gray-600 text-center not-italic" dangerouslySetInnerHTML={{
                        __html: getContent('contact_info_address_value', '7 RUE Georges Maillols<br>35000 RENNES')
                    }} />
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 transform hover:-translate-y-1 transition-all duration-300">
                    <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-5 mx-auto">
                        <Clock className="h-6 w-6 text-blue-900" />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-center">
                        {getContent('contact_info_hours_label', 'Horaires')}
                    </h3>
                    <div className="text-gray-600 text-center" dangerouslySetInnerHTML={{
                        __html: getContent('contact_info_hours_value', 'Lundi - Vendredi<br>8h30 - 12h00 | 13h00 - 16h30')
                    }} />
                </div>
            </div>
        </div>
    </section>

    {/* Carte Google Maps */}
    <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold mb-8 text-center">
                    {getContent('contact_map_title', 'Nous situer')}
                </h2>
                <div className="shadow-xl rounded-xl overflow-hidden border-4 border-white">
                    <div className="w-full h-96 bg-gray-200">
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={{ width: '100%', height: '100%' }}
                                center={center}
                                zoom={15}
                                options={mapOptions}
                            >
                                <MarkerF
                                    position={center}
                                    onClick={handleMarkerClick}
                                >
                                    {showInfoWindow && (
                                        <InfoWindow
                                            position={center}
                                            onCloseClick={handleInfoWindowClose}
                                        >
                                            <div className="p-2 max-w-[200px]">
                                                <strong>MerelFormation</strong><br />
                                                <span className="text-sm">Centre de formation Taxi</span><br />
                                                7 RUE Georges Maillols<br />
                                                35000 RENNES<br />
                                                <a href="tel:0760861109" className="text-blue-700 hover:underline">07 60 86 11 09</a>
                                            </div>
                                        </InfoWindow>
                                    )}
                                </MarkerF>
                            </GoogleMap>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-6 flex items-start">
                    <MapPinned className="h-6 w-6 text-blue-900 mr-2 flex-shrink-0 mt-1" />
                    <div>
                        <p className="text-gray-700 text-lg">
                            <strong>MerelFormation</strong> - 7 RUE Georges Maillols, 35000 RENNES
                        </p>
                        <p className="text-gray-600 mt-2">
                            {getContent('contact_map_description', 'Facilement accessible en transports en commun et parking à proximité.')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/* Contact Form Section */}
    <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold mb-8 text-center">
                    {getContent('contact_form_title', 'Envoyez-nous un message')}
                </h2>

                <div className="bg-white p-8 rounded-xl shadow-lg">
                    {submitSuccess ? (
                        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
                            <div className="flex items-center">
                                <div className="py-1">
                                    <svg className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div dangerouslySetInnerHTML={{
                                    __html: getContent('contact_form_success_message', 'Message envoyé avec succès !<br>Nous vous répondrons dans les plus brefs délais.')
                                }} />
                            </div>
                        </div>
                    ) : null}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium" htmlFor="nom">
                                            <span className="flex items-center">
                                                <User className="h-4 w-4 mr-2" />
                                                {getContent('contact_form_lastname_label', 'Nom')}
                                            </span>
                                </label>
                                <input
                                    type="text"
                                    id="nom"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring focus:ring-blue-300 transition-all duration-300 ${
                                        errors.nom ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                />
                                {errors.nom && (
                                    <p className="text-red-500 text-sm mt-1">{errors.nom}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium" htmlFor="prenom">
                                            <span className="flex items-center">
                                                <User className="h-4 w-4 mr-2" />
                                                {getContent('contact_form_firstname_label', 'Prénom')}
                                            </span>
                                </label>
                                <input
                                    type="text"
                                    id="prenom"
                                    name="prenom"
                                    value={formData.prenom}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring focus:ring-blue-300 transition-all duration-300 ${
                                        errors.prenom ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                />
                                {errors.prenom && (
                                    <p className="text-red-500 text-sm mt-1">{errors.prenom}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-2 font-medium" htmlFor="adresse">
                                        <span className="flex items-center">
                                            <Building className="h-4 w-4 mr-2" />
                                            Adresse
                                        </span>
                            </label>
                            <input
                                type="text"
                                id="adresse"
                                name="adresse"
                                value={formData.adresse}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 transition-all duration-300"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium" htmlFor="codePostal">
                                    Code postal
                                </label>
                                <input
                                    type="text"
                                    id="codePostal"
                                    name="codePostal"
                                    value={formData.codePostal}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 transition-all duration-300"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium" htmlFor="ville">
                                    Ville
                                </label>
                                <input
                                    type="text"
                                    id="ville"
                                    name="ville"
                                    value={formData.ville}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 transition-all duration-300"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium" htmlFor="telephone">
                                            <span className="flex items-center">
                                                <Smartphone className="h-4 w-4 mr-2" />
                                                {getContent('contact_form_phone_label', 'Téléphone')}
                                            </span>
                                </label>
                                <input
                                    type="tel"
                                    id="telephone"
                                    name="telephone"
                                    value={formData.telephone}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring focus:ring-blue-300 transition-all duration-300 ${
                                        errors.telephone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="07 60 XX XX XX"
                                />
                                {errors.telephone && (
                                    <p className="text-red-500 text-sm mt-1">{errors.telephone}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium" htmlFor="email">
                                            <span className="flex items-center">
                                                <Mail className="h-4 w-4 mr-2" />
                                                {getContent('contact_form_email_label', 'Email')}
                                            </span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring focus:ring-blue-300 transition-all duration-300 ${
                                        errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="exemple@email.com"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-2 font-medium" htmlFor="subject">
                                        <span className="flex items-center">
                                            <Info className="h-4 w-4 mr-2" />
                                            {getContent('contact_form_subject_label', 'Sujet')}
                                        </span>
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring focus:ring-blue-300 transition-all duration-300 ${
                                    errors.subject ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Ex: Demande d'informations sur les formations"
                            />
                            {errors.subject && (
                                <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-2 font-medium" htmlFor="message">
                                        <span className="flex items-center">
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            {getContent('contact_form_message_label', 'Votre message')}
                                        </span>
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows={6}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring focus:ring-blue-300 transition-all duration-300 ${
                                    errors.message ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Comment pouvons-nous vous aider ?"
                            ></textarea>
                            {errors.message && (
                                <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                            )}
                        </div>

                        <div className="mt-2 text-gray-600 text-sm">
                            <p>{getContent('contact_form_gdpr_text', 'En soumettant ce formulaire, vous acceptez que les informations saisies soient utilisées pour vous recontacter.')}</p>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full bg-blue-900 text-white py-3 px-6 rounded-lg font-bold hover:bg-blue-800 transition-colors flex items-center justify-center space-x-2 ${
                                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                    <span>Envoi en cours...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="h-5 w-5" />
                                    <span>{getContent('contact_form_submit_button', 'Envoyer le message')}</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </section>

    {/* Informations Légales Section */}
    <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg shadow">
                    <h3 className="text-xl font-bold mb-4 flex items-center text-blue-900">
                        <Info className="h-6 w-6 mr-2" />
                        Informations légales
                    </h3>
                    <div className="space-y-2 text-gray-700">
                        <p>MEREL TAXI</p>
                        <p>Siret : 800484222</p>
                        <p>N° Agrément préfectorale 35: 23-002 23-003</p>
                        <p>N° Agrément préfectorale 22: 22-2023-04-21-00002</p>
                        <p>N° Agrément préfectorale 56: 2023/56/02</p>
                        <p>N° Agrément préfectorale 44: 44/23/002</p>
                    </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg shadow">
                    <h3 className="text-xl font-bold mb-4 flex items-center text-blue-900">
                        <AlertCircle className="h-6 w-6 mr-2" />
                        Médiation
                    </h3>
                    <div className="space-y-2 text-gray-700">
                        <p>Centre de la Médiation et de la Consommation des Conciliateurs de Justice (CM2C)</p>
                        <p>14 rue Saint Jean – 75017 Paris</p>
                        <p>Email : <a href="mailto:cm2c@cm2c.net" className="text-blue-900 hover:underline">cm2c@cm2c.net</a></p>
                        <p>Site Internet : <a href="https://cm2c.net" target="_blank" rel="noopener noreferrer" className="text-blue-900 hover:underline">https://cm2c.net</a></p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</div>
);
};

export default ContactPage;