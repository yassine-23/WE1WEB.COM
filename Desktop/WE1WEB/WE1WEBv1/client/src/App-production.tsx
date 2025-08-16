import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "./lib/supabase";

// Create a query client with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('Query error:', error);
      }
    },
  },
});

function ProductionApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("home");

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          setIsAuthenticated(!!session);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: authListener } = supabase?.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    }) || { data: null };

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    window.history.pushState({}, "", page === "home" ? "/" : `/${page}`);
  };

  const handleLogin = async (email: string, password: string) => {
    if (!supabase) {
      alert("Authentication service not configured");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      setIsAuthenticated(true);
      setCurrentPage("dashboard");
    } catch (error: any) {
      alert(error.message || "Login failed");
    }
  };

  const handleSignup = async (email: string, password: string) => {
    if (!supabase) {
      alert("Authentication service not configured");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      alert("Check your email for verification link!");
    } catch (error: any) {
      alert(error.message || "Signup failed");
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setCurrentPage("home");
  };

  // Navigation bar component
  const Navigation = () => (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'rgba(10, 10, 10, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
      padding: '1rem 2rem',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div 
          onClick={() => handleNavigation("home")}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            cursor: 'pointer'
          }}
        >
          <img src="/we1web-logo.svg" alt="WE1WEB" style={{ width: '32px', height: '32px' }} />
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#00ffff' }}>WE1WEB</span>
        </div>
        
        {isAuthenticated && (
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <button 
              onClick={() => handleNavigation("dashboard")}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: currentPage === 'dashboard' ? '#00ffff' : '#fff',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Dashboard
            </button>
            <button 
              onClick={() => handleNavigation("provider")}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: currentPage === 'provider' ? '#00ffff' : '#fff',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Provider Hub
            </button>
            <button 
              onClick={() => handleNavigation("marketplace")}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: currentPage === 'marketplace' ? '#00ffff' : '#fff',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Marketplace
            </button>
          </div>
        )}
      </div>

      <div>
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1.5rem',
              background: 'transparent',
              border: '1px solid #00ffff',
              borderRadius: '4px',
              color: '#00ffff',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => handleNavigation("auth")}
            style={{
              padding: '0.5rem 1.5rem',
              background: 'linear-gradient(135deg, #00ffff, #0080ff)',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Get Started
          </button>
        )}
      </div>
    </nav>
  );

  // Landing page component
  const LandingPage = () => (
    <div style={{
      minHeight: '100vh',
      paddingTop: '80px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      <img 
        src="/we1web-logo.svg" 
        alt="WE1WEB Logo" 
        style={{ 
          width: '120px', 
          height: '120px', 
          marginBottom: '1.5rem',
          filter: 'drop-shadow(0 0 20px rgba(0, 255, 255, 0.5))'
        }} 
      />
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#00ffff' }}>
        WE1WEB
      </h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#fff' }}>
        Decentralized AI Computing Network
      </p>
      <p style={{ color: '#888', marginBottom: '2rem', maxWidth: '600px' }}>
        Transform your idle computing power into valuable resources. Join the compute-first revolution.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          onClick={() => handleNavigation("auth")}
          style={{
            padding: '0.75rem 2rem',
            background: 'linear-gradient(135deg, #00ffff, #0080ff)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Start Earning Credits
        </button>
        <button style={{
          padding: '0.75rem 2rem',
          background: 'transparent',
          border: '2px solid #00ffff',
          borderRadius: '8px',
          color: '#00ffff',
          fontSize: '1rem',
          cursor: 'pointer'
        }}>
          Learn More
        </button>
      </div>
      <div style={{ marginTop: '4rem', display: 'flex', gap: '3rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00ffff' }}>5,000+</div>
          <div style={{ fontSize: '0.875rem', color: '#888' }}>Active Nodes</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00ff00' }}>99.9%</div>
          <div style={{ fontSize: '0.875rem', color: '#888' }}>Uptime</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff00ff' }}>10,000+</div>
          <div style={{ fontSize: '0.875rem', color: '#888' }}>Tasks Completed</div>
        </div>
      </div>
    </div>
  );

  // Auth page component
  const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
      <div style={{
        minHeight: '100vh',
        paddingTop: '80px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          background: 'rgba(20, 20, 30, 0.8)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          borderRadius: '12px',
          padding: '2rem',
          width: '100%',
          maxWidth: '400px'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#00ffff', textAlign: 'center' }}>
            {isLogin ? 'Login to WE1WEB' : 'Create Account'}
          </h2>
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '1rem',
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(0, 255, 255, 0.3)',
              borderRadius: '4px',
              color: 'white',
              fontSize: '1rem'
            }}
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '1.5rem',
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(0, 255, 255, 0.3)',
              borderRadius: '4px',
              color: 'white',
              fontSize: '1rem'
            }}
          />
          
          <button
            onClick={() => isLogin ? handleLogin(email, password) : handleSignup(email, password)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #00ffff, #0080ff)',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '1rem',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
          
          <p style={{ textAlign: 'center', color: '#888' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              onClick={() => setIsLogin(!isLogin)}
              style={{ color: '#00ffff', cursor: 'pointer' }}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </span>
          </p>
        </div>
      </div>
    );
  };

  // Dashboard component
  const Dashboard = () => (
    <div style={{
      minHeight: '100vh',
      paddingTop: '80px',
      padding: '80px 2rem 2rem'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#00ffff' }}>Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div style={{
          background: 'rgba(20, 20, 30, 0.8)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{ color: '#00ffff', marginBottom: '1rem' }}>Compute Credits</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>1,250</p>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>Available for use</p>
        </div>
        
        <div style={{
          background: 'rgba(20, 20, 30, 0.8)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{ color: '#00ffff', marginBottom: '1rem' }}>Active Nodes</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>3</p>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>Currently running</p>
        </div>
        
        <div style={{
          background: 'rgba(20, 20, 30, 0.8)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{ color: '#00ffff', marginBottom: '1rem' }}>Tasks Completed</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>47</p>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>This month</p>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#00ffff' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleNavigation("provider")}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #00ffff, #0080ff)',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Become a Provider
          </button>
          <button
            onClick={() => handleNavigation("marketplace")}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: '1px solid #00ffff',
              borderRadius: '4px',
              color: '#00ffff',
              cursor: 'pointer'
            }}
          >
            Browse Tasks
          </button>
        </div>
      </div>
    </div>
  );

  // Provider Hub component
  const ProviderHub = () => (
    <div style={{
      minHeight: '100vh',
      paddingTop: '80px',
      padding: '80px 2rem 2rem'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#00ffff' }}>Provider Hub</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div style={{
          background: 'rgba(20, 20, 30, 0.8)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{ color: '#00ffff', marginBottom: '1rem' }}>Earnings This Month</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00ff00' }}>850 Credits</p>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>From 3 active nodes</p>
        </div>
        
        <div style={{
          background: 'rgba(20, 20, 30, 0.8)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{ color: '#00ffff', marginBottom: '1rem' }}>Node Status</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '10px', height: '10px', background: '#00ff00', borderRadius: '50%' }}></span>
            <span style={{ color: '#fff' }}>All systems operational</span>
          </div>
        </div>
        
        <div style={{
          background: 'rgba(20, 20, 30, 0.8)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{ color: '#00ffff', marginBottom: '1rem' }}>Performance</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>98.5%</p>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>Success rate</p>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#00ffff' }}>Your Nodes</h2>
        <div style={{
          background: 'rgba(20, 20, 30, 0.8)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
            No nodes connected yet. Click below to start earning credits.
          </p>
          <div style={{ textAlign: 'center' }}>
            <button style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #00ffff, #0080ff)',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer'
            }}>
              Connect New Node
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Marketplace component
  const Marketplace = () => (
    <div style={{
      minHeight: '100vh',
      paddingTop: '80px',
      padding: '80px 2rem 2rem'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#00ffff' }}>Compute Marketplace</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <input
          type="search"
          placeholder="Search for compute tasks..."
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '0.75rem',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            borderRadius: '4px',
            color: 'white',
            fontSize: '1rem'
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {[
          { title: 'AI Model Training', credits: 500, time: '2-4 hours', difficulty: 'Medium' },
          { title: 'Data Processing', credits: 200, time: '1 hour', difficulty: 'Easy' },
          { title: 'Video Rendering', credits: 750, time: '4-6 hours', difficulty: 'Hard' },
          { title: 'Blockchain Validation', credits: 300, time: '30 minutes', difficulty: 'Easy' },
        ].map((task, i) => (
          <div key={i} style={{
            background: 'rgba(20, 20, 30, 0.8)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{ color: '#00ffff', marginBottom: '1rem' }}>{task.title}</h3>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 'bold' }}>{task.credits} Credits</p>
              <p style={{ color: '#888', fontSize: '0.875rem' }}>Estimated time: {task.time}</p>
              <p style={{ color: '#888', fontSize: '0.875rem' }}>Difficulty: {task.difficulty}</p>
            </div>
            <button style={{
              width: '100%',
              padding: '0.5rem',
              background: 'transparent',
              border: '1px solid #00ffff',
              borderRadius: '4px',
              color: '#00ffff',
              cursor: 'pointer'
            }}>
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // Main app container
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <Navigation />
      
      {isLoading ? (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(0, 255, 255, 0.3)',
            borderTop: '4px solid #00ffff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      ) : (
        <>
          {currentPage === 'home' && <LandingPage />}
          {currentPage === 'auth' && <AuthPage />}
          {currentPage === 'dashboard' && isAuthenticated && <Dashboard />}
          {currentPage === 'provider' && isAuthenticated && <ProviderHub />}
          {currentPage === 'marketplace' && isAuthenticated && <Marketplace />}
          {currentPage === 'dashboard' && !isAuthenticated && <AuthPage />}
          {currentPage === 'provider' && !isAuthenticated && <AuthPage />}
          {currentPage === 'marketplace' && !isAuthenticated && <AuthPage />}
        </>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
        
        button:hover {
          opacity: 0.9;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}

// Wrap with QueryClientProvider for React Query support
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProductionApp />
    </QueryClientProvider>
  );
}