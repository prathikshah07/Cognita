// src/App.tsx
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "next-themes";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

import SplashScreen from "@/components/layout/splash-screen";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Finance from "@/pages/Finance";
import Study from "@/pages/Study";
import Sleep from "@/pages/Sleep";
import Notes from "@/pages/Notes";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

import { supabase } from "@/lib/supabaseClient";

const queryClient = new QueryClient();

const AppWrapper: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Splash screen delay
    const timer = setTimeout(() => setLoading(false), 1500);

    // Get current session
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      clearTimeout(timer);
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <SplashScreen />;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SidebarProvider>
              <div className="min-h-screen flex flex-col md:flex-row w-full">
                {/* Sidebar only if logged in */}
                {session && <AppSidebar />}

                <main className="flex-1 flex flex-col">
                  {/* Header only if logged in */}
                  {session && (
                    <header className="h-14 border-b flex items-center px-4 bg-background sticky top-0 z-10">
                      <h1 className="ml-4 text-lg font-semibold">Cognita</h1>
                      <div className="ml-auto">
                        <ThemeToggle />
                      </div>
                    </header>
                  )}

                  <div className="flex-1 overflow-auto">
                    <Routes>
                      <Route
                        path="/"
                        element={
                          session ? <Navigate to="/dashboard" /> : <Onboarding />
                        }
                      />
                      <Route
                        path="/dashboard"
                        element={session ? <Dashboard /> : <Navigate to="/" />}
                      />
                      <Route
                        path="/study"
                        element={session ? <Study /> : <Navigate to="/" />}
                      />
                      <Route
                        path="/finance"
                        element={session ? <Finance /> : <Navigate to="/" />}
                      />
                      <Route
                        path="/sleep"
                        element={session ? <Sleep /> : <Navigate to="/" />}
                      />
                      <Route
                        path="/notes"
                        element={session ? <Notes /> : <Navigate to="/" />}
                      />
                      <Route
                        path="/profile"
                        element={session ? <Profile /> : <Navigate to="/" />}
                      />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </main>
              </div>
            </SidebarProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default AppWrapper;
