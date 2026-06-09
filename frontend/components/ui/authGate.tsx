'use client'
import { ReactNode, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/components/ui/context/authContext'

function FullScreenLoader() {
  return (
    <div className="relative z-10 flex h-screen w-full items-center justify-center">
      <img src="/loading.svg" alt="Loading" className="h-10 w-10 animate-spin opacity-80" />
    </div>
  )
}

export default function AuthGate({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'unauthenticated') {
      const next = encodeURIComponent(pathname || '/')
      router.replace(`/login?next=${next}`)
    }
  }, [status, router, pathname])

  if (status !== 'authenticated') {
    return <FullScreenLoader />
  }

  return <>{children}</>
}
