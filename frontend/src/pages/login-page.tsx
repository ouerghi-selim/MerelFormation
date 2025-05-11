import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { redirectAuthenticatedUser, getRedirectPathForCurrentUser } from "../utils/auth";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
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
    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

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
            setIsLoading(false);
        }
    };
    // Afficher un indicateur de chargement pendant la vérification d'authentification
    if (isLoading && !error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <p className="text-gray-600">Vérification de la connexion...</p>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Mot de passe</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    >
                        Se connecter
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
