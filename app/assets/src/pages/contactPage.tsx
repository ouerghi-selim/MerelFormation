import { Phone, MapPin, Clock, AlertCircle, Info } from 'lucide-react';
import {useState} from "react";
import contactOffic from '@assets/images/pages/contact-office.png';


const ContactPage = () => {
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        adresse: '',
        codePostal: '',
        ville: '',
        telephone: '',
        email: '',
        message: ''
    });

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        // Logique d'envoi du formulaire
        console.log(formData);
    };

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-blue-900 text-white py-16">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Contactez-nous</h1>
                    <p className="text-xl text-blue-100 max-w-2xl">
                        Une question sur nos formations ? Besoin d'informations ? Notre équipe est à votre écoute pour vous accompagner dans votre projet professionnel.
                    </p>
                </div>
            </section>

            {/* Contact Info */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="flex items-start p-6 bg-gray-50 rounded-lg">
                            <Phone className="h-6 w-6 text-blue-900 mr-4 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold mb-2">Téléphone</h3>
                                <p className="text-gray-600">Jean-Louis MEREL</p>
                                <a href="tel:0760861109" className="text-blue-900 font-bold">07 60 86 11 09</a>
                            </div>
                        </div>
                        <div className="flex items-start p-6 bg-gray-50 rounded-lg">
                            <MapPin className="h-6 w-6 text-blue-900 mr-4 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold mb-2">Adresse</h3>
                                <p className="text-gray-600">7 RUE Georges Maillols</p>
                                <p className="text-gray-600">35000 RENNES</p>
                            </div>
                        </div>
                        <div className="flex items-start p-6 bg-gray-50 rounded-lg">
                            <Clock className="h-6 w-6 text-blue-900 mr-4 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold mb-2">Horaires</h3>
                                <p className="text-gray-600">Lundi - Vendredi</p>
                                <p className="text-gray-600">8h30 - 12h00 | 13h00 - 16h30</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Formulaire et Image */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Formulaire */}
                        <div className="lg:w-1/2">
                            <div className="bg-white p-8 rounded-lg shadow-lg">
                                <h2 className="text-2xl font-bold mb-6">Formulaire de contact</h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-gray-700 mb-2" htmlFor="nom">Nom</label>
                                            <input
                                                type="text"
                                                id="nom"
                                                name="nom"
                                                value={formData.nom}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 mb-2" htmlFor="prenom">Prénom</label>
                                            <input
                                                type="text"
                                                id="prenom"
                                                name="prenom"
                                                value={formData.prenom}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 mb-2" htmlFor="adresse">Adresse</label>
                                        <input
                                            type="text"
                                            id="adresse"
                                            name="adresse"
                                            value={formData.adresse}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-gray-700 mb-2" htmlFor="codePostal">Code postal</label>
                                            <input
                                                type="text"
                                                id="codePostal"
                                                name="codePostal"
                                                value={formData.codePostal}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 mb-2" htmlFor="ville">Ville</label>
                                            <input
                                                type="text"
                                                id="ville"
                                                name="ville"
                                                value={formData.ville}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-gray-700 mb-2" htmlFor="telephone">Téléphone</label>
                                            <input
                                                type="tel"
                                                id="telephone"
                                                name="telephone"
                                                value={formData.telephone}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 mb-2" htmlFor="message">Message</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows={6}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-900 text-white py-3 px-6 rounded-lg font-bold hover:bg-blue-800 transition-colors"
                                    >
                                        Envoyer le message
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Image et Informations */}
                        <div className="lg:w-1/2 space-y-8">
                            <img
                                src={contactOffic}
                                alt="Notre centre de formation"
                                className="rounded-lg shadow-xl w-full h-64 object-cover"
                            />

                            {/* Informations légales */}
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <h3 className="text-xl font-bold mb-4 flex items-center">
                                    <Info className="h-6 w-6 mr-2" />
                                    Informations légales
                                </h3>
                                <div className="space-y-3 text-gray-600">
                                    <p>MEREL TAXI</p>
                                    <p>Siret : 800484222</p>
                                    <p>N° Agrément préfectorale 35: 23-002 23-003</p>
                                    <p>N° Agrément préfectorale 22: 22-2023-04-21-00002</p>
                                    <p>N° Agrément préfectorale 56: 2023/56/02</p>
                                    <p>N° Agrément préfectorale 44: 44/23/002</p>
                                </div>
                            </div>

                            {/* Médiation */}
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <h3 className="text-xl font-bold mb-4 flex items-center">
                                    <AlertCircle className="h-6 w-6 mr-2" />
                                    Médiation
                                </h3>
                                <div className="space-y-3 text-gray-600">
                                    <p>Centre de la Médiation et de la Consommation des Conciliateurs de Justice (CM2C)</p>
                                    <p>14 rue Saint Jean – 75017 Paris</p>
                                    <p>Email : cm2c@cm2c.net</p>
                                    <p>Site Internet : https://cm2c.net</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;