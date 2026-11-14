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

  if (loading) return <SessionLoading />;

  return user ? children : <Navigate to="/login" replace />;
};

// Public pages remain available with or without an existing session.
const PublicRoute = ({ children }) => {
  const { loading } = useAuth();

  if (loading) return <SessionLoading />;

  return children;
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
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

function SessionLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="text-slate-600">Checking your session...</p>
      </div>
    </main>
  );
}

export default App;
