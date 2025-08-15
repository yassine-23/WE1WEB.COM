import React from 'react';
import { Redirect } from 'wouter';
import { MonitoringDashboard } from '@/components/monitoring/MonitoringDashboard';
import { useAuth } from '@/hooks/useAuth';

export default function MonitoringPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only allow admin users to access monitoring
  // In production, implement proper role-based access control
  const isAdmin = user?.email?.includes('admin') || process.env.NODE_ENV === 'development';

  if (!user || !isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MonitoringDashboard />
    </div>
  );
}