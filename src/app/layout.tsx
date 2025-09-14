import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Header } from '@/components/header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'sogon.vc - VC 후기 공유 플랫폼',
  description: '창업자들이 VC와의 실제 투자 경험을 공유하여, 다른 창업자들이 자신의 스타일과 맞는 VC를 선별할 수 있도록 돕는 플랫폼',
  keywords: ['VC', '벤처캐피털', '투자', '창업', '후기', '리뷰'],
  authors: [{ name: 'sogon.vc Team' }],
  openGraph: {
    title: 'sogon.vc - VC 후기 공유 플랫폼',
    description: '창업자들을 위한 VC 후기 공유 플랫폼',
    url: 'https://sogon.vc',
    siteName: 'sogon.vc',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'sogon.vc',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'sogon.vc - VC 후기 공유 플랫폼',
    description: '창업자들을 위한 VC 후기 공유 플랫폼',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-25">
            <Header />
            <main className="pt-16">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}