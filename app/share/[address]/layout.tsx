import { Metadata } from 'next'

type Props = {
  params: Promise<{ address: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
  const cardImageUrl = `https://basegenesis.vercel.app/api/card/${address}`
  const shareUrl = `https://basegenesis.vercel.app/share/${address}`

  const miniAppEmbed = JSON.stringify({
    version: "1",
    imageUrl: cardImageUrl,
    button: {
      title: "Check Your Genesis",
      action: {
        type: "launch_frame",
        name: "BaseGenesis",
        url: "https://basegenesis.vercel.app",
        splashImageUrl: "https://basegenesis.vercel.app/logo.jpg",
        splashBackgroundColor: "#0f0c29"
      }
    }
  })

  return {
    title: `BaseGenesis | ${shortAddress}`,
    description: `Check out my Base Genesis rank! Discover when you first joined Base blockchain.`,
    openGraph: {
      title: `BaseGenesis | ${shortAddress}`,
      description: `Check out my Base Genesis rank! Discover when you first joined Base blockchain.`,
      images: [cardImageUrl],
      url: shareUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `BaseGenesis | ${shortAddress}`,
      description: `Check out my Base Genesis rank! Discover when you first joined Base blockchain.`,
      images: [cardImageUrl],
    },
    other: {
      'fc:miniapp': miniAppEmbed,
      'fc:frame': miniAppEmbed,
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
