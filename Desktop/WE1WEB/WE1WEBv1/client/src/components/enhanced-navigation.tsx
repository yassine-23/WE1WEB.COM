import { Link, useLocation } from "wouter";
import { 
  Home, 
  Cpu, 
  Code, 
  Store, 
  Network, 
  Users, 
  Heart,
  Menu,
  X,
  User,
  Settings,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavLinkProps {
  href: string;
  icon: any;
  label: string;
  active?: boolean;
}

function NavLink({ href, icon: Icon, label, active }: NavLinkProps) {
  return (
    <Link href={href}>
      <div className={`
        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
        transition-all duration-200 hover:scale-[1.02] cursor-pointer
        ${active 
          ? 'bg-primary/10 text-primary border border-primary/20' 
          : 'text-foreground/70 hover:text-foreground hover:bg-accent/20'
        }
      `}>
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
    </Link>
  );
}

export default function EnhancedNavigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/provider", icon: Cpu, label: "Provider Hub" },
    { href: "/developer", icon: Code, label: "Developer Hub" },
    { href: "/marketplace", icon: Store, label: "Marketplace" },
    { href: "/neural-pools", icon: Network, label: "Neural Pools" },
    { href: "/community", icon: Users, label: "Community" },
    { href: "/donate", icon: Heart, label: "Donate" },
  ];

  return (
    <nav className="bg-background/95 border-b border-border sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/">
              <div className="text-2xl font-bold text-primary hover:scale-105 transition-transform duration-200 cursor-pointer">
                WE1WEB
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={location === item.href}
                />
              ))}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl} alt={user?.firstName || "User"} />
                      <AvatarFallback>
                        {user?.firstName?.charAt(0) || user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    localStorage.removeItem('demoUser');
                    window.location.href = "/";
                  }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => window.location.href = "/auth"} className="button-interactive">
                Sign In
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border py-4">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={location === item.href}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}