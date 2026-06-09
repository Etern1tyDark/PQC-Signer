'use client'
import { motion, AnimatePresence } from "motion/react"
import { useState, useEffect, useCallback } from "react"
import { apiGet } from "@/lib/api"
import { KeyInfo, KeysResponse } from "@/lib/types"
import EmbedVerify from "./components/embeddedVerify"
import VerifyDetach from "./components/verifyDetach"
import { useToast } from "@/components/hooks/pushToast"
import { useMode } from "@/components/ui/context/modeContext"
import ToolRail from "@/components/ui/toolRail"

export default function VerifyPage() {
    const { pushToast } = useToast()
    const { isDetached } = useMode()

    const [keys, setKeys] = useState<Record<string, KeyInfo>>({})

    const fetchKeys = useCallback(async () => {
        try {
            const response = await apiGet<KeysResponse>('/keys')
            if (response.success && response.keys) {
                setKeys(response.keys)
            }
        } catch (err) {
            console.error(err)
        }
    }, [])

    useEffect(() => {
        void fetchKeys()
    }, [fetchKeys])

    return(
        <div id="Verify" className="pages">
            <div className="flex flex-col md:flex-row w-full md:items-center gap-4 md:gap-0">
                <div className="flex flex-col md:flex-row w-full md:ml-6 gap-4 md:gap-0">
                    <div className="flex w-full md:items-center">
                        <AnimatePresence mode="wait">
                            {isDetached ? (
                                <motion.div
                                    key="detached-verify"
                                    layout
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -35, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                    className="flex-auto md:mr-3 w-full"
                                >
                                    <div className="keysGrid">
                                        <VerifyDetach keysData={keys} pushToast={pushToast} />
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="embedded-verify"
                                    layout
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -35, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                    className="flex-auto md:mr-3 w-full"
                                >
                                    <div className="keysGrid">
                                        <EmbedVerify pushToast={pushToast} keysData={keys} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <ToolRail pushToast={pushToast} />
                </div>
            </div>
        </div>
    )
}
