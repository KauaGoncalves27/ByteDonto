/* IMPORTS OF COMPONENTS */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../context/AuthContext";
import ScrollToTop from "./ScrollToTop";

import LandingPage from "../pages/general/LandingPage";
import LoginPage from "../pages/general/LoginPage";
import CadastroPage from "../pages/general/CadastroPage";

import OwnerListClinic from "../pages/owner/ListClinic";
import OwnerRegisterClinic from "../pages/owner/RegisterClinic";
import OwnerViewClinic from "../pages/owner/ViewClinic";
import OwnerEditClinic from "../pages/owner/EditClinic";

import OwnerPacientClinic from "../pages/owner/PacientClinic";
import OwnerListPacient from "../pages/owner/ListPacient";

import BindClinic from "../pages/owner/BindClinic";
import OwnerFinancial from "../pages/owner/Financial";
import Onboarding from "../pages/owner/Onboarding";

import SpecialistDashboard from "../pages/specialist/Dashboard";
import SpecialistListPatients from "../pages/specialist/ListPatients";
import SpecialistViewRecord from "../pages/specialist/ViewRecord";

import ReceptionDashboard from "../pages/reception/Dashboard";
import RegisterPatient from "../pages/reception/RegisterPatient";
import ListPatients from "../pages/reception/ListPatients";
import ViewPatient from "../pages/reception/ViewPatient";

/* PRIVATE ROUTE — redireciona para login se não autenticado */
function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return null;
  return token ? children : <Navigate to="/" replace />;
}

/* MAIN COMPONENT */
export function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login/:type" element={<LoginPage />} />
          <Route path="/cadastro/:type" element={<CadastroPage />} />

          {/* ROTA DO PROPRIETÁRIO */}
          <Route path="/owner/clinic" element={<PrivateRoute><OwnerListClinic /></PrivateRoute>} />
          <Route path="/owner/clinic/register" element={<PrivateRoute><OwnerRegisterClinic /></PrivateRoute>} />
          <Route path="/owner/view-clinic/:id" element={<PrivateRoute><OwnerViewClinic /></PrivateRoute>} />
          <Route path="/owner/edit-clinic/:id" element={<PrivateRoute><OwnerEditClinic /></PrivateRoute>} />
          
          <Route path="/owner/team" element={<PrivateRoute><BindClinic /></PrivateRoute>} />
          
          <Route path="/owner/pacients" element={<PrivateRoute><OwnerPacientClinic /></PrivateRoute>} />
          <Route path="/owner/pacients/:id_clinic" element={<PrivateRoute><OwnerListPacient /></PrivateRoute>} />

          <Route path="/owner/list-pacients" element={<PrivateRoute><OwnerListPacient /></PrivateRoute>} />
          <Route path="/owner/bind-clinic/:id" element={<PrivateRoute><BindClinic /></PrivateRoute>} />
          <Route path="/owner/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
          <Route path="/owner/financial" element={<PrivateRoute><OwnerFinancial role="owner" /></PrivateRoute>} />

          {/* ROTA DO ESPECIALISTA (DENTISTA) */}
          <Route path="/specialist/dashboard" element={<PrivateRoute><SpecialistDashboard /></PrivateRoute>} />
          <Route path="/specialist/patients" element={<PrivateRoute><SpecialistListPatients /></PrivateRoute>} />
          <Route path="/specialist/records" element={<PrivateRoute><SpecialistListPatients /></PrivateRoute>} />
          <Route path="/specialist/patient/view" element={<PrivateRoute><SpecialistViewRecord /></PrivateRoute>} />

          {/* ROTA DA RECEPÇÃO */}
          <Route path="/reception/dashboard" element={<PrivateRoute><ReceptionDashboard /></PrivateRoute>} />
          <Route path="/reception/patient/register" element={<PrivateRoute><RegisterPatient /></PrivateRoute>} />
          <Route path="/reception/patients" element={<PrivateRoute><ListPatients /></PrivateRoute>} />
          <Route path="/reception/patient/view" element={<PrivateRoute><ViewPatient /></PrivateRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}