import React from 'react';
import './globals.css'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata = {
  title: 'BaseGenesis | On-Chain Identity',
  description: 'Discover your OG status on the Base Blockchain.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrains.variable} bg-[#020205] text-white antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}