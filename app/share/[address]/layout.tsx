import { Metadata } from 'next'

type Props = {
  params: Promise<{ address: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
  // Dynamic card image via Next.js API route
  const cardImageUrl = `https://basegenesis.vercel.app/api/card/${address}`
  const shareUrl = `https://basegenesis.vercel.app/share/${address}`
  const appUrl = `https://basegenesis.vercel.app`

  // Farcaster Frame embed format
  const fcFrame = JSON.stringify({
    version: "next",
    imageUrl: cardImageUrl,
    button: {
      title: "Check Your Genesis Rank",
      action: {
        type: "launch_frame",
        name: "BaseGenesis",
        url: appUrl,
        splashImageUrl: "https://basegenesis.vercel.app/logo.jpg",
        splashBackgroundColor: "#0f0c29"
      }
    }
  })

  return {
    title: `${shortAddress} | BaseGenesis`,
    description: `Check out this Base Genesis rank! Discover when you first joined Base blockchain.`,
    openGraph: {
      title: `${shortAddress} | BaseGenesis`,
      description: `Check out this Base Genesis rank! Discover when you first joined Base blockchain.`,
      images: [
        {
          url: cardImageUrl,
          width: 1200,
          height: 800,
          alt: `BaseGenesis Card for ${shortAddress}`,
        }
      ],
      url: shareUrl,
      type: 'website',
      siteName: 'BaseGenesis',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${shortAddress} | BaseGenesis`,
      description: `Check out this Base Genesis rank! Discover when you first joined Base blockchain.`,
      images: [cardImageUrl],
    },
    other: {
      // Farcaster Frame metadata
      'fc:frame': fcFrame,
      'fc:frame:image': cardImageUrl,
      'fc:frame:image:aspect_ratio': '1.91:1',
      'fc:frame:button:1': 'Check Your Genesis Rank',
      'fc:frame:button:1:action': 'link',
      'fc:frame:button:1:target': appUrl,
    },
  }
}

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
