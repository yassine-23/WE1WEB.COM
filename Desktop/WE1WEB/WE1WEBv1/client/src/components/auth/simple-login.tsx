import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const DEMO_USERS = [
  {
    id: "admin",
    email: "admin@we1web.com",
    password: "admin123",
    name: "Admin User",
    firstName: "Admin",
    lastName: "User",
    profileImageUrl: "",
    role: "admin"
  },
  {
    id: "provider",
    email: "provider@we1web.com", 
    password: "provider123",
    name: "Provider User",
    firstName: "Provider",
    lastName: "User",
    profileImageUrl: "",
    role: "provider"
  },
  {
    id: "developer",
    email: "developer@we1web.com",
    password: "developer123", 
    name: "Developer User",
    firstName: "Developer",
    lastName: "User",
    profileImageUrl: "",
    role: "developer"
  }
];

interface SimpleLoginProps {
  onLogin: () => void;
}

export function SimpleLogin({ onLogin }: SimpleLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Find matching demo user
    const user = DEMO_USERS.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Store user in localStorage
      localStorage.setItem('demoUser', JSON.stringify(user));
      toast({
        title: "Login Successful",
        description: `Welcome ${user.name}!`,
      });
      onLogin();
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Try admin@we1web.com / admin123",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleDemoLogin = (user: typeof DEMO_USERS[0]) => {
    localStorage.setItem('demoUser', JSON.stringify(user));
    toast({
      title: "Demo Login",
      description: `Logged in as ${user.name}`,
    });
    onLogin();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">WE1WEB</CardTitle>
          <CardDescription>
            Sign in to access the AI Compute Network
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">Or try demo accounts:</p>
            <div className="space-y-2">
              {DEMO_USERS.map((user) => (
                <Button
                  key={user.id}
                  variant="outline"
                  onClick={() => handleDemoLogin(user)}
                  className="w-full text-left justify-start"
                >
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {user.email} • {user.role}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}