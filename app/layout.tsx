import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next' // Mantenemos los tipos de Next
import { Poppins } from 'next/font/google'
import './globals.css'

// Configuramos las variantes aprobadas de Poppins
const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'], // Light, Regular, Medium, Semibold, Bold
})

export const metadata: Metadata = {
  title: 'Valum - Tu Plataforma Financiera',
  description: 'Gestiona tus finanzas personales con análisis avanzado y asesoría profesional en una sola plataforma',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/favicon.ico',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

// Agregado el tipado correcto para TypeScript en React
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${poppins.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}