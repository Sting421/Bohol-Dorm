import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoginPage } from "@/pages/LoginPage";
import { Dashboard } from "@/pages/Dashboard";
import { TenantsPage } from "@/pages/TenantsPage";
import { RoomsPage } from "@/pages/RoomsPage";
import { PaymentsPage } from "@/pages/PaymentsPage";
import { NotFound } from "@/pages/NotFound";
import { DashboardLayout } from "./components/layout/DashboardLayout";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tenants" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <TenantsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/rooms" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <RoomsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/payments" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PaymentsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
