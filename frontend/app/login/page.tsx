'use client'
import { Suspense, FormEvent, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
import AuthHeader from "@/components/ui/auth/authHeader"
import { useAuth } from "@/components/ui/context/authContext"
import { useToast } from "@/components/hooks/pushToast"
import Glass from "@/components/ui/glassmorphism/glassMorph"
import TopBar from "@/components/ui/navbar/topBar"

function LoginForm() {
    const { login, status } = useAuth()
    const { pushToast } = useToast()
    const router = useRouter()
    const searchParams = useSearchParams()
    const next = searchParams.get('next') || '/'

    const [form, setForm] = useState({ identifier: '', password: '' })
    const [busy, setBusy] = useState(false)

    // Don't keep an already-authenticated user on the login screen.
    useEffect(() => {
        if (status === 'authenticated') {
            router.replace(next)
        }
    }, [status, router, next])

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!form.identifier.trim() || !form.password) {
            pushToast('error', 'Enter your username/email and password.')
            return
        }

        setBusy(true)
        try {
            const user = await login(form.identifier.trim(), form.password)
            pushToast('success', `Welcome back, ${user.username}.`)
            router.replace(next)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed'
            pushToast('error', message)
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="relative z-10 min-h-screen w-full flex items-center justify-center px-4 py-24">
            
            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <h1>Login</h1>
                <Glass className="mt-3 p-3">
                <form onSubmit={handleSubmit} className="flex flex-col p-2.5">
                    <label className="block">
                        <span className="text-sm font-bold">Username/Email</span>
                        <input
                            className="inputs"
                            type="text"
                            autoComplete="username"
                            placeholder="Your Username/Email"
                            value={form.identifier}
                            onChange={(e) => setForm(prev => ({ ...prev, identifier: e.target.value }))}
                        />
                    </label>

                    <div className="mt-5">
                        <span className="text-sm font-bold">Password</span>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
                            <input
                                className="w-full sm:flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors text-white placeholder-gray-400"
                                type="password"
                                autoComplete="current-password"
                                placeholder="••••••"
                                value={form.password}
                                onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                            />
                            <p className="text-xs text-gray-300 shrink-0">
                                Don&apos;t have an account?{' '}
                                <Link href="/register" className="text-white font-bold underline underline-offset-2 hover:text-amber-200 transition-colors">
                                    Register here
                                </Link>
                            </p>
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={busy}
                        whileHover={{ scale: busy ? 1 : 1.02 }}
                        whileTap={{ scale: busy ? 1 : 0.97 }}
                        className="h-11 w-full bg-white text-black mt-7 rounded-xl font-bold disabled:opacity-60 cursor-pointer"
                    >
                        {busy ? 'Signing in…' : 'Continue'}
                    </motion.button>
                </form>
                </Glass>
            </motion.div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <>
            <AuthHeader />
            <Suspense fallback={null}>
                <LoginForm />
            </Suspense>
        </>
    )
}
