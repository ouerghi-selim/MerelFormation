import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/homepage';
import FormationsPage from '@/pages/formations-page';
import LocationPage from '@/pages/location-page';
import FormationInitialePage from "@/pages/formationInitialPage";
import ContactPage from "@/pages/contactPage";
import LoginPage from "@/pages/loginPage";


const App = () => {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/formations" element={<FormationsPage />} />
                    <Route path="/formations/initial" element={<FormationInitialePage />} />
                    <Route path="/location" element={<LocationPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                </Routes>
            </Layout>
        </Router>
    );
};

export default App;