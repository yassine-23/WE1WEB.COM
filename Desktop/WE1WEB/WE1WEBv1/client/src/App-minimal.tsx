import { Switch, Route } from "wouter";

function MinimalLanding() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
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
      <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
        Decentralized AI Computing Network
      </p>
      <p style={{ color: '#888', marginBottom: '2rem' }}>
        Transform idle hardware into passive income
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button style={{
          padding: '0.75rem 2rem',
          background: 'linear-gradient(135deg, #00ffff, #0080ff)',
          border: 'none',
          borderRadius: '8px',
          color: 'white',
          fontSize: '1rem',
          cursor: 'pointer'
        }}>
          Get Started
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
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00ffff' }}>Pre-Launch</div>
          <div style={{ fontSize: '0.875rem', color: '#888' }}>Active Nodes</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00ff00' }}>5,000</div>
          <div style={{ fontSize: '0.875rem', color: '#888' }}>Target Q1 2025</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff00ff' }}>385M</div>
          <div style={{ fontSize: '0.875rem', color: '#888' }}>EU Ready</div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Switch>
      <Route path="/" component={MinimalLanding} />
      <Route>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>404 - Page Not Found</h1>
          <a href="/">Go Home</a>
        </div>
      </Route>
    </Switch>
  );
}

export default App;