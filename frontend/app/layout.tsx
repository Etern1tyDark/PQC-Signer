import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import type { ReactNode } from 'react'

// @ts-ignore
import './globals.css'
import HeroBackground from '@/components/background/heroBg'
import { ToastProvider } from '@/components/hooks/pushToast'
import { ModeProvider } from '@/components/ui/context/modeContext'
import { AuthProvider } from '@/components/ui/context/authContext'
import Shell from '@/components/ui/shell'

const displayFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
})


export const metadata: Metadata = {
  title: 'Q-SealNet',
  description: 'Post-quantum ML-DSA signing, verification, patching, and key management.',
  icons: 'PQC_SVG.svg'
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`text-white antialiased`}>
        <ToastProvider>
          <AuthProvider>
            <ModeProvider>
              <div className="fixed inset-0 z-0">
                <HeroBackground />
              </div>

              <Shell>{children}</Shell>
            </ModeProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
