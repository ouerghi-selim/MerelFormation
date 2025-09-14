import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { redirectAuthenticatedUser, getRedirectPathForCurrentUser } from "../utils/auth";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import LoginForm from "../components/auth/LoginForm";

const LoginPage = () => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Vérifier si l'utilisateur est déjà connecté au chargement du composant
    useEffect(() => {
        const checkAuthentication = async () => {
            const wasRedirected = await redirectAuthenticatedUser(navigate);
            if (!wasRedirected) {
                setIsLoading(false); // Si pas de redirection, arrêter le chargement
            }
        };

        checkAuthentication();
    }, [navigate]);

    // Récupérer le message de succès depuis l'état de navigation (ex: après reset password)
    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            // Nettoyer l'état pour éviter de le conserver en cas de rafraîchissement
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleLogin = async (email: string, password: string) => {
        setError(null);
        setIsAuthenticating(true);

        try {
            // 1. Obtenir le token JWT
            const response = await axios.post("/api/login_check", {
                email,
                password,
            });

            // 2. Stocker le token JWT
            localStorage.setItem("token", response.data.token);

            // 3. Déterminer et naviguer vers la bonne page en fonction du rôle
            const redirectPath = await getRedirectPathForCurrentUser();
            navigate(redirectPath);

        } catch (err: any) {
            if (err.response && err.response.status === 401) {
                setError("Identifiants incorrects, veuillez réessayer.");
            } else {
                setError("Une erreur s'est produite, veuillez réessayer plus tard.");
                console.error("Login error:", err);
            }
        } finally {
            setIsAuthenticating(false);
        }
    };

    // Afficher un indicateur de chargement pendant la vérification d'authentification
    if (isLoading && !error) {
        return (
            <>
                <Header fullWidth={true} />
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                    <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900 mx-auto mb-4"></div>
                        <p className="text-blue-900 font-medium">Vérification de la connexion...</p>
                    </div>
                </div>
            </>
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
                        {/* Formulaire de connexion */}
                        <LoginForm 
                            onSubmit={handleLogin}
                            error={error}
                            successMessage={successMessage}
                            isLoading={isAuthenticating}
                        />
                    </div>
                </div>
            </div>

            {/* Footer du site avec données dynamiques */}
            <Footer />
        </div>
    );
};

export default LoginPage;
