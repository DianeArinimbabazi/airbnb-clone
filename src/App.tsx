import { AIChatWidget } from './features/ai/AIChatWidget';
import { config } from './config/env';
import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./shared/components/Navbar";
import { Spinner } from "./shared/components/Spinner";
import { NotFound } from "./shared/components/NotFound";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { ForgotPasswordPage } from "./features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./features/auth/pages/ResetPasswordPage";
import { SignupPage } from "./features/auth/pages/SignupPage";
import ListingsPage from "./features/listings/pages/ListingsPage";
import HomePage from "./features/home/pages/HomePage";
import { useAuth } from "./features/auth/hooks/useAuth";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

const ListingDetail     = lazy(() => import("./features/listings/pages/ListingDetail").then(m => ({ default: m.ListingDetail })));
const GuestDashboard    = lazy(() => import("./features/auth/pages/GuestDashboard").then(m => ({ default: m.default })));
const HostDashboard     = lazy(() => import("./features/auth/pages/HostDashboard").then(m => ({ default: m.default })));
const AdminDashboard    = lazy(() => import("./features/auth/pages/AdminDashboard").then(m => ({ default: m.AdminDashboard ?? m.default })));
const BookingPage       = lazy(() => import("./features/bookings/pages/BookingPage").then(m => ({ default: m.BookingPage })));
const CreateListingPage = lazy(() => import("./features/host/pages/CreateListingPage").then(m => ({ default: m.CreateListingPage })));
const EditListingPage   = lazy(() => import("./features/host/pages/EditListingPage").then(m => ({ default: m.EditListingPage ?? m.default })));
const ModerationQueue   = lazy(() => import("./features/admin/pages/ModerationQueue").then(m => ({ default: m.ModerationQueue ?? m.default })));
const ProfilePage       = lazy(() => import("./features/auth/pages/ProfilePage").then(m => ({ default: m.ProfilePage ?? m.default })));

NProgress.configure({ showSpinner: false, trickleSpeed: 200 });

fetch(config.apiUrl + '/listings?limit=1').catch(() => {});

function RequireAuth({ children, role }: { children: React.ReactNode; role?: "GUEST" | "HOST" | "ADMIN" }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`} replace />;
  if (role && user?.role !== role) return <Navigate to="/listings" replace />;
  return <>{children}</>;
}

export default function App() {
  const location = useLocation();
  useEffect(() => {
    NProgress.start();
    const t = setTimeout(() => NProgress.done(), 300);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <>
      {!["/admin","/host","/guest"].some(p => location.pathname.startsWith(p)) && <Navbar />}
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/"       element={<HomePage />} />
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/listings"          element={<RequireAuth><ListingsPage /></RequireAuth>} />
          <Route path="/listings/:id"      element={<RequireAuth><ListingDetail /></RequireAuth>} />
          <Route path="/listings/new"      element={<RequireAuth role="HOST"><CreateListingPage /></RequireAuth>} />
          <Route path="/listings/:id/edit" element={<RequireAuth role="HOST"><EditListingPage /></RequireAuth>} />
          <Route path="/listings/:id/book" element={<RequireAuth><BookingPage /></RequireAuth>} />
          <Route path="/guest"            element={<RequireAuth role="GUEST"><GuestDashboard /></RequireAuth>} />
          <Route path="/host"             element={<RequireAuth role="HOST"><HostDashboard /></RequireAuth>} />
          <Route path="/admin"            element={<RequireAuth role="ADMIN"><AdminDashboard /></RequireAuth>} />
          <Route path="/admin/moderation" element={<RequireAuth role="ADMIN"><ModerationQueue /></RequireAuth>} />
          <Route path="/profile"          element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/dashboard"        element={<DashboardRedirect />} />
          <Route path="*"                 element={<NotFound />} />
        </Routes>
      </Suspense>
      <AIChatWidget />
    </>
  );
}

function DashboardRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === "HOST") return <Navigate to="/host" replace />;
  if (user?.role === "ADMIN") return <Navigate to="/admin" replace />;
  return <Navigate to="/guest" replace />;
}



