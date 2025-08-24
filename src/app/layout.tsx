import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { AuthProvider } from '../contexts/AuthContext'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Estuda Zatto - Plataforma Educacional',
  description: 'Plataforma educacional moderna para estudantes do ensino médio, vestibulares e concursos. Conteúdo gratuito e de qualidade.',
  keywords: 'educação, ensino médio, vestibular, concurso, enem, estudo online',
  authors: [{ name: 'Estuda Zatto' }],
  creator: 'Estuda Zatto',
  publisher: 'Estuda Zatto',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://estudazatto.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Estuda Zatto - Plataforma Educacional',
    description: 'Plataforma educacional moderna para estudantes do ensino médio, vestibulares e concursos.',
    url: 'https://estudazatto.com',
    siteName: 'Estuda Zatto',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Estuda Zatto - Plataforma Educacional',
    description: 'Plataforma educacional moderna para estudantes do ensino médio, vestibulares e concursos.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
