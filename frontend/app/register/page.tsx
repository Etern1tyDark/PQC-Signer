'use client'
import { Suspense, FormEvent, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
import AuthHeader from "@/components/ui/auth/authHeader"
import { useAuth } from "@/components/ui/context/authContext"
import { useToast } from "@/components/hooks/pushToast"

function RegisterForm() {
    const { register, status } = useAuth()
    const { pushToast } = useToast()
    const router = useRouter()
    const searchParams = useSearchParams()
    const next = searchParams.get('next') || '/'

    const [form, setForm] = useState({ email: '', username: '', password: '' })
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        if (status === 'authenticated') {
            router.replace(next)
        }
    }, [status, router, next])

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!form.email.trim() || !form.username.trim() || !form.password) {
            pushToast('error', 'Fill in your email, username, and password.')
            return
        }
        if (form.password.length < 8) {
            pushToast('error', 'Password must be at least 8 characters long.')
            return
        }

        setBusy(true)
        try {
            const user = await register(form.username.trim(), form.email.trim(), form.password)
            pushToast('success', `Account created. Welcome, ${user.username}.`)
            router.replace(next)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Registration failed'
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
                className="w-full max-w-md sm:max-w-lg font-Space bg-white/5 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl p-6 sm:p-9"
            >
                <h1 className="font-Space font-bold text-4xl sm:text-5xl mb-6 sm:mb-8">Register</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <label className="block">
                        <span className="text-sm font-bold">Email</span>
                        <input
                            className="inputs"
                            type="email"
                            autoComplete="email"
                            placeholder="Your Email"
                            value={form.email}
                            onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-bold">Username</span>
                        <input
                            className="inputs"
                            type="text"
                            autoComplete="username"
                            placeholder="Your Username"
                            value={form.username}
                            onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-bold">Password</span>
                        <input
                            className="inputs"
                            type="password"
                            autoComplete="new-password"
                            placeholder="At least 8 characters"
                            value={form.password}
                            onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                        />
                    </label>

                    <motion.button
                        type="submit"
                        disabled={busy}
                        whileHover={{ scale: busy ? 1 : 1.02 }}
                        whileTap={{ scale: busy ? 1 : 0.97 }}
                        className="h-11 w-full bg-white text-black mt-2 rounded-xl font-bold disabled:opacity-60 cursor-pointer"
                    >
                        {busy ? 'Creating account…' : 'Continue'}
                    </motion.button>

                    <p className="text-xs text-gray-300 text-center">
                        Already have an account?{' '}
                        <Link href="/login" className="text-white font-bold underline underline-offset-2 hover:text-amber-200 transition-colors">
                            Login here
                        </Link>
                    </p>
                </form>
            </motion.div>
        </div>
    )
}

export default function RegisterPage() {
    return (
        <>
            <AuthHeader />
            <Suspense fallback={null}>
                <RegisterForm />
            </Suspense>
        </>
    )
}
