'use client'
import KeysCreate from "./components/keysCreate"
import KeysImport from "./components/keysImport"
import { motion } from "motion/react"
import { useToast } from "@/components/hooks/pushToast"
import { useServerInfo } from "@/components/hooks/serverCheck"
import ToolRail from "@/components/ui/toolRail"


export default function KeyPage() {
    const { pushToast } = useToast()
    const { serverInfo, refreshData } = useServerInfo()

    const supportedAlgorithms = serverInfo?.security_features?.supported_signature_algorithms || [
        'ML-DSA-44', 'ML-DSA-65', 'ML-DSA-87'
    ]
    const defaultAlgorithm = serverInfo?.security_features?.default_signature_algorithm || 'ML-DSA-44'

    return(
        <div id="Keys" className="pages">
            <div className="flex flex-col md:flex-row w-full md:items-center gap-4 md:gap-0">
                <div className="flex flex-col md:flex-row w-full md:ml-6 gap-4 md:gap-0">
                    <motion.div layout className="flex-auto">
                        <div className="keysGrid">
                            <KeysCreate
                                supportedAlgorithms={supportedAlgorithms}
                                defaultAlgorithm={defaultAlgorithm}
                                onSuccess={refreshData}
                                pushToast={pushToast}
                            />
                        </div>
                    </motion.div>

                    <motion.div layout className="flex-auto md:mr-3">
                        <div className="keysGrid">
                            <KeysImport
                                onSuccess={refreshData}
                                pushToast={pushToast}
                            />
                        </div>
                    </motion.div>

                    <ToolRail pushToast={pushToast} />
                </div>
            </div>
        </div>
    )
}
