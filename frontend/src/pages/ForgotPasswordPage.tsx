import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Send, CheckCircle } from 'lucide-react';
import axios from 'axios';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.post('/api/auth/forgot-password', {
        email: email.trim()
      });

      setMessage(response.data.message);
      setEmailSent(true);
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Une erreur s\'est produite. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header du site avec largeur complète */}
      <Header fullWidth={true} />
      
      {/* Contenu principal avec background dégradé */}
      <div className="flex-1 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative">
        {/* Background décoratif */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
          <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl"></div>
        </div>
        
        {/* Contenu principal centré */}
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
          <div className="w-full max-w-md z-10 relative">
            
            {/* Breadcrumb */}
            <div className="mb-6">
              <Link 
                to="/login" 
                className="inline-flex items-center text-blue-200 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la connexion
              </Link>
            </div>

            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full border border-white/20">
              {!emailSent ? (
                <>
                  {/* En-tête du formulaire */}
                  <div className="text-center mb-8">
                    <div className="bg-gradient-to-r from-blue-900 to-blue-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Mail className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">Mot de passe oublié ?</h2>
                    <p className="text-gray-600">
                      Saisissez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                    </p>
                  </div>

                  {/* Message d'erreur */}
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">{error}</span>
                      </div>
                    </div>
                  )}

                  {/* Formulaire */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Champ Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="votre.email@exemple.com"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Bouton d'envoi */}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                      loading={isLoading}
                      disabled={!email || !isValidEmail(email)}
                    >
                      <Send className="h-5 w-5 mr-2" />
                      Envoyer le lien de réinitialisation
                    </Button>
                  </form>

                  {/* Liens d'aide */}
                  <div className="mt-8 text-center space-y-4">
                    <div className="text-sm text-gray-600">
                      Vous vous souvenez de votre mot de passe ?
                    </div>
                    <Link
                      to="/login"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                    >
                      Retour à la connexion
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  {/* Confirmation d'envoi */}
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <CheckCircle className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Email envoyé !</h2>
                    
                    {message && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-green-700 font-medium">{message}</p>
                      </div>
                    )}

                    <div className="text-gray-600 space-y-4">
                      <p>
                        Consultez votre boîte email et cliquez sur le lien de réinitialisation.
                      </p>
                      <p className="text-sm">
                        Le lien est valable pendant <strong>1 heure</strong>.
                      </p>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                        <p className="text-blue-800 text-sm">
                          <strong>Vous ne voyez pas l'email ?</strong><br />
                          Vérifiez votre dossier spam ou courrier indésirable.
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 space-y-3">
                      <button
                        onClick={() => {
                          setEmailSent(false);
                          setEmail('');
                          setMessage(null);
                          setError(null);
                        }}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
                      >
                        Renvoyer l'email
                      </button>
                      
                      <Link
                        to="/login"
                        className="block w-full bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg text-center"
                      >
                        Retour à la connexion
                      </Link>
                    </div>
                  </div>
                </>
              )}

              {/* Comptes de test (en développement seulement) */}
              {import.meta.env.DEV && !emailSent && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">
                    🧪 Emails de test (dev)
                  </h4>
                  <div className="text-xs text-yellow-700 space-y-1">
                    <div>admin@merelformation.com</div>
                    <div>student@merelformation.com</div>
                    <div>instructor@merelformation.com</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer du site avec données dynamiques */}
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;