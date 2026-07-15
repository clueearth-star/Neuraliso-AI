import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// -------------------------------------------------------------
// Global Resiliency Engine (Handles Adblockers & Server Sleep)
// -------------------------------------------------------------
if (typeof window !== "undefined") {
  // Prevent third-party crashes (like ad-blocker blocked scripts) from bubbling up as unhandled rejections
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason?.message || String(event.reason || "");
    const reasonStr = reason.toLowerCase();
    if (
      reasonStr.includes("failed to fetch") || 
      reasonStr.includes("fetch") || 
      reasonStr.includes("networkerror") ||
      reasonStr.includes("cpm")
    ) {
      console.warn("[System] Handled unhandled fetch rejection:", reason);
      event.preventDefault();
      event.stopPropagation();
    }
  }, { capture: true });

  window.addEventListener("error", (event) => {
    const msg = event.message || "";
    const msgStr = msg.toLowerCase();
    if (
      msgStr.includes("failed to fetch") || 
      msgStr.includes("script error") || 
      msgStr.includes("networkerror") ||
      msgStr.includes("cpm")
    ) {
      console.warn("[System] Handled global window error:", msg);
      event.preventDefault();
      event.stopPropagation();
    }
  }, { capture: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

