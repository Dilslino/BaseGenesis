'use client'

import { useEffect, use } from 'react'
import { useRouter } from 'next/navigation'

export default function SharePage({ params }: { params: Promise<{ address: string }> }) {
  const router = useRouter()
  const { address } = use(params)

  useEffect(() => {
    // Redirect to main app with address parameter
    // The meta tags will be served first for social previews
    const timer = setTimeout(() => {
      router.push(`/?address=${address}`)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [router, address])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      color: 'white',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔄</div>
        <p>Loading BaseGenesis...</p>
      </div>
    </div>
  )
}
