import { Metadata } from 'next'

type Props = {
  params: Promise<{ address: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
  
  // Dynamic card image via Next.js API route
  const timestamp = new Date().getTime(); // Use timestamp only for dev testing or versioning
  const cardImageUrl = `https://basegenesis.vercel.app/api/card/${address}?v=3` // Bump version to force cache refresh
  const shareUrl = `https://basegenesis.vercel.app/share/${address}`
  const appUrl = `https://basegenesis.vercel.app`
  const splashImageUrl = `https://basegenesis.vercel.app/logo.jpg`

  // Farcaster MiniApp Embed format - version must be "1"
  const miniAppEmbed = {
    version: "1",
    imageUrl: cardImageUrl,
    button: {
      title: "Check Your Genesis Rank",
      action: {
        type: "launch_miniapp",
        name: "BaseGenesis",
        url: appUrl,
        splashImageUrl: splashImageUrl,
        splashBackgroundColor: "#0f0c29"
      }
    }
  }

  // For backward compatibility with older clients
  const frameEmbed = {
    version: "1",
    imageUrl: cardImageUrl,
    button: {
      title: "Check Your Genesis Rank",
      action: {
        type: "launch_frame",
        name: "BaseGenesis",
        url: appUrl,
        splashImageUrl: splashImageUrl,
        splashBackgroundColor: "#0f0c29"
      }
    }
  }

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
      // Farcaster MiniApp metadata (primary)
      'fc:miniapp': JSON.stringify(miniAppEmbed),
      // Farcaster Frame metadata (backward compatibility)
      'fc:frame': JSON.stringify(frameEmbed),
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
