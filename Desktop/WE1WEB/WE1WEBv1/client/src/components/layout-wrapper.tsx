import Navigation from "@/components/navigation";
import { ReactNode } from "react";

interface LayoutWrapperProps {
  children: ReactNode;
  showNavigation?: boolean;
}

export default function LayoutWrapper({ children, showNavigation = true }: LayoutWrapperProps) {
  return (
    <div className="min-h-screen bg-background">
      {showNavigation && <Navigation />}
      <main className="relative">
        {children}
      </main>
    </div>
  );
}