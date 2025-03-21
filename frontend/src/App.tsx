// @ts-ignore
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/home-page';
import FormationsPage from './pages/formations-page';
import LocationPage from './pages/location-page';
import FormationDetailPage from "./pages/formation-detail-page";
import ContactPage from "./pages/contact-page";
import LoginPage from "./pages/login-page";

// Admin pages
import DashboardAdmin from './pages/admin/DashboardAdmin';
import FormationsAdmin from './pages/admin/FormationsAdmin';
import ReservationsAdmin from './pages/admin/ReservationsAdmin';
import UsersAdmin from './pages/admin/UsersAdmin';

// Student pages
import DashboardStudent from './pages/student/DashboardStudent';
import FormationsStudent from './pages/student/FormationsStudent';
import FormationDetailStudent from './pages/student/FormationDetailStudent';
import DocumentsStudent from './pages/student/DocumentsStudent';

// Composant pour protéger les routes admin
// const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
//     // // Vérifier si l'utilisateur est connecté et a les droits d'admin
//     // const isAuthenticated = localStorage.getItem('token') !== null;
//     // const userRole = localStorage.getItem('userRole');
//     //
//     // // Rediriger vers la page de connexion si non authentifié ou non admin
//     // if (!isAuthenticated || userRole !== 'ROLE_ADMIN') {
//     //     window.location.href = '/login';
//     //     return null;
//     // }
//     //
//     // return <>{children}</>;
// };
//
// // Composant pour protéger les routes étudiant
// const ProtectedStudentRoute = ({ children }: { children: React.ReactNode }) => {
//     // Vérifier si l'utilisateur est connecté et a les droits d'étudiant
//     // const isAuthenticated = localStorage.getItem('token') !== null;
//     // const userRole = localStorage.getItem('userRole');
//     //
//     // // Rediriger vers la page de connexion si non authentifié ou non étudiant
//     // // if (!isAuthenticated || (userRole !== 'ROLE_STUDENT' && userRole !== 'ROLE_ADMIN')) {
//     // //     window.location.href = '/login';
//     // //     return null;
//     // // }
//
//     return <>{children}</>;
// };

const App = () => {
    return (
        <Router>
            <Routes>
                {/* Routes publiques */}
                <Route path="/" element={<Layout><HomePage /></Layout>} />
                <Route path="/formations" element={<Layout><FormationsPage /></Layout>} />
                <Route path="/formations/:id" element={<Layout><FormationDetailPage /></Layout>} />
                <Route path="/location" element={<Layout><LocationPage /></Layout>} />
                <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
                <Route path="/login" element={<LoginPage />} />

                {/* Routes admin protégées */}
                <Route path="/admin/dashboard" element={
                   // <ProtectedAdminRoute>
                        <DashboardAdmin />
                   // </ProtectedAdminRoute>
                } />
                <Route path="/admin/formations" element={
                 //   <ProtectedAdminRoute>
                        <FormationsAdmin />
                   // </ProtectedAdminRoute>
                } />
                <Route path="/admin/reservations" element={
                  //  <ProtectedAdminRoute>
                        <ReservationsAdmin />
                   // </ProtectedAdminRoute>
                } />
                <Route path="/admin/users" element={
                 //   <ProtectedAdminRoute>
                        <UsersAdmin />
                 //   </ProtectedAdminRoute>
                } />

                {/* Routes étudiant protégées */}
                <Route path="/student" element={
                 //   <ProtectedStudentRoute>
                        <DashboardStudent />
                 //   </ProtectedStudentRoute>
                } />
                <Route path="/student/formations" element={
                  //  <ProtectedStudentRoute>
                        <FormationsStudent />
                  //  </ProtectedStudentRoute>
                } />
                <Route path="/student/formations/:id" element={
                 //   <ProtectedStudentRoute>
                        <FormationDetailStudent />
                 //   </ProtectedStudentRoute>
                } />
                <Route path="/student/documents" element={
                 //   <ProtectedStudentRoute>
                        <DocumentsStudent />
                 //   </ProtectedStudentRoute>
                } />
            </Routes>
        </Router>
    );
};

export default App;
