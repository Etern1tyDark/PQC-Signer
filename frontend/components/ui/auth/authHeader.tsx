'use client'
import Link from "next/link"
import { motion } from "motion/react"

export default function AuthHeader() {
    return (
        <div className="fixed top-0 left-0 w-full z-50 font-Space">
            <div className="flex justify-between items-center px-4 sm:px-8 py-4 sm:py-6">
                <Link href="/" className="shrink-0">
                    <motion.img
                        className="h-7 sm:h-8"
                        src="/PQC_SVG.svg"
                        alt="Q-SealNet"
                        whileHover={{ scale: 1.12, transition: { duration: 0.1 } }}
                    />
                </Link>
            </div>
        </div>
    )
}
