 'use client'
 
 export default function Home() {
   return (
     <div style={{
       minHeight: '100vh',
       display: 'flex',
       alignItems: 'center',
       justifyContent: 'center',
       background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
       color: 'white',
       fontFamily: 'system-ui',
       flexDirection: 'column',
       gap: '20px',
       padding: '20px',
       textAlign: 'center'
     }}>
       <h1 style={{ fontSize: '48px', margin: 0 }}>🔵 BaseGenesis</h1>
       <p style={{ fontSize: '24px', opacity: 0.8 }}>Discover Your Base Origin</p>
       <p style={{ fontSize: '16px', opacity: 0.6, maxWidth: '600px' }}>
         This app is being rebuilt with Next.js. Share links will work for dynamic genesis cards!
       </p>
       <a 
         href="/share/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"
         style={{
           padding: '12px 24px',
           background: '#0052FF',
           color: 'white',
           borderRadius: '8px',
           textDecoration: 'none',
           fontWeight: 'bold'
         }}
       >
         Test Share Link
       </a>
     </div>
   )
 }
