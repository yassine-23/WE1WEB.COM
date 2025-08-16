import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Suspense, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SimpleLogin } from "@/components/auth/simple-login";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import LoadingFallback from "@/components/lazy-loader";
import {
  LazyOnboarding,
  LazyProvider,
  LazyEnhancedProvider,
  LazyDeveloper,
  LazyMarketplace,
  LazyCommunity,
  LazyNeuralPools,
  LazyDonate,
  LazyWalletCashout,
  LazyProfile,
  LazyMonitoring,
  preloadComponent
} from "@/components/lazy-loader";
import ComputeNetwork from "@/pages/compute-network";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Always show Landing page as default */}
      <Route path="/" component={Landing} />
      <Route path="/auth" component={() => <SimpleLogin onLogin={() => window.location.href = "/dashboard"} />} />
      
      {isLoading ? (
        <Route path="/dashboard">
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </Route>
      ) : isAuthenticated ? (
        <>
          <Route path="/dashboard" component={Home} />
          <Route path="/onboarding">
            <Suspense fallback={<LoadingFallback message="Loading onboarding..." />}>
              <LazyOnboarding />
            </Suspense>
          </Route>
          <Route path="/provider">
            <Suspense fallback={<LoadingFallback message="Loading provider dashboard..." />}>
              <LazyProvider />
            </Suspense>
          </Route>
          <Route path="/enhanced-provider">
            <Suspense fallback={<LoadingFallback message="Loading enhanced provider..." />}>
              <LazyEnhancedProvider />
            </Suspense>
          </Route>
          <Route path="/developer">
            <Suspense fallback={<LoadingFallback message="Loading developer dashboard..." />}>
              <LazyDeveloper />
            </Suspense>
          </Route>
          <Route path="/marketplace">
            <Suspense fallback={<LoadingFallback message="Loading marketplace..." />}>
              <LazyMarketplace />
            </Suspense>
          </Route>
          <Route path="/neural-pools">
            <Suspense fallback={<LoadingFallback message="Loading neural pools..." />}>
              <LazyNeuralPools />
            </Suspense>
          </Route>
          <Route path="/compute-network">
            <Suspense fallback={<LoadingFallback message="Loading compute network..." />}>
              <ComputeNetwork />
            </Suspense>
          </Route>
          <Route path="/donate">
            <Suspense fallback={<LoadingFallback message="Loading donation page..." />}>
              <LazyDonate />
            </Suspense>
          </Route>
          <Route path="/wallet-cashout">
            <Suspense fallback={<LoadingFallback message="Loading wallet..." />}>
              <LazyWalletCashout />
            </Suspense>
          </Route>
          <Route path="/profile">
            <Suspense fallback={<LoadingFallback message="Loading profile..." />}>
              <LazyProfile />
            </Suspense>
          </Route>
          <Route path="/community">
            <Suspense fallback={<LoadingFallback message="Loading community..." />}>
              <LazyCommunity />
            </Suspense>
          </Route>
          <Route path="/monitoring">
            <Suspense fallback={<LoadingFallback message="Loading monitoring..." />}>
              <LazyMonitoring />
            </Suspense>
          </Route>
        </>
      ) : (
        <Route path="/dashboard">
          <SimpleLogin onLogin={() => window.location.href = "/dashboard"} />
        </Route>
      )}
      <Route path="/:rest*" component={NotFound} />
    </Switch>
  );
}

function App() {
  // Preload critical routes after initial render
  useEffect(() => {
    // Preload commonly accessed routes after a delay
    const timer = setTimeout(() => {
      preloadComponent(() => import("@/pages/provider"));
      preloadComponent(() => import("@/pages/developer"));
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="we1web-ui-theme">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
