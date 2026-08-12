import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import { AuthProvider } from "./context/AuthContext";

// Lazy load pages for performance
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Signup = lazy(() => import("./pages/Auth/Signup"));
const Dashboard = lazy(() => import("./pages/Auth/Dashboard"));
const Events = lazy(() => import("./pages/Auth/Events"));
const EventDetails = lazy(() => import("./pages/Auth/EventDetails"));
const Vendors = lazy(() => import("./pages/Auth/Vendors"));
const Guests = lazy(() => import("./pages/Auth/Guests"));
const Budget = lazy(() => import("./pages/Auth/Budget"));
const Tasks = lazy(() => import("./pages/Auth/Tasks"));
const Analytics = lazy(() => import("./pages/Auth/Analytics"));
const Team = lazy(() => import("./pages/Auth/Team"));
const Settings = lazy(() => import("./pages/Auth/Settings"));
const RegistrationBuilder = lazy(() => import("./pages/Auth/RegistrationBuilder"));
const RegisterEvent = lazy(() => import("./pages/RegisterEvent"));
const GuestPass = lazy(() => import("./pages/GuestPass"));

import { LogoLoader } from "./components/ui/Loader";

import { DialogProvider } from "./context/DialogContext";
import CustomDialog from "./components/ui/CustomDialog";
import { UploadProvider } from "./context/UploadContext";

import { useEffect } from "react";
import { useParams } from "react-router-dom";

function PublicGuestPassRedirect() {
  const { id } = useParams();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5002/api";
  useEffect(() => {
    window.location.href = `${apiUrl}/guests/pass/${id}`;
  }, [id, apiUrl]);

  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", background: "#09090b", color: "#fff", fontFamily: "sans-serif" }}>
      <p style={{ fontSize: "16px", fontWeight: 700 }}>Loading Digital Access Pass...</p>
    </div>
  );
}

export default function App() {
  return (
    <DialogProvider>
      <UploadProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<LogoLoader />}>
              <CustomDialog />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/register/:eventId" element={<RegisterEvent />} />
                <Route path="/pass/:id" element={<GuestPass />} />
                <Route path="/guests/pass/:id" element={<GuestPass />} />

                {/* Protected Dashboard Routes */}
                <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/:eventId" element={<EventDetails />} />
                  <Route path="/vendors" element={<Vendors />} />
                  <Route path="/guests" element={<Guests />} />
                  <Route path="/budget" element={<Budget />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/builder" element={<RegistrationBuilder />} />
                  {/* Redirect empty paths to dashboard */}
                  <Route path="/auth" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </UploadProvider>
    </DialogProvider>
  );
}

//sample

