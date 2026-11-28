import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import AuthCallback from "./pages/AuthCallback";
import AdminSignIn from "./pages/admin/AdminSignIn";
import AdminUsers from "./pages/admin/AdminUsers";

function Storefront() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex min-h-[calc(100dvh-57px)] flex-1 flex-col md:min-h-[calc(100dvh-65px)]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function Admin() {
  return (
    <Routes>
      <Route path="login" element={<AdminSignIn />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="*" element={<Navigate to="/admin/users" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<Admin />} />
        <Route path="*" element={<Storefront />} />
      </Routes>
    </BrowserRouter>
  );
}
