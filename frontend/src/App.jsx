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

// Loading fallback
const LoadingPage = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#fcfdff" }}>
    <div style={{ width: "40px", height: "40px", border: "3px solid #f1f5f9", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

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
              {/* Redirect empty paths to dashboard */}
              <Route path="/auth" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

