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
import OwnerRegisterPacient from "../pages/owner/RegisterPacient";

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

/* Mapeia papel para o dashboard correto para redirecionamento automático */
function dashboardByRole(papel) {
  if (papel === "Recepção") return "/employee/dashboard";
  if (papel === "Especialista") return "/specialist/dashboard";
  return "/owner/clinic";
}

/* PRIVATE ROUTE — redireciona para login se não autenticado.
   Se allowedRoles for informado, redireciona para o dashboard correto
   caso o papel do usuário não coincida. */
function PrivateRoute({ children, allowedRoles }) {
  const { token, user, loading } = useAuth();
  if (loading) return null;
  if (!token) return <Navigate to="/" replace />;

  if (allowedRoles && user?.perfil?.papel) {
    const papel = user.perfil.papel;
    if (!allowedRoles.includes(papel)) {
      return <Navigate to={dashboardByRole(papel)} replace />;
    }
  }

  return children;
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

          {/* ROTAS DO PROPRIETÁRIO */}
          <Route path="/owner/clinic" element={<PrivateRoute allowedRoles={["Dono"]}><OwnerListClinic /></PrivateRoute>} />
          <Route path="/owner/clinic/register" element={<PrivateRoute allowedRoles={["Dono"]}><OwnerRegisterClinic /></PrivateRoute>} />
          <Route path="/owner/view-clinic/:id" element={<PrivateRoute allowedRoles={["Dono"]}><OwnerViewClinic /></PrivateRoute>} />
          <Route path="/owner/edit-clinic/:id" element={<PrivateRoute allowedRoles={["Dono"]}><OwnerEditClinic /></PrivateRoute>} />

          <Route path="/owner/team" element={<PrivateRoute allowedRoles={["Dono"]}><BindClinic /></PrivateRoute>} />

          <Route path="/owner/pacients" element={<PrivateRoute allowedRoles={["Dono"]}><OwnerPacientClinic /></PrivateRoute>} />
          <Route path="/owner/pacients/:id_clinic" element={<PrivateRoute allowedRoles={["Dono"]}><OwnerListPacient /></PrivateRoute>} />
          <Route path="/owner/pacients/:id_clinic/register" element={<PrivateRoute allowedRoles={["Dono"]}><OwnerRegisterPacient /></PrivateRoute>} />

          <Route path="/owner/onboarding" element={<PrivateRoute allowedRoles={["Dono"]}><Onboarding /></PrivateRoute>} />
          <Route path="/owner/financial" element={<PrivateRoute allowedRoles={["Dono"]}><OwnerFinancial role="owner" /></PrivateRoute>} />

          {/* ROTAS DO ESPECIALISTA (DENTISTA) */}
          <Route path="/specialist/dashboard" element={<PrivateRoute allowedRoles={["Especialista"]}><SpecialistDashboard /></PrivateRoute>} />
          <Route path="/specialist/patients" element={<PrivateRoute allowedRoles={["Especialista"]}><SpecialistListPatients /></PrivateRoute>} />
          <Route path="/specialist/records" element={<PrivateRoute allowedRoles={["Especialista"]}><SpecialistListPatients /></PrivateRoute>} />
          <Route path="/specialist/patient/view" element={<PrivateRoute allowedRoles={["Especialista"]}><SpecialistViewRecord /></PrivateRoute>} />

          {/* ROTAS DA RECEPÇÃO */}
          <Route path="/employee/dashboard" element={<PrivateRoute allowedRoles={["Recepção"]}><ReceptionDashboard /></PrivateRoute>} />
          <Route path="/employee/patient/register" element={<PrivateRoute allowedRoles={["Recepção"]}><RegisterPatient /></PrivateRoute>} />
          <Route path="/employee/patients" element={<PrivateRoute allowedRoles={["Recepção"]}><ListPatients /></PrivateRoute>} />
          <Route path="/employee/patient/view" element={<PrivateRoute allowedRoles={["Recepção"]}><ViewPatient /></PrivateRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}