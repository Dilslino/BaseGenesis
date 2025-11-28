'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SharePage({ params }: { params: { address: string } }) {
  const router = useRouter()

  useEffect(() => {
    // Redirect to main app after a short delay
    // The meta tags will be served first for social previews
    const timer = setTimeout(() => {
      router.push('/')
    }, 100)
    
    return () => clearTimeout(timer)
  }, [router])

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
