import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import Button from '../common/Button';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  error: string | null;
  successMessage?: string | null;
  isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, error, successMessage, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(email, password);
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20">
      {/* En-tête du formulaire */}
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <LogIn className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Connexion</h2>
        <p className="text-gray-600">Accédez à votre espace personnel</p>
      </div>

      {/* Message de succès */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        </div>
      )}

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

        {/* Champ Mot de passe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
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
        </div>

        {/* Bouton de connexion */}
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
          loading={isLoading}
          disabled={!email || !password}
        >
          <LogIn className="h-5 w-5 mr-2" />
          Se connecter
        </Button>
      </form>

      {/* Liens d'aide */}
      <div className="mt-8 text-center space-y-4">
        <div className="text-sm text-gray-600">
          <Link 
            to="/forgot-password" 
            className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
          >
            Mot de passe oublié ?
          </Link>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            Vous n'avez pas encore de compte ?
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
          >
            Demander un accès
          </Link>
        </div>
      </div>

      {/* Comptes de test (en développement seulement) */}
      {import.meta.env.DEV && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">
            🧪 Comptes de test (dev)
          </h4>
          <div className="text-xs text-yellow-700 space-y-1">
            <div>Admin: admin@merelformation.com</div>
            <div>Étudiant: student@merelformation.com</div>
            <div>Instructeur: instructor@merelformation.com</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;