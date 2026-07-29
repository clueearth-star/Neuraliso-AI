import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AmbientOrbs } from "./components/AmbientOrbs";
import { CrisisModal } from "./components/CrisisModal";
import { LandingPage } from "./components/LandingPage";
import { Onboarding } from "./components/Onboarding";
import { AppNav } from "./components/AppNav";
import { Dashboard } from "./components/Dashboard";
import { MoodCheckView } from "./components/MoodCheckView";
import { BreatheView } from "./components/BreatheView";
import { SleepSoundsView } from "./components/SleepSoundsView";
import { ReframeView } from "./components/ReframeView";
import { ProgressView } from "./components/ProgressView";
import { SettingsView } from "./components/SettingsView";
import { ChatView } from "./components/ChatView";
import { FloatingChatButton } from "./components/FloatingChatButton";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./components/auth/Login";
import { Signup } from "./components/auth/Signup";
import { ForgotPassword } from "./components/auth/ForgotPassword";
import { ResetPassword } from "./components/auth/ResetPassword";
import { PricingView } from "./components/subscription/PricingView";
import { UpgradeModal } from "./components/subscription/UpgradeModal";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { useSubscription } from "./contexts/SubscriptionContext";
import { AuthCallback } from "./components/auth/AuthCallback";
import { ErrorBoundary } from "./components/ErrorBoundary";

const AppLayout: React.FC = () => {
  const { showExpiryBanner, daysUntilExpiry, openUpgradeModal } = useSubscription();

  return (
    <div className="min-h-screen flex flex-col relative z-10 bg-[#0B1121] text-white">
      {showExpiryBanner && (
        <div className="bg-gradient-to-r from-[#FFD700]/20 via-[#FFA500]/20 to-[#FFD700]/20 border-b border-[#FFD700]/30 px-4 py-2.5 text-center text-xs sm:text-sm text-[#FFD700] flex items-center justify-center gap-3">
          <span>⚠️ Your Plus subscription expires in <strong>{daysUntilExpiry ?? 0} days</strong>. Renew now to avoid losing your unlimited check-ins and sleep sounds.</span>
          <button
            onClick={() => openUpgradeModal("Renew your Neuraliso Plus subscription today.")}
            className="px-3 py-1 rounded-lg bg-[#FFD700] text-[#0B1121] font-bold text-xs hover:bg-[#ffe244] transition-colors cursor-pointer shrink-0"
          >
            Renew Now
          </button>
        </div>
      )}
      <AppNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <FloatingChatButton />
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0B1121] text-white selection:bg-[#00d4ff] selection:text-[#0B1121] font-sans">
        <AmbientOrbs />
        <CrisisModal />
        <UpgradeModal />
        
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/pricing" element={<PricingView />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/chat" element={<Navigate to="/app/chat" replace />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="mood" element={<MoodCheckView />} />
                <Route path="breathe" element={<BreatheView />} />
                <Route path="sleep" element={<SleepSoundsView />} />
                <Route path="reframe" element={<ReframeView />} />
                <Route path="progress" element={<ProgressView />} />
                <Route path="settings" element={<SettingsView />} />
                <Route path="chat" element={<ChatView />} />
                <Route path="pricing" element={<PricingView />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </BrowserRouter>
  );
}

export default App;

