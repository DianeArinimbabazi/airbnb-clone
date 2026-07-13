import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./shared/components/Navbar";
import { Spinner } from "./shared/components/Spinner";
import { NotFound } from "./shared/components/NotFound";
import { useAuth } from "./features/auth/hooks/useAuth";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

const HomePage           = lazy(() => import("./features/home/pages/HomePage"));
const LoginPage          = lazy(() => import("./features/auth/pages/LoginPage").then(m => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() => import("./features/auth/pages/ForgotPasswordPage").then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage  = lazy(() => import("./features/auth/pages/ResetPasswordPage").then(m => ({ default: m.ResetPasswordPage })));
const SignupPage         = lazy(() => import("./features/auth/pages/SignupPage").then(m => ({ default: m.SignupPage })));
const ListingsPage       = lazy(() => import("./features/listings/pages/ListingsPage"));
const ListingDetail      = lazy(() => import("./features/listings/pages/ListingDetail").then(m => ({ default: m.ListingDetail })));
const GuestDashboard    = lazy(() => import("./features/auth/pages/GuestDashboard").then(m => ({ default: m.default })));
const HostDashboard     = lazy(() => import("./features/auth/pages/HostDashboard").then(m => ({ default: m.default })));
const AdminDashboard    = lazy(() => import("./features/auth/pages/AdminDashboard").then(m => ({ default: m.AdminDashboard ?? m.default })));
const BookingPage       = lazy(() => import("./features/bookings/pages/BookingPage").then(m => ({ default: m.BookingPage })));
const CreateListingPage = lazy(() => import("./features/host/pages/CreateListingPage").then(m => ({ default: m.CreateListingPage })));
const EditListingPage   = lazy(() => import("./features/host/pages/EditListingPage").then(m => ({ default: m.EditListingPage ?? m.default })));
const ModerationQueue   = lazy(() => import("./features/admin/pages/ModerationQueue").then(m => ({ default: m.ModerationQueue ?? m.default })));
const ProfilePage       = lazy(() => import("./features/auth/pages/ProfilePage").then(m => ({ default: m.ProfilePage ?? m.default })));
const MessagesPage      = lazy(() => import("./features/messages/pages/MessagesPage").then(m => ({ default: m.default })));
const AIChatWidget      = lazy(() => import("./features/ai/AIChatWidget").then(m => ({ default: m.AIChatWidget })));

NProgress.configure({ showSpinner: false, trickleSpeed: 200 });

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
          <Route path="/listings"          element={<ListingsPage />} />
          <Route path="/listings/:id"      element={<ListingDetail />} />
          <Route path="/listings/new"      element={<RequireAuth role="HOST"><CreateListingPage /></RequireAuth>} />
          <Route path="/listings/:id/edit" element={<RequireAuth role="HOST"><EditListingPage /></RequireAuth>} />
          <Route path="/listings/:id/book" element={<RequireAuth><BookingPage /></RequireAuth>} />
          <Route path="/guest"            element={<RequireAuth role="GUEST"><GuestDashboard /></RequireAuth>} />
          <Route path="/host"             element={<RequireAuth role="HOST"><HostDashboard /></RequireAuth>} />
          <Route path="/admin"            element={<RequireAuth role="ADMIN"><AdminDashboard /></RequireAuth>} />
          <Route path="/admin/moderation" element={<RequireAuth role="ADMIN"><ModerationQueue /></RequireAuth>} />
          <Route path="/profile"          element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/messages"         element={<RequireAuth><MessagesPage /></RequireAuth>} />
          <Route path="/dashboard"        element={<DashboardRedirect />} />
          <Route path="*"                 element={<NotFound />} />
        </Routes>
      </Suspense>
      <Suspense fallback={null}>
        <AIChatWidget />
      </Suspense>
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




