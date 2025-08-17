import { useState, useEffect } from "react";

function StableApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");

  useEffect(() => {
    // Check for saved auth state
    const savedAuth = localStorage.getItem('we1web_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
    
    // Set current page from URL
    const path = window.location.pathname.substring(1) || 'home';
    setCurrentPage(path);
  }, []);

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    window.history.pushState({}, "", page === "home" ? "/" : `/${page}`);
  };

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simple validation
      if (!email || !password) {
        alert("Please enter email and password");
        return;
      }
      
      // For demo purposes - in production, this would call your API
      if (email && password.length >= 6) {
        localStorage.setItem('we1web_auth', 'true');
        localStorage.setItem('we1web_user', email);
        setIsAuthenticated(true);
        setCurrentPage("dashboard");
      } else {
        alert("Invalid credentials. Password must be at least 6 characters.");
      }
    } catch (error) {
      console.error('Login error:', error);
      alert("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (!email || !password) {
        alert("Please enter email and password");
        return;
      }
      
      if (password.length < 6) {
        alert("Password must be at least 6 characters");
        return;
      }
      
      // For demo purposes
      alert("Account created! You can now login.");
      
    } catch (error) {
      console.error('Signup error:', error);
      alert("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('we1web_auth');
    localStorage.removeItem('we1web_user');
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
            <button 
              onClick={() => handleNavigation("network")}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: currentPage === 'network' ? '#00ffff' : '#fff',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Network
            </button>
          </div>
        )}
      </div>

      <div>
        {isAuthenticated ? (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ color: '#888', fontSize: '0.875rem' }}>
              {localStorage.getItem('we1web_user')}
            </span>
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
          </div>
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
        Transform your idle computing power into valuable resources. Join the compute-first revolution where hardware meets opportunity.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
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
        <button 
          onClick={() => handleNavigation("learn")}
          style={{
            padding: '0.75rem 2rem',
            background: 'transparent',
            border: '2px solid #00ffff',
            borderRadius: '8px',
            color: '#00ffff',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Learn More
        </button>
      </div>
      <div style={{ marginTop: '4rem', display: 'flex', gap: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
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
        alignItems: 'center',
        padding: '80px 1rem 1rem'
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
              fontSize: '1rem',
              boxSizing: 'border-box'
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
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
          
          <button
            onClick={() => isLogin ? handleLogin(email, password) : handleSignup(email, password)}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: isLoading ? '#666' : 'linear-gradient(135deg, #00ffff, #0080ff)',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '1rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginBottom: '1rem'
            }}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
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
  const Dashboard = () => {
    const userEmail = localStorage.getItem('we1web_user') || 'user@example.com';
    
    return (
      <div style={{
        minHeight: '100vh',
        paddingTop: '80px',
        padding: '80px 2rem 2rem'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#00ffff' }}>Dashboard</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
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
          
          <div style={{
            background: 'rgba(20, 20, 30, 0.8)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{ color: '#00ffff', marginBottom: '1rem' }}>Total Earnings</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00ff00' }}>3,750</p>
            <p style={{ color: '#888', fontSize: '0.875rem' }}>Credits earned</p>
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
            <button
              onClick={() => handleNavigation("network")}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                border: '1px solid #00ff00',
                borderRadius: '4px',
                color: '#00ff00',
                cursor: 'pointer'
              }}
            >
              View Network Status
            </button>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#00ffff' }}>Recent Activity</h2>
          <div style={{
            background: 'rgba(20, 20, 30, 0.8)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            {['Task completed: AI Model Training - +500 credits', 
              'Node connected: GPU-Node-03',
              'Task completed: Data Processing - +200 credits',
              'Payout processed: 1000 credits'].map((activity, i) => (
              <div key={i} style={{
                padding: '0.75rem',
                borderBottom: i < 3 ? '1px solid rgba(0, 255, 255, 0.1)' : 'none',
                color: '#ddd'
              }}>
                {activity}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Provider Hub component
  const ProviderHub = () => (
    <div style={{
      minHeight: '100vh',
      paddingTop: '80px',
      padding: '80px 2rem 2rem'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#00ffff' }}>Provider Hub</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
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
        
        <div style={{
          background: 'rgba(20, 20, 30, 0.8)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{ color: '#00ffff', marginBottom: '1rem' }}>Compute Power</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff00ff' }}>12.5 TH/s</p>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>Total hashrate</p>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#00ffff' }}>Your Nodes</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { name: 'GPU-Node-01', status: 'Active', earnings: '350 credits', uptime: '99.8%' },
            { name: 'GPU-Node-02', status: 'Active', earnings: '280 credits', uptime: '98.5%' },
            { name: 'CPU-Node-01', status: 'Active', earnings: '220 credits', uptime: '100%' }
          ].map((node, i) => (
            <div key={i} style={{
              background: 'rgba(20, 20, 30, 0.8)',
              border: '1px solid rgba(0, 255, 255, 0.3)',
              borderRadius: '12px',
              padding: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <h4 style={{ color: '#00ffff', marginBottom: '0.5rem' }}>{node.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '8px', height: '8px', background: '#00ff00', borderRadius: '50%' }}></span>
                  <span style={{ color: '#00ff00', fontSize: '0.875rem' }}>{node.status}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#fff', fontWeight: 'bold' }}>{node.earnings}</p>
                <p style={{ color: '#888', fontSize: '0.875rem' }}>Uptime: {node.uptime}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {[
          { title: 'AI Model Training', credits: 500, time: '2-4 hours', difficulty: 'Medium', requirements: 'GPU with 8GB+ VRAM' },
          { title: 'Data Processing', credits: 200, time: '1 hour', difficulty: 'Easy', requirements: 'CPU with 4+ cores' },
          { title: 'Video Rendering', credits: 750, time: '4-6 hours', difficulty: 'Hard', requirements: 'GPU with 12GB+ VRAM' },
          { title: 'Scientific Computing', credits: 300, time: '30 minutes', difficulty: 'Easy', requirements: 'CPU with 8+ cores' },
          { title: 'Machine Learning Inference', credits: 400, time: '2 hours', difficulty: 'Medium', requirements: 'GPU with 6GB+ VRAM' },
          { title: 'Distributed Training', credits: 1000, time: '8 hours', difficulty: 'Expert', requirements: 'Multiple GPUs' }
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
              <p style={{ color: '#888', fontSize: '0.875rem' }}>Difficulty: 
                <span style={{ 
                  color: task.difficulty === 'Easy' ? '#00ff00' : 
                         task.difficulty === 'Medium' ? '#ffff00' : 
                         task.difficulty === 'Hard' ? '#ff8800' : '#ff0000',
                  marginLeft: '0.5rem'
                }}>
                  {task.difficulty}
                </span>
              </p>
              <p style={{ color: '#888', fontSize: '0.875rem' }}>Requirements: {task.requirements}</p>
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

  // Network Status component
  const NetworkStatus = () => (
    <div style={{
      minHeight: '100vh',
      paddingTop: '80px',
      padding: '80px 2rem 2rem'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#00ffff' }}>Network Status</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{
          background: 'rgba(20, 20, 30, 0.8)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{ color: '#00ffff', marginBottom: '1rem' }}>Network Health</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '12px', height: '12px', background: '#00ff00', borderRadius: '50%' }}></span>
            <span style={{ color: '#00ff00', fontSize: '1.25rem', fontWeight: 'bold' }}>Excellent</span>
          </div>
        </div>
        
        <div style={{
          background: 'rgba(20, 20, 30, 0.8)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{ color: '#00ffff', marginBottom: '1rem' }}>Total Nodes</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>5,247</p>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>Across 42 countries</p>
        </div>
        
        <div style={{
          background: 'rgba(20, 20, 30, 0.8)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{ color: '#00ffff', marginBottom: '1rem' }}>Total Compute Power</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff00ff' }}>127.3 PH/s</p>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>Combined hashrate</p>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#00ffff' }}>Regional Distribution</h2>
      <div style={{
        background: 'rgba(20, 20, 30, 0.8)',
        border: '1px solid rgba(0, 255, 255, 0.3)',
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        {[
          { region: 'North America', nodes: 1847, percentage: 35 },
          { region: 'Europe', nodes: 1423, percentage: 27 },
          { region: 'Asia Pacific', nodes: 1267, percentage: 24 },
          { region: 'South America', nodes: 421, percentage: 8 },
          { region: 'Africa', nodes: 289, percentage: 6 }
        ].map((region, i) => (
          <div key={i} style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#fff' }}>{region.region}</span>
              <span style={{ color: '#888' }}>{region.nodes} nodes</span>
            </div>
            <div style={{ background: 'rgba(0, 0, 0, 0.5)', borderRadius: '4px', height: '20px', overflow: 'hidden' }}>
              <div style={{
                width: `${region.percentage}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00ffff, #0080ff)',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Learn More page
  const LearnMore = () => (
    <div style={{
      minHeight: '100vh',
      paddingTop: '80px',
      padding: '80px 2rem 2rem',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#00ffff', textAlign: 'center' }}>
        About WE1WEB
      </h1>
      
      <div style={{
        background: 'rgba(20, 20, 30, 0.8)',
        border: '1px solid rgba(0, 255, 255, 0.3)',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#00ffff', marginBottom: '1rem' }}>What is WE1WEB?</h2>
        <p style={{ color: '#ddd', lineHeight: '1.6', marginBottom: '1rem' }}>
          WE1WEB is a revolutionary decentralized computing network that transforms idle hardware into valuable computational resources. 
          By joining our network, you can earn compute credits by sharing your unused GPU and CPU power with those who need it.
        </p>
        <p style={{ color: '#ddd', lineHeight: '1.6' }}>
          Our compute-first approach ensures that every participant benefits from a fair, transparent, and efficient marketplace 
          where computational power is the primary currency.
        </p>
      </div>

      <div style={{
        background: 'rgba(20, 20, 30, 0.8)',
        border: '1px solid rgba(0, 255, 255, 0.3)',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#00ffff', marginBottom: '1rem' }}>How It Works</h2>
        <ol style={{ color: '#ddd', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Connect your hardware to the WE1WEB network</li>
          <li style={{ marginBottom: '0.5rem' }}>Your device automatically joins compute pools</li>
          <li style={{ marginBottom: '0.5rem' }}>Complete AI training, rendering, and processing tasks</li>
          <li style={{ marginBottom: '0.5rem' }}>Earn compute credits for successful task completion</li>
          <li style={{ marginBottom: '0.5rem' }}>Use credits or exchange them for other resources</li>
        </ol>
      </div>

      <div style={{
        background: 'rgba(20, 20, 30, 0.8)',
        border: '1px solid rgba(0, 255, 255, 0.3)',
        borderRadius: '12px',
        padding: '2rem'
      }}>
        <h2 style={{ color: '#00ffff', marginBottom: '1rem' }}>Benefits</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <h3 style={{ color: '#00ff00', marginBottom: '0.5rem' }}>For Providers</h3>
            <p style={{ color: '#ddd' }}>Turn idle hardware into passive income with minimal effort</p>
          </div>
          <div>
            <h3 style={{ color: '#ff00ff', marginBottom: '0.5rem' }}>For Consumers</h3>
            <p style={{ color: '#ddd' }}>Access affordable, scalable computing power on demand</p>
          </div>
          <div>
            <h3 style={{ color: '#ffff00', marginBottom: '0.5rem' }}>For Everyone</h3>
            <p style={{ color: '#ddd' }}>Contribute to a more efficient and sustainable computing ecosystem</p>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
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
          Get Started Now
        </button>
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
      
      {currentPage === 'home' && <LandingPage />}
      {currentPage === 'auth' && <AuthPage />}
      {currentPage === 'dashboard' && (isAuthenticated ? <Dashboard /> : <AuthPage />)}
      {currentPage === 'provider' && (isAuthenticated ? <ProviderHub /> : <AuthPage />)}
      {currentPage === 'marketplace' && (isAuthenticated ? <Marketplace /> : <AuthPage />)}
      {currentPage === 'network' && (isAuthenticated ? <NetworkStatus /> : <AuthPage />)}
      {currentPage === 'learn' && <LearnMore />}

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
          transform: translateY(-1px);
          transition: all 0.2s ease;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
}

export default StableApp;