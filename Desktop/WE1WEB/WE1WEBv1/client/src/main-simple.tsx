import { createRoot } from "react-dom/client";

function SimpleApp() {
  return (
    <div style={{ 
      background: 'linear-gradient(to bottom, #1a1a2e, #0f0f1e)', 
      minHeight: '100vh',
      color: 'white',
      padding: '40px',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🚀 WE1WEB is Loading!</h1>
      <p style={{ fontSize: '20px', marginBottom: '20px' }}>If you can see this, React is working!</p>
      
      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px', marginTop: '20px' }}>
        <h2>Debug Info:</h2>
        <ul>
          <li>✅ Vite Server: Running</li>
          <li>✅ React: Loaded</li>
          <li>✅ Page: Rendered</li>
        </ul>
      </div>
      
      <button 
        onClick={() => alert('Button works!')}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '18px',
          background: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Button
      </button>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<SimpleApp />);