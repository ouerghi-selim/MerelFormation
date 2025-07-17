// @ts-ignore
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// contexts
import { NotificationProvider } from './contexts/NotificationContext';

import Layout from './components/layout/Layout';
import HomePage from './pages/home-page';
import FormationsPage from './pages/formations-page';
import LocationPage from './pages/location/LocationPage.tsx';
import FormationDetailPage from "./pages/formation-detail-page";
import ContactPage from "./pages/contact-page";
import LoginPage from "./pages/login-page";
import RentalTrackingPage from './pages/RentalTrackingPage';
import SetupPasswordPage from './pages/SetupPasswordPage';

// Admin pages
import DashboardAdmin from './pages/admin/DashboardAdmin';
import FormationsAdmin from './pages/admin/FormationsAdmin';
import FormationNew from './pages/admin/FormationNew';
import ReservationsAdmin from './pages/admin/ReservationsAdmin';
import VehicleReservationDetail from './pages/admin/VehicleReservationDetail';
import UsersAdmin from './pages/admin/UsersAdmin';
import StudentsAdmin from './pages/admin/StudentsAdmin';
import InstructorsAdmin from './pages/admin/InstructorsAdmin';
import AdminsAdmin from './pages/admin/AdminsAdmin';
import SessionsAdmin from './pages/admin/SessionsAdmin';
import SessionNew from './pages/admin/SessionNew';
import VehiclesAdmin from './pages/admin/VehiclesAdmin';
import EmailTemplatesAdmin from "@/pages/admin/EmailTemplatesAdmin.tsx";
import EmailTemplateEdit from "@/pages/admin/EmailTemplateEdit.tsx";
import EmailTemplateNew from "@/pages/admin/EmailTemplateNew.tsx";
import FormationDetail from "@/pages/admin/FormationDetail.tsx";

// CMS Content Management pages
import ContentTextsAdmin from './pages/admin/ContentTextsAdmin';
import TestimonialsAdmin from './pages/admin/TestimonialsAdmin';
import FAQAdmin from './pages/admin/FAQAdmin';

// Centers and Formulas Management pages
import CentersAdmin from './pages/admin/CentersAdmin';
import FormulasAdmin from './pages/admin/FormulasAdmin';

// Direct Documents pages
import DirectDocuments from './pages/admin/DirectDocuments';

// Student pages
import DashboardStudent from './pages/student/DashboardStudent';
import FormationsStudent from './pages/student/FormationsStudent';
import FormationDetailStudent from './pages/student/FormationDetailStudent';
import DocumentsStudent from './pages/student/DocumentsStudent';

// Planning pages
import PlanningCalendar from './pages/planning/PlanningCalendar';

// Composant pour protéger les routes admin
// const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
//     // Vérifier si l'utilisateur est connecté et a les droits d'admin
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
        <NotificationProvider>
            <Router>
                <Routes>
                    {/* Routes publiques */}
                    <Route path="/" element={<Layout><HomePage /></Layout>} />
                    <Route path="/formations" element={<Layout><FormationsPage /></Layout>} />
                    <Route path="/formations/:id" element={<Layout><FormationDetailPage /></Layout>} />
                    <Route path="/location" element={<Layout><LocationPage /></Layout>} />
                    <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/setup-password" element={<SetupPasswordPage />} />
                    <Route path="/track/:trackingToken" element={<RentalTrackingPage />} />

                    {/* Routes admin protégées */}
                    <Route path="/admin/dashboard" element={
                        // <ProtectedAdminRoute>
                            <DashboardAdmin />
                        // </ProtectedAdminRoute>
                    } />
                    <Route path="/admin/formations" element={
                        //   <ProtectedAdminRoute>
                            <FormationsAdmin />
                        //   </ProtectedAdminRoute>
                    } />
                    <Route path="/admin/formations/new" element={<FormationNew />} />
                    <Route path="/admin/formations/:id" element={<FormationDetail />} />
                    <Route path="/admin/sessions" element={<SessionsAdmin />} />
                    <Route path="/admin/sessions/new" element={<SessionNew />} />
                    <Route path="/admin/vehicles" element={<VehiclesAdmin />} />
                    <Route path="/admin/email-templates" element={<EmailTemplatesAdmin />} />
                    <Route path="/admin/email-templates/new" element={<EmailTemplateNew />} />
                    <Route path="/admin/email-templates/:id/edit" element={<EmailTemplateEdit />} />
                    <Route path="/admin/direct-documents" element={<DirectDocuments />} />

                    {/* CMS Content Management Routes */}
                    <Route path="/admin/content/texts" element={<ContentTextsAdmin />} />
                    <Route path="/admin/content/testimonials" element={<TestimonialsAdmin />} />
                    <Route path="/admin/content/faq" element={<FAQAdmin />} />

                    <Route path="/admin/reservations" element={
                        //   <ProtectedAdminRoute>
                            <ReservationsAdmin />
                        //   </ProtectedAdminRoute>
                    } />
                    {/* Nouvelle route pour les détails de réservation véhicule */}
                    <Route path="/admin/reservations/vehicle/:id" element={<VehicleReservationDetail />} />
                    <Route path="/admin/centers" element={<CentersAdmin />} />
                    <Route path="/admin/reservations/formules" element={<FormulasAdmin />} />


                    <Route path="/admin/users" element={
                        //   <ProtectedAdminRoute>
                            <UsersAdmin />
                        //   </ProtectedAdminRoute>
                    } />
                    <Route path="/admin/users/students" element={<StudentsAdmin />} />
                    <Route path="/admin/users/instructors" element={<InstructorsAdmin />} />
                    <Route path="/admin/users/admins" element={<AdminsAdmin />} />

                    {/* Routes de planning */}
                    <Route path="/admin/planning" element={
                        //   <ProtectedAdminRoute>
                            <PlanningCalendar />
                        //   </ProtectedAdminRoute>
                    } />
                    <Route path="/student/planning" element={
                        //   <ProtectedStudentRoute>
                            <PlanningCalendar />
                        //   </ProtectedStudentRoute>
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
        </NotificationProvider>
    );
};

export default App;