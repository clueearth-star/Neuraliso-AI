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

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col relative z-10 bg-[#0B1121] text-white">
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
        
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
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
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

