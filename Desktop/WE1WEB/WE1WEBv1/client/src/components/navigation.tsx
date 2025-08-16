import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Cpu, User, Coins, Heart, LogOut, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();

  const { data: tokenBalance } = useQuery({
    queryKey: ["/api/tokens/balance"],
    enabled: isAuthenticated,
  });

  // Show navigation on all pages, including landing
  // Only hide auth-specific features when not authenticated

  const navItems = isAuthenticated ? [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/provider", label: "Provider Hub" },
    { path: "/developer", label: "Developer Tools" },
    { path: "/marketplace", label: "Marketplace" },
    { path: "/compute-network", label: "Compute Network" },
    { path: "/community", label: "Community" },
  ] : [
    { path: "/", label: "Home" },
    { path: "/auth", label: "Get Started" },
  ];

  // Add monitoring link for admin users
  const isAdmin = isAuthenticated && (user?.email?.includes('admin') || process.env.NODE_ENV === 'development');
  if (isAdmin) {
    navItems.push({ path: "/monitoring", label: "Monitoring", icon: Activity });
  }

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <Cpu className="text-white w-4 h-4" />
            </div>
            <Link href="/">
              <span className="text-xl font-bold text-foreground cursor-pointer">
                WE1WEB
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <button
                  className={`transition-colors ${
                    location === item.path
                      ? "text-neutral font-semibold"
                      : "text-gray-600 hover:text-neutral"
                  }`}
                >
                  {item.label}
                </button>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated && tokenBalance && (
              <div className="hidden md:flex items-center space-x-2 bg-muted px-3 py-1 rounded-full">
                <Cpu className="text-primary w-4 h-4" />
                <span className="text-sm font-medium text-foreground">
                  {Math.round(tokenBalance.balance)} Credits
                </span>
              </div>
            )}
            
            <ThemeToggle />
            
            {isAuthenticated ? (
              <>
                <Link href="/profile">
                  <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all">
                    <AvatarImage src={user?.profileImageUrl || ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                      {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 
                       user?.email ? user.email[0].toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Clear demo user and refresh
                    localStorage.removeItem('demoUser');
                    window.location.href = "/";
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/auth">
                <Button variant="default" size="sm">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
