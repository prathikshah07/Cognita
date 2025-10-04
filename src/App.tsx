// src/App.tsx
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import SplashScreen from "@/components/layout/splash-screen";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Finance from "@/pages/Finance";
import Study from "@/pages/Study";
import Sleep from "@/pages/Sleep";
import Notes from "@/pages/Notes";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <SplashScreen />;

  if (!onboarded) return <Onboarding onFinish={() => setOnboarded(true)} />;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex flex-col md:flex-row w-full">
              <AppSidebar/>
              <main className="flex-1 flex flex-col">
                <header className="h-14 border-b flex items-center px-4 bg-background sticky top-0 z-10">
                  <SidebarTrigger />
                  <h1 className="ml-4 text-lg font-semibold">Cognita</h1>
                </header>

                <div className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/study" element={<Study />} />
                    <Route path="/finance" element={<Finance />} />
                    <Route path="/sleep" element={<Sleep />} />
                    <Route path="/notes" element={<Notes />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
