import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Validation du token au chargement
  useEffect(() => {
    if (!token || !email) {
      setError('Lien invalide ou expiré');
      setIsValidating(false);
      return;
    }

    validateToken();
  }, [token, email]);

  const validateToken = async () => {
    try {
      setIsValidating(true);
      const response = await axios.post('/api/auth/validate-reset-token', {
        token,
        email
      });

      if (response.data.valid) {
        setUser(response.data.user);
      } else {
        setError(response.data.message);
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Une erreur s\'est produite lors de la validation du lien');
      }
    } finally {
      setIsValidating(false);
    }
  };

  const validatePassword = (pwd: string) => {
    const errors: string[] = [];
    
    if (pwd.length < 8) {
      errors.push('Au moins 8 caractères');
    }
    
    if (!/[a-z]/.test(pwd)) {
      errors.push('Au moins une minuscule');
    }
    
    if (!/[A-Z]/.test(pwd)) {
      errors.push('Au moins une majuscule');
    }
    
    if (!/\d/.test(pwd)) {
      errors.push('Au moins un chiffre');
    }
    
    return errors;
  };

  const passwordErrors = password ? validatePassword(password) : [];
  const isPasswordValid = passwordErrors.length === 0;
  const passwordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!isPasswordValid) {
      setError('Le mot de passe ne respecte pas les critères requis');
      setIsLoading(false);
      return;
    }

    if (!passwordsMatch) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    try {
      await axios.post('/api/auth/reset-password', {
        token,
        email,
        password,
        confirmPassword
      });

      setSuccess(true);
      
      // Redirection automatique après 3 secondes
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.' 
          } 
        });
      }, 3000);

    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Une erreur s\'est produite lors de la réinitialisation');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // État de chargement initial
  if (isValidating) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header fullWidth={true} />
        <div className="flex-1 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
          <div className="text-center bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900 mx-auto mb-4"></div>
            <p className="text-blue-900 font-medium">Vérification du lien...</p>
          </div>
        </div>
      </div>
    );
  }

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
              
              {error && !success ? (
                <>
                  {/* Erreur de validation */}
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <AlertCircle className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Lien invalide</h2>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <p className="text-red-700 font-medium">{error}</p>
                    </div>

                    <div className="text-gray-600 space-y-4">
                      <p>
                        Le lien de réinitialisation est invalide ou a expiré.
                      </p>
                      
                      <div className="space-y-3">
                        <Link
                          to="/forgot-password"
                          className="block w-full bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg text-center"
                        >
                          Demander un nouveau lien
                        </Link>
                        
                        <Link
                          to="/login"
                          className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors text-center"
                        >
                          Retour à la connexion
                        </Link>
                      </div>
                    </div>
                  </div>
                </>
              ) : success ? (
                <>
                  {/* Succès */}
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <CheckCircle className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Mot de passe réinitialisé !</h2>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <p className="text-green-700 font-medium">
                        Votre mot de passe a été modifié avec succès.
                      </p>
                    </div>

                    <div className="text-gray-600 space-y-4">
                      <p>
                        Vous allez être redirigé automatiquement vers la page de connexion...
                      </p>
                      
                      <Link
                        to="/login"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                      >
                        Se connecter maintenant
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Formulaire de réinitialisation */}
                  <div className="text-center mb-8">
                    <div className="bg-gradient-to-r from-blue-900 to-blue-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Lock className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">Nouveau mot de passe</h2>
                    {user && (
                      <p className="text-gray-600">
                        Bonjour <strong>{user.firstName} {user.lastName}</strong>,<br/>
                        Créez votre nouveau mot de passe.
                      </p>
                    )}
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
                    {/* Nouveau mot de passe */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                            password && !isPasswordValid ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                          }`}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Votre nouveau mot de passe"
                          required
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                      
                      {/* Critères de validation */}
                      {password && (
                        <div className="mt-2 space-y-1">
                          {['Au moins 8 caractères', 'Au moins une minuscule', 'Au moins une majuscule', 'Au moins un chiffre'].map((criterion, index) => {
                            const isValid = passwordErrors.length === 0 || !passwordErrors.some(err => criterion.includes(err.split(' ').slice(-1)[0]));
                            return (
                              <div key={index} className={`flex items-center text-xs ${isValid ? 'text-green-600' : 'text-red-500'}`}>
                                <CheckCircle className={`h-3 w-3 mr-1 ${isValid ? 'text-green-500' : 'text-gray-300'}`} />
                                {criterion}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Confirmation mot de passe */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmer le mot de passe
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                            confirmPassword && !passwordsMatch ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                          }`}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirmez votre mot de passe"
                          required
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                      
                      {confirmPassword && !passwordsMatch && (
                        <p className="mt-2 text-xs text-red-500">Les mots de passe ne correspondent pas</p>
                      )}
                    </div>

                    {/* Bouton de soumission */}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                      loading={isLoading}
                      disabled={!password || !confirmPassword || !isPasswordValid || !passwordsMatch}
                    >
                      <Lock className="h-5 w-5 mr-2" />
                      Réinitialiser le mot de passe
                    </Button>
                  </form>
                </>
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

export default ResetPasswordPage;