import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./lib/AuthContext";
import Landing from "./pages/Landing";
import RulesOfEngagement from "./pages/RulesOfEngagement";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Support from "./pages/Support";
import SupportTicketDetail from "./pages/SupportTicketDetail";
import SupportQueue from "./pages/SupportQueue";
import Directory from "./pages/Directory";
import DirectoryProfile from "./pages/DirectoryProfile";
import Documents from "./pages/Documents";
import Payslips from "./pages/Payslips";
import Leave from "./pages/Leave";
import LeaveTeam from "./pages/LeaveTeam";
import Expenses from "./pages/Expenses";
import ExpenseApprovals from "./pages/ExpenseApprovals";
import Reviews from "./pages/Reviews";
import AdminConsole from "./pages/AdminConsole";
import AdminReports from "./pages/AdminReports";

function RequireAuth({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

const HR_ROLES = ["HR_ADMIN", "SUPER_ADMIN"];

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/rules-of-engagement" element={<RulesOfEngagement />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/directory"
        element={
          <RequireAuth>
            <Directory />
          </RequireAuth>
        }
      />
      <Route
        path="/directory/:id"
        element={
          <RequireAuth>
            <DirectoryProfile />
          </RequireAuth>
        }
      />
      <Route
        path="/documents"
        element={
          <RequireAuth>
            <Documents />
          </RequireAuth>
        }
      />
      <Route
        path="/payslips"
        element={
          <RequireAuth>
            <Payslips />
          </RequireAuth>
        }
      />
      <Route
        path="/leave"
        element={
          <RequireAuth>
            <Leave />
          </RequireAuth>
        }
      />
      <Route
        path="/leave/team"
        element={
          <RequireAuth>
            <LeaveTeam />
          </RequireAuth>
        }
      />
      <Route
        path="/expenses"
        element={
          <RequireAuth>
            <Expenses />
          </RequireAuth>
        }
      />
      <Route
        path="/expenses/approvals"
        element={
          <RequireAuth>
            <ExpenseApprovals />
          </RequireAuth>
        }
      />
      <Route
        path="/reviews"
        element={
          <RequireAuth>
            <Reviews />
          </RequireAuth>
        }
      />
      <Route
        path="/support"
        element={
          <RequireAuth>
            <Support />
          </RequireAuth>
        }
      />
      <Route
        path="/support/queue"
        element={
          <RequireAuth roles={HR_ROLES}>
            <SupportQueue />
          </RequireAuth>
        }
      />
      <Route
        path="/support/:id"
        element={
          <RequireAuth>
            <SupportTicketDetail />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAuth roles={HR_ROLES}>
            <AdminConsole />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <RequireAuth roles={HR_ROLES}>
            <AdminReports />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
