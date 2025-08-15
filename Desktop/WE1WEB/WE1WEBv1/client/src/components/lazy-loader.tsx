import { Suspense, lazy, ComponentType } from 'react';
import { Card, CardContent } from '@/components/ui/card';

// Loading component
const LoadingFallback = ({ message = "Loading..." }: { message?: string }) => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Card className="modern-card w-96">
      <CardContent className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  </div>
);

// Lazy load pages with prefetch support
export const LazyProvider = lazy(() => 
  import(/* webpackChunkName: "provider" */ '@/pages/provider')
);
export const LazyEnhancedProvider = lazy(() => 
  import(/* webpackChunkName: "enhanced-provider" */ '@/pages/enhanced-provider')
);
export const LazyNeuralPools = lazy(() => 
  import(/* webpackChunkName: "neural-pools" */ '@/pages/neural-pools')
);
export const LazyMarketplace = lazy(() => 
  import(/* webpackChunkName: "marketplace" */ '@/pages/marketplace')
);
export const LazyCommunity = lazy(() => 
  import(/* webpackChunkName: "community" */ '@/pages/community')
);
export const LazyDeveloper = lazy(() => 
  import(/* webpackChunkName: "developer" */ '@/pages/developer')
);
export const LazyProfile = lazy(() => 
  import(/* webpackChunkName: "profile" */ '@/pages/profile')
);
export const LazyWalletCashout = lazy(() => 
  import(/* webpackChunkName: "wallet-cashout" */ '@/pages/wallet-cashout')
);
export const LazyDonate = lazy(() => 
  import(/* webpackChunkName: "donate" */ '@/pages/donate')
);
export const LazyOnboarding = lazy(() => 
  import(/* webpackChunkName: "onboarding" */ '@/pages/onboarding')
);
export const LazyMonitoring = lazy(() => 
  import(/* webpackChunkName: "monitoring" */ '@/pages/monitoring')
);

// Lazy load heavy components
export const LazyEarthGlobe = lazy(() => 
  import(/* webpackChunkName: "earth-globe" */ '@/components/ui/earth-globe')
);
export const LazyDeveloperDashboard = lazy(() => 
  import(/* webpackChunkName: "developer-dashboard" */ '@/components/dashboard/developer-dashboard')
);
export const LazyProviderDashboard = lazy(() => 
  import(/* webpackChunkName: "provider-dashboard" */ '@/components/dashboard/provider-dashboard')
);
// Temporarily disabled - missing dependencies
// export const LazyAutoScalingDashboard = lazy(() => 
//   import(/* webpackChunkName: "auto-scaling" */ '@/components/auto-scaling/AutoScalingDashboard')
// );

// Enterprise components
export const LazyAnalyticsDashboard = lazy(() => 
  import(/* webpackChunkName: "enterprise-analytics" */ '@/components/enterprise/analytics-dashboard')
);
export const LazyPoolManagement = lazy(() => 
  import(/* webpackChunkName: "enterprise-pool" */ '@/components/enterprise/pool-management')
);
export const LazyPricingDashboard = lazy(() => 
  import(/* webpackChunkName: "enterprise-pricing" */ '@/components/enterprise/pricing-dashboard')
);

// Community components
export const LazyRealTimeFeed = lazy(() => 
  import(/* webpackChunkName: "community-feed" */ '@/components/community/real-time-feed')
);
export const LazyCommunityLeaderboard = lazy(() => 
  import(/* webpackChunkName: "community-leaderboard" */ '@/components/community/community-leaderboard')
);

// Chart components
export const LazyEarningsChart = lazy(() => 
  import(/* webpackChunkName: "charts" */ '@/components/charts/earnings-chart')
);

// HOC for lazy loading with fallback
export const withLazyLoading = <P extends object>(
  Component: ComponentType<P>, 
  fallbackMessage?: string
) => {
  return (props: P) => (
    <Suspense fallback={<LoadingFallback message={fallbackMessage} />}>
      <Component {...props} />
    </Suspense>
  );
};

// Preload function for critical components
export const preloadComponent = (componentLoader: () => Promise<any>) => {
  componentLoader();
};

export default LoadingFallback;