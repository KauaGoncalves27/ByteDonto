/* IMPORTS OF COMPONENTS */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../context/AuthContext";
import ScrollToTop from "./ScrollToTop";

import LandingPage from "../pages/general/LandingPage";
import LoginPage from "../pages/general/LoginPage";
import CadastroPage from "../pages/general/CadastroPage";

import OwnerListClinic from "../pages/owner/clinic/ListClinic";
import OwnerRegisterClinic from "../pages/owner/clinic/RegisterClinic";
import OwnerViewClinic from "../pages/owner/clinic/ViewClinic";
import OwnerEditClinic from "../pages/owner/clinic/EditClinic";

import OwnerTeamClinic from "../pages/owner/team/TeamClinic";
import OwnerListTeam from "../pages/owner/team/ListTeam";

import OwnerPacientClinic from "../pages/owner/pacients/PacientClinic";
import OwnerListPacient from "../pages/owner/pacients/ListPacient";
import OwnerRegisterPacient from "../pages/owner/pacients/RegisterPacient";

import OwnerFinancial from "../pages/owner/Financial";
import Onboarding from "../pages/owner/Onboarding";

import SpecialistDashboard from "../pages/specialist/Dashboard";
import SpecialistListPatients from "../pages/specialist/ListPatients";
import SpecialistViewRecord from "../pages/specialist/ViewRecord";

import ReceptionDashboard from "../pages/reception/Dashboard";
import RegisterPatient from "../pages/reception/RegisterPatient";
import ListPatients from "../pages/reception/ListPatients";
import ViewPatient from "../pages/reception/ViewPatient";

/* Mapeia role para o dashboard correto para redirecionamento automático */
function dashboardByRole(papel) {
  if (papel === "Employee") return "/employee/dashboard";
  if (papel === "Specialist") return "/specialist/dashboard";
  return "/owner/clinic";
}

/* PRIVATE ROUTE — redireciona para login se não autenticado.
   Se allowedRoles for informado, redireciona para o dashboard correto
   caso o papel do usuário não coincida. */
function PrivateRoute({ children, allowedRoles }) {
  const { token, user, loading } = useAuth();
  if (loading) return null;
  if (!token) return <Navigate to="/" replace />;

  if (allowedRoles && user?.perfil?.roles) {
    const papel = user.perfil.roles;
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
          <Route path="/owner/clinic" element={<PrivateRoute allowedRoles={["Owner"]}><OwnerListClinic /></PrivateRoute>} />
          <Route path="/owner/clinic/register" element={<PrivateRoute allowedRoles={["Owner"]}><OwnerRegisterClinic /></PrivateRoute>} />
          <Route path="/owner/view-clinic/:id" element={<PrivateRoute allowedRoles={["Owner"]}><OwnerViewClinic /></PrivateRoute>} />
          <Route path="/owner/edit-clinic/:id" element={<PrivateRoute allowedRoles={["Owner"]}><OwnerEditClinic /></PrivateRoute>} />

          <Route path="/owner/team" element={<PrivateRoute allowedRoles={["Owner"]}><OwnerTeamClinic /></PrivateRoute>} />
          <Route path="/owner/team/:id_clinic" element={<PrivateRoute allowedRoles={["Owner"]}><OwnerListTeam /></PrivateRoute>} />

          <Route path="/owner/pacients" element={<PrivateRoute allowedRoles={["Owner"]}><OwnerPacientClinic /></PrivateRoute>} />
          <Route path="/owner/pacients/:id_clinic" element={<PrivateRoute allowedRoles={["Owner"]}><OwnerListPacient /></PrivateRoute>} />
          <Route path="/owner/pacients/:id_clinic/register" element={<PrivateRoute allowedRoles={["Owner"]}><OwnerRegisterPacient /></PrivateRoute>} />

          <Route path="/owner/financial" element={<PrivateRoute allowedRoles={["Owner"]}><OwnerFinancial role="owner" /></PrivateRoute>} />

          {/* ROTAS DO ESPECIALISTA (DENTISTA) */}
          <Route path="/specialist/dashboard" element={<PrivateRoute allowedRoles={["Specialist"]}><SpecialistDashboard /></PrivateRoute>} />
          <Route path="/specialist/patients" element={<PrivateRoute allowedRoles={["Specialist"]}><SpecialistListPatients /></PrivateRoute>} />
          <Route path="/specialist/records" element={<PrivateRoute allowedRoles={["Specialist"]}><SpecialistListPatients /></PrivateRoute>} />
          <Route path="/specialist/patient/view" element={<PrivateRoute allowedRoles={["Specialist"]}><SpecialistViewRecord /></PrivateRoute>} />

          {/* ROTAS DA RECEPÇÃO */}
          <Route path="/employee/dashboard" element={<PrivateRoute allowedRoles={["Employee"]}><ReceptionDashboard /></PrivateRoute>} />
          <Route path="/employee/patient/register" element={<PrivateRoute allowedRoles={["Employee"]}><RegisterPatient /></PrivateRoute>} />
          <Route path="/employee/patients" element={<PrivateRoute allowedRoles={["Employee"]}><ListPatients /></PrivateRoute>} />
          <Route path="/employee/patient/view" element={<PrivateRoute allowedRoles={["Employee"]}><ViewPatient /></PrivateRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}