'use client'
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { CgArrowsExchange } from "react-icons/cg"
import { FiLogOut } from "react-icons/fi"
import { useMode } from "../context/modeContext"
import { useAuth } from "../context/authContext"

// The detached/embedded toggle only matters on the signing surfaces.
const MODE_ROUTES = ['/sign', '/verify']

export default function TopBar() {
    const { isDetached, setIsDetached } = useMode()
    const { user, status, logout } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    const showModeToggle = MODE_ROUTES.includes(pathname)

    const handleLogout = () => {
        logout()
        router.push('/login')
    }

    return(
        <div className="fixed top-0 left-0 w-full z-50 font-Space pb-12">

            <div className="absolute inset-0 -z-10 bg-black/40 backdrop-blur-md pointer-events-none [mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)]" />

            <div className="flex justify-between items-center px-4 sm:px-6 py-4 sm:py-4.5 text-xl text-white w-full gap-3">
                <Link href='/' className="shrink-0">
                    <motion.img
                    className="h-7 sm:h-8"
                    src='/PQC_SVG.svg'
                    alt="Logo"
                    whileHover={{
                        scale: 1.15,
                        transition: { duration: 0.1 }
                    }}
                    />
                </Link>

                <div className="flex items-center gap-2 sm:gap-3">
                    {showModeToggle && (
                        <motion.button
                            onClick={() => setIsDetached(!isDetached)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white hover:bg-white/90 text-black/95 transition-colors py-1.5 px-3 sm:px-4 rounded-3xl text-sm sm:text-md cursor-pointer border-2 border-white shadow-sm font-bold flex items-center gap-2"
                        >
                            <div className="flex items-center gap-1.5">
                                <span className="hidden sm:inline">Mode:</span>
                                <div className="relative w-[72px] sm:w-[88px] h-[24px] flex items-center overflow-hidden">
                                    <AnimatePresence mode="popLayout">
                                        <motion.span
                                            key={isDetached ? 'detached' : 'embedded'}
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -20, opacity: 0 }}
                                            transition={{ duration: 0.2, ease: "easeInOut" }}
                                            className="absolute left-0 text-black/95"
                                        >
                                            {isDetached ? 'Detached' : 'Embedded'}
                                        </motion.span>
                                    </AnimatePresence>
                                </div>
                            </div>

                            <motion.div
                                animate={{ rotate: isDetached ? 0 : 180 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="flex items-center"
                            >
                                <CgArrowsExchange size={24} />
                            </motion.div>
                        </motion.button>
                    )}

                    {status === 'authenticated' && user && (
                        <motion.button
                            onClick={handleLogout}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            title={`Signed in as ${user.username} — log out`}
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-colors py-1.5 px-3 sm:px-4 rounded-3xl text-sm cursor-pointer border border-white/40 shadow-sm font-bold flex items-center gap-2"
                        >
                            <span className="max-w-[90px] sm:max-w-[140px] truncate">{user.username}</span>
                            <FiLogOut size={16} />
                        </motion.button>
                    )}
                </div>

            </div>

        </div>
    )
}
