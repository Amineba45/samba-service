import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/common/Providers'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Samba Service - Vos courses à domicile à Dakar',
  description: 'Commandez en ligne dans vos supermarchés préférés de Dakar. Livraison rapide à domicile.',
  keywords: 'supermarché, Dakar, livraison, courses, Samba Service',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
