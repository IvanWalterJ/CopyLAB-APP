import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import AppLayoutWrapper from '@/components/SharedUI/AppLayoutWrapper'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

export const metadata: Metadata = {
  title: 'CopyLab v2.0 - IA para Copywriting',
  description: 'Sistema Operativo de Copywriting impulsado por Gemini 2.0 Flash',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-background text-text-primary antialiased flex h-screen overflow-hidden dark">
        <AppLayoutWrapper>
          {children}
        </AppLayoutWrapper>
      </body>
    </html>
  )
}
