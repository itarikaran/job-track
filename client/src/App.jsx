import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CompaniesList from "./pages/CompaniesList";
import AddCompany from "./pages/AddCompany";
import EditCompany from "./pages/EditCompany";
import CompanyDetail from "./pages/CompanyDetail";
import ApplicationsList from "./pages/ApplicationsList";
import ApplicationForm from "./pages/ApplicationForm";
import ApplicationDetail from "./pages/ApplicationDetail";
import Dashboard from "./pages/Dashboard";

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return user ? children : <Navigate to="/login" replace />;
};

// Public route wrapper (redirects to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return user ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen">
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/companies"
              element={
                <ProtectedRoute>
                  <CompaniesList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/companies/create"
              element={
                <ProtectedRoute>
                  <AddCompany />
                </ProtectedRoute>
              }
            />
            <Route
              path="/companies/:id/edit"
              element={
                <ProtectedRoute>
                  <EditCompany />
                </ProtectedRoute>
              }
            />
            <Route
              path="/companies/:id"
              element={
                <ProtectedRoute>
                  <CompanyDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute>
                  <ApplicationsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications/create"
              element={
                <ProtectedRoute>
                  <ApplicationForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications/:id/edit"
              element={
                <ProtectedRoute>
                  <ApplicationForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications/:id"
              element={
                <ProtectedRoute>
                  <ApplicationDetail />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
