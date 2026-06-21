'use client'
import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import NavBar from '@/components/ui/navbar/navBar'
import TopBar from '@/components/ui/navbar/topBar'
import AuthGate from '@/components/ui/authGate'

// Routes that render their own minimal chrome (no app TopBar / NavBar).
const AUTH_ROUTES = ['/login', '/register']
// Routes reachable without signing in (but still inside the app chrome).
const PUBLIC_ROUTES = ['/']

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  if (AUTH_ROUTES.includes(pathname)) {
    return <main className="relative z-10 min-h-screen w-full">{children}</main>
  }

  const isGated = !PUBLIC_ROUTES.includes(pathname)

  const chrome = (
    <>
      <TopBar />
      <main className="relative min-h-screen md:h-screen">{children}</main>
      <NavBar />
    </>
  )

  return isGated ? <AuthGate>{chrome}</AuthGate> : chrome
}
