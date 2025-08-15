import { useState } from "react";

function AppSimple() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '40px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold' }}>🌐 WE1WEB</h1>
          <p style={{ fontSize: '24px', opacity: 0.9 }}>Decentralized AI Computing Network</p>
        </header>

        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '30px'
        }}>
          <h2 style={{ fontSize: '36px', marginBottom: '20px' }}>
            Transform Your Device Into a Money Machine
          </h2>
          <p style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '30px' }}>
            Join Europe's first decentralized AI supercomputer. 
            Turn your idle computing power into real earnings.
          </p>
          
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => alert('Join Network clicked!')}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🚀 Join Network
            </button>
            
            <button 
              onClick={() => setCount(count + 1)}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid white',
                borderRadius: '10px',
                cursor: 'pointer'
              }}
            >
              Counter: {count}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {[
            { icon: '💰', title: 'Passive Income', desc: 'Earn while you sleep' },
            { icon: '🇪🇺', title: 'European Sovereignty', desc: 'Data stays in Europe' },
            { icon: '📊', title: 'Real-Time Earnings', desc: 'Track your profits live' },
            { icon: '🔒', title: 'Secure Payments', desc: 'Instant crypto payouts' }
          ].map((feature, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '15px',
              padding: '25px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>{feature.title}</h3>
              <p style={{ opacity: 0.8 }}>{feature.desc}</p>
            </div>
          ))}
        </div>

        <footer style={{ marginTop: '60px', textAlign: 'center', opacity: 0.7 }}>
          <p>© 2024 WE1WEB - Building Europe's AI Future</p>
        </footer>
      </div>
    </div>
  );
}

export default AppSimple;