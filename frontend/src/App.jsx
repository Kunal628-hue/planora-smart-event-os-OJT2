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

import { LogoLoader } from "./components/ui/Loader";

import { DialogProvider } from "./context/DialogContext";
import CustomDialog from "./components/ui/CustomDialog";

export default function App() {
  return (
    <DialogProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<LogoLoader />}>
            <CustomDialog />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/register/:eventId" element={<RegisterEvent />} />

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
    </DialogProvider>
  );
}

